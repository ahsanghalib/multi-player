#!/usr/bin/env node

const package = require('../package.json')

require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    outfile: "dist/build/player.js",
    ignoreAnnotations: true,
    legalComments: 'none',
    // outdir: "dist/build",
    banner: {
      js: `/* eslint-disable */\n/** ${package.name}-${package.version} */`,
    },
  })
  .catch(() => process.exit(1));
