import { BoolRadioGroup, RadioGroup } from '../fields/RadioGroup';
import { Checkbox, CheckboxGroup } from '../fields/CheckboxGroup';
import { NumberField } from '../fields/NumberField';
import { TextField } from '../fields/TextField';
import { Section } from '../Section';
import type { SectionProps } from './sectionTypes';

const PARENT_COUNCIL_OPTIONS = [
  { value: '当番制', label: '当番制' },
  { value: '希望制', label: '希望制' },
  { value: '指名制', label: '指名制' },
] as const;

const ATTENDANCE_METHOD_OPTIONS = [
  { value: '紙', label: '紙' },
  { value: 'タブレット', label: 'タブレット' },
] as const;

const LUNCH_UNIT_OPTIONS = [
  { value: '回', label: '回' },
  { value: '月', label: '月' },
] as const;

export function DailyOpsSection({ value, onChange }: SectionProps) {
  const clothing = value.clothing ?? {};
  const lunchFee = value.lunchFee ?? {};
  const bento = value.bentoRequired ?? {};
  const trial = value.trialCare ?? {};
  const contact = value.contactBook ?? {};
  const pickup = value.pickupCriteria ?? {};
  const events = value.parentEvents ?? {};
  const morning = value.morningTasks ?? {};
  const refill = morning.supplyRefill ?? {};

  return (
    <Section title="日常運用">
      <div className="space-y-2">
        <CheckboxGroup label="服装">
          <Checkbox
            label="制服"
            checked={clothing.uniform ?? false}
            onChange={(v) => onChange({ clothing: { ...clothing, uniform: v } })}
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
          <Checkbox
            label="その他"
            checked={clothing.otherChecked ?? false}
            onChange={(v) =>
              onChange({ clothing: { ...clothing, otherChecked: v } })
            }
          />
        </CheckboxGroup>
        {clothing.uniform && (
          <CheckboxGroup label="制服の年齢区分">
            <Checkbox
              label="1才〜"
              checked={clothing.uniformFrom1 ?? false}
              onChange={(v) =>
                onChange({ clothing: { ...clothing, uniformFrom1: v } })
              }
            />
            <Checkbox
              label="3才〜"
              checked={clothing.uniformFrom3 ?? false}
              onChange={(v) =>
                onChange({ clothing: { ...clothing, uniformFrom3: v } })
              }
            />
          </CheckboxGroup>
        )}
        {clothing.otherChecked && (
          <TextField
            label="服装（その他詳細）"
            value={clothing.otherText}
            onChange={(v) =>
              onChange({ clothing: { ...clothing, otherText: v } })
            }
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
        <NumberField
          label="給食費"
          value={lunchFee.amount}
          onChange={(v) => onChange({ lunchFee: { ...lunchFee, amount: v } })}
          suffix="円"
          min={0}
        />
        <RadioGroup
          label="単位"
          value={lunchFee.unit ?? null}
          onChange={(v) => onChange({ lunchFee: { ...lunchFee, unit: v } })}
          options={LUNCH_UNIT_OPTIONS}
        />
      </div>

      <div className="space-y-2">
        <BoolRadioGroup
          label="お弁当が必要な日"
          value={bento.required}
          onChange={(v) => onChange({ bentoRequired: { ...bento, required: v } })}
        />
        {bento.required === true && (
          <TextField
            label="頻度"
            value={bento.frequency}
            onChange={(v) =>
              onChange({ bentoRequired: { ...bento, frequency: v } })
            }
            placeholder="例: 月1, 行事日のみ"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
        <BoolRadioGroup
          label="慣らし保育"
          value={trial.exists}
          onChange={(v) => onChange({ trialCare: { ...trial, exists: v } })}
        />
        {trial.exists === true && (
          <NumberField
            label="日数"
            value={trial.days}
            onChange={(v) => onChange({ trialCare: { ...trial, days: v } })}
            suffix="日"
            min={0}
          />
        )}
      </div>

      <CheckboxGroup label="連絡帳">
        <Checkbox
          label="紙"
          checked={contact.paper ?? false}
          onChange={(v) => onChange({ contactBook: { ...contact, paper: v } })}
        />
        <Checkbox
          label="アプリ"
          checked={contact.app ?? false}
          onChange={(v) => onChange({ contactBook: { ...contact, app: v } })}
        />
      </CheckboxGroup>

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
          min={0}
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
        <CheckboxGroup label="朝やること">
          <Checkbox
            label="登園チェック"
            checked={morning.attendanceChecked ?? false}
            onChange={(v) =>
              onChange({ morningTasks: { ...morning, attendanceChecked: v } })
            }
          />
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
          <Checkbox
            label="備品補充"
            checked={morning.supplyChecked ?? false}
            onChange={(v) =>
              onChange({ morningTasks: { ...morning, supplyChecked: v } })
            }
          />
          <Checkbox
            label="その他"
            checked={morning.otherChecked ?? false}
            onChange={(v) =>
              onChange({ morningTasks: { ...morning, otherChecked: v } })
            }
          />
        </CheckboxGroup>

        {morning.attendanceChecked && (
          <RadioGroup
            label="登園チェック 手段"
            value={morning.attendanceMethod ?? null}
            onChange={(v) =>
              onChange({ morningTasks: { ...morning, attendanceMethod: v } })
            }
            options={ATTENDANCE_METHOD_OPTIONS}
          />
        )}

        {morning.supplyChecked && (
          <div className="space-y-2">
            <CheckboxGroup label="備品補充の内訳">
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
              label="備品補充（他）"
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
          </div>
        )}

        {morning.otherChecked && (
          <TextField
            label="朝やること（その他詳細）"
            value={morning.otherText}
            onChange={(v) =>
              onChange({ morningTasks: { ...morning, otherText: v } })
            }
          />
        )}
      </div>
    </Section>
  );
}
