import { defineConfig } from 'vite';

// Plugin: strip crossorigin from built HTML
// NOTE: type="module" is kept because the bundle uses import.meta (for Worker)
function stripCrossorigin() {
  return {
    name: 'strip-crossorigin',
    enforce: 'post',
    apply: 'build', // Only run during build, NOT dev server
    transformIndexHtml(html) {
      return html
        .replace(/ crossorigin/g, '');
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [stripCrossorigin()],
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
        // entryFileNames: 'assets/app.bundle.js', // removed to prevent overwrite
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
