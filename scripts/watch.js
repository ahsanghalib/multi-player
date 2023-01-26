#!/usr/bin/env node
const esbuild = require("esbuild");
const path = require("path");
const { readFile, writeFile } = require("fs");

esbuild
  .build({
    logLevel: "info",
    entryPoints: ["src/index.ts"],
    bundle: true,
    watch: true,
    outfile: "dist/player.js",
  })
  .then(() => {
    const loc = path.join(__dirname, "../dist/player.js");
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
