import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    sourcemap: false,
    rollupOptions: {
      input: {
        game: "index.html",
        viewer: "viewer.html"
      }
    }
  }
});
