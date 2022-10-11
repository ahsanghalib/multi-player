export const isSafari = (): boolean =>
  /version\/(\d+).+?safari/.test(
    ((navigator && navigator.userAgent) || "").toLowerCase()
  );
