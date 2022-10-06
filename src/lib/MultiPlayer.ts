/* eslint-disable @typescript-eslint/no-explicit-any */
import { IConfig, ISource, DRM_TYPES, PlayersEnum } from "./types";
import { Hls, Shaka, Dashjs, muxjs } from "../vendor";

class MultiPlayer {
  private static __instance: MultiPlayer;
  private __config: IConfig;
  private __source: ISource;
  private __mediaElement: HTMLMediaElement | null;
  private __hls: Hls | null;
  private __shaka!: Shaka.Player;
  private __dashjs: Dashjs.MediaPlayerClass;
  private __isDrm = false;
  private __player: PlayersEnum;

  private constructor() {
    (window as any).muxjs = muxjs;
    this.__player = PlayersEnum.NONE;
    this.__config = { debug: false };
    this.__source = {
      url: null,
      drm: null,
    };
    this.__mediaElement = null;
    this.__hls = null;
    this.__dashjs = Dashjs.MediaPlayer().create();
    this.__dashjs.initialize();
    if (Shaka.Player.isBrowserSupported()) {
      Shaka.polyfill.installAll();
      this.__shaka = new Shaka.Player();
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
      if (!MultiPlayer.__instance) {
        MultiPlayer.__instance = new MultiPlayer();
      }
      return MultiPlayer.__instance;
    } else {
      throw new Error("Library only supported in browsers!");
    }
  }

  getLibraryVersions(): string {
    return "shaka: v3.3.2, dashjs: v4.5.0, hls.js: v1.2.4, mux.js: v5.14.1";
  }

  setConfig(config: IConfig) {
    this.__config = config;
    const _shaka = Shaka as any;
    const _dashjs = Dashjs as any;
    _shaka.log.setLevel(
      this.__config.debug ? _shaka.log.Level.DEBUG : _shaka.log.Level.NONE
    );
    this.__dashjs.updateSettings({
      debug: {
        logLevel: this.__config.debug
          ? _dashjs.Debug.LOG_LEVEL_DEBUG
          : _dashjs.Debug.LOG_LEVEL_NONE,
      },
    });
  }

  private __checkIsDrm(): void {
    if (this.__source.drm) {
      if (
        Object.values(DRM_TYPES).includes(this.__source.drm?.drmType) &&
        typeof this.__source.drm?.licenseUrl === "string"
      ) {
        this.__isDrm = true;
        return;
      }
    }
    this.__isDrm = false;
  }

  async detachMediaElement() {
    try {
      if (this.__hls) {
        this.__hls.destroy();
        this.__hls = null;
      }
      this.__dashjs.reset();
      await this.__shaka.detach();
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(true);
    }
  }

  setSource(src: ISource) {
    this.__mediaElement = document.querySelector("video[data-multi-player]");
    if (!this.__mediaElement) {
      console.error(
        "Please create video element with data-multi-player attribute function."
      );
      return;
    }

    this.__source = src;
    this.__checkIsDrm();

    this.detachMediaElement()
      .then(async () => {
        try {
          if (this.__isDrm) {
            if (this.__source.drm?.drmType === DRM_TYPES.FAIRPLAY) {
              await this.__initShakaPlayer();
              return;
            }
            if (this.__source.drm?.drmType === DRM_TYPES.WIDEVINE) {
              this.__initDashjsPlayer();
              return;
            }
          }
          if (this.__source.url) {
            this.__initHlsPlayer();
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

  private __initHlsPlayer() {
    this.__player = PlayersEnum.HLS;
    const config = Hls.DefaultConfig;
    this.__hls = new Hls({
      ...config,
      debug: this.__config.debug,
    });
    if (this.__mediaElement) this.__hls.attachMedia(this.__mediaElement);
    this.__hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      if (this.__hls && this.__source.url) this.__hls.loadSource(this.__source.url);
    });
  }

  private async __initShakaPlayer() {
    this.__player = PlayersEnum.SHAKA;
    this.__shaka.resetConfiguration();
    if (this.__mediaElement) await this.__shaka.attach(this.__mediaElement);

    const drmConfig = {
      drm: {
        servers: {
          "com.apple.fps.1_0": this.__source.drm?.licenseUrl,
        },
        advanced: {
          "com.apple.fps.1_0": {
            serverCertificateUri: this.__source.drm?.certicateUrl,
          },
        },
      },
    };

    this.__shaka.configure({ ...drmConfig });
    this.__shaka.setTextTrackVisibility(false);
    this.__shaka
      .load(this.__source.url || "")
      .then(() => {
        if (this.__mediaElement) this.__mediaElement.play();
      })
      .catch(() => {
        return;
      });
  }

  private __initDashjsPlayer() {
    this.__player = PlayersEnum.DASHJS;
    if (this.__mediaElement) {
      this.__dashjs.attachView(this.__mediaElement);
      this.__dashjs.setAutoPlay(true);
      if (this.__source.url) this.__dashjs.attachSource(this.__source.url);
      this.__dashjs.setProtectionData({
        "com.widevine.alpha": {
          serverURL: this.__source.drm?.licenseUrl,
          priority: 0,
        },
      });
      this.__dashjs
        .getProtectionController()
        .setRobustnessLevel("SW_SECURE_CRYPTO");
    }
  }
}

export const player = MultiPlayer.getInstance();
