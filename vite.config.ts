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
    // さらに Vitest 内部の START_TIMEOUT (60s) を fork の cold start が超えがちで
    // 1回目の実行が必ずタイムアウトする。fileParallelism を切って単一 fork に集約することで
    // spawn 回数を1回にし、cold start のリスクを最小化する。
    pool: 'forks',
    fileParallelism: false,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
