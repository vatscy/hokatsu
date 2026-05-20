import { TextArea } from '../fields/TextArea';
import { Section } from '../Section';
import type { SectionProps } from './sectionTypes';

export function ActivitiesSection({ value, onChange }: SectionProps) {
  return (
    <Section title="園内活動">
      <TextArea
        label="園内の習い事"
        value={value.lessons}
        onChange={(v) => onChange({ lessons: v })}
      />
      <TextArea
        label="手作りが必要なもの"
        value={value.handmadeItems}
        onChange={(v) => onChange({ handmadeItems: v })}
      />
    </Section>
  );
}
