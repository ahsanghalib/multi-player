import { MimeTypesEnum } from "./types";

export const _isSafari = (): boolean =>
  /version\/(\d+).+?safari/.test(
    ((navigator && navigator.userAgent) || "").toLowerCase()
  );

export const _getMimeType = (url: string) =>
  /.*(\.m3u8).*$/.test(url)
    ? MimeTypesEnum.M3U8
    : /.*(\.mpd).*$/.test(url)
    ? MimeTypesEnum.MPD
    : "none";

export const _getMediaElement = (): HTMLVideoElement | null =>
  document.querySelector("video[data-multi-player]");

export const _getCloseCaptionContainer = (): HTMLDivElement | null =>
  document.querySelector("div[data-multi-player-close-captions]");

export const _getMainVideoContainer = () =>
  document.querySelector("div[data-multi-player-main-container]");

export const delay = (ms: number = 0) => new Promise((resolve) => setTimeout(resolve, ms));
