#!/usr/bin/env node
const esbuild = require("esbuild");
// const { nodeExternalsPlugin } = require("esbuild-node-externals");
const package = require("../package.json");

esbuild
  .build({
    logLevel: "info",
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    outfile: "dist/build/player.js",
    ignoreAnnotations: true,
    legalComments: "none",
    // plugins: [nodeExternalsPlugin()],
    banner: {
      js: `/* eslint-disable */\n/** ${package.name}-${package.version} */`,
    },
  })
  .catch(() => process.exit(1));
