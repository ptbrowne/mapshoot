/* eslint-disable import/no-extraneous-dependencies */
import path from "path"

import react from "@vitejs/plugin-react"
// import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from "vite"
import svgrPlugin from "vite-plugin-svgr"

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "../dist",
    sourcemap: true
  },
  server: {
    port: 3000
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" }
  },
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true
        // ...svgr options (https://react-svgr.com/docs/options/)
      }
    })
  ]
})
