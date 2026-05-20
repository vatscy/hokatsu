import { BoolRadioGroup, RadioGroup } from '../fields/RadioGroup';
import { Checkbox, CheckboxGroup } from '../fields/CheckboxGroup';
import { NumberField } from '../fields/NumberField';
import { TextField } from '../fields/TextField';
import { Section } from '../Section';
import type { SectionProps } from './sectionTypes';

const CONTACT_BOOK_OPTIONS = [
  { value: '紙', label: '紙' },
  { value: 'アプリ', label: 'アプリ' },
] as const;

const PARENT_COUNCIL_OPTIONS = [
  { value: '当番制', label: '当番制' },
  { value: '希望制', label: '希望制' },
  { value: '指名制', label: '指名制' },
] as const;

const ATTENDANCE_OPTIONS = [
  { value: '紙', label: '紙' },
  { value: 'タブレット', label: 'タブレット' },
] as const;

export function DailyOpsSection({ value, onChange }: SectionProps) {
  const clothing = value.clothing ?? {};
  const lunchFee = value.lunchFee ?? {};
  const bento = value.bentoRequired ?? {};
  const trial = value.trialCare ?? {};
  const pickup = value.pickupCriteria ?? {};
  const events = value.parentEvents ?? {};
  const morning = value.morningTasks ?? {};
  const refill = morning.supplyRefill ?? {};

  return (
    <Section title="日常運用">
      <CheckboxGroup label="服装">
        <Checkbox
          label="制服（1才～）"
          checked={clothing.uniformFrom1 ?? false}
          onChange={(v) => onChange({ clothing: { ...clothing, uniformFrom1: v } })}
        />
        <Checkbox
          label="制服（3才～）"
          checked={clothing.uniformFrom3 ?? false}
          onChange={(v) => onChange({ clothing: { ...clothing, uniformFrom3: v } })}
        />
        <Checkbox
          label="私服"
          checked={clothing.privateClothes ?? false}
          onChange={(v) =>
            onChange({ clothing: { ...clothing, privateClothes: v } })
          }
        />
        <Checkbox
          label="帽子のみ"
          checked={clothing.hatOnly ?? false}
          onChange={(v) => onChange({ clothing: { ...clothing, hatOnly: v } })}
        />
      </CheckboxGroup>
      <TextField
        label="服装（その他）"
        value={clothing.other}
        onChange={(v) => onChange({ clothing: { ...clothing, other: v } })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <NumberField
          label="給食費（1回）"
          value={lunchFee.perMeal}
          onChange={(v) => onChange({ lunchFee: { ...lunchFee, perMeal: v } })}
          suffix="円 / 回"
        />
        <NumberField
          label="給食費（月額）"
          value={lunchFee.perMonth}
          onChange={(v) => onChange({ lunchFee: { ...lunchFee, perMonth: v } })}
          suffix="円 / 月"
        />
      </div>

      <div className="space-y-2">
        <BoolRadioGroup
          label="お弁当が必要な日"
          value={bento.required}
          onChange={(v) => onChange({ bentoRequired: { ...bento, required: v } })}
        />
        <TextField
          label="頻度"
          value={bento.frequency}
          onChange={(v) =>
            onChange({ bentoRequired: { ...bento, frequency: v } })
          }
          placeholder="例: 月1, 行事日のみ"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
        <BoolRadioGroup
          label="慣らし保育"
          value={trial.exists}
          onChange={(v) => onChange({ trialCare: { ...trial, exists: v } })}
        />
        <NumberField
          label="日数"
          value={trial.days}
          onChange={(v) => onChange({ trialCare: { ...trial, days: v } })}
          suffix="日"
        />
      </div>

      <RadioGroup
        label="連絡帳"
        value={value.contactBook ?? null}
        onChange={(v) => onChange({ contactBook: v })}
        options={CONTACT_BOOK_OPTIONS}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <NumberField
          label="お迎えの判断（発熱基準）"
          value={pickup.feverThreshold}
          onChange={(v) =>
            onChange({ pickupCriteria: { ...pickup, feverThreshold: v } })
          }
          suffix="℃ 以上"
          step={0.1}
        />
        <TextField
          label="その他基準"
          value={pickup.other}
          onChange={(v) =>
            onChange({ pickupCriteria: { ...pickup, other: v } })
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <NumberField
          label="保護者参加行事"
          value={events.perYear}
          onChange={(v) =>
            onChange({ parentEvents: { ...events, perYear: v } })
          }
          suffix="回 / 年"
        />
        <TextField
          label="内容"
          value={events.content}
          onChange={(v) =>
            onChange({ parentEvents: { ...events, content: v } })
          }
        />
      </div>

      <RadioGroup
        label="保護者会役員"
        value={value.parentCouncil ?? null}
        onChange={(v) => onChange({ parentCouncil: v })}
        options={PARENT_COUNCIL_OPTIONS}
      />

      <div className="space-y-2">
        <RadioGroup
          label="朝やること：登園チェック"
          value={morning.attendanceCheck ?? null}
          onChange={(v) =>
            onChange({ morningTasks: { ...morning, attendanceCheck: v } })
          }
          options={ATTENDANCE_OPTIONS}
        />
        <CheckboxGroup label="朝やること">
          <Checkbox
            label="検温"
            checked={morning.tempCheck ?? false}
            onChange={(v) =>
              onChange({ morningTasks: { ...morning, tempCheck: v } })
            }
          />
          <Checkbox
            label="生活ノート記入"
            checked={morning.journalEntry ?? false}
            onChange={(v) =>
              onChange({ morningTasks: { ...morning, journalEntry: v } })
            }
          />
        </CheckboxGroup>
        <CheckboxGroup label="備品補充">
          <Checkbox
            label="おむつ"
            checked={refill.diaper ?? false}
            onChange={(v) =>
              onChange({
                morningTasks: {
                  ...morning,
                  supplyRefill: { ...refill, diaper: v },
                },
              })
            }
          />
          <Checkbox
            label="着替え"
            checked={refill.clothes ?? false}
            onChange={(v) =>
              onChange({
                morningTasks: {
                  ...morning,
                  supplyRefill: { ...refill, clothes: v },
                },
              })
            }
          />
          <Checkbox
            label="エプロン類"
            checked={refill.apron ?? false}
            onChange={(v) =>
              onChange({
                morningTasks: {
                  ...morning,
                  supplyRefill: { ...refill, apron: v },
                },
              })
            }
          />
        </CheckboxGroup>
        <TextField
          label="備品補充（その他）"
          value={refill.other}
          onChange={(v) =>
            onChange({
              morningTasks: {
                ...morning,
                supplyRefill: { ...refill, other: v },
              },
            })
          }
        />
        <TextField
          label="朝やること（その他）"
          value={morning.other}
          onChange={(v) =>
            onChange({ morningTasks: { ...morning, other: v } })
          }
        />
      </div>
    </Section>
  );
}
