# 保育園見学所感記録アプリ 要求整理

## 1. 目的・背景

- 保活において複数の保育園を見学する際の所感を記録し、夫婦間で共有・比較できるようにしたい。
- 現在は紙の記録表（[report.jpg](report.jpg)）で記録しているが、以下の課題がある。
  - 紙のままだと園ごとの比較がしにくい。
  - 片方しか見学に行けなかった園の情報を共有しづらい。
  - 過去の記録の検索性・再利用性が低い。
- 紙の記録表のレイアウト・項目は実用上問題ないため、これをそのままデジタル化することを目指す。

## 2. 利用者・利用シーン

| 区分 | 内容 |
|---|---|
| 利用者 | 夫婦2名 |
| 利用デバイス | スマホ（見学中の入力）／ PC（家での整理・比較） |
| 利用シーン | ①見学中にスマホで入力／②帰宅後にPCで整理・比較／③申込書類作成時に参照 |
| 想定見学件数 | 数件〜十数件規模（既に紙で記録済みの園あり） |

## 3. スコープ方針

「2週間以内にコア機能を使い始めたい」「ただし最終的には紙の全項目をデジタル化したい」を両立するため、**3フェーズ**に分けて段階的に拡張する。

### Phase 1（MVP / 2週間以内・必達）
直近の見学に最低限間に合わせるためのコア機能。入力項目は紙の記録表と同等にする。

- 園の登録・編集・削除
- **入力項目は紙の記録表と同じ全項目**（「4.1 入力（最終形）」のセクション構成に準拠）
  - 基本情報 / 運営条件 / 施設 / 日常運用 / 園内活動 / 費用 / 人物（5段階印象評価含む）/ その他
  - 全項目空欄でも保存可能
  - セクションごとに折りたたみ可能なフォーム
- 園一覧（カード or リスト表示、並び替え: 見学日 / 印象評価平均 / 園名）
- ローカル保存（IndexedDB or localStorage）
- スマホ・PC両対応のレスポンシブUI
- **JSON エクスポート / インポート（簡易版）**
  - 全データを単一 JSON ファイルとして書き出し / 読み込み
  - 用途: 端末故障時のバックアップ、Phase 2→3 のホスティング移行時のデータ持ち越し
  - マージ機能は Phase 3 で実装する想定。Phase 1 では「全件上書き」のみで割り切る

### Phase 2（比較・可視化・オフライン対応 / 1〜2週間後）
入力された全項目を活かして比較・可視化機能を整え、見学中の現場利用に耐える形にする。

- レーダーチャートで複数園の印象評価を可視化（重ね表示で比較）
- 一覧表（スプレッドシート風）で項目を横並びに比較
- フィルタ・絞り込み（分類別 / 評価帯別 など）
- **オフライン対応（PWA 化）**
  - Service Worker によるアセットキャッシュ
  - ホーム画面に追加可能
  - 見学中の電波が弱い環境でも安定動作
- 既存の紙記録の手入力移行作業

### Phase 3（手動共有・拡張 / 必要に応じて）
Phase 1 で実装した JSON 入出力を「夫婦間の共有」に耐えられる形に強化する軽量フェーズ。

- JSON エクスポート / インポートの **マージ対応強化**
  - 相手のデバイス（スマホ・PC）に手動で共有（LINE / メール / AirDrop など）
  - 受け取り側で取り込み時、重複園の扱いを選べる: **上書き / スキップ / 別レコードとして追加**
  - 競合があった場合の差分表示 UI
- タグ機能（気になる / 有力 / 候補外 など）
- URL・マップリンクの記録

### Phase 4（自動同期 / 余裕があれば）
真の意味でのリアルタイム同期。Phase 3 の手動運用に限界を感じた場合に着手。

- Google Drive 連携によるクラウド同期
  - データ本体は JSON ファイルとして Drive の app data folder 上に保存
  - 端末ローカルにキャッシュし、オンライン復帰時に同期
- 画像・写真の添付機能（Google Drive 上に保存）
- 競合解決ロジック（同一園の同時編集）

## 4. 機能要求

### 4.1 入力（Phase 1 完了時の最終形）

紙の記録表に準拠し、以下のセクション構成で入力できる。

| セクション | 主な項目 |
|---|---|
| 基本情報 | 園名 / 見学日 / 時間 / 分類 / 家から距離・時間 / 会社から距離・時間 / メモ |
| 運営条件 | 休園期間 / 祝日保育 / 保育時間 / 延長保育 / クラス定員 / 現在の空き人数 |
| 施設 | 園庭 / おでかけ頻度 / 近隣公園 / プール |
| 日常運用 | 服装 / 給食費 / お弁当 / 慣らし保育 / 連絡帳 / お迎えの判断（発熱基準）/ 保護者参加行事 / 保護者会役員 / 朝やること |
| 園内活動 | 園内の習い事 / 手作りが必要なもの |
| 費用 | 月々の諸費用 / サブスク可能なもの / おむつの処分 |
| 人物 | 案内者 / 印象5段階評価（5項目） |
| その他 | 自由メモ / 1日のスケジュール |

- 全項目必須ではなく、空欄のまま保存できる。
- セクションごとに折りたたみ可能にし、必要な箇所だけ開いて入力できる。
- スマホでも片手で操作しやすい入力UI（チェックボックス・ラジオ・選択肢中心）。

#### 4.1.1 入力項目詳細（選択肢・形式）

各セクション内のフィールド形式と選択肢を以下に定義する。記号の凡例：

- **単一選択**: ラジオ／プルダウン相当。択一。
- **複数選択**: チェックボックス相当。0〜N 個選択可。
- **数値** / **テキスト** / **時刻** / **日付**: 自由入力。
- **動的追加**: 「＋追加」で行を増減できる繰り返しセット。

##### 基本情報

| 項目 | 形式 | 選択肢・補足 |
|---|---|---|
| 園名 | テキスト | |
| 見学日 | 日付 | |
| 時間 | 時刻 〜 時刻 | 見学の開始〜終了 |
| 分類 | 単一選択 | 公立 / 認可 / 認可外 |
| 家から | 数値（km）＋ 数値（分） | |
| 会社から | 数値（km）＋ 数値（分） | |
| メモ | テキスト（複数行） | |

##### 運営条件

| 項目 | 形式 | 選択肢・補足 |
|---|---|---|
| 休園期間（年末年始） | 日付 〜 日付 | 月日のみ |
| 休園期間（その他） | 動的追加（日付 〜 日付） | お盆・GW などを想定し複数登録可 |
| 祝日保育 | 単一選択 | 有 / 無 |
| 保育時間 | 時刻 〜 時刻 | |
| 延長保育 形式 | 単一選択 | 申請制 / 不要 |
| 延長保育 終了時刻 | 時刻 | |
| クラス定員 | 動的追加（数値「才」＋ 数値「各 人」） | 年齢別の定員。クラス数は園により異なるため動的追加 |
| 現在の空き人数 | 動的追加（数値「才」＋ 数値「人」） | 年齢別の空き状況。動的追加 |

##### 施設

| 項目 | 形式 | 選択肢・補足 |
|---|---|---|
| 園庭 有無 | 単一選択 | 有 / 無 |
| 園庭 広さ | 単一選択（未選択可） | 広め / 狭め |
| 園庭 場所 | 単一選択（未選択可） | 屋外 / 屋上 |
| おでかけ | 数値（回/週） または 「基本なし」 | どちらか一方を入力 |
| 公園 距離 | 単一選択（未選択可） | 近い / 遠い |
| 公園 交通量 | 単一選択（未選択可） | 車多い / 車少ない |
| 公園 広さ | 単一選択（未選択可） | 広い / 狭い |
| プール | 単一選択 | 有 / 無 |

##### 日常運用

| 項目 | 形式 | 選択肢・補足 |
|---|---|---|
| 服装 区分 | 複数選択 | 制服 / 私服 / 帽子のみ / その他 |
| 服装 制服の年齢区分 | 複数選択 | 1才〜 / 3才〜（「制服」選択時に有効） |
| 服装 その他補足 | テキスト | 「その他」選択時 |
| 給食費 金額 | 数値（円） | |
| 給食費 単位 | 単一選択 | 回 / 月（切替式） |
| お弁当 有無 | 単一選択 | 有 / 無 |
| お弁当 頻度 | テキスト | 有選択時（毎日 / 週◯回 など） |
| 慣らし保育 有無 | 単一選択 | 有 / 無 |
| 慣らし保育 日数 | 数値（日間） | 有選択時 |
| 連絡帳 | 複数選択 | 紙 / アプリ（併用可） |
| お迎えの判断 発熱基準 | 数値（度以上） | |
| お迎えの判断 その他 | テキスト | |
| 保護者参加行事 回数 | 数値（回/年） | |
| 保護者参加行事 内容 | テキスト | |
| 保護者会役員 | 単一選択 | 当番制 / 希望制 / 指名制 |
| 朝やること | 複数選択 | 登園チェック / 検温 / 生活ノート記入 / 備品補充 / その他 |
| 朝やること 登園チェック手段 | 単一選択 | 紙 / タブレット（「登園チェック」選択時） |
| 朝やること 備品補充の内訳 | 複数選択 | おむつ / 着替え / エプロン類 / 他（「備品補充」選択時） |
| 朝やること その他補足 | テキスト | 「その他」選択時 |

##### 園内活動

| 項目 | 形式 | 選択肢・補足 |
|---|---|---|
| 園内の習い事 | テキスト（複数行） | |
| 手作りが必要なもの | テキスト（複数行） | |

##### 費用

| 項目 | 形式 | 選択肢・補足 |
|---|---|---|
| 月々の諸費用 | 動的追加（テキスト「費名」＋ 数値「円」） | 行ごとに名称と金額。何件でも追加可 |
| サブスク おむつ | 数値（円/月） | |
| サブスク 布団類 | 数値（円/月） | |
| サブスク その他 名称 | テキスト | |
| サブスク その他 金額 | 数値（円/月） | |
| おむつの処分 区分 | 単一選択 | 園にて処分 / 持ち帰り / その他 |
| おむつの処分 その他補足 | テキスト | 「その他」選択時 |

##### 人物

| 項目 | 形式 | 選択肢・補足 |
|---|---|---|
| 案内者 名前 | テキスト | 「◯◯先生」の名前部分 |
| 案内者 役職 | 単一選択 | 園長先生 / 担当の先生 |
| 印象: 先生の印象 | 5段階評価 | 1〜5 |
| 印象: 子供への対応 | 5段階評価 | 1〜5 |
| 印象: 建物の綺麗さ/広さ | 5段階評価 | 1〜5 |
| 印象: おもちゃ/絵本の豊富さ | 5段階評価 | 1〜5 |
| 印象: 園長先生の印象 | 5段階評価 | 1〜5 |

##### その他

| 項目 | 形式 | 選択肢・補足 |
|---|---|---|
| 自由メモ | テキスト（複数行） | 一時保育の有無 / 床暖の有無 / 特別な行事等を想定（プレースホルダで例示） |
| 1日のスケジュール | テキスト（時間帯ごとの自由記述） | 7〜19時。UI 仕様は「7. 課題・要検討事項」参照 |

### 4.2 一覧・比較

- 園を一覧表示（並び替え：見学日 / 印象評価平均 / 園名）
- 比較ビュー
  - レーダーチャート（複数園を重ねて表示、Phase 2）
  - 横並び比較表（Phase 2）

### 4.3 データ操作

- 編集・削除
- JSON エクスポート・インポート（バックアップ／端末間移行のため）
- Phase 3: Google Drive 自動同期

## 5. 非機能要求

| 区分 | 内容 |
|---|---|
| 対応デバイス | スマホ（iOS Safari / Android Chrome）、PC（Chrome） |
| オフライン | Phase 2 から見学中のオフライン入力に対応（PWA）。Phase 1 はオンライン前提（一度ロードすれば SPA として動くが、Service Worker による保証はなし）|
| データ保存 | Phase 1-3: ブラウザローカル（IndexedDB 推奨）／ Phase 4: Google Drive |
| 認証 | Phase 1-3: なし／ Phase 4: Google OAuth（クライアントサイドのみ）|
| 共有範囲 | 夫婦2名のみ（不特定多数への公開なし）|
| データ件数 | 〜数十件想定。性能要件は緩い |

### 5.1 ホスティング・配信制約（重要）

- **バックエンドサーバを持たない**: API サーバ、DB サーバ、サーバサイド処理は一切構築しない。すべての処理はブラウザ内で完結（SPA + クライアントサイドストレージ）。
- **配信されるのは静的ファイルのみ**: HTML / CSS / JS / 画像など。ビルド済み成果物をそのままホスティングに配置する。
- **ホスティング戦略はフェーズ別に切り替える**:

| フェーズ | リポジトリ可視性 | ホスティング | 想定 URL 形式 |
|---|---|---|---|
| Phase 1-2 | **public** | **GitHub Pages** | `https://<username>.github.io/<repo>/` |
| Phase 3-4 | **private** | **別の静的ホスティング（Cloudflare Pages / Netlify / Vercel など）** | 各サービスのドメイン or 独自ドメイン |

- **フェーズ別ホスティング切り替えの背景**:
  - Phase 1-2 はテキスト・評価のみの素朴な構成で、ソースコードが公開されても支障がない。GitHub Pages を無料で使える public リポジトリで運用。
  - Phase 3-4 は JSON のインポート・エクスポート、Google Drive 連携など、データ取り扱いや認証ロジックが絡む。ソースコードを公開リポジトリに置きたくないため、private リポジトリに切り替える。
  - private リポジトリの GitHub Pages 利用は GitHub Pro 以上が必要なため、Cloudflare Pages / Netlify / Vercel など private リポジトリを無料で扱える別サービスへ移行する。
  - いずれのホスティングでも **配信される静的ファイル自体は公開される** ことに変わりはないため、ソースコードに秘密情報（API キー等）はハードコードしない方針は全フェーズ共通。
- **その他の派生設計方針**:
  - Phase 4 の Google Drive 同期はサーバ経由ではなく **ブラウザから直接 Google OAuth + Drive API を叩く** 方式（API キー・クライアント ID は配信物として公開される前提でスコープを Drive の app data folder 等に限定）。
  - ルーティングは HashRouter（`#/...`）を採用する。GitHub Pages はリロード時のサーバサイドルーティングを持たないため。Phase 3 以降の移行先でも同方針を維持し、URL の互換性を保つ。
  - フェーズ移行時は同じビルド成果物が動くよう、ホスティング非依存（ベースパス設定のみ環境変数で切り替え）の構成を Phase 1 から徹底する。

## 6. データモデル概要

[src/types/kindergarten.ts](../../src/types/kindergarten.ts) を正とする。本節はそのスナップショット（変更時は実装側を更新後、こちらも追従）。

- 必須は `id` / `createdAt` / `updatedAt` のみ。それ以外はすべて optional で「空欄保存可」を担保。
- 日付は `YYYY-MM-DD`、時刻は `HH:mm`、休園期間の月日は `MM/DD` 形式の文字列。
- `Rating` は `1 | 2 | 3 | 4 | 5 | null`。

```ts
type Category = '公立' | '認可' | '認可外';
type Rating = 1 | 2 | 3 | 4 | 5 | null;

// クラス定員 / 現在の空き人数 で共用
interface ClassCapacity {
  age?: number | null;   // 才
  count?: number | null; // 人
}

interface CostItem {
  label?: string;
  amountYen?: number | null;
}

interface ScheduleSlot {
  hour: number;  // 7..19
  text?: string;
}

interface Impressions {
  teacher: Rating;    // 先生の印象
  childCare: Rating;  // 子供への対応
  facility: Rating;   // 建物の綺麗さ・広さ
  toysBooks: Rating;  // おもちゃ/絵本の豊富さ
  principal: Rating;  // 園長先生の印象
}

interface ClosurePeriod { from?: string; to?: string; }  // 'MM/DD'
interface ClosurePeriods {
  yearEnd?: ClosurePeriod;
  others?: ClosurePeriod[];
}

interface ExtendedCare {
  applicationRequired?: boolean | null; // true: 申請制 / false: 不要
  timeTo?: string;                      // 終了時刻 'HH:mm'
}

interface YardInfo {
  exists?: boolean | null;
  sizeNote?: '広め' | '狭め' | null;
  placement?: '屋外' | '屋上' | null;
}

interface OutingsInfo {
  perWeek?: number | null;
  basicallyNone?: boolean | null;
}

interface NearbyParkInfo {
  distance?: '近い' | '遠い' | null;
  traffic?: '車多い' | '車少ない' | null;
  size?: '広い' | '狭い' | null;
}

interface ClothingInfo {
  uniform?: boolean;        // 制服（親）
  uniformFrom1?: boolean;   // 制服 1才〜
  uniformFrom3?: boolean;   // 制服 3才〜
  privateClothes?: boolean;
  hatOnly?: boolean;
  otherChecked?: boolean;   // その他（親）
  otherText?: string;
}

interface LunchFee {
  amount?: number | null;
  unit?: '回' | '月' | null;
}

interface BentoRequired {
  required?: boolean | null;
  frequency?: string;
}

interface TrialCare {
  exists?: boolean | null;
  days?: number | null;
}

interface ContactBook { paper?: boolean; app?: boolean; }

interface PickupCriteria {
  feverThreshold?: number | null;
  other?: string;
}

interface ParentEvents {
  perYear?: number | null;
  content?: string;
}

interface SupplyRefill {
  diaper?: boolean;
  clothes?: boolean;
  apron?: boolean;
  other?: string;
}

interface MorningTasks {
  attendanceChecked?: boolean;                       // 登園チェック（親）
  attendanceMethod?: '紙' | 'タブレット' | null;
  tempCheck?: boolean;
  journalEntry?: boolean;
  supplyChecked?: boolean;                           // 備品補充（親）
  supplyRefill?: SupplyRefill;
  otherChecked?: boolean;                            // その他（親）
  otherText?: string;
}

interface Subscriptions {
  diaperYenPerMonth?: number | null;
  beddingYenPerMonth?: number | null;
  otherLabel?: string;
  otherYenPerMonth?: number | null;
}

interface GuidePerson {
  name?: string;
  role?: '園長' | '担当' | null;
}

interface Kindergarten {
  id: string;

  // --- 基本情報 ---
  name?: string;
  visitedAt?: string;       // YYYY-MM-DD
  visitTimeFrom?: string;   // HH:mm
  visitTimeTo?: string;
  category?: Category | null;
  distanceFromHomeKm?: number | null;
  distanceFromHomeMin?: number | null;
  distanceFromWorkKm?: number | null;
  distanceFromWorkMin?: number | null;
  generalMemo?: string;

  // --- 運営条件 ---
  closurePeriods?: ClosurePeriods;
  holidayCare?: boolean | null;
  careTimeFrom?: string;
  careTimeTo?: string;
  extendedCare?: ExtendedCare;
  classCapacities?: ClassCapacity[];
  vacancies?: ClassCapacity[];

  // --- 施設 ---
  yard?: YardInfo;
  outings?: OutingsInfo;
  nearbyPark?: NearbyParkInfo;
  pool?: boolean | null;

  // --- 日常運用 ---
  clothing?: ClothingInfo;
  lunchFee?: LunchFee;
  bentoRequired?: BentoRequired;
  trialCare?: TrialCare;
  contactBook?: ContactBook;
  pickupCriteria?: PickupCriteria;
  parentEvents?: ParentEvents;
  parentCouncil?: '当番制' | '希望制' | '指名制' | null;
  morningTasks?: MorningTasks;

  // --- 園内活動 ---
  lessons?: string;
  handmadeItems?: string;

  // --- 費用 ---
  monthlyCosts?: CostItem[];
  subscriptions?: Subscriptions;
  diaperDisposal?: '園にて処分' | '持ち帰り' | 'その他' | null;
  diaperDisposalOther?: string;

  // --- 人物 ---
  guide?: GuidePerson;
  impressions?: Impressions;

  // --- その他 ---
  freeMemo?: string;
  schedule?: ScheduleSlot[];

  // --- メタ ---
  createdAt: string;  // ISO datetime
  updatedAt: string;
}
```

## 7. 課題・要検討事項

- **JSON 共有時のマージ戦略**: Phase 3 でインポート時に同一園が既存データにある場合、上書き / スキップ / 別レコードとして追加のいずれにするか。UI でユーザに選ばせる方針で設計。
- **Google Drive 同期の競合解決**: 夫婦が同じ園を同時編集した場合の競合をどう扱うか。Phase 4 設計時に検討。
- **PWA のオフライン時データの整合性**: 複数デバイスでオフライン編集された場合のマージ戦略。
- **既存紙記録の移行**: 件数次第では Phase 2 完了を待たず、Phase 1 のメモ欄に貼り付けるだけの簡易移行も選択肢。
- **1日のスケジュール入力UI**: Phase 1 では時間帯ごとの自由記述に簡略化する方針（4.1.1 参照）。タイムラインバー風の UI は Phase 2 以降で検討。
- **技術スタック**: 未決定。GitHub Pages 上の静的 SPA 前提で、Phase 1 を 2週間で出すには軽量構成が現実的。候補:
  - Vite + React + TypeScript + IndexedDB ラッパ（idb / Dexie）
  - PWA 化は `vite-plugin-pwa` 等で対応
  - 状態管理は最小限（Zustand / React Context）
- **GitHub Pages デプロイ運用（Phase 1-2）**: `main` ブランチへの push をトリガに GitHub Actions でビルド → `gh-pages` ブランチへデプロイする構成を想定。
- **Phase 2 → 3 移行時の作業**:
  - public リポジトリ → private リポジトリへの移行手段（既存リポジトリの可視性変更 or 新規 private リポジトリへミラー）
  - 移行先ホスティングの選定は **Phase 2 完了タイミングで実施**（候補: Cloudflare Pages / Netlify / Vercel）。判断軸: 無料枠 / カスタムドメイン / ビルド時間 / PWA 対応 / プライベートリポジトリでの利用条件
  - 既存ユーザ（夫婦）への URL 変更告知とブックマーク更新
  - 旧 GitHub Pages 側の停止または「移行先へリダイレクト」ページへの差し替え
  - ローカル保存データ（IndexedDB）はドメインが変わると引き継げないため、移行前に Phase 1 の JSON エクスポート機能でバックアップ → 新ドメインでインポートする手順で対応
- **Google Drive 同期の現実性（Phase 4）**: バックエンドなしで OAuth + Drive API を叩く構成は実装可能だが、トークン管理やリフレッシュをクライアント側で扱う必要があり、Phase 1-3 の設計に比べて複雑度が跳ねる。Phase 3 の手動共有運用で支障がなければ Phase 4 は着手しない判断もあり得る。

## 8. 次のステップ

1. 本要求整理を確認・修正
2. 技術スタック選定（Phase 1 を 2週間で出せる構成）
3. Phase 1 の画面設計（入力フォーム / 一覧）
4. 実装開始
