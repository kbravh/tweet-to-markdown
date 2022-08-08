import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

const isProd = process.env.BUILD === 'production'

const banner = `#!/usr/bin/env node`

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    sourcemap: 'inline',
    sourcemapExcludeSources: isProd,
    format: 'cjs',
    banner,
  },
  plugins: [nodeResolve({ preferBuiltins: true }), commonjs(), json(), typescript()],
}
