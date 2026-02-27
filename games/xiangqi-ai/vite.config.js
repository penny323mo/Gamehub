import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
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
