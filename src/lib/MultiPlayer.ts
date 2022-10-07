/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IConfig,
  ISource,
  DRM_TYPES,
  PlayersEnum,
  IEvents,
  Listener,
  EventsEnum,
} from "./types";
import { Hls, Shaka, Dashjs, muxjs } from "../vendor";

class MultiPlayer {
  private static instance: MultiPlayer;
  private config: IConfig;
  private source: ISource;
  private mediaElement: HTMLMediaElement | null;
  private hls: Hls | null;
  private shaka!: Shaka.Player;
  private dashjs: Dashjs.MediaPlayerClass;
  private isDrm = false;
  private player: PlayersEnum;
  private isVidgo: boolean;
  private isSafari: boolean;
  // private errorRetryCounter: number;
  private readonly events: IEvents;

  private constructor() {
    (window as any).muxjs = muxjs;
    this.player = PlayersEnum.NONE;
    this.events = {};
    // this.errorRetryCounter = 0;
    this.isSafari = false;
    this.isVidgo = false;
    this.config = {
      debug: false,
      useShakaForDashStreams: false,
      shaka: {},
      dashjs: {},
      hlsjs: {},
    };
    this.source = {
      url: null,
      drm: null,
    };
    this.mediaElement = null;
    this.hls = null;
    this.dashjs = Dashjs.MediaPlayer().create();
    this.dashjs.initialize();
    if (Shaka.Player.isBrowserSupported()) {
      Shaka.polyfill.installAll();
      this.shaka = new Shaka.Player();
    } else {
      console.error("Shaka Player is not Supported.");
    }
    if (!Hls.isSupported()) {
      console.error("HLS.js is not Supported.");
    }
  }

  private static isBrowser(): boolean {
    return typeof window === "object";
  }

  public static getInstance(): MultiPlayer {
    if (this.isBrowser()) {
      if (!MultiPlayer.instance) {
        MultiPlayer.instance = new MultiPlayer();
      }
      return MultiPlayer.instance;
    } else {
      throw new Error("Library only supported in browsers!");
    }
  }

  getLibraryVersions(): string {
    return "shaka: v3.3.2, dashjs: v4.5.0, hls.js: v1.2.4, mux.js: v5.14.1";
  }

  setUpdateConfig(config: IConfig) {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  private checkIsDrm(): void {
    if (this.source.drm) {
      if (
        Object.values(DRM_TYPES).includes(this.source.drm?.drmType) &&
        typeof this.source.drm?.licenseUrl === "string"
      ) {
        this.isDrm = true;
        return;
      }
    }
    this.isDrm = false;
  }

  async detachMediaElement() {
    try {
      if (this.hls) {
        this.hls.destroy();
        this.hls = null;
      }
      this.dashjs.reset();
      await this.shaka.detach();
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(true);
    }
  }

  checkUrl(src: ISource) {
    if (src.url && this.source.url) {
      return (
        new URL(src.url).origin + new URL(src.url).pathname ===
        new URL(this.source.url).origin + new URL(this.source.url).pathname
      );
    }
    return false;
  }

  setSource(src: ISource, isVidgo: boolean) {
    if (this.checkUrl(src)) return;
    this.mediaElement = document.querySelector("video[data-multi-player]");
    if (!this.mediaElement) {
      console.error(
        "Please create video element with data-multi-player attribute function."
      );
      return;
    }

    this.source = src;
    this.isVidgo = isVidgo;
    this.isSafari = /version\/(\d+).+?safari/.test(
      ((navigator && navigator.userAgent) || "").toLowerCase()
    );
    this.checkIsDrm();

    this.detachMediaElement()
      .then(async () => {
        try {
          if (this.isDrm) {
            if (this.source.drm?.drmType === DRM_TYPES.FAIRPLAY) {
              await this.initShakaPlayer(true);
              return;
            }
            if (this.source.drm?.drmType === DRM_TYPES.WIDEVINE) {
              if (this.config.useShakaForDashStreams) {
                await this.initShakaPlayer(false);
                return;
              }
              this.initDashjsPlayer();
              return;
            }
          }
          if (this.source.url) {
            this.initHlsPlayer();
            return;
          }
        } catch (e) {
          return;
        }
      })
      .catch(() => {
        console.error("error....");
      });
  }

  private initHlsPlayer() {
    this.player = PlayersEnum.HLS;
    const config = Hls.DefaultConfig;
    this.hls = new Hls({
      ...config,
      debug: this.config.debug,
    });
    if (this.mediaElement) this.hls.attachMedia(this.mediaElement);
    this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      if (this.hls && this.source.url) this.hls.loadSource(this.source.url);
    });
  }

  private async initShakaPlayer(isFairPlay: boolean) {
    this.player = PlayersEnum.SHAKA;
    const _shaka = Shaka as any;
    _shaka.log.setLevel(
      this.config.debug ? _shaka.log.Level.DEBUG : _shaka.log.Level.NONE
    );

    this.shaka.resetConfiguration();

    if (this.mediaElement) await this.shaka.attach(this.mediaElement);

    let drmConfig = {};

    if (isFairPlay && this.isSafari) {
      drmConfig = {
        drm: {
          servers: {
            "com.apple.fps.1_0": this.source.drm?.licenseUrl,
          },
          advanced: {
            "com.apple.fps.1_0": {
              serverCertificateUri: this.source.drm?.certicateUrl,
            },
          },
        },
      };
    } else {
      drmConfig = {
        drm: {
          servers: {
            "com.widevine.alpha": this.source.drm?.licenseUrl,
          },
        },
      };
    }

    this.shaka.configure({ ...drmConfig });
    this.shaka.setTextTrackVisibility(false);

    if (this.isVidgo && isFairPlay && this.isSafari) {
      this.vidgoResponseFilter();
    } else {
      this.shaka.getNetworkingEngine()?.clearAllResponseFilters();
    }

    this.shaka
      .load(this.source.url || "")
      .then(async () => {
        try {
          if (this.mediaElement) await this.mediaElement.play();
        } catch (e) {
          return;
        }
      })
      .catch(() => {
        return;
      });
  }

  private vidgoResponseFilter() {
    this.shaka.getNetworkingEngine()?.clearAllResponseFilters();
    this.shaka.getNetworkingEngine()?.registerResponseFilter((type, resp) => {
      if (type === Shaka.net.NetworkingEngine.RequestType.LICENSE) {
        const jsonResp = JSON.parse(
          String.fromCharCode.apply(
            null,
            new Uint8Array(resp.data as any) as any
          )
        );
        const raw = Buffer.from(jsonResp.ckc, "base64");
        const rawLength = raw.length;
        const data = new Uint8Array(new ArrayBuffer(rawLength));
        for (let i = 0; i < rawLength; i += 1) {
          data[i] = raw[i];
        }
        resp.data = data;
      }
    });
  }

  private initDashjsPlayer() {
    this.player = PlayersEnum.DASHJS;
    if (this.mediaElement) {
      this.dashjs.attachView(this.mediaElement);
      this.dashjs.setAutoPlay(true);
      if (this.source.url) this.dashjs.attachSource(this.source.url);
      this.dashjs.setProtectionData({
        "com.widevine.alpha": {
          serverURL: this.source.drm?.licenseUrl,
          priority: 0,
        },
      });
      this.dashjs
        .getProtectionController()
        .setRobustnessLevel("SW_SECURE_CRYPTO");

      const _dashjs = Dashjs as any;

      this.dashjs.updateSettings({
        debug: {
          logLevel: this.config.debug
            ? _dashjs.Debug.LOG_LEVEL_DEBUG
            : _dashjs.Debug.LOG_LEVEL_NONE,
        },
        streaming: {
          scheduling: {
            scheduleWhilePaused: false,
          },
          buffer: {
            fastSwitchEnabled: true,
          },
        },
      });
    }
  }

  // Events;
  on(event: EventsEnum, fn: Listener) {
    this._addHlsEvents();
    this._addDashjsEvents();
    this._addShakaEvents();
    this._addMediaElementEvents();
    if (typeof this.events[event] !== "object") this.events[event] = [];
    this.events[event].push(fn);
    return () => this._removeListener(event, fn);
  }

  emit(event: EventsEnum, ...args: any[]) {
    if (typeof this.events[event] !== "object") return;
    [...this.events[event]].forEach((listener) => listener.apply(this, args));
  }

  private _removeListener(event: EventsEnum, listener: Listener) {
    if (typeof this.events[event] !== "object") return;
    const idx: number = this.events[event].indexOf(listener);
    if (idx > -1) {
      this.events[event].splice(idx, 1);
    }
  }

  removeAllListeners() {
    this._removeHlsEvents();
    this._removeDashjsEvents();
    this._removeShakaEvents();
    this._removeMediaElementEvents();
    Object.keys(this.events).forEach((event: string) =>
      this.events[event].splice(0, this.events[event].length)
    );
  }

  private _loadingErrorEvents(loading: boolean, error: boolean, detail?: any) {
    MultiPlayer.getInstance().emit(EventsEnum.LOADING, {
      event: EventsEnum.LOADING,
      value: loading,
    });
    MultiPlayer.getInstance().emit(EventsEnum.ERROR, {
      event: EventsEnum.ERROR,
      value: error,
      detail,
    });
  }

  private _fatalErrorRetry(d: any) {
    MultiPlayer.getInstance()._loadingErrorEvents(false, true, d);
  }

  private _shakaBufferingEvent(d: any) {
    if (d?.buffering) {
      MultiPlayer.getInstance()._loadingErrorEvents(true, false);
    } else {
      MultiPlayer.getInstance()._loadingErrorEvents(false, false);
    }
  }

  private _shakaErrorEvent(d: any) {
    console.log("shaka-error-event", d);
    if (d?.severity === Shaka.util.Error.Severity.CRITICAL) {
      this._fatalErrorRetry(d);
    }
  }

  private _shakaStallDetectedEvent() {
    MultiPlayer.getInstance()._loadingErrorEvents(true, false);
  }

  private _addShakaEvents() {
    this._removeShakaEvents();
    this.shaka.addEventListener("buffering", this._shakaBufferingEvent);
    this.shaka.addEventListener("error", this._shakaErrorEvent);
    this.shaka.addEventListener("stalldetected", this._shakaStallDetectedEvent);
  }

  private _removeShakaEvents() {
    this.shaka.removeEventListener("buffering", this._shakaBufferingEvent);
    this.shaka.removeEventListener("error", this._shakaErrorEvent);
    this.shaka.removeEventListener(
      "stalldetected",
      this._shakaStallDetectedEvent
    );
  }

  private _hlsErrorEvent(e: any, d: any) {
    console.log("hls-error", e, d);
    if (d?.details === "bufferStalledError") {
      MultiPlayer.getInstance()._loadingErrorEvents(true, false);
    }

    if (d?.fatal) {
      this._fatalErrorRetry(d);
    }
  }

  private _addHlsEvents() {
    this._removeHlsEvents();
    if (this.hls) {
      this.hls.on(Hls.Events.ERROR, this._hlsErrorEvent);
    }
  }

  private _removeHlsEvents() {
    if (this.hls) {
      this.hls.removeAllListeners();
    }
  }

  private _dashjsErrorEvent(d: any) {
    console.log("dashjs - error", d);

    const dashjsErrors = {
      23: "CAPABILITY_MEDIASOURCE_ERROR_CODE",
      25: "DOWNLOAD_ERROR_ID_MANIFEST_CODE",
      27: "DOWNLOAD_ERROR_ID_CONTENT_CODE",
      28: "DOWNLOAD_ERROR_ID_INITIALIZATION_CODE",
      31: "MANIFEST_ERROR_ID_PARSE_CODE",
      32: "MANIFEST_ERROR_ID_NOSTREAMS_CODE",
      34: "MANIFEST_ERROR_ID_MULTIPLEXED_CODE",
      35: "MEDIASOURCE_TYPE_UNSUPPORTED_CODE",
      110: "DRM: KeyStatusChange error! -- License has expired",
    };

    const { error } = d;
    const errorCode = error?.code?.toString();
    if (errorCode in dashjsErrors) {
      MultiPlayer.getInstance()._loadingErrorEvents(false, true, d);
    } else {
      this._fatalErrorRetry(d);
    }
  }

  private _dashjsBufferLoadedEvent() {
    MultiPlayer.getInstance()._loadingErrorEvents(false, false);
  }

  private _dashjsBufferEmptyEvent() {
    MultiPlayer.getInstance()._loadingErrorEvents(true, false);
  }

  private _addDashjsEvents() {
    this._removeDashjsEvents();
    this.dashjs.on(Dashjs.MediaPlayer.events.ERROR, this._dashjsErrorEvent);
    this.dashjs.on(
      Dashjs.MediaPlayer.events.BUFFER_EMPTY,
      this._dashjsBufferEmptyEvent
    );
    this.dashjs.on(
      Dashjs.MediaPlayer.events.BUFFER_LOADED,
      this._dashjsBufferLoadedEvent
    );
  }

  private _removeDashjsEvents() {
    this.dashjs.off(Dashjs.MediaPlayer.events.ERROR, this._dashjsErrorEvent);
    this.dashjs.off(
      Dashjs.MediaPlayer.events.BUFFER_EMPTY,
      this._dashjsBufferEmptyEvent
    );
    this.dashjs.off(
      Dashjs.MediaPlayer.events.BUFFER_LOADED,
      this._dashjsBufferLoadedEvent
    );
  }

  waitingEvent() {
    MultiPlayer.getInstance()._loadingErrorEvents(true, false);
  }

  playEvent() {
    MultiPlayer.getInstance()._loadingErrorEvents(false, false);
  }

  private _addMediaElementEvents() {
    this._removeMediaElementEvents();
    if (this.mediaElement) {
      this.mediaElement.addEventListener("waiting", this.waitingEvent);
      this.mediaElement.addEventListener("playing", this.playEvent);
    }
  }

  private _removeMediaElementEvents() {
    if (this.mediaElement) {
      this.mediaElement.removeEventListener("waiting", this.waitingEvent);
      this.mediaElement.removeEventListener("playing", this.playEvent);
    }
  }
}

export const player = MultiPlayer.getInstance();
