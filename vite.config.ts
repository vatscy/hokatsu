import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const APP_VERSION = process.env.VITE_APP_VERSION ?? 'dev';

// dist/version.json をビルド時に発行する。クライアントはこれを no-store fetch して
// 自身に埋め込まれた __APP_VERSION__ と比較し、変化したら更新バナーを表示する。
const emitVersionJson = (): Plugin => ({
  name: 'emit-version-json',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({ version: APP_VERSION }),
    });
  },
});

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  plugins: [react(), tailwindcss(), emitVersionJson()],
  test: {
    environment: 'jsdom',
    // jsdom はデフォルト URL が about:blank の opaque origin で localStorage を提供しないため、
    // 明示的に http URL を指定して localStorage を有効化する（並び替え設定の永続化テストで必要）。
    environmentOptions: { jsdom: { url: 'http://localhost/' } },
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
