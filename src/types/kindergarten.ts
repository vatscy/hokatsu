// 保育園見学記録のデータモデル。
// 紙の記録表（doc/planning/report.jpg）に準拠し、ほぼ全フィールドを optional/nullable で保持する。
// 全項目空欄でも保存可能とするため、必須は id / createdAt / updatedAt のみ。

export type Category = '公立' | '認可' | '認可外';

export type Rating = 1 | 2 | 3 | 4 | 5 | null;

export interface ClassCapacity {
  age?: string;
  count?: number | null;
  note?: string;
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

export interface ClosurePeriods {
  yearEnd?: string;
  others?: string;
}

export interface ExtendedCare {
  applicationRequired?: boolean | null;
  timeFrom?: string;
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
  uniformFrom1?: boolean;
  uniformFrom3?: boolean;
  privateClothes?: boolean;
  hatOnly?: boolean;
  other?: string;
}

export interface LunchFee {
  perMeal?: number | null;
  perMonth?: number | null;
}

export interface BentoRequired {
  required?: boolean | null;
  frequency?: string;
}

export interface TrialCare {
  exists?: boolean | null;
  days?: number | null;
}

export interface PickupCriteria {
  feverThreshold?: number | null;
  other?: string;
}

export interface ParentEvents {
  perYear?: number | null;
  content?: string;
}

export interface MorningTasks {
  attendanceCheck?: '紙' | 'タブレット' | null;
  tempCheck?: boolean;
  journalEntry?: boolean;
  supplyRefill?: {
    diaper?: boolean;
    clothes?: boolean;
    apron?: boolean;
    other?: string;
  };
  other?: string;
}

export interface Subscriptions {
  diaperYenPerMonth?: number | null;
  beddingYenPerMonth?: number | null;
  other?: string;
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
  contactBook?: '紙' | 'アプリ' | null;
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
