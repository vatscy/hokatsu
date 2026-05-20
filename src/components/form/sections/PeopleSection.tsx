import { IMPRESSION_KEYS, IMPRESSION_LABELS, type Impressions } from '../../../types/kindergarten';
import { Rating5 } from '../fields/Rating5';
import { RadioGroup } from '../fields/RadioGroup';
import { TextArea } from '../fields/TextArea';
import { TextField } from '../fields/TextField';
import { Section } from '../Section';
import type { SectionProps } from './sectionTypes';

const GUIDE_ROLE_OPTIONS = [
  { value: '園長', label: '園長' },
  { value: '担当', label: '担当の先生' },
] as const;

const EMPTY_IMPRESSIONS: Impressions = {
  teacher: null,
  childCare: null,
  facility: null,
  toysBooks: null,
  principal: null,
};

export function PeopleSection({ value, onChange }: SectionProps) {
  const guide = value.guide ?? {};
  const impressions = value.impressions ?? EMPTY_IMPRESSIONS;

  return (
    <Section title="人物・印象評価" defaultOpen>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField
          label="案内してくれた人（名前）"
          value={guide.name}
          onChange={(v) => onChange({ guide: { ...guide, name: v } })}
        />
        <RadioGroup
          label="区分"
          value={guide.role ?? null}
          onChange={(v) => onChange({ guide: { ...guide, role: v } })}
          options={GUIDE_ROLE_OPTIONS}
        />
      </div>

      <div className="space-y-2">
        {IMPRESSION_KEYS.map((key) => (
          <Rating5
            key={key}
            label={IMPRESSION_LABELS[key]}
            value={impressions[key]}
            onChange={(v) =>
              onChange({ impressions: { ...impressions, [key]: v } })
            }
          />
        ))}
      </div>

      <TextArea
        label="メモ"
        value={value.peopleMemo}
        onChange={(v) => onChange({ peopleMemo: v })}
      />
    </Section>
  );
}
