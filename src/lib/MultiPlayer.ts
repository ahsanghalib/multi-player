/* eslint-disable @typescript-eslint/no-explicit-any */
import Hls from "hls.js";
import Shaka from "shaka-player/dist/shaka-player.compiled.debug";
import muxjs from "mux.js";
import Dashjs from "dashjs";

class MultiPlayer {
  static _instance: MultiPlayer;
  private config: IConfig;
  private source: ISource;
  mediaElement: HTMLMediaElement | null;
  private hls: Hls | null;
  private shaka!: Shaka.Player;
  private dashjs: Dashjs.MediaPlayerClass;
  private isDrm = false;
  private player: PlayersEnum;
  private isVidgo: boolean;
  private isSafari: boolean;
  private isPlaying: boolean;
  readonly events: IEvents;

  constructor() {
    (window as any).muxjs = muxjs;
    this.player = PlayersEnum.NONE;
    this.isPlaying = false;
    this.events = {};
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

  static _isBrowser = (): boolean => {
    return typeof window === "object";
  };

  public static getInstance = (): MultiPlayer => {
    if (this._isBrowser()) {
      if (!MultiPlayer._instance) {
        MultiPlayer._instance = new MultiPlayer();
      }
      return MultiPlayer._instance;
    } else {
      throw new Error("Library only supported in browsers!");
    }
  };

  getLibraryVersions = (): string => {
    return "shaka: v3.3.2, dashjs: v4.5.0, hls.js: v1.2.4, mux.js: v5.14.1";
  };

  setUpdateConfig = (config: IConfig) => {
    this.config = {
      ...this.config,
      ...config,
    };
  };

  _checkIsDrm = (): void => {
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
  };

  detachMediaElement = async () => {
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
  };

  setSource = (src: ISource, isVidgo: boolean) => {
    this.mediaElement = document.querySelector("video[data-multi-player]");
    if (!this.mediaElement) {
      console.error(
        "Please create video element with data-multi-player attribute function."
      );
      return;
    }
    this.isPlaying = false;
    this.source = src;
    this.isVidgo = isVidgo;
    this.isSafari = /version\/(\d+).+?safari/.test(
      ((navigator && navigator.userAgent) || "").toLowerCase()
    );
    this._checkIsDrm();

    this.detachMediaElement()
      .then(async () => {
        try {
          if (this.isDrm) {
            if (this.source.drm?.drmType === DRM_TYPES.FAIRPLAY) {
              await this._initShakaPlayer(true);
              return;
            }
            if (this.source.drm?.drmType === DRM_TYPES.WIDEVINE) {
              if (this.config.useShakaForDashStreams) {
                await this._initShakaPlayer(false);
                return;
              }
              this._initDashjsPlayer();
              return;
            }
          }
          if (this.source.url) {
            this._initHlsPlayer();
            return;
          }

          this._loadingErrorEvents(
            false,
            false,
            `Provided sourcee is not correct please check, src: ${JSON.stringify(
              this.source
            )}`
          );
        } catch (e) {
          this._emit(EventsEnum.ERROR, {
            event: EventsEnum.ERROR,
            player: this.player,
            value: true,
            detail: null,
          });
        }
      })
      .catch(() => {
        this._emit(EventsEnum.ERROR, {
          event: EventsEnum.ERROR,
          player: this.player,
          value: true,
          detail: null,
        });
      });
  };

  _initHlsPlayer = () => {
    this.player = PlayersEnum.HLS;
    const config = Hls.DefaultConfig;
    this.hls = new Hls({
      ...config,
      debug: this.config.debug,
    });
    if (this.mediaElement) this.hls.attachMedia(this.mediaElement);

    this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      this.hls!.loadSource(this.source.url!);
    });
    this._addHlsEvents();
  };

  _initShakaPlayer = async (isFairPlay: boolean) => {
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
      this._vidgoResponseFilter();
    } else {
      this.shaka.getNetworkingEngine()!.clearAllResponseFilters();
    }

    this._addShakaEvents();

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
  };

  _vidgoResponseFilter = () => {
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
  };

  _initDashjsPlayer = () => {
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

      this._addDashjsEvents();

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
  };

  /**
   * event methods.
   */
  on = (event: EventsEnum, fn: Listener) => {
    this._addMediaElementEvents();
    if (typeof this.events[event] !== "object") this.events[event] = [];
    this.events[event].push(fn);
    return () => this._removeListener(event, fn);
  };

  _emit = (
    event: EventsEnum,
    ...args: {
      event: EventsEnum;
      player: PlayersEnum;
      value: boolean;
      detail: any;
    }[]
  ) => {
    if (typeof this.events[event] !== "object") return;
    [...this.events[event]].forEach((listener) => listener.apply(this, args));
  };

  _removeListener = (event: EventsEnum, listener: Listener) => {
    if (typeof this.events[event] !== "object") return;
    const idx: number = this.events[event].indexOf(listener);
    if (idx > -1) {
      this.events[event].splice(idx, 1);
    }
  };

  removeAllListeners = () => {
    this._removeHlsEvents();
    this._removeDashjsEvents();
    this._removeShakaEvents();
    this._removeMediaElementEvents();
    Object.keys(this.events).forEach((event: string) =>
      this.events[event].splice(0, this.events[event].length)
    );
  };

  /**
   * event helpers
   */
  _loadingErrorEvents = (loading: boolean, error: boolean, detail?: any) => {
    this._emit(EventsEnum.LOADING, {
      event: EventsEnum.LOADING,
      player: this.player,
      value: loading,
      detail,
    });
    this._emit(EventsEnum.ERROR, {
      event: EventsEnum.ERROR,
      player: this.player,
      value: error,
      detail,
    });
  };

  _fatalErrorRetry = (d: any) => {
    this._loadingErrorEvents(false, true, d);
  };

  /**
   * shaka player events
   */
  _shakaBufferingEvent = (d: any) => {
    if (d?.buffering) {
      this._loadingErrorEvents(true, false);
    } else {
      this._loadingErrorEvents(false, false);
    }
  };

  _shakaErrorEvent = (d: any) => {
    console.log("shaka-error-event", d);
    if (d?.severity === Shaka.util.Error.Severity.CRITICAL) {
      this._fatalErrorRetry(d);
    }
  };

  _shakaStallDetectedEvent = () => {
    this._loadingErrorEvents(true, false);
  };

  _addShakaEvents = () => {
    this._removeShakaEvents();
    this.shaka.addEventListener(
      ShakaEventsEnum.BUFFERING,
      this._shakaBufferingEvent
    );
    this.shaka.addEventListener(ShakaEventsEnum.ERROR, this._shakaErrorEvent);
    this.shaka.addEventListener(
      ShakaEventsEnum.STALL_DETECTED,
      this._shakaStallDetectedEvent
    );
  };

  _removeShakaEvents = () => {
    this.shaka.removeEventListener(
      ShakaEventsEnum.BUFFERING,
      this._shakaBufferingEvent
    );
    this.shaka.removeEventListener(
      ShakaEventsEnum.ERROR,
      this._shakaErrorEvent
    );
    this.shaka.removeEventListener(
      ShakaEventsEnum.STALL_DETECTED,
      this._shakaStallDetectedEvent
    );
  };

  /**
   * hlsjs events
   */
  _hlsErrorEvent = (e: any, d: any) => {
    console.log("hls-error", e, d);
    if (d?.details === "bufferStalledError") {
      this._loadingErrorEvents(true, false, "hlsjs - error");
    }

    if (d?.fatal) {
      this._fatalErrorRetry(d);
    }
  };

  _addHlsEvents = () => {
    if (this.hls) {
      this.hls.on(Hls.Events.ERROR, this._hlsErrorEvent);
    }
  };

  _removeHlsEvents = () => {
    if (this.hls) {
      this.hls.removeAllListeners();
    }
  };

  /**
   * dashjs events
   */
  _dashjsErrorEvent = (d: any) => {
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
      this._loadingErrorEvents(false, true, d);
    } else {
      this._fatalErrorRetry(d);
    }
  };

  _dashjsBufferLoadedEvent = () => {
    this._loadingErrorEvents(false, false);
  };

  _dashjsBufferEmptyEvent = () => {
    this._loadingErrorEvents(true, false);
  };

  _addDashjsEvents = () => {
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
  };

  _removeDashjsEvents = () => {
    this.dashjs.off(Dashjs.MediaPlayer.events.ERROR, this._dashjsErrorEvent);
    this.dashjs.off(
      Dashjs.MediaPlayer.events.BUFFER_EMPTY,
      this._dashjsBufferEmptyEvent
    );
    this.dashjs.off(
      Dashjs.MediaPlayer.events.BUFFER_LOADED,
      this._dashjsBufferLoadedEvent
    );
  };

  /**
   * media element events.
   * */
  _waitingEvent = () => {
    this._loadingErrorEvents(true, false, "video - wating event");
  };

  _playingEvent = () => {
    this.isPlaying = true;
    this._loadingErrorEvents(false, false, "video - playing event");
    if (this.hls) this.hls.startLoad();
  };

  _pauseEvent = () => {
    this.isPlaying = false;
    this._loadingErrorEvents(false, false, "video - pause event");
    if (this.hls) this.hls.stopLoad();
  };

  _addMediaElementEvents = () => {
    this._removeMediaElementEvents();
    if (this.mediaElement) {
      this.mediaElement.addEventListener(
        VideoEventsEnum.WAITING,
        this._waitingEvent
      );
      this.mediaElement.addEventListener(
        VideoEventsEnum.PLAYING,
        this._playingEvent
      );
      this.mediaElement.addEventListener(
        VideoEventsEnum.PAUSE,
        this._pauseEvent
      );
    }
  };

  _removeMediaElementEvents = () => {
    if (this.mediaElement) {
      this.mediaElement.removeEventListener(
        VideoEventsEnum.WAITING,
        this._waitingEvent
      );
      this.mediaElement.removeEventListener(
        VideoEventsEnum.PLAYING,
        this._playingEvent
      );
      this.mediaElement.removeEventListener(
        VideoEventsEnum.PAUSE,
        this._pauseEvent
      );
    }
  };
}

export const player = MultiPlayer.getInstance();

/**
 * types
 */
enum DRM_TYPES {
  WIDEVINE = "widevine",
  FAIRPLAY = "fairplay",
}

enum PlayersEnum {
  SHAKA = "shaka",
  HLS = "hls",
  DASHJS = "dashjs",
  NONE = "none",
}

enum EventsEnum {
  ERROR = "error",
  LOADING = "loading",
  LOADED = "loaded",
}

interface IDrm {
  drmType: DRM_TYPES;
  licenseUrl: string;
  certicateUrl?: string;
}

interface ISource {
  url: string | null;
  drm: IDrm | null;
}

type Listener = (...args: any[]) => void;

interface IEvents {
  [event: string]: Array<Listener>;
}

enum VideoEventsEnum {
  WAITING = "waiting",
  PLAYING = "playing",
  ERROR = "error",
  PAUSE = "pause",
  LOADSTART = "loadstart",
}

enum ShakaEventsEnum {
  BUFFERING = "buffering",
  ERROR = "error",
  STALL_DETECTED = "stalldetected",
}

interface IShakaConfigs {}

interface IHlsJsConfigs {}

interface IDashJsConfigs {}

interface IConfig {
  debug: boolean;
  useShakaForDashStreams: boolean;
  shaka: IShakaConfigs;
  hlsjs: IHlsJsConfigs;
  dashjs: IDashJsConfigs;
}
