// 共有文字列内部表現 (compact form) と Kindergarten オブジェクトの相互変換。
//
// 目的: 共有文字列を可能な限り短くする。
//   - フィールド名を 1〜3 文字へマッピング
//   - 日本語 enum を数値コードへ
//   - createdAt/updatedAt を epoch ms の base36 表記へ
//   - null / undefined / "" / [] / {} は出力しない（false と数値 0 は意味があるので残す）
//
// Kindergarten 型を変更したら、本ファイルの KEY_MAP / ENUM_MAP も同 PR で追従させること。
// satisfies で型レベルの網羅性を保証し、shareCodec.test.ts でランタイム網羅性も確認する。

import type {
  BentoRequired,
  Category,
  ClassCapacity,
  ClosurePeriod,
  ClosurePeriods,
  ClothingInfo,
  ContactBook,
  CostItem,
  ExtendedCare,
  GuidePerson,
  Impressions,
  Kindergarten,
  LunchFee,
  MorningTasks,
  NearbyParkInfo,
  OutingsInfo,
  ParentEvents,
  PickupCriteria,
  Rating,
  ScheduleSlot,
  Subscriptions,
  SupplyRefill,
  TrialCare,
  YardInfo,
} from '../types/kindergarten';

export class ImportFormatError extends Error {}

// ===== キー短縮テーブル =====

export const KINDERGARTEN_KEY_MAP = {
  id: 'id',
  name: 'n',
  visitedAt: 'v',
  visitTimeFrom: 'vF',
  visitTimeTo: 'vT',
  category: 'c',
  distanceFromHomeKm: 'dhK',
  distanceFromHomeMin: 'dhM',
  distanceFromStationKm: 'dsK',
  distanceFromStationMin: 'dsM',
  distanceFromWorkKm: 'dwK',
  distanceFromWorkMin: 'dwM',
  generalMemo: 'gM',
  closurePeriods: 'cp',
  holidayCare: 'hC',
  careTimeFrom: 'cF',
  careTimeTo: 'cT',
  extendedCare: 'eC',
  classCapacities: 'cc',
  vacancies: 'va',
  operationMemo: 'oM',
  yard: 'y',
  outings: 'ou',
  nearbyPark: 'np',
  pool: 'po',
  bikeParking: 'bp',
  facilityMemo: 'fM',
  clothing: 'cl',
  lunchFee: 'lf',
  inHouseLunch: 'iL',
  bentoRequired: 'bR',
  trialCare: 'tC',
  contactBook: 'cb',
  pickupCriteria: 'pC',
  parentEvents: 'pE',
  parentCouncil: 'pCo',
  morningTasks: 'mt',
  lessons: 'le',
  handmadeItems: 'hI',
  bedding: 'be',
  sns: 's',
  dailyOperationMemo: 'dO',
  monthlyCosts: 'mc',
  subscriptions: 'sb',
  diaperDisposal: 'dD',
  diaperDisposalOther: 'dDo',
  costMemo: 'coM',
  guide: 'g',
  impressions: 'im',
  peopleMemo: 'peM',
  freeMemo: 'frM',
  schedule: 'sc',
  createdAt: 'ca',
  updatedAt: 'ua',
} as const satisfies Record<keyof Kindergarten, string>;

const CLOSURE_PERIOD_MAP = {
  from: 'f',
  to: 't',
} as const satisfies Record<keyof ClosurePeriod, string>;

const CLOSURE_PERIODS_MAP = {
  yearEnd: 'y',
  others: 'o',
} as const satisfies Record<keyof ClosurePeriods, string>;

const EXTENDED_CARE_MAP = {
  applicationRequired: 'a',
  timeTo: 't',
} as const satisfies Record<keyof ExtendedCare, string>;

const CLASS_CAPACITY_MAP = {
  age: 'a',
  count: 'c',
} as const satisfies Record<keyof ClassCapacity, string>;

const YARD_MAP = {
  exists: 'e',
  sizeNote: 's',
  placement: 'p',
} as const satisfies Record<keyof YardInfo, string>;

const OUTINGS_MAP = {
  perWeek: 'p',
  basicallyNone: 'b',
} as const satisfies Record<keyof OutingsInfo, string>;

const NEARBY_PARK_MAP = {
  distance: 'd',
  traffic: 't',
  size: 's',
} as const satisfies Record<keyof NearbyParkInfo, string>;

const CLOTHING_MAP = {
  uniform: 'u',
  uniformFrom1: 'u1',
  uniformFrom3: 'u3',
  privateClothes: 'p',
  hatOnly: 'h',
  otherChecked: 'oC',
  otherText: 'oT',
} as const satisfies Record<keyof ClothingInfo, string>;

const LUNCH_FEE_MAP = {
  amount: 'a',
  unit: 'u',
} as const satisfies Record<keyof LunchFee, string>;

const BENTO_REQUIRED_MAP = {
  required: 'r',
  frequency: 'f',
} as const satisfies Record<keyof BentoRequired, string>;

const TRIAL_CARE_MAP = {
  exists: 'e',
  days: 'd',
} as const satisfies Record<keyof TrialCare, string>;

const CONTACT_BOOK_MAP = {
  paper: 'p',
  app: 'a',
} as const satisfies Record<keyof ContactBook, string>;

const PICKUP_CRITERIA_MAP = {
  feverThreshold: 'f',
  other: 'o',
} as const satisfies Record<keyof PickupCriteria, string>;

const PARENT_EVENTS_MAP = {
  perYear: 'p',
  content: 'c',
} as const satisfies Record<keyof ParentEvents, string>;

const SUPPLY_REFILL_MAP = {
  diaper: 'd',
  clothes: 'c',
  apron: 'a',
  other: 'o',
} as const satisfies Record<keyof SupplyRefill, string>;

const MORNING_TASKS_MAP = {
  attendanceChecked: 'aC',
  attendanceMethod: 'aM',
  tempCheck: 't',
  journalEntry: 'j',
  supplyChecked: 'sC',
  supplyRefill: 'sR',
  otherChecked: 'oC',
  otherText: 'oT',
} as const satisfies Record<keyof MorningTasks, string>;

const SUBSCRIPTIONS_MAP = {
  diaperYenPerMonth: 'd',
  beddingYenPerMonth: 'b',
  otherLabel: 'oL',
  otherYenPerMonth: 'oY',
} as const satisfies Record<keyof Subscriptions, string>;

const GUIDE_PERSON_MAP = {
  name: 'n',
  role: 'r',
} as const satisfies Record<keyof GuidePerson, string>;

const IMPRESSIONS_MAP = {
  teacher: 't',
  childCare: 'c',
  facility: 'f',
  toysBooks: 'b',
  principal: 'p',
} as const satisfies Record<keyof Impressions, string>;

const COST_ITEM_MAP = {
  label: 'l',
  amountYen: 'a',
} as const satisfies Record<keyof CostItem, string>;

const SCHEDULE_SLOT_MAP = {
  hour: 'h',
  text: 't',
} as const satisfies Record<keyof ScheduleSlot, string>;

// ===== enum コード変換テーブル =====

const CATEGORY_REVERSE = ['公立', '認可', '認可外'] as const;
const CATEGORY_FORWARD: Record<Category, number> = { 公立: 0, 認可: 1, 認可外: 2 };

const PARENT_COUNCIL_REVERSE = ['当番制', '希望制', '指名制'] as const;
const PARENT_COUNCIL_FORWARD: Record<(typeof PARENT_COUNCIL_REVERSE)[number], number> = {
  当番制: 0,
  希望制: 1,
  指名制: 2,
};

const DIAPER_DISPOSAL_REVERSE = ['園にて処分', '持ち帰り', 'その他'] as const;
const DIAPER_DISPOSAL_FORWARD: Record<(typeof DIAPER_DISPOSAL_REVERSE)[number], number> = {
  園にて処分: 0,
  持ち帰り: 1,
  その他: 2,
};

const YARD_SIZE_REVERSE = ['広め', '狭め'] as const;
const YARD_SIZE_FORWARD: Record<(typeof YARD_SIZE_REVERSE)[number], number> = { 広め: 0, 狭め: 1 };

const YARD_PLACEMENT_REVERSE = ['屋外', '屋上'] as const;
const YARD_PLACEMENT_FORWARD: Record<(typeof YARD_PLACEMENT_REVERSE)[number], number> = {
  屋外: 0,
  屋上: 1,
};

const NP_DISTANCE_REVERSE = ['近い', '遠い'] as const;
const NP_DISTANCE_FORWARD: Record<(typeof NP_DISTANCE_REVERSE)[number], number> = {
  近い: 0,
  遠い: 1,
};

const NP_TRAFFIC_REVERSE = ['車多い', '車少ない'] as const;
const NP_TRAFFIC_FORWARD: Record<(typeof NP_TRAFFIC_REVERSE)[number], number> = {
  車多い: 0,
  車少ない: 1,
};

const NP_SIZE_REVERSE = ['広い', '狭い'] as const;
const NP_SIZE_FORWARD: Record<(typeof NP_SIZE_REVERSE)[number], number> = { 広い: 0, 狭い: 1 };

const LUNCH_UNIT_REVERSE = ['回', '月'] as const;
const LUNCH_UNIT_FORWARD: Record<(typeof LUNCH_UNIT_REVERSE)[number], number> = { 回: 0, 月: 1 };

const ATT_METHOD_REVERSE = ['紙', 'タブレット'] as const;
const ATT_METHOD_FORWARD: Record<(typeof ATT_METHOD_REVERSE)[number], number> = {
  紙: 0,
  タブレット: 1,
};

const GUIDE_ROLE_REVERSE = ['園長', '担当'] as const;
const GUIDE_ROLE_FORWARD: Record<(typeof GUIDE_ROLE_REVERSE)[number], number> = {
  園長: 0,
  担当: 1,
};

// ===== 日時 (ISO ↔ base36 epoch ms) =====

export function encodeEpochBase36(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    throw new ImportFormatError(`不正な日時文字列: ${iso}`);
  }
  return ms.toString(36);
}

export function decodeEpochBase36(s: string): string {
  // parseInt は不正文字までを部分解釈してしまうため、文字種を先に検査する
  if (!/^-?[0-9a-z]+$/.test(s)) {
    throw new ImportFormatError(`不正な base36 日時: ${s}`);
  }
  const ms = Number.parseInt(s, 36);
  if (!Number.isFinite(ms)) {
    throw new ImportFormatError(`不正な base36 日時: ${s}`);
  }
  return new Date(ms).toISOString();
}

// ===== ヘルパ =====

// 「値が空か」判定。false / 0 は意味があるので空扱いしない。
function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (v === '') return true;
  return false;
}

function setIfPresent(out: Record<string, unknown>, key: string, value: unknown): void {
  if (isEmptyValue(value)) return;
  out[key] = value;
}

// 子オブジェクトの compact 結果が空オブジェクトならスキップ。
function setObj(
  out: Record<string, unknown>,
  key: string,
  value: Record<string, unknown> | undefined,
): void {
  if (!value) return;
  if (Object.keys(value).length === 0) return;
  out[key] = value;
}

// 配列の各要素を compact して、要素が全て空ならスキップ。
function setArr(
  out: Record<string, unknown>,
  key: string,
  value: Record<string, unknown>[] | undefined,
): void {
  if (!value || value.length === 0) return;
  out[key] = value;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function readString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === 'string' ? v : undefined;
}

function readNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const v = obj[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function readBoolean(obj: Record<string, unknown>, key: string): boolean | undefined {
  const v = obj[key];
  return typeof v === 'boolean' ? v : undefined;
}

function readEnum<T extends string>(
  obj: Record<string, unknown>,
  key: string,
  reverse: readonly T[],
): T | undefined {
  const v = obj[key];
  if (typeof v !== 'number') return undefined;
  return reverse[v];
}

function readRating(obj: Record<string, unknown>, key: string): Rating {
  const v = obj[key];
  if (v === 1 || v === 2 || v === 3 || v === 4 || v === 5) return v;
  return null;
}

// ===== サブ構造 compact / expand =====

function compactClosurePeriod(v: ClosurePeriod): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  setIfPresent(out, CLOSURE_PERIOD_MAP.from, v.from);
  setIfPresent(out, CLOSURE_PERIOD_MAP.to, v.to);
  return out;
}

function expandClosurePeriod(o: Record<string, unknown>): ClosurePeriod {
  const out: ClosurePeriod = {};
  const f = readString(o, CLOSURE_PERIOD_MAP.from);
  if (f) out.from = f;
  const t = readString(o, CLOSURE_PERIOD_MAP.to);
  if (t) out.to = t;
  return out;
}

function compactClosurePeriods(v: ClosurePeriods): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.yearEnd) {
    const ye = compactClosurePeriod(v.yearEnd);
    if (Object.keys(ye).length > 0) out[CLOSURE_PERIODS_MAP.yearEnd] = ye;
  }
  if (v.others && v.others.length > 0) {
    const arr = v.others
      .map(compactClosurePeriod)
      .filter((p) => Object.keys(p).length > 0);
    if (arr.length > 0) out[CLOSURE_PERIODS_MAP.others] = arr;
  }
  return out;
}

function expandClosurePeriods(o: Record<string, unknown>): ClosurePeriods {
  const out: ClosurePeriods = {};
  const ye = o[CLOSURE_PERIODS_MAP.yearEnd];
  if (isObject(ye)) out.yearEnd = expandClosurePeriod(ye);
  const others = o[CLOSURE_PERIODS_MAP.others];
  if (Array.isArray(others)) {
    out.others = others.filter(isObject).map(expandClosurePeriod);
  }
  return out;
}

function compactExtendedCare(v: ExtendedCare): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.applicationRequired != null) {
    out[EXTENDED_CARE_MAP.applicationRequired] = v.applicationRequired;
  }
  setIfPresent(out, EXTENDED_CARE_MAP.timeTo, v.timeTo);
  return out;
}

function expandExtendedCare(o: Record<string, unknown>): ExtendedCare {
  const out: ExtendedCare = {};
  const a = readBoolean(o, EXTENDED_CARE_MAP.applicationRequired);
  if (a !== undefined) out.applicationRequired = a;
  const t = readString(o, EXTENDED_CARE_MAP.timeTo);
  if (t) out.timeTo = t;
  return out;
}

function compactClassCapacity(v: ClassCapacity): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.age != null) out[CLASS_CAPACITY_MAP.age] = v.age;
  if (v.count != null) out[CLASS_CAPACITY_MAP.count] = v.count;
  return out;
}

function expandClassCapacity(o: Record<string, unknown>): ClassCapacity {
  const out: ClassCapacity = {};
  const a = readNumber(o, CLASS_CAPACITY_MAP.age);
  if (a !== undefined) out.age = a;
  const c = readNumber(o, CLASS_CAPACITY_MAP.count);
  if (c !== undefined) out.count = c;
  return out;
}

function compactYard(v: YardInfo): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.exists != null) out[YARD_MAP.exists] = v.exists;
  if (v.sizeNote != null) out[YARD_MAP.sizeNote] = YARD_SIZE_FORWARD[v.sizeNote];
  if (v.placement != null) out[YARD_MAP.placement] = YARD_PLACEMENT_FORWARD[v.placement];
  return out;
}

function expandYard(o: Record<string, unknown>): YardInfo {
  const out: YardInfo = {};
  const e = readBoolean(o, YARD_MAP.exists);
  if (e !== undefined) out.exists = e;
  const s = readEnum(o, YARD_MAP.sizeNote, YARD_SIZE_REVERSE);
  if (s) out.sizeNote = s;
  const p = readEnum(o, YARD_MAP.placement, YARD_PLACEMENT_REVERSE);
  if (p) out.placement = p;
  return out;
}

function compactOutings(v: OutingsInfo): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.perWeek != null) out[OUTINGS_MAP.perWeek] = v.perWeek;
  if (v.basicallyNone != null) out[OUTINGS_MAP.basicallyNone] = v.basicallyNone;
  return out;
}

function expandOutings(o: Record<string, unknown>): OutingsInfo {
  const out: OutingsInfo = {};
  const p = readNumber(o, OUTINGS_MAP.perWeek);
  if (p !== undefined) out.perWeek = p;
  const b = readBoolean(o, OUTINGS_MAP.basicallyNone);
  if (b !== undefined) out.basicallyNone = b;
  return out;
}

function compactNearbyPark(v: NearbyParkInfo): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.distance != null) out[NEARBY_PARK_MAP.distance] = NP_DISTANCE_FORWARD[v.distance];
  if (v.traffic != null) out[NEARBY_PARK_MAP.traffic] = NP_TRAFFIC_FORWARD[v.traffic];
  if (v.size != null) out[NEARBY_PARK_MAP.size] = NP_SIZE_FORWARD[v.size];
  return out;
}

function expandNearbyPark(o: Record<string, unknown>): NearbyParkInfo {
  const out: NearbyParkInfo = {};
  const d = readEnum(o, NEARBY_PARK_MAP.distance, NP_DISTANCE_REVERSE);
  if (d) out.distance = d;
  const t = readEnum(o, NEARBY_PARK_MAP.traffic, NP_TRAFFIC_REVERSE);
  if (t) out.traffic = t;
  const s = readEnum(o, NEARBY_PARK_MAP.size, NP_SIZE_REVERSE);
  if (s) out.size = s;
  return out;
}

function compactClothing(v: ClothingInfo): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.uniform != null) out[CLOTHING_MAP.uniform] = v.uniform;
  if (v.uniformFrom1 != null) out[CLOTHING_MAP.uniformFrom1] = v.uniformFrom1;
  if (v.uniformFrom3 != null) out[CLOTHING_MAP.uniformFrom3] = v.uniformFrom3;
  if (v.privateClothes != null) out[CLOTHING_MAP.privateClothes] = v.privateClothes;
  if (v.hatOnly != null) out[CLOTHING_MAP.hatOnly] = v.hatOnly;
  if (v.otherChecked != null) out[CLOTHING_MAP.otherChecked] = v.otherChecked;
  setIfPresent(out, CLOTHING_MAP.otherText, v.otherText);
  return out;
}

function expandClothing(o: Record<string, unknown>): ClothingInfo {
  const out: ClothingInfo = {};
  const u = readBoolean(o, CLOTHING_MAP.uniform);
  if (u !== undefined) out.uniform = u;
  const u1 = readBoolean(o, CLOTHING_MAP.uniformFrom1);
  if (u1 !== undefined) out.uniformFrom1 = u1;
  const u3 = readBoolean(o, CLOTHING_MAP.uniformFrom3);
  if (u3 !== undefined) out.uniformFrom3 = u3;
  const p = readBoolean(o, CLOTHING_MAP.privateClothes);
  if (p !== undefined) out.privateClothes = p;
  const h = readBoolean(o, CLOTHING_MAP.hatOnly);
  if (h !== undefined) out.hatOnly = h;
  const oc = readBoolean(o, CLOTHING_MAP.otherChecked);
  if (oc !== undefined) out.otherChecked = oc;
  const ot = readString(o, CLOTHING_MAP.otherText);
  if (ot) out.otherText = ot;
  return out;
}

function compactLunchFee(v: LunchFee): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.amount != null) out[LUNCH_FEE_MAP.amount] = v.amount;
  if (v.unit != null) out[LUNCH_FEE_MAP.unit] = LUNCH_UNIT_FORWARD[v.unit];
  return out;
}

function expandLunchFee(o: Record<string, unknown>): LunchFee {
  const out: LunchFee = {};
  const a = readNumber(o, LUNCH_FEE_MAP.amount);
  if (a !== undefined) out.amount = a;
  const u = readEnum(o, LUNCH_FEE_MAP.unit, LUNCH_UNIT_REVERSE);
  if (u) out.unit = u;
  return out;
}

function compactBentoRequired(v: BentoRequired): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.required != null) out[BENTO_REQUIRED_MAP.required] = v.required;
  setIfPresent(out, BENTO_REQUIRED_MAP.frequency, v.frequency);
  return out;
}

function expandBentoRequired(o: Record<string, unknown>): BentoRequired {
  const out: BentoRequired = {};
  const r = readBoolean(o, BENTO_REQUIRED_MAP.required);
  if (r !== undefined) out.required = r;
  const f = readString(o, BENTO_REQUIRED_MAP.frequency);
  if (f) out.frequency = f;
  return out;
}

function compactTrialCare(v: TrialCare): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.exists != null) out[TRIAL_CARE_MAP.exists] = v.exists;
  if (v.days != null) out[TRIAL_CARE_MAP.days] = v.days;
  return out;
}

function expandTrialCare(o: Record<string, unknown>): TrialCare {
  const out: TrialCare = {};
  const e = readBoolean(o, TRIAL_CARE_MAP.exists);
  if (e !== undefined) out.exists = e;
  const d = readNumber(o, TRIAL_CARE_MAP.days);
  if (d !== undefined) out.days = d;
  return out;
}

function compactContactBook(v: ContactBook): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.paper != null) out[CONTACT_BOOK_MAP.paper] = v.paper;
  if (v.app != null) out[CONTACT_BOOK_MAP.app] = v.app;
  return out;
}

function expandContactBook(o: Record<string, unknown>): ContactBook {
  const out: ContactBook = {};
  const p = readBoolean(o, CONTACT_BOOK_MAP.paper);
  if (p !== undefined) out.paper = p;
  const a = readBoolean(o, CONTACT_BOOK_MAP.app);
  if (a !== undefined) out.app = a;
  return out;
}

function compactPickupCriteria(v: PickupCriteria): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.feverThreshold != null) out[PICKUP_CRITERIA_MAP.feverThreshold] = v.feverThreshold;
  setIfPresent(out, PICKUP_CRITERIA_MAP.other, v.other);
  return out;
}

function expandPickupCriteria(o: Record<string, unknown>): PickupCriteria {
  const out: PickupCriteria = {};
  const f = readNumber(o, PICKUP_CRITERIA_MAP.feverThreshold);
  if (f !== undefined) out.feverThreshold = f;
  const x = readString(o, PICKUP_CRITERIA_MAP.other);
  if (x) out.other = x;
  return out;
}

function compactParentEvents(v: ParentEvents): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.perYear != null) out[PARENT_EVENTS_MAP.perYear] = v.perYear;
  setIfPresent(out, PARENT_EVENTS_MAP.content, v.content);
  return out;
}

function expandParentEvents(o: Record<string, unknown>): ParentEvents {
  const out: ParentEvents = {};
  const p = readNumber(o, PARENT_EVENTS_MAP.perYear);
  if (p !== undefined) out.perYear = p;
  const c = readString(o, PARENT_EVENTS_MAP.content);
  if (c) out.content = c;
  return out;
}

function compactSupplyRefill(v: SupplyRefill): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.diaper != null) out[SUPPLY_REFILL_MAP.diaper] = v.diaper;
  if (v.clothes != null) out[SUPPLY_REFILL_MAP.clothes] = v.clothes;
  if (v.apron != null) out[SUPPLY_REFILL_MAP.apron] = v.apron;
  setIfPresent(out, SUPPLY_REFILL_MAP.other, v.other);
  return out;
}

function expandSupplyRefill(o: Record<string, unknown>): SupplyRefill {
  const out: SupplyRefill = {};
  const d = readBoolean(o, SUPPLY_REFILL_MAP.diaper);
  if (d !== undefined) out.diaper = d;
  const c = readBoolean(o, SUPPLY_REFILL_MAP.clothes);
  if (c !== undefined) out.clothes = c;
  const a = readBoolean(o, SUPPLY_REFILL_MAP.apron);
  if (a !== undefined) out.apron = a;
  const x = readString(o, SUPPLY_REFILL_MAP.other);
  if (x) out.other = x;
  return out;
}

function compactMorningTasks(v: MorningTasks): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.attendanceChecked != null) out[MORNING_TASKS_MAP.attendanceChecked] = v.attendanceChecked;
  if (v.attendanceMethod != null) {
    out[MORNING_TASKS_MAP.attendanceMethod] = ATT_METHOD_FORWARD[v.attendanceMethod];
  }
  if (v.tempCheck != null) out[MORNING_TASKS_MAP.tempCheck] = v.tempCheck;
  if (v.journalEntry != null) out[MORNING_TASKS_MAP.journalEntry] = v.journalEntry;
  if (v.supplyChecked != null) out[MORNING_TASKS_MAP.supplyChecked] = v.supplyChecked;
  if (v.supplyRefill) {
    const sr = compactSupplyRefill(v.supplyRefill);
    setObj(out, MORNING_TASKS_MAP.supplyRefill, sr);
  }
  if (v.otherChecked != null) out[MORNING_TASKS_MAP.otherChecked] = v.otherChecked;
  setIfPresent(out, MORNING_TASKS_MAP.otherText, v.otherText);
  return out;
}

function expandMorningTasks(o: Record<string, unknown>): MorningTasks {
  const out: MorningTasks = {};
  const aC = readBoolean(o, MORNING_TASKS_MAP.attendanceChecked);
  if (aC !== undefined) out.attendanceChecked = aC;
  const aM = readEnum(o, MORNING_TASKS_MAP.attendanceMethod, ATT_METHOD_REVERSE);
  if (aM) out.attendanceMethod = aM;
  const tc = readBoolean(o, MORNING_TASKS_MAP.tempCheck);
  if (tc !== undefined) out.tempCheck = tc;
  const j = readBoolean(o, MORNING_TASKS_MAP.journalEntry);
  if (j !== undefined) out.journalEntry = j;
  const sC = readBoolean(o, MORNING_TASKS_MAP.supplyChecked);
  if (sC !== undefined) out.supplyChecked = sC;
  const sR = o[MORNING_TASKS_MAP.supplyRefill];
  if (isObject(sR)) out.supplyRefill = expandSupplyRefill(sR);
  const oc = readBoolean(o, MORNING_TASKS_MAP.otherChecked);
  if (oc !== undefined) out.otherChecked = oc;
  const ot = readString(o, MORNING_TASKS_MAP.otherText);
  if (ot) out.otherText = ot;
  return out;
}

function compactSubscriptions(v: Subscriptions): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.diaperYenPerMonth != null) out[SUBSCRIPTIONS_MAP.diaperYenPerMonth] = v.diaperYenPerMonth;
  if (v.beddingYenPerMonth != null) {
    out[SUBSCRIPTIONS_MAP.beddingYenPerMonth] = v.beddingYenPerMonth;
  }
  setIfPresent(out, SUBSCRIPTIONS_MAP.otherLabel, v.otherLabel);
  if (v.otherYenPerMonth != null) out[SUBSCRIPTIONS_MAP.otherYenPerMonth] = v.otherYenPerMonth;
  return out;
}

function expandSubscriptions(o: Record<string, unknown>): Subscriptions {
  const out: Subscriptions = {};
  const d = readNumber(o, SUBSCRIPTIONS_MAP.diaperYenPerMonth);
  if (d !== undefined) out.diaperYenPerMonth = d;
  const b = readNumber(o, SUBSCRIPTIONS_MAP.beddingYenPerMonth);
  if (b !== undefined) out.beddingYenPerMonth = b;
  const ol = readString(o, SUBSCRIPTIONS_MAP.otherLabel);
  if (ol) out.otherLabel = ol;
  const oy = readNumber(o, SUBSCRIPTIONS_MAP.otherYenPerMonth);
  if (oy !== undefined) out.otherYenPerMonth = oy;
  return out;
}

function compactGuide(v: GuidePerson): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  setIfPresent(out, GUIDE_PERSON_MAP.name, v.name);
  if (v.role != null) out[GUIDE_PERSON_MAP.role] = GUIDE_ROLE_FORWARD[v.role];
  return out;
}

function expandGuide(o: Record<string, unknown>): GuidePerson {
  const out: GuidePerson = {};
  const n = readString(o, GUIDE_PERSON_MAP.name);
  if (n) out.name = n;
  const r = readEnum(o, GUIDE_PERSON_MAP.role, GUIDE_ROLE_REVERSE);
  if (r) out.role = r;
  return out;
}

// Impressions は型上 5 キー全てが必須 (Rating = 1..5 | null)。
// null は省略し、欠損は復元時に null 補完する。
function compactImpressions(v: Impressions): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (v.teacher != null) out[IMPRESSIONS_MAP.teacher] = v.teacher;
  if (v.childCare != null) out[IMPRESSIONS_MAP.childCare] = v.childCare;
  if (v.facility != null) out[IMPRESSIONS_MAP.facility] = v.facility;
  if (v.toysBooks != null) out[IMPRESSIONS_MAP.toysBooks] = v.toysBooks;
  if (v.principal != null) out[IMPRESSIONS_MAP.principal] = v.principal;
  return out;
}

function expandImpressions(o: Record<string, unknown>): Impressions {
  return {
    teacher: readRating(o, IMPRESSIONS_MAP.teacher),
    childCare: readRating(o, IMPRESSIONS_MAP.childCare),
    facility: readRating(o, IMPRESSIONS_MAP.facility),
    toysBooks: readRating(o, IMPRESSIONS_MAP.toysBooks),
    principal: readRating(o, IMPRESSIONS_MAP.principal),
  };
}

function compactCostItem(v: CostItem): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  setIfPresent(out, COST_ITEM_MAP.label, v.label);
  if (v.amountYen != null) out[COST_ITEM_MAP.amountYen] = v.amountYen;
  return out;
}

function expandCostItem(o: Record<string, unknown>): CostItem {
  const out: CostItem = {};
  const l = readString(o, COST_ITEM_MAP.label);
  if (l) out.label = l;
  const a = readNumber(o, COST_ITEM_MAP.amountYen);
  if (a !== undefined) out.amountYen = a;
  return out;
}

function compactScheduleSlot(v: ScheduleSlot): Record<string, unknown> {
  const out: Record<string, unknown> = { [SCHEDULE_SLOT_MAP.hour]: v.hour };
  setIfPresent(out, SCHEDULE_SLOT_MAP.text, v.text);
  return out;
}

function expandScheduleSlot(o: Record<string, unknown>): ScheduleSlot | undefined {
  const hour = readNumber(o, SCHEDULE_SLOT_MAP.hour);
  if (hour === undefined) return undefined;
  const out: ScheduleSlot = { hour };
  const t = readString(o, SCHEDULE_SLOT_MAP.text);
  if (t) out.text = t;
  return out;
}

// ===== Kindergarten compact / expand =====

const KK = KINDERGARTEN_KEY_MAP;

export function compactKindergarten(k: Kindergarten): Record<string, unknown> {
  const out: Record<string, unknown> = {
    [KK.id]: k.id,
    [KK.createdAt]: encodeEpochBase36(k.createdAt),
    [KK.updatedAt]: encodeEpochBase36(k.updatedAt),
  };

  setIfPresent(out, KK.name, k.name);
  setIfPresent(out, KK.visitedAt, k.visitedAt);
  setIfPresent(out, KK.visitTimeFrom, k.visitTimeFrom);
  setIfPresent(out, KK.visitTimeTo, k.visitTimeTo);
  if (k.category != null) out[KK.category] = CATEGORY_FORWARD[k.category];
  if (k.distanceFromHomeKm != null) out[KK.distanceFromHomeKm] = k.distanceFromHomeKm;
  if (k.distanceFromHomeMin != null) out[KK.distanceFromHomeMin] = k.distanceFromHomeMin;
  if (k.distanceFromStationKm != null) out[KK.distanceFromStationKm] = k.distanceFromStationKm;
  if (k.distanceFromStationMin != null) out[KK.distanceFromStationMin] = k.distanceFromStationMin;
  if (k.distanceFromWorkKm != null) out[KK.distanceFromWorkKm] = k.distanceFromWorkKm;
  if (k.distanceFromWorkMin != null) out[KK.distanceFromWorkMin] = k.distanceFromWorkMin;
  setIfPresent(out, KK.generalMemo, k.generalMemo);

  if (k.closurePeriods) setObj(out, KK.closurePeriods, compactClosurePeriods(k.closurePeriods));
  if (k.holidayCare != null) out[KK.holidayCare] = k.holidayCare;
  setIfPresent(out, KK.careTimeFrom, k.careTimeFrom);
  setIfPresent(out, KK.careTimeTo, k.careTimeTo);
  if (k.extendedCare) setObj(out, KK.extendedCare, compactExtendedCare(k.extendedCare));
  if (k.classCapacities) {
    const arr = k.classCapacities
      .map(compactClassCapacity)
      .filter((o) => Object.keys(o).length > 0);
    setArr(out, KK.classCapacities, arr);
  }
  if (k.vacancies) {
    const arr = k.vacancies.map(compactClassCapacity).filter((o) => Object.keys(o).length > 0);
    setArr(out, KK.vacancies, arr);
  }
  setIfPresent(out, KK.operationMemo, k.operationMemo);

  if (k.yard) setObj(out, KK.yard, compactYard(k.yard));
  if (k.outings) setObj(out, KK.outings, compactOutings(k.outings));
  if (k.nearbyPark) setObj(out, KK.nearbyPark, compactNearbyPark(k.nearbyPark));
  if (k.pool != null) out[KK.pool] = k.pool;
  if (k.bikeParking != null) out[KK.bikeParking] = k.bikeParking;
  setIfPresent(out, KK.facilityMemo, k.facilityMemo);

  if (k.clothing) setObj(out, KK.clothing, compactClothing(k.clothing));
  if (k.lunchFee) setObj(out, KK.lunchFee, compactLunchFee(k.lunchFee));
  if (k.inHouseLunch != null) out[KK.inHouseLunch] = k.inHouseLunch;
  if (k.bentoRequired) setObj(out, KK.bentoRequired, compactBentoRequired(k.bentoRequired));
  if (k.trialCare) setObj(out, KK.trialCare, compactTrialCare(k.trialCare));
  if (k.contactBook) setObj(out, KK.contactBook, compactContactBook(k.contactBook));
  if (k.pickupCriteria) setObj(out, KK.pickupCriteria, compactPickupCriteria(k.pickupCriteria));
  if (k.parentEvents) setObj(out, KK.parentEvents, compactParentEvents(k.parentEvents));
  if (k.parentCouncil != null) out[KK.parentCouncil] = PARENT_COUNCIL_FORWARD[k.parentCouncil];
  if (k.morningTasks) setObj(out, KK.morningTasks, compactMorningTasks(k.morningTasks));
  setIfPresent(out, KK.lessons, k.lessons);
  setIfPresent(out, KK.handmadeItems, k.handmadeItems);
  setIfPresent(out, KK.bedding, k.bedding);
  setIfPresent(out, KK.sns, k.sns);
  setIfPresent(out, KK.dailyOperationMemo, k.dailyOperationMemo);

  if (k.monthlyCosts) {
    const arr = k.monthlyCosts.map(compactCostItem).filter((o) => Object.keys(o).length > 0);
    setArr(out, KK.monthlyCosts, arr);
  }
  if (k.subscriptions) setObj(out, KK.subscriptions, compactSubscriptions(k.subscriptions));
  if (k.diaperDisposal != null) out[KK.diaperDisposal] = DIAPER_DISPOSAL_FORWARD[k.diaperDisposal];
  setIfPresent(out, KK.diaperDisposalOther, k.diaperDisposalOther);
  setIfPresent(out, KK.costMemo, k.costMemo);

  if (k.guide) setObj(out, KK.guide, compactGuide(k.guide));
  if (k.impressions) setObj(out, KK.impressions, compactImpressions(k.impressions));
  setIfPresent(out, KK.peopleMemo, k.peopleMemo);

  setIfPresent(out, KK.freeMemo, k.freeMemo);
  if (k.schedule) {
    const arr = k.schedule.map(compactScheduleSlot);
    setArr(out, KK.schedule, arr);
  }

  return out;
}

export function expandKindergarten(input: unknown): Kindergarten {
  if (!isObject(input)) {
    throw new ImportFormatError('レコードがオブジェクトではありません');
  }

  // 未知キーの早期検出（実装漏れ・データ破損を検知）
  const allowed = new Set<string>(Object.values(KK));
  for (const k of Object.keys(input)) {
    if (!allowed.has(k)) {
      throw new ImportFormatError(`未知のキー: ${k}`);
    }
  }

  const id = readString(input, KK.id);
  if (!id) throw new ImportFormatError('id がありません');
  const caRaw = readString(input, KK.createdAt);
  const uaRaw = readString(input, KK.updatedAt);
  if (!caRaw || !uaRaw) throw new ImportFormatError('createdAt / updatedAt がありません');

  const out: Kindergarten = {
    id,
    createdAt: decodeEpochBase36(caRaw),
    updatedAt: decodeEpochBase36(uaRaw),
  };

  const name = readString(input, KK.name);
  if (name) out.name = name;
  const visitedAt = readString(input, KK.visitedAt);
  if (visitedAt) out.visitedAt = visitedAt;
  const vF = readString(input, KK.visitTimeFrom);
  if (vF) out.visitTimeFrom = vF;
  const vT = readString(input, KK.visitTimeTo);
  if (vT) out.visitTimeTo = vT;
  const cat = readEnum(input, KK.category, CATEGORY_REVERSE);
  if (cat) out.category = cat;

  const dhK = readNumber(input, KK.distanceFromHomeKm);
  if (dhK !== undefined) out.distanceFromHomeKm = dhK;
  const dhM = readNumber(input, KK.distanceFromHomeMin);
  if (dhM !== undefined) out.distanceFromHomeMin = dhM;
  const dsK = readNumber(input, KK.distanceFromStationKm);
  if (dsK !== undefined) out.distanceFromStationKm = dsK;
  const dsM = readNumber(input, KK.distanceFromStationMin);
  if (dsM !== undefined) out.distanceFromStationMin = dsM;
  const dwK = readNumber(input, KK.distanceFromWorkKm);
  if (dwK !== undefined) out.distanceFromWorkKm = dwK;
  const dwM = readNumber(input, KK.distanceFromWorkMin);
  if (dwM !== undefined) out.distanceFromWorkMin = dwM;

  const gM = readString(input, KK.generalMemo);
  if (gM) out.generalMemo = gM;

  const cp = input[KK.closurePeriods];
  if (isObject(cp)) out.closurePeriods = expandClosurePeriods(cp);
  const hC = readBoolean(input, KK.holidayCare);
  if (hC !== undefined) out.holidayCare = hC;
  const cF = readString(input, KK.careTimeFrom);
  if (cF) out.careTimeFrom = cF;
  const cT = readString(input, KK.careTimeTo);
  if (cT) out.careTimeTo = cT;
  const eC = input[KK.extendedCare];
  if (isObject(eC)) out.extendedCare = expandExtendedCare(eC);
  const cc = input[KK.classCapacities];
  if (Array.isArray(cc)) out.classCapacities = cc.filter(isObject).map(expandClassCapacity);
  const va = input[KK.vacancies];
  if (Array.isArray(va)) out.vacancies = va.filter(isObject).map(expandClassCapacity);
  const oM = readString(input, KK.operationMemo);
  if (oM) out.operationMemo = oM;

  const yard = input[KK.yard];
  if (isObject(yard)) out.yard = expandYard(yard);
  const outings = input[KK.outings];
  if (isObject(outings)) out.outings = expandOutings(outings);
  const np = input[KK.nearbyPark];
  if (isObject(np)) out.nearbyPark = expandNearbyPark(np);
  const pool = readBoolean(input, KK.pool);
  if (pool !== undefined) out.pool = pool;
  const bp = readBoolean(input, KK.bikeParking);
  if (bp !== undefined) out.bikeParking = bp;
  const fM = readString(input, KK.facilityMemo);
  if (fM) out.facilityMemo = fM;

  const cl = input[KK.clothing];
  if (isObject(cl)) out.clothing = expandClothing(cl);
  const lf = input[KK.lunchFee];
  if (isObject(lf)) out.lunchFee = expandLunchFee(lf);
  const iL = readBoolean(input, KK.inHouseLunch);
  if (iL !== undefined) out.inHouseLunch = iL;
  const bR = input[KK.bentoRequired];
  if (isObject(bR)) out.bentoRequired = expandBentoRequired(bR);
  const tC = input[KK.trialCare];
  if (isObject(tC)) out.trialCare = expandTrialCare(tC);
  const cb = input[KK.contactBook];
  if (isObject(cb)) out.contactBook = expandContactBook(cb);
  const pC = input[KK.pickupCriteria];
  if (isObject(pC)) out.pickupCriteria = expandPickupCriteria(pC);
  const pE = input[KK.parentEvents];
  if (isObject(pE)) out.parentEvents = expandParentEvents(pE);
  const pCo = readEnum(input, KK.parentCouncil, PARENT_COUNCIL_REVERSE);
  if (pCo) out.parentCouncil = pCo;
  const mt = input[KK.morningTasks];
  if (isObject(mt)) out.morningTasks = expandMorningTasks(mt);

  const lessons = readString(input, KK.lessons);
  if (lessons) out.lessons = lessons;
  const handmade = readString(input, KK.handmadeItems);
  if (handmade) out.handmadeItems = handmade;
  const bedding = readString(input, KK.bedding);
  if (bedding) out.bedding = bedding;
  const sns = readString(input, KK.sns);
  if (sns) out.sns = sns;
  const dO = readString(input, KK.dailyOperationMemo);
  if (dO) out.dailyOperationMemo = dO;

  const mc = input[KK.monthlyCosts];
  if (Array.isArray(mc)) out.monthlyCosts = mc.filter(isObject).map(expandCostItem);
  const sb = input[KK.subscriptions];
  if (isObject(sb)) out.subscriptions = expandSubscriptions(sb);
  const dD = readEnum(input, KK.diaperDisposal, DIAPER_DISPOSAL_REVERSE);
  if (dD) out.diaperDisposal = dD;
  const dDo = readString(input, KK.diaperDisposalOther);
  if (dDo) out.diaperDisposalOther = dDo;
  const coM = readString(input, KK.costMemo);
  if (coM) out.costMemo = coM;

  const guide = input[KK.guide];
  if (isObject(guide)) out.guide = expandGuide(guide);
  const im = input[KK.impressions];
  if (isObject(im)) out.impressions = expandImpressions(im);
  const peM = readString(input, KK.peopleMemo);
  if (peM) out.peopleMemo = peM;

  const frM = readString(input, KK.freeMemo);
  if (frM) out.freeMemo = frM;
  const sc = input[KK.schedule];
  if (Array.isArray(sc)) {
    const slots = sc
      .filter(isObject)
      .map(expandScheduleSlot)
      .filter((s): s is ScheduleSlot => s !== undefined);
    if (slots.length > 0) out.schedule = slots;
  }

  return out;
}
