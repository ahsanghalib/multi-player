declare module "shaka-player" {
  export = shaka;
}

declare module "shaka-player/dist/shaka-player.compiled.debug" {
  export = shaka;
  export as namespace shaka;
}

declare module "mux.js" {
  export = muxjs;
}
