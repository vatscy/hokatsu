import { BoolRadioGroup } from '../fields/RadioGroup';
import { NumberField } from '../fields/NumberField';
import { RepeatableRows } from '../fields/RepeatableRows';
import { TextArea } from '../fields/TextArea';
import { TextField } from '../fields/TextField';
import { TimeField } from '../fields/TimeField';
import { Section } from '../Section';
import { labelClass } from '../fields/fieldStyles';
import type { SectionProps } from './sectionTypes';

export function OperationSection({ value, onChange }: SectionProps) {
  const closure = value.closurePeriods ?? {};
  const yearEnd = closure.yearEnd ?? {};
  const extended = value.extendedCare ?? {};

  return (
    <Section title="運営条件">
      <div>
        <span className={labelClass}>休園期間（年末年始）</span>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="開始（月/日）"
            value={yearEnd.from}
            onChange={(v) =>
              onChange({
                closurePeriods: { ...closure, yearEnd: { ...yearEnd, from: v } },
              })
            }
            placeholder="例: 12/29"
          />
          <TextField
            label="終了（月/日）"
            value={yearEnd.to}
            onChange={(v) =>
              onChange({
                closurePeriods: { ...closure, yearEnd: { ...yearEnd, to: v } },
              })
            }
            placeholder="例: 1/3"
          />
        </div>
      </div>

      <RepeatableRows
        label="休園期間（その他）"
        value={closure.others}
        emptyItem={() => ({ from: '', to: '' })}
        onChange={(rows) =>
          onChange({ closurePeriods: { ...closure, others: rows } })
        }
        addLabel="期間を追加"
        renderRow={(row, update) => (
          <>
            <TextField
              label="開始（月/日）"
              value={row.from}
              onChange={(v) => update({ from: v })}
              placeholder="例: 8/13"
            />
            <TextField
              label="終了（月/日）"
              value={row.to}
              onChange={(v) => update({ to: v })}
              placeholder="例: 8/15"
            />
          </>
        )}
      />

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
          trueLabel="申請制"
          falseLabel="不要"
          value={extended.applicationRequired}
          onChange={(v) =>
            onChange({ extendedCare: { ...extended, applicationRequired: v } })
          }
        />
        <TimeField
          label="延長保育 終了時刻"
          value={extended.timeTo}
          onChange={(v) =>
            onChange({ extendedCare: { ...extended, timeTo: v } })
          }
        />
      </div>

      <RepeatableRows
        label="クラス定員"
        value={value.classCapacities}
        emptyItem={() => ({ age: null, count: null })}
        onChange={(rows) => onChange({ classCapacities: rows })}
        addLabel="クラスを追加"
        renderRow={(row, update) => (
          <>
            <NumberField
              label="年齢"
              value={row.age}
              onChange={(v) => update({ age: v })}
              suffix="才"
              min={0}
            />
            <NumberField
              label="定員"
              value={row.count}
              onChange={(v) => update({ count: v })}
              suffix="各 人"
              min={0}
            />
          </>
        )}
      />

      <RepeatableRows
        label="現在の空き人数"
        value={value.vacancies}
        emptyItem={() => ({ age: null, count: null })}
        onChange={(rows) => onChange({ vacancies: rows })}
        addLabel="空きを追加"
        renderRow={(row, update) => (
          <>
            <NumberField
              label="年齢"
              value={row.age}
              onChange={(v) => update({ age: v })}
              suffix="才"
              min={0}
            />
            <NumberField
              label="空き"
              value={row.count}
              onChange={(v) => update({ count: v })}
              suffix="人"
              min={0}
            />
          </>
        )}
      />

      <TextArea
        label="メモ"
        value={value.operationMemo}
        onChange={(v) => onChange({ operationMemo: v })}
      />
    </Section>
  );
}
