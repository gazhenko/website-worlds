import { defineConfig } from 'vite';

// GitHub Pages serves the project from https://<user>.github.io/website-worlds/,
// so every built URL is prefixed with this base. Routing uses the URL hash
// (#/world/<id>), which means deep links work without any server rewrites.
export default defineConfig({
  base: '/website-worlds/',
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 300,
  },
  server: {
    open: false,
  },
  preview: {
    port: 4173,
  },
});
