import { defineConfig } from 'vite';

// Plugin: strip type="module" and crossorigin from built HTML
// so dist/index.html works when opened via file:// (double-click)
function stripModuleAttrs() {
  return {
    name: 'strip-module-attrs',
    enforce: 'post',
    apply: 'build', // Only run during build, NOT dev server
    transformIndexHtml(html) {
      return html
        .replace(/ type="module"/g, '')
        .replace(/ crossorigin/g, '');
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [stripModuleAttrs()],
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
