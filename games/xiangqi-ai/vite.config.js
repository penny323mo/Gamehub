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
        .replace(/ crossorigin/g, '')
        // Source index sits at games/xiangqi-ai/, but the built page sits one
        // level deeper at dist/. Shift every shared-layer script up one level so
        // both dev and dist resolve.
        //
        // 本來呢度寫死咗 `online_utils.js` 一個名。加 `safe-storage.js` 嗰陣就
        // 靜靜雞唔改寫、dist 度 404——而 dev 度係好嘅，所以喺自己部機試唔到。
        // **一條淨係識一個名嘅規則，等於下一個檔一定漏。**
        .replace(/src="\.\.\/shared\/js\//g, 'src="../../shared/js/');
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
