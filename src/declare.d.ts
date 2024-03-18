declare module 'shaka-player' {
  export = shaka as Shaka;
}

declare module 'shaka-player/dist/shaka-player.compiled.debug' {
  export = shaka;
  export as namespace shaka;
}

declare module 'shaka-player/dist/shaka-player.compiled' {
  export = shaka;
  export as namespace shaka;
}

declare module 'mux.js' {
  export = muxjs;
}

declare module 'hls.js/dist/hls.min' {
  export = hls.js;
}
