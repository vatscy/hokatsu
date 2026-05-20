import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Windows + Node 26 では threads pool で worker timeout が頻発するため forks を使う。
    pool: 'forks',
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
