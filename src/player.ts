import muxjs from 'mux.js';
import hash from 'object-hash';

import { AirPlay } from './airplay';
import { CastingSender } from './cast.sender';
import { HlsPlayer } from './hls';
import { NativePlayer } from './native';
import { ShakaPlayer } from './shaka';
import {
  BrowsersEnum,
  DRMEnums,
  EventsEnum,
  IConfig,
  IPlayerState,
  ISource,
  MimeTypesEnum,
  PlayersEnum,
  SETTINGS_SUB_MENU,
  STORAGE_KEYS,
} from './types';
import { UI } from './ui';
import { Utils } from './utils';
import { VideoEvents } from './video.events';

const defaultConfig: IConfig = {
  debug: false,
  isVidgo: false,
  maxRetryCount: 5,
  disableControls: false,
  type: null,
  castReceiverId: null,
};

const defaultPlayerState: IPlayerState = {
  player: PlayersEnum.NONE,
  loaded: false,
  uiState: 'none',
  textTracks: [],
  videoTracks: [],
  audioTracks: [],
  selectedTextTrackId: null,
  selectedVideoTrackId: null,
  selectedAudioTrackId: null,
  isPlaying: false,
  isMuted: false,
  showPIP: false,
  isPIP: false,
  isCasting: false,
  isAirplay: false,
  hasUserPaused: false,
};

export class Player {
  static _instance: Player | undefined;

  ui: UI;
  videoEvents: VideoEvents;
  native: NativePlayer;
  hls: HlsPlayer;
  shaka: ShakaPlayer;
  airplay: AirPlay;
  castSender: CastingSender;

  isInitialized = false;
  stateTimer: NodeJS.Timeout | undefined = undefined;
  playerState: IPlayerState;

  source: ISource = { url: undefined, drm: undefined };
  config: IConfig;
  onPauseCallback?: () => void = undefined;
  onPlayCallback?: () => void = undefined;
  onEnterPIPCallback?: () => void = undefined;
  onLeavePIPCallback?: () => void = undefined;
  onPlayerStateChange?: (state: IPlayerState) => void = undefined;
  eventCallbacks?: Array<{
    event: keyof typeof EventsEnum;
    callback: () => void;
  }> = [];

  static _isBrowser = (): boolean => {
    return typeof window === 'object';
  };

  constructor() {
    (window as any).muxjs = muxjs;
    this.ui = new UI();
    this.castSender = new CastingSender(this.ui);
    this.castSender.load();

    this.videoEvents = new VideoEvents(this.ui);
    this.native = new NativePlayer(this.ui);
    this.hls = new HlsPlayer(this.ui);
    this.shaka = new ShakaPlayer(this.ui);
    this.airplay = new AirPlay(this.ui);

    this.config = defaultConfig;
    this.playerState = defaultPlayerState;
  }

  public static getInstance = (): Player => {
    if (this._isBrowser()) {
      if (!Player._instance) {
        Player._instance = new Player();
      }
      return Player._instance;
    } else {
      throw new Error('Library only supported in browsers!');
    }
  };

  /**
   * @param  elem: HTMLDivElement;
   * @param source: ISource;
   * @param config?: Partial<IConfig>;
   * @param contextLogoUrl?: string;
   * @param videoPosterUrl?: string;
   * @param onPauseCallback?: () => void;
   * @param onPlayCallback?: () => void;
   * @param onEnterPIPCallback?: () => void;
   * @param onLeavePIPCallback?: () => void;
   * @param eventCallbacks?: Array<{
      event: keyof typeof EventsEnum;
      callback: () => void;
    }>;
   */
  init = async ({
    elem,
    source,
    contextLogoUrl,
    videoPosterUrl,
    config,
    eventCallbacks,
    onPauseCallback,
    onPlayCallback,
    onLeavePIPCallback,
    onEnterPIPCallback,
    onPlayerStateChange,
  }: {
    elem: HTMLDivElement;
    source: ISource;
    config?: Partial<IConfig>;
    contextLogoUrl?: string;
    videoPosterUrl?: string;
    onPauseCallback?: () => void;
    onPlayCallback?: () => void;
    onEnterPIPCallback?: () => void;
    onLeavePIPCallback?: () => void;
    onPlayerStateChange?: (state: IPlayerState) => void;
    eventCallbacks?: Array<{
      event: keyof typeof EventsEnum;
      callback: () => void;
    }>;
  }) => {
    try {
      if (!elem) return;

      if (!this.isInitialized && !this.playerState.isCasting) {
        clearTimeout(this.stateTimer);
        this.ui.setContainer(this, elem, contextLogoUrl, videoPosterUrl);
        this.videoEvents.addEvents();
        this.airplay.init();
        this.__windowOnLoad();
        Utils.setCloseCaptionStyles(this.ui);
        this.isInitialized = true;
      }

      this.eventCallbacks = eventCallbacks;
      this.onPauseCallback = onPauseCallback;
      this.onPlayCallback = onPlayCallback;
      this.onEnterPIPCallback = onEnterPIPCallback;
      this.onLeavePIPCallback = onLeavePIPCallback;
      this.onPlayerStateChange = onPlayerStateChange;
      this.updateConfig(config);
      this.castSender.init();
      await this.setSource(source, false);
    } catch (e) {
      console.log(e);
    }
  };

  setSource = async (source: ISource, retry: boolean) => {
    try {
      if (!source.url) return Promise.resolve();

      const hashedSourceNew = hash(source);
      const hashedSourceOld = hash(this.source);

      let videoCurrentTime = -1;

      if (hashedSourceNew === hashedSourceOld) {
        videoCurrentTime = Number(sessionStorage.getItem(STORAGE_KEYS.VIDOE_CURRENT_TIME)) || -1;
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.VIDOE_CURRENT_TIME);
      }

      this.source = {
        ...source,
        startTime: source.startTime ?? videoCurrentTime,
      };

      if (this.playerState.isCasting) {
        return Promise.resolve();
      }

      const isDRM =
        this.source.drm?.drmType === DRMEnums.FAIRPLAY ||
        this.source.drm?.drmType === DRMEnums.WIDEVINE;
      const mimeType = await Utils.getMimeType(this.source.url);
      const isM3U8 = mimeType === MimeTypesEnum.M3U8_1 || mimeType === MimeTypesEnum.M3U8_2;
      const isMPD = mimeType === MimeTypesEnum.MPD;
      const isSafari = Utils.getBrowser() === BrowsersEnum.SAFARI;
      const useShaka = isSafari || isDRM || isMPD;
      const useHLS = !isSafari && isM3U8;
      const useNative = !useShaka && !useHLS;

      await this.detachMediaElement(retry);

      if (useShaka) {
        await this.shaka.init(
          this.ui.videoElement,
          this.source,
          this.config.debug,
          mimeType,
          this.config.isVidgo,
        );
        return Promise.resolve();
      }

      if (useHLS) {
        this.setPlayerState({ player: PlayersEnum.HLS });
        await this.hls.init(this.ui.videoElement, this.source, this.config.debug);
        return Promise.resolve();
      }

      if (useNative) {
        this.setPlayerState({ player: PlayersEnum.NATIVE });
        await this.native.init(this.ui.videoElement, this.source);
        return Promise.resolve();
      }
      return Promise.resolve();
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  };

  getSource = () => {
    return this.source;
  };

  getConfig = () => {
    return this.config;
  };

  updateConfig = (data?: Partial<IConfig>) => {
    this.config = { ...defaultConfig, ...this.config, ...data };
  };

  getPlayerState = () => {
    return this.playerState;
  };

  setPlayerState = (state?: Partial<IPlayerState>) => {
    this.playerState = { ...defaultPlayerState, ...this.playerState, ...state };
    if (typeof this.onPlayerStateChange === 'function') {
      this.onPlayerStateChange(this.playerState);
    }
  };

  fullScreenEvent = (ui: UI) => {
    Utils.fullScreenEvent(ui);
  };

  enterPIPEvent = (ui: UI) => {
    Utils.enterPIP(ui, this.onEnterPIPCallback);
  };

  leavePIPEvent = (ui: UI) => {
    Utils.leavePIP(ui, this.onLeavePIPCallback);
  };

  getVideoElement = () => {
    return this.ui.videoElement;
  };

  // NOT IN USE.
  toggleVideoElement = () => {
    Utils.toggleTextTracks(this.ui, null);
    this.videoEvents.removeEvents();
    this.ui.removeVideoPlayer();
    this.ui.addVideoElement();
    this.videoEvents.addEvents();
    this.airplay.init();
    this.castSender.init();
  };

  detachMediaElement = async (retry: boolean) => {
    try {
      if (this.playerState.player === PlayersEnum.NONE) {
        return Promise.resolve();
      }

      if (!retry) {
        Utils.toggleShowHide(this.ui.controlsWrapper, 'none');
        Utils.toggleOpacity(this.ui.controlsWrapper, false);
        Utils.toggleShowHide(this.ui.optionsMenuWrapper, 'none');
        Utils.toggleShowHide(this.ui.controlsProgressBar, 'none');
        this.ui.controlsTimeText.innerText = '';
        this.ui.controlsPIP.innerHTML = '';
        this.ui.controlsPIP.classList.add('none');
        this.ui.controlsCloseCaptionButton.classList.add('none');
        this.ui.optionsMenuState = SETTINGS_SUB_MENU.NONE;
        this.ui.optionsMenuWrapper.innerHTML = '';
        Utils.resetRetryCounter();
      }

      if (this.playerState.player === PlayersEnum.SHAKA) {
        await this.shaka.destroy();
      }

      if (this.playerState.player === PlayersEnum.HLS) {
        await this.hls.destroy();
      }

      if (this.playerState.player === PlayersEnum.NATIVE) {
        await this.native.destroy();
      }

      this.setPlayerState({
        ...defaultPlayerState,
        isCasting: this.playerState.isCasting,
        isPIP: this.playerState.isPIP,
        isAirplay: this.playerState.isAirplay,
      });
      Utils.toggleTextTracks(this.ui, null);

      return Promise.resolve();
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  };

  removePlayer = () => {
    if (!this.isInitialized) return;
    this.ui.videoElement.muted = true;
    this.detachMediaElement(false)
      .then(() => {
        this.videoEvents.removeEvents();
        this.removeEvents();
        if (!!document.pictureInPictureEnabled && !!document.pictureInPictureElement) {
          sessionStorage.removeItem('pip-enter');
          document.exitPictureInPicture().catch((e) => console.log(e));
        }
        this.ui.removeUI();
        this.isInitialized = false;
      })
      .catch(() => {});
  };

  removeEvents = () => {
    document.removeEventListener('fullscreenchange', this.fullScreenEvent.bind(this, this.ui));
    document.removeEventListener('enterpictureinpicture', this.enterPIPEvent.bind(this, this.ui));
    document.removeEventListener('leavepictureinpicture', this.leavePIPEvent.bind(this, this.ui));
    document.removeEventListener('keydown', Utils.keyDownEvents.bind(this, this.ui));
    clearInterval(this.stateTimer);
  };

  unmount = () => {
    if (this.playerState.isCasting) {
      this.castSender.stopCasting();
      this.isInitialized = false;
      this.setPlayerState({
        ...defaultPlayerState,
      });
    }
    if (!this.isInitialized) return;
    sessionStorage.removeItem(STORAGE_KEYS.VIDOE_CURRENT_TIME);
    this.removePlayer();
    this.ui.removeAllUI();
  };

  reloadPlayer = async (wait = true) => {
    try {
      if (wait) await Utils.delay(2 * 1000);

      if (this.playerState.player === PlayersEnum.SHAKA) {
        await this.shaka.reload();
        return Promise.resolve();
      }

      this.retry(true);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject();
    }
  };

  retry = (hard = false) => {
    Utils.toggleWrappers({ ui: this.ui, loading: true });
    if (hard) {
      this.setSource(this.source, hard).catch(() => {});
      return;
    }
    this.reloadPlayer().catch(() => console.log());
  };

  onTogglePlayPause = () => {
    Utils.togglePlayPause(this.ui).catch(() => {});
  };

  onToggleMuteUnMute = () => {
    Utils.toggleMuteUnMute(this.ui);
  };

  onToggleForwardRewind = (forward: boolean) => {
    Utils.toggleForwardRewind(this.ui, forward);
  };

  onSeekTime = (timeInSeconds: number) => {
    Utils.seekTime(this.ui, timeInSeconds);
  };

  onTogglePip = () => {
    Utils.togglePip(this.ui);
  };

  onToggleFullScreen = () => {
    Utils.toggleFullScreen(this.ui);
  };

  onEndedReplay = () => {
    Utils.onEndedReplay(this.ui);
  };

  __windowOnLoad = () => {
    this.removeEvents();
    document.addEventListener('fullscreenchange', this.fullScreenEvent.bind(this, this.ui));
    document.addEventListener('enterpictureinpicture', this.enterPIPEvent.bind(this, this.ui));
    document.addEventListener('leavepictureinpicture', this.leavePIPEvent.bind(this, this.ui));
    document.addEventListener('keydown', Utils.keyDownEvents.bind(this, this.ui));
    this.__stateUpdater();
  };

  __stateUpdater = () => {
    clearTimeout(this.stateTimer);

    // Picture in Picture state.
    const showPIP = !!document.pictureInPictureEnabled;
    const isPIP = this.ui.videoElement === document.pictureInPictureElement;
    if (showPIP) {
      this.ui.controlsPIP.innerHTML = isPIP
        ? Utils.Icons({ type: 'pip_exit' })
        : Utils.Icons({ type: 'pip_enter' });
      this.ui.controlsPIP.classList.remove('none');
    }
    this.setPlayerState({ showPIP, isPIP });

    // timer...
    this.stateTimer = setTimeout(this.__stateUpdater.bind(this), 500);
  };
}

export const playerInstance = Player.getInstance();
