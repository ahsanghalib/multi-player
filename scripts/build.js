#!/usr/bin/env node
import * as esbuild from "esbuild";
import pkg from "../package.json" assert { type: "json" };
import { sassPlugin } from "esbuild-sass-plugin";

esbuild
  .build({
    plugins: [sassPlugin()],
    logLevel: "info",
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    splitting: true,
    outdir: "dist",
    ignoreAnnotations: true,
    legalComments: "none",
    target: ["esnext"],
    format: "esm",
    banner: {
      js: `/* eslint-disable */\n/** ${pkg.name}-${pkg.version} */`,
    },
  })
  .catch(() => process.exit(1));
