# 保活ノート — Claude 向けプロジェクトメモ

## このプロジェクトの本質

- 個人用 SPA。サーバなし。データはブラウザの IndexedDB のみ。
- 現在は **v1 (MVP)** に集中。PWA / オフライン / レーダーチャート / Google Drive 同期は v2 以降のため、頼まれてもいないのに先取り提案しない。
- 要求整理の一次情報は [doc/planning/requirements.md](doc/planning/requirements.md)。仕様判断で迷ったらまずこれを参照する。

## 必ず守る規約

- **ルーティングは HashRouter 固定**。GitHub Pages のサブパス配信でリロード 404 を避けるための採用なので、`BrowserRouter` への置換提案は禁止。
- **配信ベースパスは `VITE_BASE_PATH` で制御**。`vite.config.ts` の `base` を直書きしない（GitHub Actions が自動注入する前提）。
- **IndexedDB は `src/db/database.ts` の repository 経由**でのみ操作する。Dexie インスタンスを各コンポーネントから直接触らない。
- **フォーム入力は [src/components/form/fields/](src/components/form/fields/) のプリミティブを再利用**。素の `<input>` を新規に書かない。
- **紙の記録表とセクション構造を 1:1 対応**させる（[src/components/form/sections/](src/components/form/sections/)）。セクションの分割・統合は要求書側の構造変更が先。
- **共有文字列インポートは「全件上書き」のみ**。マージ実装は v3 まで凍結。JSON 直接の入出力 API は v1 から廃止済み（共有文字列に一本化）。
- **共有文字列フォーマットは [src/lib/shareCodec.ts](src/lib/shareCodec.ts) を一次情報**とする。`Kindergarten` 型を変更したら同ファイルの `KINDERGARTEN_KEY_MAP`（および対応するネスト型 `*_MAP`）を同 PR で必ず追従させる。漏れたら `satisfies` で型エラーになる。enum 値を増やしたときの数値コードテーブル追加は手動なので注意。
- **`Kindergarten` 型を変更したら**、[doc/planning/requirements.md](doc/planning/requirements.md) §6 のスナップショットを同じ PR 内で更新する。実装が正、ドキュメントが追従。

## ディレクトリ責務

- [src/types/](src/types/) — `Kindergarten` 型・定数
- [src/db/](src/db/) — Dexie インスタンス + repository
- [src/lib/](src/lib/) — id 生成 / スコア計算 / 共有文字列 I/O / フォーマット（純関数のみ）
- [src/stores/](src/stores/) — Zustand ストア
- [src/pages/](src/pages/) — ListPage / NewPage / EditPage / SettingsPage
- [src/components/](src/components/) — layout / list / form

## 日常コマンド

| 用途 | コマンド |
|---|---|
| 開発サーバ | `npm run dev`（http://localhost:5173/） |
| 型チェック | `npx tsc --noEmit` |
| 単発テスト | `npm run test` |
| 監視テスト | `npm run test:watch` |
| 本番ビルド検証 | `npm run build` |
| プレビュー | `npm run preview` |
| E2E テスト | `npm run e2e`（Chromium、`webServer` で dev サーバ自動起動） |
| E2E (UI モード) | `npm run e2e:ui` |

## 完了の定義

コード変更を「完了」と報告する前に、最低限以下を満たすこと:

1. `npx tsc --noEmit` が通る
2. `npm run test` が通る
3. UI 変更を伴う場合は `npm run dev` で実ブラウザ動作を確認した旨を明示する（型・テストは UI 正しさを保証しない）
4. ブラウザ API を新規利用または挙動変更した場合は、`e2e/` に Playwright 回帰テストを足したことを明示する（下記「ブラウザ API を扱う変更の追加ルール」参照）

## ブラウザ API を扱う変更の追加ルール

`CompressionStream` / `DecompressionStream` / `Clipboard` / `IndexedDB` / `File System Access` / `FileReader` などのブラウザ API を新規利用または挙動変更する場合、**Vitest（jsdom + Node）の Pass を実ブラウザ動作の根拠にしない**。Node 実装と Chromium 実装でバックプレッシャ・権限・タイミングが異なるため、`e2e/` に Playwright spec で回帰テストを必ず足すこと。

既知の落とし穴:

- Chromium の `CompressionStream` / `DecompressionStream` は readable を並行消費しないと `writer.write()` がバックプレッシャでハングする（Node では発生しない）。書き込みとドレインを並行にすること。実装は [src/lib/shareIO.ts](src/lib/shareIO.ts) の `pipeThroughTransform` を参照。低レイヤの回帰テストは [e2e/compression-stream-backpressure.spec.ts](e2e/compression-stream-backpressure.spec.ts)。

## テスト実行の注意

- `npm run test` はフォアグラウンドで実行する。所要時間はおおむね 10〜15 秒。
- 設定で `pool: 'forks' + fileParallelism: false` を採用しているため、テストは単一 fork で順次実行される。Windows + Node 26 で Vitest 内部の `START_TIMEOUT (60s)` を fork の cold start が超えてしまう問題（旧設定では1回目が必ずタイムアウトしていた）への対処。並列度は犠牲だが、現状のテスト量では実テスト時間 1 秒未満なので体感への影響はない。
- まれに（数十回に1回）長時間化したり flaky になることがある。再実行で通る。
- Bash ツールでバックグラウンド実行する場合（`run_in_background: true`）、出力確認は `TaskOutput` ツールより **`Read` でファイルパスを直接読む方が確実**（TaskOutput スキーマのロードが不要になる）。

## テストの方針

- **ユニットテスト**: Vitest + Testing Library + jsdom。`src/**/*.test.ts(x)` をソースと同居配置。
- IndexedDB を絡める場合は `fake-indexeddb`（[src/test/setup.ts](src/test/setup.ts) で有効化済み）。
- `src/lib/` の純関数は積極的にテストを足す。
- **E2E テスト**: Playwright（Chromium のみ）。[e2e/](e2e/) 配下に `*.spec.ts` で配置。
  - Vitest と Playwright の住み分けは「拡張子」で行う:
    - Vitest: `*.test.ts(x)` のみ（`e2e/` は Vitest の `exclude` に含めてある）
    - Playwright: `*.spec.ts` のみ
  - `npm run e2e` は dev サーバを自動起動するため、別途 `npm run dev` は不要。
  - 初回のみブラウザバイナリを取得する必要あり: `npx playwright install chromium`。CI 導入時もこの 1 行が前提。
