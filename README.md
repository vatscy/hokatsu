# 保活ノート (hokatsu)

保育園見学の所感を記録・比較するためのローカル動作 SPA。
要求整理は [doc/planning/requirements.md](doc/planning/requirements.md) を参照。

公開 URL: https://vatscy.github.io/hokatsu/

## v1 (MVP) でできること

- 紙の記録表に準拠した全項目入力（折りたたみセクション）
- 園の登録・編集・削除
- 一覧表示（並び替え: 見学日 / 印象評価平均 / 園名 / 家からの距離（km・分））
- ブラウザローカル保存（IndexedDB）
- 共有文字列によるバックアップ／端末間移行（短縮文字列 `h1:...`）
  - クリップボードへコピー＆ペースト
  - txt ファイルとしてダウンロード／アップロード
  - 取り込みは全件上書きのみ（v3 でマージ対応予定）
- スマホ・PC 両対応のレスポンシブ UI

PWA / オフライン対応 / レーダーチャート / Google Drive 同期は v2 以降。

## 開発コマンド

| 用途 | コマンド |
|---|---|
| 開発サーバ | `npm run dev` |
| 型チェック | `npx tsc --noEmit` |
| 単発テスト | `npm run test` |
| 監視テスト | `npm run test:watch` |
| 本番ビルド | `npm run build` |
| プレビュー | `npm run preview` |
| E2E テスト | `npm run e2e`（dev サーバ自動起動） |
| E2E (UI) | `npm run e2e:ui` |

初回のみ Playwright のブラウザ取得が必要: `npx playwright install chromium`。

## セットアップ

```bash
npm install
npm run dev
# → http://localhost:5173/
```

## ビルド・プレビュー

```bash
npm run build
npm run preview
```

## 環境変数

| 変数 | 用途 | デフォルト |
|---|---|---|
| `VITE_BASE_PATH` | 配信ベースパス。GitHub Pages のサブパス配信時に `/<repo>/` を指定。 | `/` |

ローカル開発時は未指定で問題ない。GitHub Actions では `VITE_BASE_PATH=/${{ github.event.repository.name }}/` を自動注入する。

## デプロイ（GitHub Pages）

1. GitHub 上でリポジトリ → Settings → Pages → Source を「**GitHub Actions**」に設定。
2. `main` ブランチへ push すると `.github/workflows/deploy.yml` が走り、自動デプロイされる。
3. 公開 URL: `https://<username>.github.io/<repo>/`

リロード対策として **HashRouter**（`#/...`）を採用しているため、`/#/edit/<id>` のような直リンクも 404 にならない。

## データ保存・バックアップ

- データはブラウザの IndexedDB（DB 名 `hokatsu`）にのみ保存される。
- 設定ページの **「共有文字列で書き出し」** から、クリップボードへのコピーまたは txt ファイルダウンロードでバックアップ・端末間共有ができる（短縮文字列 `h1:...`）。
- 別端末・別ブラウザでは **「共有文字列で読み込み」** に貼り付けるか、txt ファイルをアップロードすれば取り込める（完了後は自動で一覧画面へ戻る）。
- インポートは「全件上書き」のみ（v3 でマージ対応予定）。

## 技術スタック

- Vite + React + TypeScript
- Dexie (IndexedDB ラッパ)
- Zustand
- Tailwind CSS v4
- react-router-dom (HashRouter)
- Vitest + Testing Library + jsdom（単体テスト）
- Playwright / Chromium（E2E テスト）

## ディレクトリ

```
src/
├─ types/                  Kindergarten 型・定数
├─ db/                     Dexie インスタンス + repository
├─ lib/                    id 生成 / スコア計算 / 共有文字列 I/O / フォーマット
├─ stores/                 Zustand ストア
├─ pages/                  ListPage / NewPage / EditPage / SettingsPage
├─ test/                   Vitest セットアップ（fake-indexeddb 等）
└─ components/
   ├─ layout/              Header / Container
   ├─ list/                KindergartenCard / SortSelector
   └─ form/
      ├─ FormShell.tsx     全セクションをまとめるフォーム本体
      ├─ Section.tsx       折りたたみ <details>
      ├─ fields/           汎用入力プリミティブ
      └─ sections/         紙記録表セクションに 1:1 対応
e2e/                       Playwright spec（*.spec.ts）
```
