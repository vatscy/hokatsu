import type { Category } from '../../../types/kindergarten';
import { DateField } from '../fields/DateField';
import { NumberField } from '../fields/NumberField';
import { Select } from '../fields/Select';
import { TextArea } from '../fields/TextArea';
import { TextField } from '../fields/TextField';
import { TimeField } from '../fields/TimeField';
import { Section } from '../Section';
import type { SectionProps } from './sectionTypes';

const CATEGORY_OPTIONS = [
  { value: '公立', label: '公立' },
  { value: '認可', label: '認可' },
  { value: '認可外', label: '認可外' },
] as const;

export function BasicSection({ value, onChange }: SectionProps) {
  return (
    <Section title="基本情報" defaultOpen>
      <TextField
        label="園名"
        value={value.name}
        onChange={(v) => onChange({ name: v })}
        placeholder="例: 〇〇保育園"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <DateField
          label="見学日"
          value={value.visitedAt}
          onChange={(v) => onChange({ visitedAt: v })}
        />
        <TimeField
          label="見学時間（開始）"
          value={value.visitTimeFrom}
          onChange={(v) => onChange({ visitTimeFrom: v })}
        />
        <TimeField
          label="見学時間（終了）"
          value={value.visitTimeTo}
          onChange={(v) => onChange({ visitTimeTo: v })}
        />
      </div>
      <Select<Category>
        label="分類"
        value={value.category ?? null}
        onChange={(v) => onChange({ category: v })}
        options={CATEGORY_OPTIONS}
      />
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="家から（距離）"
          value={value.distanceFromHomeKm}
          onChange={(v) => onChange({ distanceFromHomeKm: v })}
          suffix="km"
          step={0.1}
        />
        <NumberField
          label="家から（時間）"
          value={value.distanceFromHomeMin}
          onChange={(v) => onChange({ distanceFromHomeMin: v })}
          suffix="分"
        />
        <NumberField
          label="駅から（距離）"
          value={value.distanceFromStationKm}
          onChange={(v) => onChange({ distanceFromStationKm: v })}
          suffix="km"
          step={0.1}
        />
        <NumberField
          label="駅から（時間）"
          value={value.distanceFromStationMin}
          onChange={(v) => onChange({ distanceFromStationMin: v })}
          suffix="分"
        />
        <NumberField
          label="会社から（距離）"
          value={value.distanceFromWorkKm}
          onChange={(v) => onChange({ distanceFromWorkKm: v })}
          suffix="km"
          step={0.1}
        />
        <NumberField
          label="会社から（時間）"
          value={value.distanceFromWorkMin}
          onChange={(v) => onChange({ distanceFromWorkMin: v })}
          suffix="分"
        />
      </div>
      <TextArea
        label="メモ"
        value={value.generalMemo}
        onChange={(v) => onChange({ generalMemo: v })}
      />
    </Section>
  );
}
