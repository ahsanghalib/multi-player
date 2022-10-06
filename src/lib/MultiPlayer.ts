/* eslint-disable @typescript-eslint/no-explicit-any */
import { IConfig, ISource, DRM_TYPES, PlayersEnum } from "./types";
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

  private constructor() {
    (window as any).muxjs = muxjs;
    this.player = PlayersEnum.NONE;
    this.config = { debug: false };
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

  setConfig(config: IConfig) {
    this.config = config;
    const _shaka = Shaka as any;
    const _dashjs = Dashjs as any;
    _shaka.log.setLevel(
      this.config.debug ? _shaka.log.Level.DEBUG : _shaka.log.Level.NONE
    );
    this.dashjs.updateSettings({
      debug: {
        logLevel: this.config.debug
          ? _dashjs.Debug.LOG_LEVEL_DEBUG
          : _dashjs.Debug.LOG_LEVEL_NONE,
      },
    });
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

  setSource(src: ISource) {
    this.mediaElement = document.querySelector("video[data-multi-player]");
    if (!this.mediaElement) {
      console.error(
        "Please create video element with data-multi-player attribute function."
      );
      return;
    }

    this.source = src;
    this.checkIsDrm();

    this.detachMediaElement()
      .then(async () => {
        try {
          if (this.isDrm) {
            if (this.source.drm?.drmType === DRM_TYPES.FAIRPLAY) {
              await this.initShakaPlayer();
              return;
            }
            if (this.source.drm?.drmType === DRM_TYPES.WIDEVINE) {
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

  private async initShakaPlayer() {
    this.player = PlayersEnum.SHAKA;
    this.shaka.resetConfiguration();
    if (this.mediaElement) await this.shaka.attach(this.mediaElement);

    const drmConfig = {
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

    this.shaka.configure({ ...drmConfig });
    this.shaka.setTextTrackVisibility(false);
    this.shaka
      .load(this.source.url || "")
      .then(() => {
        if (this.mediaElement) this.mediaElement.play();
      })
      .catch(() => {
        return;
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
    }
  }
}

export const player = MultiPlayer.getInstance();

