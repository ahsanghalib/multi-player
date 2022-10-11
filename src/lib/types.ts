export interface IPlayer {
  urlCheck: (source: ISource) => boolean;
  initPlayer: (
    mediaElement: HTMLMediaElement,
    source: ISource,
    config: IConfig,
    isVidgo: boolean
  ) => Promise<void>;
  destroy: () => Promise<void>;
  addEvents: () => void;
  removeEvents: () => void;
}

export enum DRMEnums {
  WIDEVINE = "widevine",
  FAIRPLAY = "fairplay",
}

export enum PlayersEnum {
  SHAKA = "shaka",
  HLS = "hls",
  DASHJS = "dashjs",
  NONE = "none",
}

export interface IDrm {
  drmType: DRMEnums;
  licenseUrl: string;
  certicateUrl?: string;
}

export interface ISource {
  url: string | null;
  drm: IDrm | null;
}

export type Listener = (...args: any[]) => void;

export interface IEvents {
  [event: string]: Array<Listener>;
}

export enum MainEventsEnum {
  ERROR = "error",
  LOADING = "loading",
}

export enum VideoEventsEnum {
  WAITING = "waiting",
  PLAYING = "playing",
  ERROR = "error",
  PAUSE = "pause",
  LOADSTART = "loadstart",
}

export enum ShakaEventsEnum {
  BUFFERING = "buffering",
  ERROR = "error",
  STALL_DETECTED = "stalldetected",
}

export const EventsEnum = { ...MainEventsEnum, ...VideoEventsEnum };
export type EventsEnumType = MainEventsEnum | VideoEventsEnum;

export interface IConfig {
  debug: boolean;
  useShakaForDashStreams: boolean;
  isVidgo: boolean;
  startTime?: number;
}

export enum MimeTypesEnum {
  MP4 = "video/mp4",
  M4V = "video/mp4",
  M4A = "audio/mp4",
  WEBM = "video/webm",
  WEBA = "audio/webm",
  MKV = "video/webm",
  TS = "video/mp2t",
  OGV = "video/ogg",
  OGG = "audio/ogg",
  MPG = "video/mpeg",
  MPEG = "video/mpeg",
  M3U8 = "application/x-mpegurl",
  MPD = "application/dash+xml",
  MP3 = "audio/mpeg",
  AAC = "audio/aac",
  FLAC = "audio/flac",
  WAV = "audio/wav",
}
