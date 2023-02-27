import muxjs from 'mux.js';
import { Events } from './Events';
import { MediaElementEvents } from './MediaElementEvents';
import { DashjsPlayer, ShakaPlayer, HlsjsPlayer } from './players';
import {
  DRMEnums,
  EventsEnum,
  IConfig,
  IPlayerState,
  ISource,
  Listener,
  MimeTypesEnum,
  PlayersEnum,
  STORAGE_CONSTANTS,
} from './types';
import {
  _getMediaElement,
  delay,
  _getMainVideoContainer,
  _getMimeType,
  _getCloseCaptionContainer,
} from './Utils';

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
  isPIP: false,
};

export class MultiPlayer {
  static _instance: MultiPlayer;
  private _mediaElement: HTMLVideoElement | null;
  private _source: ISource;
  private _config: IConfig;
  private _playerState: IPlayerState;
  private _textTracks: Array<any>;
  private _timer?: NodeJS.Timeout;
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
    this._retryCount = 0;
    this._textTracks = [];
    this._hls = new HlsjsPlayer(this, this._events);
    this._shaka = new ShakaPlayer(this, this._events);
    this._dashjs = new DashjsPlayer(this, this._events);
    this._mediaEvents = new MediaElementEvents(
      this,
      this._events,
      this._hls,
      this._dashjs,
    );
  }

  static _isBrowser = (): boolean => {
    return typeof window === 'object';
  };

  public static getInstance = (): MultiPlayer => {
    if (this._isBrowser()) {
      if (!MultiPlayer._instance) {
        MultiPlayer._instance = new MultiPlayer();
      }
      return MultiPlayer._instance;
    } else {
      throw new Error('Library only supported in browsers!');
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
        isPIP: false,
      };
    }
    this._playerState = { ...defaultPlayerState, ...current, ...state };
  };

  detachMediaElement = async () => {
    try {
      if (this._playerState.player === PlayersEnum.HLS)
        await this._hls.destroy();
      if (this._playerState.player === PlayersEnum.DASHJS)
        await this._dashjs.destroy();
      if (this._playerState.player === PlayersEnum.SHAKA)
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
          sessionStorage.removeItem('pip-enter');
          document.exitPictureInPicture().catch((e) => console.log());
        }
      });
    }
  };

  reloadPlayer = async (wait = true) => {
    try {
      if (wait) await delay(5 * 1000);
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

  retry = (hard = false) => {
    this._events.loadingErrorEvents(true, false);
    if (hard) {
      this.setSource(this._source, this._config);
      return;
    }
    this.reloadPlayer().catch((e) => console.log());
  };

  setSource = async (source: ISource, config?: IConfig) => {
    clearTimeout(this._timer);

		if (this._mediaElement) {
      try {
        this.hideTextTracks();
        this._mediaElement.pause();
        await this.detachMediaElement();
        this._mediaElement.removeAttribute('src');
        this._mediaElement.load();
        await delay(100);
      } catch (err) {}
    }

    this.setPlayerState({
      ...defaultPlayerState,
      player: this._playerState.player,
      textTrack: null,
    });



    if (!source.url) {
      console.error('Source URL is not valid.');
      return;
    }

    this._source = { ...source };
    this.updateConfig(config);

    const element = _getMediaElement();
    if (!element) {
      console.error(
        'Please create video element with data-multi-player attribute function.',
      );
      return;
    }

    this.setMediaElement(element);

    this._mediaEvents._init();

    try {
      const isDrm =
        this._source.drm?.drmType === DRMEnums.FAIRPLAY ||
        this._source.drm?.drmType === DRMEnums.WIDEVINE;
      const isM3U8 = _getMimeType(this._source.url) === MimeTypesEnum.M3U8;
      const isMPD = _getMimeType(this._source.url) === MimeTypesEnum.MPD;

      if (isM3U8) {
        if (isDrm) {
          this.setPlayerState({ player: PlayersEnum.SHAKA });
          await this._shaka.initPlayer();
          return;
        }

        this.setPlayerState({ player: PlayersEnum.HLS });
        await this._hls.initPlayer();
        return;
      }

      if (isMPD) {
        if (this._config.useShakaForDashStreams) {
          this.setPlayerState({ player: PlayersEnum.SHAKA });
          await this._shaka.initPlayer();
          return;
        }

        this.setPlayerState({ player: PlayersEnum.DASHJS });
        await this._dashjs.initPlayer();
        return;
      }
    } catch (e) {
      console.log();
    }
  };

  hideTextTracks = (player = false) => {
    if (this._mediaElement) {
      if (!!this._textTracks.length) {
        this._textTracks.forEach((t) =>
          t.track.removeEventListener('cuechange', this.activeCuesEvent, true),
        );
      }
      sessionStorage.removeItem(STORAGE_CONSTANTS.trackId);
			this.resetCloseCaptionContainer();
      if (!player) {
        Object.keys(this._mediaElement.textTracks || {}).forEach(
          (t: any) => (this._mediaElement!.textTracks[t].mode = 'disabled'),
        );
        this._textTracks = [];
        this._events.emit(EventsEnum.TEXTTRACKS, { value: this._textTracks });
      }
    }
  };

  checkTextTracks = () => {
    if (this._mediaElement && !!this._playerState.loaded) {
      clearTimeout(this._timer);
      const tracks = this._mediaElement.textTracks;
      const tracksData: Array<any> = Object.keys(tracks || {}).reduce(
        (a: any, c: any) => {
          tracks[c].mode = 'hidden';
          return tracks[c].kind !== 'metadata' &&
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
        [],
      );

      this._textTracks = tracksData;
      this._events.emit(EventsEnum.TEXTTRACKS, { value: this._textTracks });
      const id = sessionStorage.getItem(STORAGE_CONSTANTS.trackId);
      this.setTextTrack(id, false);
      if (!this._textTracks.length) {
        this._timer = setTimeout(this.checkTextTracks, 500);
      }
    }
  };

  setTextTrack = (id: string | null, player: boolean) => {
    if (!id && !!player) {
      this.hideTextTracks(player);
    }
    if (this._textTracks.length) {
      const idx = this._textTracks.findIndex((t) => t.id === id);
      if (idx !== -1) {
        sessionStorage.setItem(STORAGE_CONSTANTS.trackId, id!);
        this._playerState = { ...this._playerState, textTrack: id };
        this._textTracks[idx].track.addEventListener(
          'cuechange',
          this.activeCuesEvent,
          true,
        );
        return;
      }
      this._playerState = { ...this._playerState, textTrack: null };
      return;
    }
    this._playerState = { ...this._playerState, textTrack: null };
  };

  resetCloseCaptionContainer = () => {
    const container = _getCloseCaptionContainer();
    if (container) {
      container.style.display = 'none';
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
  };

  activeCuesEvent = (e: any) => {
    let text = [];
    const cues = e?.target?.activeCues;

    if (!!Object.keys(cues || {}).length) {
      text = Object.keys(cues).reduce((a: any, c: any) => {
        return [...a, cues[c].text];
      }, []);
    }

    this.resetCloseCaptionContainer();

    const container = _getCloseCaptionContainer();

    if (container) {
      if (!!text.length) {
        text.forEach((txt) => {
          let wrapper = document.createElement('div');
          wrapper.className = 'close-caption';
          wrapper.id = 'close-caption';
          wrapper.innerHTML = txt;
          container.appendChild(wrapper);
        });
        container.style.display = 'flex';
      }
    }
  };

  togglePlayPause = () => {
    const video = this.getMediaElement();
    if (!!video) {
      if (!video.duration) return;

      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
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
      if (!video.duration) return;
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
      if (!video.duration) return;
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
      return '00:00';
    }

    const t = new Date(timeInSeconds! * 1000)
      .toISOString()
      .substring(11, 19)
      .split(':');

    if (t.length === 3) {
      if (parseInt(t[0]) === 0) return `${t[1]}:${t[2]}`;
      if (parseInt(t[0]) > 0) return `${t[0]}:${t[1]}:${t[2]}`;
    }

    return '00:00';
  };

  isLive = () => {
    if (this._mediaElement) {
      if (this._mediaElement.duration === Infinity) return true;
      if (this._shaka.isLive()) return true;
    }

    return false;
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
