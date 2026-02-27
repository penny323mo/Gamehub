import { defineConfig } from 'vite';

export default defineConfig({
  // ⚠️ 改成你嘅 GitHub repo name，例如 /xiangqi-ai/
  base: '/xiangqi-ai/',
  build: {
    outDir: 'dist',
    // Ensure worker is bundled correctly
    rollupOptions: {
      input: 'index.html'
    }
  }
});
