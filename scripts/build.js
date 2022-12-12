#!/usr/bin/env node
const esbuild = require("esbuild");
const path = require("path");
const { readFile, writeFile } = require("fs");
const package = require("../package.json");
// const { nodeExternalsPlugin } = require("esbuild-node-externals");

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
  .then(() => {
    const loc = path.join(__dirname, "../dist/build/player.js");
    readFile(loc, "utf-8", (err, contents) => {
      if (err) {
        console.log(err);
        return;
      }
      const replaced = contents.replace(
        /this\.log\(/g,
        "typeof this.log === 'function' && this.log("
      );
      writeFile(loc, replaced, "utf-8", (err) => console.log(err));
    });
  })
  .catch(() => process.exit(1));
