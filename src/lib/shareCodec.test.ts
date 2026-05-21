import { describe, it, expect } from 'vitest';
import {
  ImportFormatError,
  KINDERGARTEN_KEY_MAP,
  compactKindergarten,
  decodeEpochBase36,
  encodeEpochBase36,
  expandKindergarten,
} from './shareCodec';
import type { Kindergarten } from '../types/kindergarten';

const baseRecord = (): Kindergarten => ({
  id: 'r1',
  createdAt: '2024-01-02T03:04:05.678Z',
  updatedAt: '2024-02-03T04:05:06.789Z',
});

describe('compactKindergarten / expandKindergarten', () => {
  it('必須フィールドのみのラウンドトリップ', () => {
    const k = baseRecord();
    const restored = expandKindergarten(compactKindergarten(k));
    expect(restored).toEqual(k);
  });

  it('id / createdAt / updatedAt は短縮キーで出力される', () => {
    const compact = compactKindergarten(baseRecord());
    expect(compact.id).toBe('r1');
    // createdAt は epoch ms の base36 化
    expect(typeof compact.ca).toBe('string');
    expect(decodeEpochBase36(compact.ca as string)).toBe('2024-01-02T03:04:05.678Z');
    expect(decodeEpochBase36(compact.ua as string)).toBe('2024-02-03T04:05:06.789Z');
  });

  it('全フィールドを埋めたラウンドトリップ', () => {
    const k: Kindergarten = {
      ...baseRecord(),
      name: 'テスト保育園',
      visitedAt: '2024-05-10',
      visitTimeFrom: '10:00',
      visitTimeTo: '11:30',
      category: '認可',
      distanceFromHomeKm: 1.5,
      distanceFromHomeMin: 12,
      distanceFromStationKm: 0.8,
      distanceFromStationMin: 6,
      distanceFromWorkKm: 4.2,
      distanceFromWorkMin: 25,
      generalMemo: '駅に近い',
      closurePeriods: {
        yearEnd: { from: '12-29', to: '01-03' },
        others: [{ from: '08-13', to: '08-15' }],
      },
      holidayCare: false,
      careTimeFrom: '07:30',
      careTimeTo: '18:30',
      extendedCare: { applicationRequired: true, timeTo: '19:30' },
      classCapacities: [
        { age: 0, count: 6 },
        { age: 1, count: 12 },
      ],
      vacancies: [{ age: 1, count: 0 }],
      operationMemo: '土曜あり',
      yard: { exists: true, sizeNote: '広め', placement: '屋上' },
      outings: { perWeek: 3, basicallyNone: false },
      nearbyPark: { distance: '近い', traffic: '車少ない', size: '広い' },
      pool: true,
      bikeParking: false,
      facilityMemo: '施設メモ',
      clothing: {
        uniform: false,
        uniformFrom1: true,
        uniformFrom3: false,
        privateClothes: true,
        hatOnly: false,
        otherChecked: true,
        otherText: 'スモック',
      },
      lunchFee: { amount: 300, unit: '回' },
      inHouseLunch: true,
      bentoRequired: { required: false, frequency: '月1' },
      trialCare: { exists: true, days: 2 },
      contactBook: { paper: false, app: true },
      pickupCriteria: { feverThreshold: 37.5, other: '嘔吐2回' },
      parentEvents: { perYear: 4, content: '運動会・遠足' },
      parentCouncil: '希望制',
      morningTasks: {
        attendanceChecked: true,
        attendanceMethod: 'タブレット',
        tempCheck: true,
        journalEntry: false,
        supplyChecked: true,
        supplyRefill: { diaper: true, clothes: false, apron: true, other: 'タオル' },
        otherChecked: false,
        otherText: '',
      },
      lessons: '英語',
      handmadeItems: 'なし',
      bedding: 'リース',
      sns: 'Instagram',
      dailyOperationMemo: '日常メモ',
      monthlyCosts: [
        { label: '保育料', amountYen: 30000 },
        { label: '給食費', amountYen: 5000 },
      ],
      subscriptions: {
        diaperYenPerMonth: 1500,
        beddingYenPerMonth: 800,
        otherLabel: '写真',
        otherYenPerMonth: 300,
      },
      diaperDisposal: '園にて処分',
      diaperDisposalOther: '',
      costMemo: '費用メモ',
      guide: { name: '田中先生', role: '園長' },
      impressions: { teacher: 5, childCare: 4, facility: 3, toysBooks: 2, principal: 1 },
      peopleMemo: '人物メモ',
      freeMemo: '自由メモ',
      schedule: [
        { hour: 7, text: '順次登園' },
        { hour: 9 },
        { hour: 12, text: '昼食' },
      ],
    };

    const restored = expandKindergarten(compactKindergarten(k));
    // morningTasks.otherText は空文字なのでプルーニングされる → 復元側にも現れない
    const expected: Kindergarten = {
      ...k,
      morningTasks: { ...k.morningTasks! },
      diaperDisposalOther: undefined,
    };
    delete expected.diaperDisposalOther;
    delete (expected.morningTasks as { otherText?: string }).otherText;
    expect(restored).toEqual(expected);
  });

  it('null / undefined / "" / [] / {} は出力に含まれない', () => {
    const k: Kindergarten = {
      ...baseRecord(),
      name: '',
      generalMemo: undefined,
      category: null,
      closurePeriods: { others: [] },
      classCapacities: [],
      monthlyCosts: [{}, {}],
      impressions: { teacher: null, childCare: null, facility: null, toysBooks: null, principal: null },
    };
    const c = compactKindergarten(k) as Record<string, unknown>;
    expect(c.n).toBeUndefined();
    expect(c.gM).toBeUndefined();
    expect(c.c).toBeUndefined();
    expect(c.cp).toBeUndefined();
    expect(c.cc).toBeUndefined();
    expect(c.mc).toBeUndefined();
    expect(c.im).toBeUndefined();
  });

  it('false / 数値 0 は保持される', () => {
    const k: Kindergarten = {
      ...baseRecord(),
      holidayCare: false,
      pool: false,
      bikeParking: false,
      distanceFromHomeKm: 0,
      classCapacities: [{ age: 0, count: 0 }],
    };
    const c = compactKindergarten(k) as Record<string, unknown>;
    expect(c.hC).toBe(false);
    expect(c.po).toBe(false);
    expect(c.bp).toBe(false);
    expect(c.dhK).toBe(0);
    expect(c.cc).toEqual([{ a: 0, c: 0 }]);

    const restored = expandKindergarten(c);
    expect(restored.holidayCare).toBe(false);
    expect(restored.pool).toBe(false);
    expect(restored.distanceFromHomeKm).toBe(0);
    expect(restored.classCapacities).toEqual([{ age: 0, count: 0 }]);
  });

  it('全 enum コードのラウンドトリップ', () => {
    const cases: Partial<Kindergarten>[] = [
      { category: '公立' },
      { category: '認可' },
      { category: '認可外' },
      { parentCouncil: '当番制' },
      { parentCouncil: '希望制' },
      { parentCouncil: '指名制' },
      { diaperDisposal: '園にて処分' },
      { diaperDisposal: '持ち帰り' },
      { diaperDisposal: 'その他' },
      { yard: { sizeNote: '広め' } },
      { yard: { sizeNote: '狭め' } },
      { yard: { placement: '屋外' } },
      { yard: { placement: '屋上' } },
      { nearbyPark: { distance: '近い' } },
      { nearbyPark: { distance: '遠い' } },
      { nearbyPark: { traffic: '車多い' } },
      { nearbyPark: { traffic: '車少ない' } },
      { nearbyPark: { size: '広い' } },
      { nearbyPark: { size: '狭い' } },
      { lunchFee: { unit: '回' } },
      { lunchFee: { unit: '月' } },
      { morningTasks: { attendanceMethod: '紙' } },
      { morningTasks: { attendanceMethod: 'タブレット' } },
      { guide: { role: '園長' } },
      { guide: { role: '担当' } },
    ];
    for (const overrides of cases) {
      const k = { ...baseRecord(), ...overrides };
      const restored = expandKindergarten(compactKindergarten(k));
      expect(restored).toMatchObject(overrides);
    }
  });

  it('Rating の欠損は null に復元される', () => {
    const k: Kindergarten = {
      ...baseRecord(),
      impressions: { teacher: 5, childCare: null, facility: 3, toysBooks: null, principal: 1 },
    };
    const restored = expandKindergarten(compactKindergarten(k));
    expect(restored.impressions).toEqual({
      teacher: 5,
      childCare: null,
      facility: 3,
      toysBooks: null,
      principal: 1,
    });
  });

  it('未知のキーが含まれる入力は ImportFormatError', () => {
    expect(() => expandKindergarten({ id: 'x', ca: '0', ua: '0', unknownKey: 1 })).toThrow(
      ImportFormatError,
    );
  });

  it('オブジェクトでない入力は ImportFormatError', () => {
    expect(() => expandKindergarten(null)).toThrow(ImportFormatError);
    expect(() => expandKindergarten('string')).toThrow(ImportFormatError);
    expect(() => expandKindergarten(123)).toThrow(ImportFormatError);
  });

  it('id 欠損は ImportFormatError', () => {
    expect(() => expandKindergarten({ ca: '0', ua: '0' })).toThrow(ImportFormatError);
  });

  it('createdAt / updatedAt 欠損は ImportFormatError', () => {
    expect(() => expandKindergarten({ id: 'x' })).toThrow(ImportFormatError);
  });

  // 旧フォーマット（appName/version/kindergartens を含む生 JSON 由来のレコード）が
  // 紛れ込んだ場合に静かに通らず必ず弾かれることを保証する。
  it('旧フォーマットのキー (name フルネーム) は未知キーとしてエラー', () => {
    expect(() => expandKindergarten({ id: 'x', name: 'foo', ca: '0', ua: '0' })).toThrow(
      ImportFormatError,
    );
  });
});

describe('KINDERGARTEN_KEY_MAP のランタイム網羅性', () => {
  // satisfies で型レベル網羅は保証されているが、Kindergarten 型を増やしたときに
  // 短縮値の重複が起きないこともランタイムで担保する。
  it('短縮キーに重複がない', () => {
    const values = Object.values(KINDERGARTEN_KEY_MAP);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('encodeEpochBase36 / decodeEpochBase36', () => {
  it('ISO 文字列のラウンドトリップ', () => {
    const iso = '2024-06-15T12:34:56.789Z';
    expect(decodeEpochBase36(encodeEpochBase36(iso))).toBe(iso);
  });

  it('不正な日時で ImportFormatError', () => {
    expect(() => encodeEpochBase36('not-a-date')).toThrow(ImportFormatError);
    expect(() => decodeEpochBase36('not-base36')).toThrow(ImportFormatError);
  });
});
