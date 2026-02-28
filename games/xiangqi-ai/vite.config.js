import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  worker: {
    format: 'iife',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js'
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html',
      output: {
        entryFileNames: 'assets/app.bundle.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/style.[ext]'
      }
    }
  }
});
