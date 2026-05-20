# 保活ノート (hokatsu)

保育園見学の所感を記録・比較するためのローカル動作 SPA。
要求整理は [doc/planning/requirements.md](doc/planning/requirements.md) を参照。

## Phase 1 (MVP) でできること

- 紙の記録表に準拠した全項目入力（折りたたみセクション）
- 園の登録・編集・削除
- 一覧表示（並び替え: 見学日 / 印象評価平均 / 園名）
- ブラウザローカル保存（IndexedDB）
- JSON エクスポート / インポート（全件上書き）
- スマホ・PC 両対応のレスポンシブ UI

PWA / オフライン対応 / レーダーチャート / Google Drive 同期は Phase 2 以降。

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
- 端末を変える場合・ブラウザのデータをクリアする前は、**設定ページから JSON エクスポート**でバックアップする。
- インポートは「全件上書き」のみ（Phase 3 でマージ対応予定）。

## 技術スタック

- Vite + React + TypeScript
- Dexie (IndexedDB ラッパ)
- Zustand
- Tailwind CSS v4
- react-router-dom (HashRouter)

## ディレクトリ

```
src/
├─ types/                  Kindergarten 型・定数
├─ db/                     Dexie インスタンス + repository
├─ lib/                    id 生成 / スコア計算 / JSON I/O / フォーマット
├─ stores/                 Zustand ストア
├─ pages/                  ListPage / NewPage / EditPage / SettingsPage
└─ components/
   ├─ layout/              Header / Container
   ├─ list/                KindergartenCard / SortSelector
   └─ form/
      ├─ FormShell.tsx     全セクションをまとめるフォーム本体
      ├─ Section.tsx       折りたたみ <details>
      ├─ fields/           汎用入力プリミティブ
      └─ sections/         紙記録表セクションに 1:1 対応
```
