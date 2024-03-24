#!/usr/bin/env node

import { build } from 'esbuild';
import pkg from '../package.json' assert { type: 'json' };
import { sassPlugin } from 'esbuild-sass-plugin';
import npmDts from 'npm-dts';

const { Generator } = npmDts;

new Generator({
  entry: 'src/index.ts',
  output: 'dist/index.d.ts',
}).generate();

build({
  plugins: [sassPlugin()],
  logLevel: 'info',
  entryPoints: ['src/index.ts', 'src/index.scss'],
  bundle: true,
  minify: true,
  splitting: true,
  outdir: 'dist',
  ignoreAnnotations: true,
  legalComments: 'none',
  target: ['esnext'],
  format: 'esm',
  banner: {
    js: `/* eslint-disable */\n/** ${pkg.name}-${pkg.version} */`,
  },
}).catch(() => process.exit(1));
