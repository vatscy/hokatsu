import { BoolRadioGroup, RadioGroup } from '../fields/RadioGroup';
import { NumberField } from '../fields/NumberField';
import { Checkbox, CheckboxGroup } from '../fields/CheckboxGroup';
import { TextArea } from '../fields/TextArea';
import { Section } from '../Section';
import type { SectionProps } from './sectionTypes';

const YARD_SIZE_OPTIONS = [
  { value: '広め', label: '広め' },
  { value: '狭め', label: '狭め' },
] as const;

const YARD_PLACEMENT_OPTIONS = [
  { value: '屋外', label: '屋外' },
  { value: '屋上', label: '屋上' },
] as const;

const PARK_DISTANCE_OPTIONS = [
  { value: '近い', label: '近い' },
  { value: '遠い', label: '遠い' },
] as const;

const PARK_TRAFFIC_OPTIONS = [
  { value: '車多い', label: '車多い' },
  { value: '車少ない', label: '車少ない' },
] as const;

const PARK_SIZE_OPTIONS = [
  { value: '広い', label: '広い' },
  { value: '狭い', label: '狭い' },
] as const;

export function FacilitySection({ value, onChange }: SectionProps) {
  const yard = value.yard ?? {};
  const outings = value.outings ?? {};
  const park = value.nearbyPark ?? {};

  return (
    <Section title="施設">
      <div className="space-y-2">
        <BoolRadioGroup
          label="園庭"
          value={yard.exists}
          onChange={(v) => onChange({ yard: { ...yard, exists: v } })}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <RadioGroup
            label="広さ"
            value={yard.sizeNote ?? null}
            onChange={(v) => onChange({ yard: { ...yard, sizeNote: v } })}
            options={YARD_SIZE_OPTIONS}
          />
          <RadioGroup
            label="位置"
            value={yard.placement ?? null}
            onChange={(v) => onChange({ yard: { ...yard, placement: v } })}
            options={YARD_PLACEMENT_OPTIONS}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
        <NumberField
          label="おでかけ頻度"
          value={outings.perWeek}
          onChange={(v) => onChange({ outings: { ...outings, perWeek: v } })}
          suffix="回 / 週"
        />
        <CheckboxGroup>
          <Checkbox
            label="基本なし"
            checked={outings.basicallyNone ?? false}
            onChange={(v) =>
              onChange({ outings: { ...outings, basicallyNone: v } })
            }
          />
        </CheckboxGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <RadioGroup
          label="近隣公園（距離）"
          value={park.distance ?? null}
          onChange={(v) => onChange({ nearbyPark: { ...park, distance: v } })}
          options={PARK_DISTANCE_OPTIONS}
        />
        <RadioGroup
          label="近隣公園（交通）"
          value={park.traffic ?? null}
          onChange={(v) => onChange({ nearbyPark: { ...park, traffic: v } })}
          options={PARK_TRAFFIC_OPTIONS}
        />
        <RadioGroup
          label="近隣公園（広さ）"
          value={park.size ?? null}
          onChange={(v) => onChange({ nearbyPark: { ...park, size: v } })}
          options={PARK_SIZE_OPTIONS}
        />
      </div>

      <BoolRadioGroup
        label="プール"
        value={value.pool}
        onChange={(v) => onChange({ pool: v })}
      />

      <BoolRadioGroup
        label="駐輪場"
        value={value.bikeParking}
        onChange={(v) => onChange({ bikeParking: v })}
      />

      <TextArea
        label="メモ"
        value={value.facilityMemo}
        onChange={(v) => onChange({ facilityMemo: v })}
      />
    </Section>
  );
}
