import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/tcc-finance-v2/',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  }
});
