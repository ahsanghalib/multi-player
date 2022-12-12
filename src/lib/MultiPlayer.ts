import muxjs from "mux.js";
import { Events } from "./Events";
import { MediaElementEvents } from "./MediaElementEvents";
import { DashjsPlayer, ShakaPlayer, HlsjsPlayer } from "./players";
import {
  DRMEnums,
  EventsEnum,
  IConfig,
  IPlayerState,
  ISource,
  Listener,
  PlayersEnum,
} from "./types";
import { _getMediaElement, delay, _getMainVideoContainer } from "./Utils";

const defaultConfig: IConfig = {
  debug: false,
  useShakaForDashStreams: false,
  isVidgo: false,
  startTime: undefined,
  maxRetryCount: 5,
};

const defaultPlayerState = {
  player: PlayersEnum.NONE,
  loaded: false,
  loading: true,
  error: false,
  ended: false,
  textTrack: null,
  videoTrack: null,
  audioTrack: null,
  isPlaying: false,
};

export class MultiPlayer {
  static _instance: MultiPlayer;
  private _mediaElement: HTMLVideoElement | null;
  private _source: ISource;
  private _config: IConfig;
  private _playerState: IPlayerState;
  private _textTracks: Array<any>;
  private _timer?: NodeJS.Timeout;
  private _timerCounter: number;
  private _retryCount: number;
  private _hls: HlsjsPlayer;
  private _shaka!: ShakaPlayer;
  private _dashjs: DashjsPlayer;
  private readonly _events: Events;
  private _mediaEvents: MediaElementEvents;

  private constructor() {
    (window as any).muxjs = muxjs;
    this._events = new Events(this);
    this._mediaElement = null;
    this._source = { url: null, drm: null };
    this._config = defaultConfig;
    this._playerState = defaultPlayerState;
    this._timer = undefined;
    this._timerCounter = 0;
    this._retryCount = 0;
    this._textTracks = [];
    this._hls = new HlsjsPlayer(this, this._events);
    this._shaka = new ShakaPlayer(this, this._events);
    this._dashjs = new DashjsPlayer(this, this._events);
    this._mediaEvents = new MediaElementEvents(
      this,
      this._events,
      this._hls,
      this._dashjs
    );
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

  getMediaElement = () => this._mediaElement;

  setMediaElement = (element: HTMLVideoElement) => {
    this._mediaElement = element;
  };

  getSource = () => this._source;

  getCurrentConfig = () => this._config;

  /**
   * updateConfig
   * @param {debug: boolean, useShakaForDashStreams: boolean, isVidgo: boolean, startTime: number | undefined} config
   */
  updateConfig = (data?: Partial<IConfig>) => {
    this._config = { ...defaultConfig, ...this._config, ...data };
    if (!!this._config.debug) {
      (window as any).videoplayer = _getMediaElement();
    } else {
      delete (window as any).videoplayer;
    }
  };

  getRetryCount = () => this._retryCount;

  increaseRetryCount = () => (this._retryCount += 1);

  resetRetryCount = () => (this._retryCount = 0);

  getPlayerState = () => this._playerState;

  setPlayerState = (state?: Partial<IPlayerState>) => {
    let current = this._playerState;
    if (!!state?.ended) {
      current = {
        ...current,
        loading: false,
        error: false,
        isPlaying: false,
        textTrack: null,
        videoTrack: null,
        audioTrack: null,
      };
    }
    this._playerState = { ...defaultPlayerState, ...current, ...state };
  };

  detachMediaElement = async () => {
    try {
      // if (this._playerState.player === PlayersEnum.HLS)
      await this._hls.destroy();
      // if (this._playerState.player === PlayersEnum.DASHJS)
      await this._dashjs.destroy();
      // if (this._playerState.player === PlayersEnum.SHAKA)
      await this._shaka.destroy();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject();
    }
  };

  removePlayer = () => {
    if (this._mediaElement) {
      this._mediaElement.muted = true;
      this.detachMediaElement().then(() => {
        this._mediaElement = null;
        if (
          !!document.pictureInPictureEnabled &&
          !!document.pictureInPictureElement
        ) {
          sessionStorage.removeItem("pip-enter");
          document.exitPictureInPicture().catch((e) => console.log());
        }
      });
    }
  };

  reloadPlayer = async () => {
    try {
      await delay(5 * 1000);
      if (this._playerState.player === PlayersEnum.HLS) this.retry(true);
      if (this._playerState.player === PlayersEnum.DASHJS)
        await this._dashjs.reload();
      if (this._playerState.player === PlayersEnum.SHAKA)
        await this._shaka.reload();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject();
    }
  };

  retry = (hard: boolean = false) => {
    this._events.loadingErrorEvents(true, false);
    if (hard) {
      this.setSource(this._source, this._config);
      return;
    }
    this.reloadPlayer().catch((e) => console.log());
  };

  setSource = async (source: ISource, config?: IConfig) => {
    clearTimeout(this._timer);

    this.setPlayerState({
      ...defaultPlayerState,
      player: this._playerState.player,
      textTrack: this._playerState.textTrack,
    });

    if (!source.url) {
      console.error("Source URL is not valid.");
      return;
    }

    this._source = { ...source };
    this.updateConfig(config);

    if (this._mediaElement) {
      try {
        await this.detachMediaElement();
      } catch (err) {}
      this._mediaElement = null;
    }

    const element = _getMediaElement();
    if (!element) {
      console.error(
        "Please create video element with data-multi-player attribute function."
      );
      return;
    }

    this.setMediaElement(element);
    this.hideTextTracks();
    this._textTracks = [];
    this._timerCounter = 0;
    this._events.emit(EventsEnum.TEXTTRACKS, { value: this._textTracks });
    this._mediaEvents._init();

    try {
      if (this._source.drm?.drmType === DRMEnums.FAIRPLAY) {
        this.setPlayerState({ player: PlayersEnum.SHAKA });
        await this._shaka.initPlayer();
        return;
      }

      if (this._source.drm?.drmType === DRMEnums.WIDEVINE) {
        if (this._config.useShakaForDashStreams) {
          this.setPlayerState({ player: PlayersEnum.SHAKA });
          await this._shaka.initPlayer();
          return;
        }

        this.setPlayerState({ player: PlayersEnum.DASHJS });
        await this._dashjs.initPlayer();
        return;
      }

      if (this._source.url) {
        this.setPlayerState({ player: PlayersEnum.HLS });
        await this._hls.initPlayer();
        return;
      }
    } catch (e) {
      console.log();
    }
  };

  hideTextTracks = () => {
    if (this._mediaElement) {
      Object.keys(this._mediaElement.textTracks || {}).forEach(
        (t: any) => (this._mediaElement!.textTracks[t].mode = "hidden")
      );
    }
  };

  checkTextTracks = () => {
    if (this._mediaElement && !!this._playerState.loaded) {
      const tracks = this._mediaElement.textTracks;
      const tracksData: Array<any> = Object.keys(tracks).reduce(
        (a: any, c: any) => {
          tracks[c].mode = "hidden";
          return tracks[c].kind !== "metadata" &&
            !!Object.keys(tracks[c].cues || {}).length
            ? [
                ...a,
                {
                  id: c,
                  label: tracks[c].label,
                  lang: tracks[c].language,
                  track: tracks[c],
                },
              ]
            : [...a];
        },
        []
      );

      if (!tracksData.length && this._timerCounter < 1000) {
        this._timerCounter += 1;
        this._timer = setTimeout(this.checkTextTracks, 2000);
      } else {
        this._textTracks = tracksData;
        this._events.emit(EventsEnum.TEXTTRACKS, { value: this._textTracks });
        this.setTextTrack(this._playerState.textTrack);
      }
    }
  };

  setTextTrack = (id: any) => {
    if (this._textTracks.length) {
      this._playerState = { ...this._playerState, textTrack: id };
      const idx = this._textTracks.findIndex((t) => t.id === id);
      if (idx !== -1) {
        this._textTracks.forEach((t) => (t.track.mode = "hidden"));
        this._textTracks[idx].track.mode = "showing";
      } else {
        this._textTracks.forEach((t) => (t.track.mode = "hidden"));
      }
    } else {
      this._playerState = { ...this._playerState, textTrack: null };
    }
  };

  togglePlayPause = (play: boolean) => {
    const video = this.getMediaElement();
    if (!!video) {
      if (play) video.play();
      if (!play) video.pause();
    }
  };

  toggleMuteUnMute = () => {
    const video = this.getMediaElement();
    if (!!video) {
      if (video.muted) {
        video.muted = false;
      } else {
        video.muted = true;
      }
    }
  };

  toggleForwardRewind = (forward: boolean) => {
    const video = this.getMediaElement();
    if (!!video) {
      const ct = video.currentTime;
      const dt = video.duration;

      if (ct >= 0 && dt >= 0) {
        if (forward) {
          video.currentTime = Math.min(ct + 30, dt);
          return;
        }
        video.currentTime = Math.max(0, ct - 15);
      }
    }
  };

  seekTime = (timeInSeconds: number) => {
    const video = this.getMediaElement();
    if (!!video) {
      video.currentTime = timeInSeconds;
    }
  };

  togglePip = async () => {
    const video = this.getMediaElement();
    if (!document.pictureInPictureEnabled) return;
    if (this.isFullScreen()) {
      this.toggleFullScreen();
    }
    try {
      if (!!video && video !== document.pictureInPictureElement) {
        await video.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (e) {
      console.log();
    }
  };

  toggleFullScreen = async () => {
    const video = this.getMediaElement();
    const videoContainer = _getMainVideoContainer();
    if (!video && !videoContainer) return;
    if (video === document.pictureInPictureElement) await this.togglePip();
    if ((document as any).fullscreenElement) {
      (document as any).exitFullscreen();
    } else if ((document as any).webkitFullscreenElement) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    } else if ((videoContainer as any).webkitRequestFullscreen) {
      (videoContainer as any).webkitRequestFullscreen();
    } else if ((videoContainer as any).requestFullscreen) {
      (videoContainer as any).requestFullscreen();
    } else if ((videoContainer as any).msRequestFullscreen) {
      (videoContainer as any).msRequestFullscreen();
    }
  };

  isFullScreen = () => {
    if (
      (document as any).fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msExitFullscreen
    )
      return true;
    return false;
  };

  formatTime = (timeInSeconds?: number) => {
    if (Number.isNaN(timeInSeconds) || !Number.isFinite(timeInSeconds)) {
      return "00:00";
    }

    const t = new Date(timeInSeconds! * 1000)
      .toISOString()
      .substring(11, 19)
      .split(":");

    if (t.length === 3) {
      if (parseInt(t[0]) === 0) return `${t[1]}:${t[2]}`;
      if (parseInt(t[0]) > 0) return `${t[0]}:${t[1]}:${t[2]}`;
    }

    return "00:00";
  };

  on = (event: EventsEnum, fn: Listener) => {
    this._events.on(event, fn);
  };

  removeAllListeners = () => {
    this._events.removeAllListeners();
    this._dashjs.removeEvents();
    this._shaka.removeEvents();
    this._hls.removeEvents();
    this._mediaEvents._removeMediaElementEvents();
  };
}

export const multiPlayer = MultiPlayer.getInstance();
