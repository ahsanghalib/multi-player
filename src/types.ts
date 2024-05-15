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
  startMuted: boolean;
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
  isUnmounting: boolean;
}

export enum MimeTypesEnum {
  MP4 = 'video/mp4',
  WEBM = 'video/webm',
  TS = 'video/mp2t',
  OGV = 'video/ogg',
  OGG = 'audio/ogg',
  MPEG = 'video/mpeg',
  M3U8_1 = 'application/x-mpegurl',
  M3U8_2 = 'application/vnd.apple.mpegurl',
  MPD = 'application/dash+xml',
  MP3 = 'audio/mpeg',
  AAC = 'audio/aac',
  FLAC = 'audio/flac',
  WAV = 'audio/wav',
  NONE = 'none',
}

export enum DRMEnums {
  WIDEVINE = 'widevine',
  FAIRPLAY = 'fairplay',
}

export enum PlayersEnum {
  SHAKA = 'shaka',
  HLS = 'hls',
  NATIVE = 'native',
  YOUTUBE = 'youtube',
  NONE = 'none',
}

export enum EventsEnum {
  ABORT = 'abort',
  CANPLAY = 'canplay',
  CANPLAYTHROUGH = 'canplaythrough',
  DURATIONCHANGE = 'durationchange',
  EMPTIED = 'emptied',
  ENDED = 'ended',
  ERROR = 'error',
  LOADEDDATA = 'loadeddata',
  LOADEDMETADATA = 'loadedmetadata',
  LOADSTART = 'loadstart',
  PAUSE = 'pause',
  PLAY = 'play',
  PLAYING = 'playing',
  PROGRESS = 'progress',
  RATECHANGE = 'ratechange',
  SEEKED = 'seeked',
  SEEKING = 'seeking',
  STALLED = 'stalled',
  SUSPEND = 'suspend',
  TIMEUPDATE = 'timeupdate',
  VOLUMECHANGE = 'volumechange',
  WAITING = 'waiting',
  LOADING = 'loading',
  LOADED = 'loaded',
  TEXTTRACKS = 'texttracks',
  VIDEOTRACKS = 'videotracks',
  AUDIOTRACKS = 'audiotracks',
  ENCRYPTED = 'encrypted',
}

export enum ShakaEventsEnum {
  BUFFERING = 'buffering',
  ERROR = 'error',
  STALL_DETECTED = 'stalldetected',
}

export const TextTrackLabels = {
  eng: 'English',
  en: 'English',
  und: 'English',
} as const;

export enum BrowsersEnum {
  CHROME = 'chrome',
  SAFARI = 'safari',
  FIREFOX = 'firefox',
  EDGE = 'edge',
  OPERA = 'opera',
  IE = 'ie',
  UNKNOWN = 'unkown',
}

export enum SETTINGS_SUB_MENU {
  NONE = 'none',
  CC = 'cc',
  SETINGS = 'settings',
  CC_SETTINGS = 'cc_settings',
  TEXT_SIZE = 'textSize',
  TEXT_COLOR = 'textColor',
  BG_COLOR = 'bgColor',
  BG_OPACITY = 'bgOpacity',
}

export const SETTINGS_CC_TEXT_SIZE = {
  'Default': 'default',
  '50%': 0.5,
  '75%': 0.75,
  '100%': 1,
  '150%': 1.5,
  '200%': 2,
};

export const SETTINGS_CC_COLORS = {
  Default: 'default',
  White: '255, 255, 255',
  Black: '0, 0, 0',
  Gray: '128, 128, 128',
  Yellow: '255, 255, 0',
  Green: '0, 128, 0',
  Cyan: '0, 255, 255',
  Blue: '0, 0, 255',
  Red: '255, 0, 0',
};

export const SETTINGS_CC_OPACITY = {
  'Default': 'default',
  '25%': 0.2,
  '50%': 0.4,
  '75%': 0.6,
  '100%': 0.8,
};

export enum STORAGE_KEYS {
  CC_ID = 'closeCaptionID',
  CC_STYLES = 'closeCaptionStyles',
  IS_FULL_SCREEN = 'isFullScreen',
  VIDOE_CURRENT_TIME = 'videoCurrentTime',
}

export enum KEYBOARD_CODES {
  SPACE_KEY = 'Space',
  ARROW_UP_KEY = 'ArrowUp',
  ARROW_DOWN_KEY = 'ArrowDown',
  ARROW_LEFT_KEY = 'ArrowLeft',
  ARROW_RIGHT_KEY = 'ArrowRight',
  MUTE_KEY = 'KeyM',
}
