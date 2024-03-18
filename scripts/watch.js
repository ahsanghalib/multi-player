#!/usr/bin/env node
import * as esbuild from "esbuild";
import pkg from "../package.json" assert { type: "json" };
import { sassPlugin } from "esbuild-sass-plugin";

esbuild
  .build({
    plugins: [sassPlugin()],
    logLevel: "info",
    entryPoints: ["src/index.ts", "src/index.scss"],
    bundle: true,
    outdir: "dist",
    format: "esm",
    watch: true,
  })
  .catch(() => process.exit(1));
