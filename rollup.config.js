import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel'
import { terser } from "rollup-plugin-terser";
import visualizer from 'rollup-plugin-visualizer';
import json from '@rollup/plugin-json';

export default {
  input: './src/index.js',
  output: {
    file:"bundle.js",
    format:"cjs"
  },
  plugins: [
    resolve({}),
    json(),
    commonjs(),
    // babel(),
    visualizer(),
    terser()
  ]
}