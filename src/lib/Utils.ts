import { MimeTypesEnum } from "./types";

export const isSafari = (): boolean =>
  /version\/(\d+).+?safari/.test(
    ((navigator && navigator.userAgent) || "").toLowerCase()
  );

export const getMimeType = (url: string) =>
  /.*(\.m3u8).*$/.test(url)
    ? MimeTypesEnum.M3U8
    : /.*(\.mpd).*$/.test(url)
    ? MimeTypesEnum.MPD
    : "none";
