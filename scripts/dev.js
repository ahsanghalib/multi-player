#!/usr/bin/env node

require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/build/player.js",
  })
  .catch(() => process.exit(1));