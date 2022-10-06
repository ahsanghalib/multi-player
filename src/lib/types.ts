export enum DRM_TYPES {
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
  drmType: DRM_TYPES;
  licenseUrl: string;
  certicateUrl?: string;
}

export interface ISource {
  url: string | null;
  drm: IDrm | null;
}

export interface IEventCallbackData {
  loading?: boolean;
  error?: boolean;
  detail?: any;
  shakaLoaded?: boolean;
}

export interface IShakaConfigs {}

export interface IHlsJsConfigs {}

export interface IDashJsConfigs {}

export interface IConfig {
  debug: boolean;
  useShakaForDashStreams: boolean;
  shaka: IShakaConfigs;
  hlsjs: IHlsJsConfigs;
  dashjs: IDashJsConfigs;
}
