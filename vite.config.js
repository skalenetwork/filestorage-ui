import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodePolyfills from "rollup-plugin-polyfill-node";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "web3": 'web3/dist/web3.min.js'
    }
  },
  root: './',
  build: {
    outDir: './dist',
    rollupOptions: {
      plugins: [
        nodePolyfills()
      ]
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
});