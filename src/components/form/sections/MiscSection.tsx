import { SCHEDULE_HOURS, type ScheduleSlot } from '../../../types/kindergarten';
import { TextArea } from '../fields/TextArea';
import { TextField } from '../fields/TextField';
import { labelClass } from '../fields/fieldStyles';
import { Section } from '../Section';
import type { SectionProps } from './sectionTypes';

function getSlotText(schedule: ScheduleSlot[] | undefined, hour: number): string {
  return schedule?.find((s) => s.hour === hour)?.text ?? '';
}

function setSlotText(
  schedule: ScheduleSlot[] | undefined,
  hour: number,
  text: string,
): ScheduleSlot[] {
  const map = new Map<number, ScheduleSlot>();
  for (const h of SCHEDULE_HOURS) {
    map.set(h, { hour: h, text: '' });
  }
  for (const s of schedule ?? []) {
    if (SCHEDULE_HOURS.includes(s.hour)) map.set(s.hour, { ...s });
  }
  map.set(hour, { hour, text });
  return SCHEDULE_HOURS.map((h) => map.get(h)!).filter((s) => (s.text ?? '') !== ''
    || s.hour === hour);
}

export function MiscSection({ value, onChange }: SectionProps) {
  return (
    <Section title="その他・1日のスケジュール">
      <TextArea
        label="自由メモ"
        value={value.freeMemo}
        onChange={(v) => onChange({ freeMemo: v })}
        rows={4}
        placeholder="一時保育の有無、床暖の有無、特別な行事があるか等"
      />

      <div>
        <span className={labelClass}>1日のスケジュール（時間帯ごと自由記述）</span>
        <div className="space-y-2">
          {SCHEDULE_HOURS.map((hour) => (
            <div key={hour} className="flex items-center gap-2">
              <span className="shrink-0 w-12 text-sm text-slate-600 font-mono">
                {String(hour).padStart(2, '0')}:00
              </span>
              <TextField
                value={getSlotText(value.schedule, hour)}
                onChange={(v) =>
                  onChange({ schedule: setSlotText(value.schedule, hour, v) })
                }
                placeholder="例: 朝の会 / 自由遊び / 昼食 など"
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
