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

export interface IConfig {
  debug: boolean
}
