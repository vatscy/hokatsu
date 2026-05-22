import type { ReactNode } from 'react';
import type {
  ClosurePeriod,
  Impressions,
  Kindergarten,
} from '../../../types/kindergarten';
import { IMPRESSION_KEYS, IMPRESSION_LABELS } from '../../../types/kindergarten';
import {
  classCapacityList,
  costList,
  distance,
  monthDayRange,
  timeRange,
  yesNo,
} from '../../../lib/displayFormat';
import { DefinitionList, DefinitionRow } from './DefinitionList';
import { DetailSection } from './DetailSection';
import { RatingStars } from './RatingStars';

interface Props {
  record: Kindergarten;
}

interface Row {
  label: string;
  value: ReactNode;
}

export function KindergartenDetail({ record }: Props) {
  const sections: Array<{ title: string; rows: Row[]; extra?: ReactNode }> = [
    { title: '基本情報', rows: basicRows(record) },
    { title: '運営条件', rows: operationRows(record) },
    { title: '施設', rows: facilityRows(record) },
    { title: '日常運用', rows: dailyOpsRows(record) },
    { title: '費用', rows: costRows(record) },
    { title: '人物', rows: peopleRows(record) },
    { title: 'その他', rows: miscRows(record) },
  ];

  const visible = sections
    .map((s) => ({ ...s, rows: s.rows.filter((r) => !isEmpty(r.value)) }))
    .filter((s) => s.rows.length > 0);

  if (visible.length === 0) {
    return (
      <div className="px-4 pb-4 text-sm text-slate-400">
        この園にはまだ詳細データがありません。
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 pt-1">
      {visible.map((s) => (
        <DetailSection key={s.title} title={s.title}>
          <DefinitionList>
            {s.rows.map((r) => (
              <DefinitionRow key={r.label} label={r.label} value={r.value} />
            ))}
          </DefinitionList>
        </DetailSection>
      ))}
    </div>
  );
}

function isEmpty(v: ReactNode): boolean {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0 || v.every(isEmpty);
  return false;
}

function bulletList(items: string[]): ReactNode {
  if (items.length === 0) return '';
  return (
    <ul className="list-disc list-inside space-y-0.5">
      {items.map((it, i) => (
        <li key={`${i}:${it}`}>{it}</li>
      ))}
    </ul>
  );
}

function basicRows(r: Kindergarten): Row[] {
  return [
    { label: '園名', value: r.name },
    { label: '見学日', value: r.visitedAt },
    { label: '見学時間', value: timeRange(r.visitTimeFrom, r.visitTimeTo) },
    { label: '分類', value: r.category },
    { label: '家から', value: distance(r.distanceFromHomeKm, r.distanceFromHomeMin) },
    { label: '駅から', value: distance(r.distanceFromStationKm, r.distanceFromStationMin) },
    { label: '会社から', value: distance(r.distanceFromWorkKm, r.distanceFromWorkMin) },
    { label: 'メモ', value: r.generalMemo },
  ];
}

function operationRows(r: Kindergarten): Row[] {
  return [
    {
      label: '休園 年末年始',
      value: monthDayRange(r.closurePeriods?.yearEnd?.from, r.closurePeriods?.yearEnd?.to),
    },
    {
      label: '休園 その他',
      value: bulletList(
        (r.closurePeriods?.others ?? [])
          .map((p: ClosurePeriod) => monthDayRange(p.from, p.to))
          .filter(Boolean),
      ),
    },
    { label: '祝日保育', value: yesNo(r.holidayCare) },
    { label: '保育時間', value: timeRange(r.careTimeFrom, r.careTimeTo) },
    {
      label: '延長保育',
      value: extendedCareText(r.extendedCare),
    },
    { label: 'クラス定員', value: bulletList(classCapacityList(r.classCapacities)) },
    { label: '空き人数', value: bulletList(classCapacityList(r.vacancies)) },
    { label: 'メモ', value: r.operationMemo },
  ];
}

function extendedCareText(ec: Kindergarten['extendedCare']): string {
  if (!ec) return '';
  const parts: string[] = [];
  if (ec.applicationRequired === true) parts.push('申請制');
  if (ec.applicationRequired === false) parts.push('不要');
  if (ec.timeTo) parts.push(`${ec.timeTo}まで`);
  return parts.join(' / ');
}

function facilityRows(r: Kindergarten): Row[] {
  const yardParts: string[] = [];
  if (r.yard?.exists === true) yardParts.push('有');
  if (r.yard?.exists === false) yardParts.push('無');
  if (r.yard?.sizeNote) yardParts.push(r.yard.sizeNote);
  if (r.yard?.placement) yardParts.push(r.yard.placement);

  const outingParts: string[] = [];
  if (typeof r.outings?.perWeek === 'number' && Number.isFinite(r.outings.perWeek)) {
    outingParts.push(`週 ${r.outings.perWeek} 回`);
  }
  if (r.outings?.basicallyNone === true) outingParts.push('基本なし');

  const parkParts: string[] = [];
  if (r.nearbyPark?.distance) parkParts.push(r.nearbyPark.distance);
  if (r.nearbyPark?.traffic) parkParts.push(r.nearbyPark.traffic);
  if (r.nearbyPark?.size) parkParts.push(r.nearbyPark.size);

  return [
    { label: '園庭', value: yardParts.join(' / ') },
    { label: 'おでかけ', value: outingParts.join(' / ') },
    { label: '近くの公園', value: parkParts.join(' / ') },
    { label: 'プール', value: yesNo(r.pool) },
    { label: '駐輪場', value: yesNo(r.bikeParking) },
    { label: 'メモ', value: r.facilityMemo },
  ];
}

function dailyOpsRows(r: Kindergarten): Row[] {
  const clothing: string[] = [];
  if (r.clothing?.uniform) {
    const ageParts: string[] = [];
    if (r.clothing.uniformFrom1) ageParts.push('1才〜');
    if (r.clothing.uniformFrom3) ageParts.push('3才〜');
    clothing.push(ageParts.length ? `制服 (${ageParts.join(' / ')})` : '制服');
  }
  if (r.clothing?.privateClothes) clothing.push('私服');
  if (r.clothing?.hatOnly) clothing.push('帽子のみ');
  if (r.clothing?.otherChecked) {
    clothing.push(r.clothing.otherText ? `その他: ${r.clothing.otherText}` : 'その他');
  }

  const lunchFee = (() => {
    const amount = r.lunchFee?.amount;
    if (!Number.isFinite(amount as number) || amount == null) return '';
    const unit = r.lunchFee?.unit ? `/${r.lunchFee.unit}` : '';
    return `${amount}円${unit}`;
  })();

  const bento = (() => {
    if (r.bentoRequired?.required == null) return '';
    if (r.bentoRequired.required === false) return '無';
    return r.bentoRequired.frequency ? `有 (${r.bentoRequired.frequency})` : '有';
  })();

  const trial = (() => {
    if (r.trialCare?.exists == null) return '';
    if (r.trialCare.exists === false) return '無';
    return Number.isFinite(r.trialCare.days as number)
      ? `有 (${r.trialCare.days}日間)`
      : '有';
  })();

  const contactBook: string[] = [];
  if (r.contactBook?.paper) contactBook.push('紙');
  if (r.contactBook?.app) contactBook.push('アプリ');

  const pickup: string[] = [];
  if (Number.isFinite(r.pickupCriteria?.feverThreshold as number)) {
    pickup.push(`発熱 ${r.pickupCriteria!.feverThreshold}度以上`);
  }
  if (r.pickupCriteria?.other) pickup.push(r.pickupCriteria.other);

  const parentEvents: string[] = [];
  if (Number.isFinite(r.parentEvents?.perYear as number)) {
    parentEvents.push(`年 ${r.parentEvents!.perYear} 回`);
  }
  if (r.parentEvents?.content) parentEvents.push(r.parentEvents.content);

  const morning: string[] = [];
  if (r.morningTasks?.attendanceChecked) {
    morning.push(
      r.morningTasks.attendanceMethod
        ? `登園チェック (${r.morningTasks.attendanceMethod})`
        : '登園チェック',
    );
  }
  if (r.morningTasks?.tempCheck) morning.push('検温');
  if (r.morningTasks?.journalEntry) morning.push('生活ノート記入');
  if (r.morningTasks?.supplyChecked) {
    const sup = r.morningTasks.supplyRefill;
    const inner: string[] = [];
    if (sup?.diaper) inner.push('おむつ');
    if (sup?.clothes) inner.push('着替え');
    if (sup?.apron) inner.push('エプロン類');
    if (sup?.other) inner.push(sup.other);
    morning.push(inner.length ? `備品補充 (${inner.join('・')})` : '備品補充');
  }
  if (r.morningTasks?.otherChecked) {
    morning.push(
      r.morningTasks.otherText
        ? `その他: ${r.morningTasks.otherText}`
        : 'その他',
    );
  }

  return [
    { label: '服装', value: clothing.join(' / ') },
    { label: '給食費', value: lunchFee },
    { label: '自園調理', value: yesNo(r.inHouseLunch) },
    { label: 'お弁当', value: bento },
    { label: '慣らし保育', value: trial },
    { label: '連絡帳', value: contactBook.join(' / ') },
    { label: 'お迎え判断', value: pickup.join(' / ') },
    { label: '保護者行事', value: parentEvents.join(' / ') },
    { label: '保護者会役員', value: r.parentCouncil },
    { label: '朝やること', value: morning.join(' / ') },
    { label: '園内の習い事', value: r.lessons },
    { label: '手作りが必要なもの', value: r.handmadeItems },
    { label: '布団', value: r.bedding },
    { label: 'SNS', value: r.sns },
    { label: 'メモ', value: r.dailyOperationMemo },
  ];
}

function costRows(r: Kindergarten): Row[] {
  const subs: string[] = [];
  if (Number.isFinite(r.subscriptions?.diaperYenPerMonth as number)) {
    subs.push(`おむつ: ${r.subscriptions!.diaperYenPerMonth}円/月`);
  }
  if (Number.isFinite(r.subscriptions?.beddingYenPerMonth as number)) {
    subs.push(`布団類: ${r.subscriptions!.beddingYenPerMonth}円/月`);
  }
  if (
    r.subscriptions?.otherLabel ||
    Number.isFinite(r.subscriptions?.otherYenPerMonth as number)
  ) {
    const label = r.subscriptions?.otherLabel ?? 'その他';
    const amount = Number.isFinite(r.subscriptions?.otherYenPerMonth as number)
      ? `${r.subscriptions!.otherYenPerMonth}円/月`
      : '';
    subs.push(amount ? `${label}: ${amount}` : label);
  }

  const diaperDisposal = (() => {
    if (!r.diaperDisposal) return '';
    if (r.diaperDisposal === 'その他' && r.diaperDisposalOther) {
      return `その他: ${r.diaperDisposalOther}`;
    }
    return r.diaperDisposal;
  })();

  return [
    { label: '月々の諸費用', value: bulletList(costList(r.monthlyCosts)) },
    { label: 'サブスク', value: bulletList(subs) },
    { label: 'おむつの処分', value: diaperDisposal },
    { label: 'メモ', value: r.costMemo },
  ];
}

function peopleRows(r: Kindergarten): Row[] {
  const guide: string[] = [];
  if (r.guide?.name) guide.push(r.guide.name);
  if (r.guide?.role) guide.push(`(${r.guide.role})`);

  return [
    { label: '案内者', value: guide.join(' ') },
    { label: '印象評価', value: impressionsView(r.impressions) },
    { label: 'メモ', value: r.peopleMemo },
  ];
}

function impressionsView(imp: Impressions | undefined): ReactNode {
  if (!imp) return '';
  const ratings = IMPRESSION_KEYS.map((k) => ({ key: k, v: imp[k] }));
  if (ratings.every((r) => r.v == null)) return '';
  return (
    <ul className="space-y-1">
      {ratings.map(({ key, v }) => (
        <li key={key} className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 min-w-[10rem]">
            {IMPRESSION_LABELS[key]}
          </span>
          <RatingStars value={v} />
        </li>
      ))}
    </ul>
  );
}

function miscRows(r: Kindergarten): Row[] {
  const schedule = (r.schedule ?? [])
    .filter((s) => s.text && s.text.trim() !== '')
    .map((s) => `${String(s.hour).padStart(2, '0')}:00 — ${s.text}`);

  return [
    { label: '自由メモ', value: r.freeMemo },
    { label: '1日のスケジュール', value: bulletList(schedule) },
  ];
}
