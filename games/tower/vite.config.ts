import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            output: {
                // Use IIFE format so dist works under file:// protocol (no ES module CORS issues)
                format: 'iife',
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
                inlineDynamicImports: true,
            },
        },
    },
    server: {
        port: 5173,
        open: true,
    },
});
