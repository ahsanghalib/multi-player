import { MimeTypesEnum } from './types';

export const _isSafari = (): boolean =>
  /version\/(\d+).+?safari/.test(
    ((navigator && navigator.userAgent) || '').toLowerCase(),
  );

export const _getMimeType = (url: string | null) =>
  url
    ? /.*(\.m3u8).*$/.test(url)
      ? MimeTypesEnum.M3U8
      : /.*(\.mpd).*$/.test(url)
      ? MimeTypesEnum.MPD
      : 'none'
    : 'none';

export const _getMediaElement = (): HTMLVideoElement | null =>
  document.querySelector('video[data-multi-player]');

export const _getCloseCaptionContainer = (): HTMLDivElement | null =>
  document.querySelector('div[data-multi-player-close-captions]');

export const _getMainVideoContainer = () =>
  document.querySelector('div[data-multi-player-main-container]');

export const delay = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const hasHeader = (obj: unknown) =>
  !!obj &&
  typeof obj === 'object' &&
  Object.keys(obj).length === 1 &&
  typeof Object.keys(obj)[0] === 'string' &&
  typeof Object.values(obj)[0] === 'string';
