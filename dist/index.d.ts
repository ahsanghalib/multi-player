declare module 'multi-players/airplay' {
  import { UI } from 'multi-players/ui';
  export class AirPlay {
      private ui;
      constructor(ui: UI);
      protected webkitPlaybackTargetAvailabilityChangedEvent: (airplay?: HTMLDivElement, video?: any) => (event: any) => void;
      protected webkitCurrentPlaybackTargetIsWirelessChangedEvent: (isLive: boolean, airplay?: HTMLDivElement, volume?: HTMLDivElement) => (event: any) => void;
      init: () => void;
  }

}
declare module 'multi-players/airplay.test' {
  export {};

}
declare module 'multi-players/cast.sender' {
  import { UI } from 'multi-players/ui';
  export class CastingSender {
      ui: UI;
      androidReceiverCompatible: boolean;
      castReceiverId?: string | null;
      hasReceivers: boolean;
      session: any;
      receiverName: string;
      apiReady: boolean;
      isCasting: boolean;
      seekTime?: number;
      playerCastingButton?: HTMLDivElement;
      isTextTrackVisible: boolean;
      loaded: boolean;
      stoppedForced: boolean;
      type?: 'channel' | 'catchup' | 'dvr' | 'vod' | null;
      constructor(ui: UI);
      load: () => void;
      init: () => void;
      onInitSuccess: () => void;
      onInitError: (error: any) => void;
      onSessionInitiated: (session: any) => void;
      removeListeners: () => void;
      onReceiverStatusChange: (availability: any) => void;
      onConnectionStatusChanged: () => void;
      CastingUIBinds: () => void;
      onConnectionError: (error: any) => void;
      stopCasting: () => void;
      cast: () => void;
      onMessageReceived: (_namespace: any, message: any) => void;
      sendMessage: (data: any) => void;
      onPlayPause: () => void;
      onMuteUnMute: () => void;
      onForward: () => void;
      onRewind: () => void;
      onRestartPlay: () => void;
      onTextTracksChange: () => void;
      sendSourceInfo: ({ type, stream, vidgoToken, seekTime, }: {
          type?: "channel" | "catchup" | "dvr" | "vod" | null | undefined;
          stream?: string | {
              type?: string | undefined;
              data: {
                  media_url: string | undefined;
                  drm_type: string | undefined;
                  drm_details: {
                      server_url: string | undefined;
                      extra_headers: Record<string, string> | undefined;
                  };
              } | string;
          }[] | null | undefined;
          vidgoToken?: string | null | undefined;
          seekTime?: number | null | undefined;
      }) => void;
      sendMediaInfo: ({ vidTitle, description, logoUrl, }: {
          vidTitle?: string | null | undefined;
          description?: string | null | undefined;
          logoUrl?: string | null | undefined;
      }) => void;
      sendRefreshToken: (token?: string) => void;
  }

}
declare module 'multi-players/cast.sender.test' {
  export {};

}
declare module 'multi-players/hls' {
  import Hls from 'hls.js/dist/hls.min';
  import { ISource } from 'multi-players/types';
  import { UI } from 'multi-players/ui';
  export class HlsPlayer {
      private ui;
      player: typeof Hls | null;
      isHlsStopped: boolean;
      constructor(ui: UI);
      init: (video: HTMLVideoElement, source: ISource, debug: boolean) => Promise<void>;
      destroy: () => Promise<void>;
      startLoad: (startPosition?: number) => void;
      stopLoad: () => void;
      addEvents: () => void;
      removeEvents: () => void;
      errorEvent: (e: any, d: any) => void;
  }

}
declare module 'multi-players/hls.test' {
  export {};

}
declare module 'multi-players/index' {
  import { DRMEnums } from 'multi-players/types';
  const player: {
      instance: import("multi-players/player").Player;
      DRMEnums: typeof DRMEnums;
      init: ({ elem, source, contextLogoUrl, videoPosterUrl, config, eventCallbacks, onPauseCallback, onPlayCallback, onLeavePIPCallback, onEnterPIPCallback, onPlayerStateChange, }: {
          elem?: HTMLDivElement | undefined;
          source: import("multi-players/types").ISource;
          config?: Partial<import("multi-players/types").IConfig> | undefined;
          contextLogoUrl?: string | undefined;
          videoPosterUrl?: string | undefined;
          onPauseCallback?: (() => void) | undefined;
          onPlayCallback?: (() => void) | undefined;
          onEnterPIPCallback?: (() => void) | undefined;
          onLeavePIPCallback?: (() => void) | undefined;
          onPlayerStateChange?: ((state: import("multi-players/types").IPlayerState) => void) | undefined;
          eventCallbacks?: {
              event: "ABORT" | "CANPLAY" | "CANPLAYTHROUGH" | "DURATIONCHANGE" | "EMPTIED" | "ENDED" | "ERROR" | "LOADEDDATA" | "LOADEDMETADATA" | "LOADSTART" | "PAUSE" | "PLAY" | "PLAYING" | "PROGRESS" | "RATECHANGE" | "SEEKED" | "SEEKING" | "STALLED" | "SUSPEND" | "TIMEUPDATE" | "VOLUMECHANGE" | "WAITING" | "LOADING" | "LOADED" | "TEXTTRACKS" | "VIDEOTRACKS" | "AUDIOTRACKS" | "ENCRYPTED";
              callback: () => void;
          }[] | undefined;
      }) => Promise<void>;
      getVideoElement: () => HTMLVideoElement | undefined;
      getPlayerState: () => import("multi-players/types").IPlayerState;
      setPlayerState: (state?: Partial<import("multi-players/types").IPlayerState> | undefined) => void;
      unmount: () => void;
      removePlayer: () => void;
      onTogglePlayPause: () => void;
      onToggleMuteUnMute: () => void;
      onToggleForwardRewind: (forward: boolean) => void;
      onSeekTime: (timeInSeconds: number) => void;
      onTogglePip: () => void;
      onToggleFullScreen: () => void;
      onEndedReplay: () => void;
      setCastingSource: ({ type, stream, vidgoToken, seekTime, }: {
          type?: "channel" | "catchup" | "dvr" | "vod" | null | undefined;
          stream?: string | {
              type?: string | undefined;
              data: string | {
                  media_url: string | undefined;
                  drm_type: string | undefined;
                  drm_details: {
                      server_url: string | undefined;
                      extra_headers: Record<string, string> | undefined;
                  };
              };
          }[] | null | undefined;
          vidgoToken?: string | null | undefined;
          seekTime?: number | null | undefined;
      }) => void;
      setCastingMediaInfo: ({ vidTitle, description, logoUrl, }: {
          vidTitle?: string | null | undefined;
          description?: string | null | undefined;
          logoUrl?: string | null | undefined;
      }) => void;
      stopCasting: () => void;
  };
  export { player as default, DRMEnums };

}
declare module 'multi-players/native' {
  import { ISource } from 'multi-players/types';
  import { UI } from 'multi-players/ui';
  export class NativePlayer {
      private ui;
      constructor(ui: UI);
      init: (video: HTMLVideoElement, source: ISource) => Promise<void>;
      destroy: () => Promise<void>;
  }

}
declare module 'multi-players/native.test' {
  export {};

}
declare module 'multi-players/player' {
  /// <reference types="node" />
  import { AirPlay } from 'multi-players/airplay';
  import { CastingSender } from 'multi-players/cast.sender';
  import { HlsPlayer } from 'multi-players/hls';
  import { NativePlayer } from 'multi-players/native';
  import { ShakaPlayer } from 'multi-players/shaka';
  import { EventsEnum, IConfig, IPlayerState, ISource } from 'multi-players/types';
  import { UI } from 'multi-players/ui';
  import { VideoEvents } from 'multi-players/video.events';
  export class Player {
      static _instance: Player | undefined;
      ui: UI;
      videoEvents: VideoEvents;
      native: NativePlayer;
      hls: HlsPlayer;
      shaka: ShakaPlayer;
      airplay: AirPlay;
      castSender: CastingSender;
      isInitialized: boolean;
      stateTimer: NodeJS.Timeout | undefined;
      playerState: IPlayerState;
      source: ISource;
      config: IConfig;
      onPauseCallback?: () => void;
      onPlayCallback?: () => void;
      onEnterPIPCallback?: () => void;
      onLeavePIPCallback?: () => void;
      onPlayerStateChange?: (state: IPlayerState) => void;
      eventCallbacks?: Array<{
          event: keyof typeof EventsEnum;
          callback: () => void;
      }>;
      static _isBrowser: () => boolean;
      constructor();
      static getInstance: () => Player;
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
      init: ({ elem, source, contextLogoUrl, videoPosterUrl, config, eventCallbacks, onPauseCallback, onPlayCallback, onLeavePIPCallback, onEnterPIPCallback, onPlayerStateChange, }: {
          elem?: HTMLDivElement | undefined;
          source: ISource;
          config?: Partial<IConfig> | undefined;
          contextLogoUrl?: string | undefined;
          videoPosterUrl?: string | undefined;
          onPauseCallback?: (() => void) | undefined;
          onPlayCallback?: (() => void) | undefined;
          onEnterPIPCallback?: (() => void) | undefined;
          onLeavePIPCallback?: (() => void) | undefined;
          onPlayerStateChange?: ((state: IPlayerState) => void) | undefined;
          eventCallbacks?: {
              event: keyof typeof EventsEnum;
              callback: () => void;
          }[] | undefined;
      }) => Promise<void>;
      setSource: (source: ISource, retry: boolean) => Promise<void>;
      getSource: () => ISource;
      getConfig: () => IConfig;
      updateConfig: (data?: Partial<IConfig>) => void;
      getPlayerState: () => IPlayerState;
      setPlayerState: (state?: Partial<IPlayerState>) => void;
      fullScreenEvent: (ui: UI) => void;
      enterPIPEvent: (ui: UI) => void;
      leavePIPEvent: (ui: UI) => void;
      getVideoElement: () => HTMLVideoElement | undefined;
      toggleVideoElement: () => void;
      detachMediaElement: (retry: boolean) => Promise<void>;
      removePlayer: () => void;
      removeEvents: () => void;
      unmount: () => void;
      reloadPlayer: (wait?: boolean) => Promise<void>;
      retry: (hard?: boolean) => void;
      onTogglePlayPause: () => void;
      onToggleMuteUnMute: () => void;
      onToggleForwardRewind: (forward: boolean) => void;
      onSeekTime: (timeInSeconds: number) => void;
      onTogglePip: () => void;
      onToggleFullScreen: () => void;
      onEndedReplay: () => void;
      __windowOnLoad: () => void;
      __stateUpdater: () => void;
  }
  export const playerInstance: Player;

}
declare module 'multi-players/player.test' {
  export {};

}
declare module 'multi-players/shaka' {
  import Shaka from 'shaka-player/dist/shaka-player.compiled.debug';
  import { ISource } from 'multi-players/types';
  import { UI } from 'multi-players/ui';
  export class ShakaPlayer {
      ui: UI;
      player: shaka.Player | null;
      isSupported: boolean;
      contentId: string | null;
      url?: string;
      constructor(ui: UI);
      isLive: () => boolean | undefined;
      init: (video: HTMLVideoElement, source: ISource, debug: boolean, mimeType: string, isVidgo: boolean) => Promise<undefined>;
      buydrmWidevineRequestFilter: (source: ISource) => void;
      buydrmFairplayRequestFilter: (source: ISource) => void;
      buyDrmFairplayResponseFilter: () => void;
      vidgoResponseFilter: () => void;
      buydrmWidevineRequestFilterImpl: (source: ISource) => (type: Shaka.net.NetworkingEngine.RequestType, req: Shaka.extern.Request) => void;
      buydrmFairplayRequestFilterImpl: (source: ISource) => (type: Shaka.net.NetworkingEngine.RequestType, req: Shaka.extern.Request) => void;
      buyDrmFairplayResponseFilterImpl: () => (type: Shaka.net.NetworkingEngine.RequestType, resp: Shaka.extern.Response) => void;
      vidgoResponseFilterImpl: () => (type: Shaka.net.NetworkingEngine.RequestType, resp: Shaka.extern.Response) => void;
      initDataTransformImpl: (initData: any, initDataType: any, drmInfo: any) => any;
      basicDrmConfigs: (source: ISource, lagacyFairplay?: boolean) => {
          drm: {
              servers: {
                  'com.widevine.alpha': string;
                  'com.apple.fps.1_0'?: undefined;
                  'com.apple.fps'?: undefined;
              };
              advanced: {
                  'com.widevine.alpha': {
                      videoRobustness: string;
                      audioRobustness: string;
                  };
                  'com.apple.fps.1_0'?: undefined;
                  'com.apple.fps'?: undefined;
              };
              initDataTransform?: undefined;
          };
      } | {
          drm: {
              servers: {
                  'com.apple.fps.1_0': string;
                  'com.widevine.alpha'?: undefined;
                  'com.apple.fps'?: undefined;
              };
              advanced: {
                  'com.apple.fps.1_0': {
                      serverCertificateUri: string | undefined;
                  };
                  'com.widevine.alpha'?: undefined;
                  'com.apple.fps'?: undefined;
              };
              initDataTransform?: undefined;
          };
      } | {
          drm: {
              servers: {
                  'com.apple.fps': string;
                  'com.widevine.alpha'?: undefined;
                  'com.apple.fps.1_0'?: undefined;
              };
              advanced: {
                  'com.apple.fps': {
                      serverCertificateUri: string | undefined;
                  };
                  'com.widevine.alpha'?: undefined;
                  'com.apple.fps.1_0'?: undefined;
              };
              initDataTransform: (initData: any, initDataType: any, drmInfo: any) => any;
          };
      } | {
          drm?: undefined;
      };
      reload: () => Promise<void>;
      destroy: () => Promise<void>;
      addEvents: () => void;
      removeEvents: () => void;
      shakaBufferingEvent: (d: any) => void;
      shakaErrorEvent: (d: any) => void;
      shakaStallDetectedEvent: () => void;
  }

}
declare module 'multi-players/shaka.test' {
  export {};

}
declare module 'multi-players/test-setup' {
  import 'vitest-dom/extend-expect';

}
declare module 'multi-players/types' {
  export interface IDrm {
      drmType: DRMEnums;
      licenseUrl: string;
      certicateUrl?: string;
      licenseHeader?: Record<string, string>;
      requireBase64Encoding?: boolean;
  }
  export interface ISource {
      url?: string;
      drm?: IDrm;
      startTime?: number;
  }
  export type Listener = (...args: any[]) => void;
  export interface IEvents {
      [event: string]: Array<Listener>;
  }
  export interface IConfig {
      debug: boolean;
      isVidgo: boolean;
      maxRetryCount: number;
      disableControls: boolean;
      type: string | null;
      castReceiverId: string | null;
  }
  export interface IPlayerState {
      player: PlayersEnum;
      loaded: boolean;
      uiState: 'loading' | 'error' | 'ended' | 'none';
      textTracks: Array<any>;
      videoTracks: Array<any>;
      audioTracks: Array<any>;
      selectedTextTrackId: string | null;
      selectedVideoTrackId: string | null;
      selectedAudioTrackId: string | null;
      isPlaying: boolean;
      isMuted: boolean;
      showPIP: boolean;
      isPIP: boolean;
      isCasting: boolean;
      isAirplay: boolean;
      hasUserPaused: boolean;
  }
  export enum MimeTypesEnum {
      MP4 = "video/mp4",
      WEBM = "video/webm",
      TS = "video/mp2t",
      OGV = "video/ogg",
      OGG = "audio/ogg",
      MPEG = "video/mpeg",
      M3U8_1 = "application/x-mpegurl",
      M3U8_2 = "application/vnd.apple.mpegurl",
      MPD = "application/dash+xml",
      MP3 = "audio/mpeg",
      AAC = "audio/aac",
      FLAC = "audio/flac",
      WAV = "audio/wav",
      NONE = "none"
  }
  export enum DRMEnums {
      WIDEVINE = "widevine",
      FAIRPLAY = "fairplay"
  }
  export enum PlayersEnum {
      SHAKA = "shaka",
      HLS = "hls",
      NATIVE = "native",
      YOUTUBE = "youtube",
      NONE = "none"
  }
  export enum EventsEnum {
      ABORT = "abort",
      CANPLAY = "canplay",
      CANPLAYTHROUGH = "canplaythrough",
      DURATIONCHANGE = "durationchange",
      EMPTIED = "emptied",
      ENDED = "ended",
      ERROR = "error",
      LOADEDDATA = "loadeddata",
      LOADEDMETADATA = "loadedmetadata",
      LOADSTART = "loadstart",
      PAUSE = "pause",
      PLAY = "play",
      PLAYING = "playing",
      PROGRESS = "progress",
      RATECHANGE = "ratechange",
      SEEKED = "seeked",
      SEEKING = "seeking",
      STALLED = "stalled",
      SUSPEND = "suspend",
      TIMEUPDATE = "timeupdate",
      VOLUMECHANGE = "volumechange",
      WAITING = "waiting",
      LOADING = "loading",
      LOADED = "loaded",
      TEXTTRACKS = "texttracks",
      VIDEOTRACKS = "videotracks",
      AUDIOTRACKS = "audiotracks",
      ENCRYPTED = "encrypted"
  }
  export enum ShakaEventsEnum {
      BUFFERING = "buffering",
      ERROR = "error",
      STALL_DETECTED = "stalldetected"
  }
  export const TextTrackLabels: {
      readonly eng: "English";
      readonly en: "English";
      readonly und: "English";
  };
  export enum BrowsersEnum {
      CHROME = "chrome",
      SAFARI = "safari",
      FIREFOX = "firefox",
      EDGE = "edge",
      OPERA = "opera",
      IE = "ie",
      UNKNOWN = "unkown"
  }
  export enum SETTINGS_SUB_MENU {
      NONE = "none",
      CC = "cc",
      SETINGS = "settings",
      CC_SETTINGS = "cc_settings",
      TEXT_SIZE = "textSize",
      TEXT_COLOR = "textColor",
      BG_COLOR = "bgColor",
      BG_OPACITY = "bgOpacity"
  }
  export const SETTINGS_CC_TEXT_SIZE: {
      Default: string;
      '50%': number;
      '75%': number;
      '100%': number;
      '150%': number;
      '200%': number;
  };
  export const SETTINGS_CC_COLORS: {
      Default: string;
      White: string;
      Black: string;
      Gray: string;
      Yellow: string;
      Green: string;
      Cyan: string;
      Blue: string;
      Red: string;
  };
  export const SETTINGS_CC_OPACITY: {
      Default: string;
      '25%': number;
      '50%': number;
      '75%': number;
      '100%': number;
  };
  export enum STORAGE_KEYS {
      CC_ID = "closeCaptionID",
      CC_STYLES = "closeCaptionStyles",
      IS_FULL_SCREEN = "isFullScreen",
      VIDOE_CURRENT_TIME = "videoCurrentTime"
  }
  export enum KEYBOARD_CODES {
      SPACE_KEY = "Space",
      ARROW_UP_KEY = "ArrowUp",
      ARROW_DOWN_KEY = "ArrowDown",
      ARROW_LEFT_KEY = "ArrowLeft",
      ARROW_RIGHT_KEY = "ArrowRight",
      MUTE_KEY = "KeyM"
  }

}
declare module 'multi-players/ui' {
  /// <reference types="node" />
  import { Player } from 'multi-players/player';
  import { SETTINGS_SUB_MENU } from 'multi-players/types';
  export class UI {
      player?: Player;
      container?: HTMLDivElement;
      containerWrapper?: HTMLDivElement;
      mainWrapper?: HTMLDivElement;
      contextMenu?: HTMLDivElement;
      contextLogoUrl: string;
      videoPosterUrl: string;
      contextMenuTimer: NodeJS.Timeout | null;
      wrapper?: HTMLDivElement;
      media?: HTMLDivElement;
      videoElement?: HTMLVideoElement;
      closeCaptionsContainer?: HTMLDivElement;
      loaderWrapper?: HTMLDivElement;
      endedWrapper?: HTMLDivElement;
      replayButton?: HTMLDivElement;
      errorWrapper?: HTMLDivElement;
      contentNotAvailableWrapper?: HTMLDivElement;
      controlsWrapper?: HTMLDivElement;
      showControlsTimer: NodeJS.Timeout | null;
      controlsPlayPauseButton?: HTMLDivElement;
      controlsVolumeWrapper?: HTMLDivElement;
      controlsVolumeButton?: HTMLDivElement;
      controlsVolumeRangeInput?: HTMLInputElement;
      controlsTimeText?: HTMLDivElement;
      controlsProgressBar?: HTMLDivElement;
      controlsProgressRangeInput?: HTMLInputElement;
      controlsPIP?: HTMLDivElement;
      controlsRemotePlaybackButton?: HTMLDivElement;
      controlsCloseCaptionButton?: HTMLDivElement;
      controlsFullScreen?: HTMLDivElement;
      controlsSettingsButton?: HTMLDivElement;
      optionsMenuWrapper?: HTMLDivElement;
      castingWrapper?: HTMLDivElement;
      castingTitle?: HTMLDivElement;
      castingIconsContainer?: HTMLDivElement;
      castingPlayPauseButton?: HTMLDivElement;
      castingCloseCaptionButton?: HTMLDivElement;
      castingVolumeButtoon?: HTMLDivElement;
      castingRemotePlaybackButton?: HTMLDivElement;
      castingRewindButton?: HTMLDivElement;
      castingForwardButton?: HTMLDivElement;
      castingRestartPlayButton?: HTMLDivElement;
      volumeSliderValue: string;
      progressSliderValue: string;
      isElementsAdded: boolean;
      isCastingUIAdded: boolean;
      optionsMenuState: SETTINGS_SUB_MENU;
      containerFocusCounter: number;
      isContainerFocused: boolean;
      constructor();
      setContainer: (player: Player, elem: HTMLDivElement, contextLogoUrl?: string, videoPosterUrl?: string) => void;
      addElements: () => void;
      removeUI: () => void;
      removeCastingUIElements: () => void;
      removeAllUI: () => void;
      create: (args: {
          tag: string;
          parent?: HTMLElement;
          classListAdd?: string[];
          className?: string;
          id?: string;
          innerHTML?: string;
          innerText?: string;
      }) => any;
      addContainerWrapper: () => void;
      addMainWrapper: () => void;
      addMediaDiv: () => void;
      addWrapperDiv: () => void;
      addAspectRatio: () => void;
      mainWrapperMouseEnter: () => void;
      mainWrapperMouseLeave: () => void;
      mainWrapperContextMenu: (e: MouseEvent) => void;
      hideContextMenu: (timer: boolean) => void;
      mainWrapperClick: (e: MouseEvent) => void;
      addCloseCaptionContainer: () => void;
      addLoaderWrapper: () => void;
      addEndedWrapper: () => void;
      addControlsWrapper: () => void;
      addControlsPlayPauseButton: (parent: HTMLElement) => void;
      addVolumeControls: (parent: HTMLElement) => void;
      addControlsTimeText: (parent: HTMLElement) => void;
      addControlsProgressBar: () => void;
      addControlsPIP: (parent: HTMLElement) => void;
      addControlsRemovePlayback: (parent: HTMLElement) => void;
      addControlsCloseCaptionButton: (parent: HTMLElement) => void;
      addControlsCloseCaptionMenu: () => void;
      addControlsSettingsButton: (parent: HTMLElement) => void;
      addControlsSetingsMenu: () => void;
      addControlsFullScreen: (parent: HTMLElement) => void;
      addContextMenu: () => void;
      addVideoElement: () => void;
      removeVideoPlayer: () => void;
      videoElementContextMenu: (e: MouseEvent) => boolean;
      addOptionsMenuWrapper: () => void;
      addErrorWrapper: () => void;
      addContentNotAvailableWrapper: () => void;
      getVideoElement: () => HTMLVideoElement | undefined;
      addCastingUIElements: () => void;
      addCastingTtile: () => void;
      addCastingIconsContainer: () => void;
      addCastingPlayPauseButton: () => void;
      addCastingCloseCaptionButton: () => void;
      addCastingVolumeButtoon: () => void;
      addCastingRemotePlaybackButton: () => void;
      addCastingRewindButton: () => void;
      addCastingForwardButton: () => void;
      addCastingRestartPlayButton: () => void;
  }

}
declare module 'multi-players/ui.test' {
  export {};

}
declare module 'multi-players/utils' {
  /// <reference types="node" />
  import { BrowsersEnum, EventsEnum, ISource, MimeTypesEnum } from 'multi-players/types';
  import { UI } from 'multi-players/ui';
  export class Utils {
      static retryCount: number;
      static fairPlayErrorCount: number;
      static checkTextTracksTimer: NodeJS.Timeout | null;
      static togglePlayPause(ui: UI): Promise<void>;
      static toggleMuteUnMute(ui: UI): void;
      static toggleForwardRewind(ui: UI, forward: boolean): void;
      static seekTime(ui: UI, timeInSeconds: number): void;
      static togglePip(ui: UI): void;
      static toggleFullScreen(ui: UI): void;
      static fullScreenEvent(ui: UI): void;
      static onEndedReplay(ui: UI): void;
      static isFullScreen(): boolean;
      static formatTime(timeInSeconds?: number): string;
      static getBrowser(): BrowsersEnum;
      static delay(ms?: number): Promise<unknown>;
      static hasHeader(obj: unknown): boolean;
      static toggleShowHide(elem: HTMLElement | undefined, show: 'flex' | 'block' | 'none'): void;
      static toggleOpacity(elem?: HTMLElement, show?: boolean): void;
      static toggleWrappers({ ui, none, loading, error, ended, na, }: {
          ui: UI;
          none?: boolean;
          loading?: boolean;
          error?: boolean;
          ended?: boolean;
          na?: boolean;
      }): void;
      static fatelErrorRetry(ui: UI): void;
      static resetRetryCounter(): void;
      static getMimeType(url?: string): Promise<MimeTypesEnum.MP4 | MimeTypesEnum.WEBM | MimeTypesEnum.OGG | MimeTypesEnum.M3U8_1 | MimeTypesEnum.M3U8_2 | MimeTypesEnum.MPD | MimeTypesEnum.NONE>;
      static urlCheck(source: ISource): boolean;
      static checkTextTracks(ui: UI): void;
      static setCloseCaptionButtonUI(ui: UI): void;
      static isLive(ui: UI): boolean;
      static onVolumeSliderChange(ui: UI, e: any): void;
      static onVideoProgressChange(ui: UI, e: any): void;
      static sliderColorValue(slider: HTMLInputElement): void;
      static enterPIP(ui: UI, callback?: () => void): void;
      static leavePIP(ui: UI, callback?: () => void): void;
      static setSelectedTextTrack(ui: UI, trackId: string | null): void;
      static activeCuesEvent: (ui: UI) => (e: any) => void;
      static toggleTextTracks(ui: UI, trackId: string | null): void;
      static resetCloseCaptionContainer: (ui: UI) => void;
      static setCloseCaptionStyles(ui: UI, styles?: {
          textSize?: number;
          textColor?: string;
          bgColor?: string;
          bgOpacity?: number;
      }, isFullScreen?: boolean): void;
      static getCloseCaptionStyles(): {
          textColor: string | undefined;
          textSize: string | undefined;
          bgColor: string | undefined;
          bgOpacity: string | undefined;
      };
      static isCastSenderFrameworkAvailable(): any;
      static addEventCallback: (ui: UI, event: EventsEnum) => void;
      static keyDownEvents: (ui: UI, event: any) => void;
      static Icons({ type, iconSize, fill, }: {
          type: 'pause' | 'play' | 'volume_up' | 'volume_off' | 'volume_down' | 'cast_enter' | 'cast_exit' | 'airplay_enter' | 'airplay_exit' | 'fullscreen_enter' | 'fullscreen_exit' | 'pip_enter' | 'pip_exit' | 'settings' | 'cc_enabled' | 'cc_disabled' | 'arrow_back' | 'replay' | 'forward' | 'rewind' | 'none';
          iconSize?: string;
          fill?: string;
      }): string;
  }

}
declare module 'multi-players/utils.test' {
  export {};

}
declare module 'multi-players/video.events' {
  import { EventsEnum } from 'multi-players/types';
  import { UI } from 'multi-players/ui';
  export class VideoEvents {
      private ui;
      timeUpdated: boolean;
      progressCounter: number;
      events: Array<{
          event: EventsEnum;
          callback: (e: any) => void;
      }>;
      constructor(ui: UI);
      addEvents: () => void;
      removeEvents: () => void;
      getConfig: () => import("multi-players/types").IConfig | undefined;
      abortEvent: () => void;
      canPlayEvent: () => void;
      canPlayThroughEvent: () => void;
      durationChangeEvent: () => void;
      emptiedEvent: () => void;
      endedEvent: () => void;
      errorEvent: (e: any) => void;
      loadedDataEvent: () => void;
      loadedMetaDataEvent: () => void;
      loadStartEvent: () => void;
      pauseEvent: () => void;
      playEvent: () => void;
      playingEvent: () => void;
      progressEvent: () => void;
      rateChangeEvent: () => void;
      seekedEvent: () => void;
      seekingEvent: () => void;
      stalledEvent: () => void;
      suspendEvent: () => void;
      timeUpdateEvent: () => void;
      volumeChangeEvent: () => void;
      waitingEvent: () => void;
  }

}
declare module 'multi-players/video.events.test' {
  export {};

}
declare module 'multi-players' {
  import main = require('multi-players/src/index');
  export = main;
}