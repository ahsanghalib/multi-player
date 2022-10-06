#!/usr/bin/env node

require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    outfile: "dist/build/player.js",
    // outdir: "dist/build",
    banner: {
      js: "/* eslint-disable */",
    },
  })
  .catch(() => process.exit(1));
