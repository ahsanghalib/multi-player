/* eslint-disable */
export interface IPlayer {
  urlCheck: (source: ISource) => boolean;
  initPlayer: (
    mediaElement: HTMLMediaElement | null,
    source: ISource,
    config: IConfig,
  ) => Promise<void>;
  destroy: () => Promise<void>;
  addEvents: () => void;
  removeEvents: () => void;
}
export interface IDrm {
  drmType: DRMEnums;
  licenseUrl: string;
  certicateUrl?: string;
  licenseHeader?: Record<string, string>;
}

export interface ISource {
  url: string | null;
  drm: IDrm | null;
}

export type Listener = (...args: any[]) => void;

export interface IEvents {
  [event: string]: Array<Listener>;
}

export interface IConfig {
  debug: boolean;
  useShakaForDashStreams: boolean;
  isVidgo: boolean;
  startTime?: number;
  maxRetryCount: number;
}

export interface IPlayerState {
  player: PlayersEnum;
  loaded: boolean;
  loading: boolean;
  error: boolean;
  ended: boolean;
  textTrack: any;
  videoTrack: any;
  audioTrack: any;
  isPlaying: boolean;
  isPIP: boolean;
}

export enum MimeTypesEnum {
  MP4 = 'video/mp4',
  M4V = 'video/mp4',
  M4A = 'audio/mp4',
  WEBM = 'video/webm',
  WEBA = 'audio/webm',
  MKV = 'video/webm',
  TS = 'video/mp2t',
  OGV = 'video/ogg',
  OGG = 'audio/ogg',
  MPG = 'video/mpeg',
  MPEG = 'video/mpeg',
  M3U8 = 'application/x-mpegurl',
  MPD = 'application/dash+xml',
  MP3 = 'audio/mpeg',
  AAC = 'audio/aac',
  FLAC = 'audio/flac',
  WAV = 'audio/wav',
}

export enum DRMEnums {
  WIDEVINE = 'widevine',
  FAIRPLAY = 'fairplay',
}

export enum PlayersEnum {
  SHAKA = 'shaka',
  HLS = 'hls',
  DASHJS = 'dashjs',
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
}

export enum ShakaEventsEnum {
  BUFFERING = 'buffering',
  ERROR = 'error',
  STALL_DETECTED = 'stalldetected',
}

export enum TextTrackLabels {
  eng = 'English',
  en = 'English',
  und = 'English',
}

export enum STORAGE_CONSTANTS {
  trackId = 'cc-track-id',
  trackLang = 'cc-track-lang',
}
