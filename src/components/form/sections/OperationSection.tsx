import { BoolRadioGroup } from '../fields/RadioGroup';
import { NumberField } from '../fields/NumberField';
import { RepeatableRows } from '../fields/RepeatableRows';
import { TextField } from '../fields/TextField';
import { TimeField } from '../fields/TimeField';
import { Section } from '../Section';
import type { SectionProps } from './sectionTypes';

export function OperationSection({ value, onChange }: SectionProps) {
  const closure = value.closurePeriods ?? {};
  const extended = value.extendedCare ?? {};

  return (
    <Section title="運営条件">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField
          label="休園期間（年末年始など）"
          value={closure.yearEnd}
          onChange={(v) =>
            onChange({ closurePeriods: { ...closure, yearEnd: v } })
          }
          placeholder="例: 12/29 〜 1/3"
        />
        <TextField
          label="休園期間（その他）"
          value={closure.others}
          onChange={(v) =>
            onChange({ closurePeriods: { ...closure, others: v } })
          }
          placeholder="例: 8/13 〜 8/15"
        />
      </div>

      <BoolRadioGroup
        label="祝日保育"
        value={value.holidayCare}
        onChange={(v) => onChange({ holidayCare: v })}
      />

      <div className="grid grid-cols-2 gap-3">
        <TimeField
          label="保育時間（開始）"
          value={value.careTimeFrom}
          onChange={(v) => onChange({ careTimeFrom: v })}
        />
        <TimeField
          label="保育時間（終了）"
          value={value.careTimeTo}
          onChange={(v) => onChange({ careTimeTo: v })}
        />
      </div>

      <div className="space-y-2">
        <BoolRadioGroup
          label="延長保育"
          trueLabel="申請要"
          falseLabel="申請不要"
          value={extended.applicationRequired}
          onChange={(v) =>
            onChange({ extendedCare: { ...extended, applicationRequired: v } })
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <TimeField
            label="延長 開始"
            value={extended.timeFrom}
            onChange={(v) =>
              onChange({ extendedCare: { ...extended, timeFrom: v } })
            }
          />
          <TimeField
            label="延長 終了"
            value={extended.timeTo}
            onChange={(v) =>
              onChange({ extendedCare: { ...extended, timeTo: v } })
            }
          />
        </div>
      </div>

      <RepeatableRows
        label="クラス人数"
        value={value.classCapacities}
        emptyItem={() => ({ age: '', count: null, note: '' })}
        onChange={(rows) => onChange({ classCapacities: rows })}
        addLabel="クラスを追加"
        renderRow={(row, update) => (
          <>
            <TextField
              label="年齢"
              value={row.age}
              onChange={(v) => update({ age: v })}
              placeholder="例: 0才"
            />
            <NumberField
              label="人数"
              value={row.count}
              onChange={(v) => update({ count: v })}
              suffix="人"
            />
          </>
        )}
      />

      <RepeatableRows
        label="現在の空き人数"
        value={value.vacancies}
        emptyItem={() => ({ age: '', count: null, note: '' })}
        onChange={(rows) => onChange({ vacancies: rows })}
        addLabel="空きを追加"
        renderRow={(row, update) => (
          <>
            <TextField
              label="年齢"
              value={row.age}
              onChange={(v) => update({ age: v })}
              placeholder="例: 1才"
            />
            <NumberField
              label="人数"
              value={row.count}
              onChange={(v) => update({ count: v })}
              suffix="人"
            />
          </>
        )}
      />
    </Section>
  );
}
