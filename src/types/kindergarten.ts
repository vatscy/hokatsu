// 保育園見学記録のデータモデル。
// 紙の記録表（doc/planning/report.jpg）に準拠し、ほぼ全フィールドを optional/nullable で保持する。
// 全項目空欄でも保存可能とするため、必須は id / createdAt / updatedAt のみ。
// 各フィールドの形式・選択肢は doc/planning/requirements.md 4.1.1 を参照。

export type Category = '公立' | '認可' | '認可外';

export type Rating = 1 | 2 | 3 | 4 | 5 | null;

// クラス定員 / 現在の空き人数 で共用。age は数値（才）、count は人数。
export interface ClassCapacity {
  age?: number | null;
  count?: number | null;
}

export interface CostItem {
  label?: string;
  amountYen?: number | null;
}

// 7..19 の各時間帯ごとの自由記述（Phase 1 簡略版）
export interface ScheduleSlot {
  hour: number;
  text?: string;
}

export interface Impressions {
  teacher: Rating; // 先生の印象
  childCare: Rating; // 子供への対応
  facility: Rating; // 建物の綺麗さ・広さ
  toysBooks: Rating; // おもちゃ/絵本の豊富さ
  principal: Rating; // 園長先生の印象
}

// 月日のみ。'MM-DD' 形式で保持。
export interface ClosurePeriod {
  from?: string;
  to?: string;
}

export interface ClosurePeriods {
  yearEnd?: ClosurePeriod;
  others?: ClosurePeriod[];
}

export interface ExtendedCare {
  // true: 申請制 / false: 不要
  applicationRequired?: boolean | null;
  timeTo?: string;
}

export interface YardInfo {
  exists?: boolean | null;
  sizeNote?: '広め' | '狭め' | null;
  placement?: '屋外' | '屋上' | null;
}

export interface OutingsInfo {
  perWeek?: number | null;
  basicallyNone?: boolean | null;
}

export interface NearbyParkInfo {
  distance?: '近い' | '遠い' | null;
  traffic?: '車多い' | '車少ない' | null;
  size?: '広い' | '狭い' | null;
}

export interface ClothingInfo {
  uniform?: boolean; // 制服（親）
  uniformFrom1?: boolean; // 制服 1才〜
  uniformFrom3?: boolean; // 制服 3才〜
  privateClothes?: boolean;
  hatOnly?: boolean;
  otherChecked?: boolean; // その他（親）
  otherText?: string;
}

export interface LunchFee {
  amount?: number | null;
  unit?: '回' | '月' | null;
}

export interface BentoRequired {
  required?: boolean | null;
  frequency?: string;
}

export interface TrialCare {
  exists?: boolean | null;
  days?: number | null;
}

export interface ContactBook {
  paper?: boolean;
  app?: boolean;
}

export interface PickupCriteria {
  feverThreshold?: number | null;
  other?: string;
}

export interface ParentEvents {
  perYear?: number | null;
  content?: string;
}

export interface SupplyRefill {
  diaper?: boolean;
  clothes?: boolean;
  apron?: boolean;
  other?: string;
}

export interface MorningTasks {
  attendanceChecked?: boolean; // 登園チェック（親）
  attendanceMethod?: '紙' | 'タブレット' | null;
  tempCheck?: boolean;
  journalEntry?: boolean;
  supplyChecked?: boolean; // 備品補充（親）
  supplyRefill?: SupplyRefill;
  otherChecked?: boolean; // その他（親）
  otherText?: string;
}

export interface Subscriptions {
  diaperYenPerMonth?: number | null;
  beddingYenPerMonth?: number | null;
  otherLabel?: string;
  otherYenPerMonth?: number | null;
}

export interface GuidePerson {
  name?: string;
  role?: '園長' | '担当' | null;
}

export interface Kindergarten {
  id: string;

  // --- 基本情報 ---
  name?: string;
  visitedAt?: string; // YYYY-MM-DD
  visitTimeFrom?: string; // HH:mm
  visitTimeTo?: string;
  category?: Category | null;
  distanceFromHomeKm?: number | null;
  distanceFromHomeMin?: number | null;
  distanceFromStationKm?: number | null;
  distanceFromStationMin?: number | null;
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
  operationMemo?: string;

  // --- 施設 ---
  yard?: YardInfo;
  outings?: OutingsInfo;
  nearbyPark?: NearbyParkInfo;
  pool?: boolean | null;
  bikeParking?: boolean | null;
  facilityMemo?: string;

  // --- 日常運用 ---
  clothing?: ClothingInfo;
  lunchFee?: LunchFee;
  inHouseLunch?: boolean | null;
  bentoRequired?: BentoRequired;
  trialCare?: TrialCare;
  contactBook?: ContactBook;
  pickupCriteria?: PickupCriteria;
  parentEvents?: ParentEvents;
  parentCouncil?: '当番制' | '希望制' | '指名制' | null;
  morningTasks?: MorningTasks;
  lessons?: string;
  handmadeItems?: string;
  bedding?: string;
  sns?: string;
  dailyOperationMemo?: string;

  // --- 費用 ---
  monthlyCosts?: CostItem[];
  subscriptions?: Subscriptions;
  diaperDisposal?: '園にて処分' | '持ち帰り' | 'その他' | null;
  diaperDisposalOther?: string;
  costMemo?: string;

  // --- 人物 ---
  guide?: GuidePerson;
  impressions?: Impressions;
  peopleMemo?: string;

  // --- その他 ---
  freeMemo?: string;
  schedule?: ScheduleSlot[];

  // --- メタ ---
  createdAt: string;
  updatedAt: string;
}

export const SCHEDULE_HOURS: number[] = Array.from({ length: 13 }, (_, i) => i + 7); // 7..19

export const IMPRESSION_KEYS = [
  'teacher',
  'childCare',
  'facility',
  'toysBooks',
  'principal',
] as const satisfies readonly (keyof Impressions)[];

export const IMPRESSION_LABELS: Record<keyof Impressions, string> = {
  teacher: '先生の印象',
  childCare: '子供への対応',
  facility: '建物の綺麗さ・広さ',
  toysBooks: 'おもちゃ/絵本の豊富さ',
  principal: '園長先生の印象',
};
