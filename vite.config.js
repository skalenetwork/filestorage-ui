import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // "web3": "https://unpkg.com/web3@2.0.0-alpha.1/dist/web3.umd.js"
    }
  },
  root: './',
  build: {
    outDir: './dist',
  }
});