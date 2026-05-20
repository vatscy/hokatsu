import { NumberField } from '../fields/NumberField';
import { RadioGroup } from '../fields/RadioGroup';
import { RepeatableRows } from '../fields/RepeatableRows';
import { TextField } from '../fields/TextField';
import { Section } from '../Section';
import type { SectionProps } from './sectionTypes';

const DIAPER_OPTIONS = [
  { value: '園にて処分', label: '園にて処分' },
  { value: '持ち帰り', label: '持ち帰り' },
  { value: 'その他', label: 'その他' },
] as const;

export function CostSection({ value, onChange }: SectionProps) {
  const subs = value.subscriptions ?? {};

  return (
    <Section title="費用">
      <RepeatableRows
        label="月々の諸費用"
        value={value.monthlyCosts}
        emptyItem={() => ({ label: '', amountYen: null })}
        onChange={(rows) => onChange({ monthlyCosts: rows })}
        addLabel="費用を追加"
        renderRow={(row, update) => (
          <>
            <TextField
              label="費用名"
              value={row.label}
              onChange={(v) => update({ label: v })}
              placeholder="例: 教材費"
            />
            <NumberField
              label="金額"
              value={row.amountYen}
              onChange={(v) => update({ amountYen: v })}
              suffix="円"
            />
          </>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <NumberField
          label="サブスク：おむつ"
          value={subs.diaperYenPerMonth}
          onChange={(v) =>
            onChange({ subscriptions: { ...subs, diaperYenPerMonth: v } })
          }
          suffix="円 / 月"
        />
        <NumberField
          label="サブスク：布団類"
          value={subs.beddingYenPerMonth}
          onChange={(v) =>
            onChange({ subscriptions: { ...subs, beddingYenPerMonth: v } })
          }
          suffix="円 / 月"
        />
      </div>
      <TextField
        label="サブスク：その他"
        value={subs.other}
        onChange={(v) => onChange({ subscriptions: { ...subs, other: v } })}
      />

      <RadioGroup
        label="おむつの処分"
        value={value.diaperDisposal ?? null}
        onChange={(v) => onChange({ diaperDisposal: v })}
        options={DIAPER_OPTIONS}
      />
      <TextField
        label="おむつ処分（その他詳細）"
        value={value.diaperDisposalOther}
        onChange={(v) => onChange({ diaperDisposalOther: v })}
      />
    </Section>
  );
}
