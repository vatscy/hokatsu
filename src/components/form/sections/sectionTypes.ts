import type { Kindergarten } from '../../../types/kindergarten';

export interface SectionProps {
  value: Partial<Kindergarten>;
  onChange: (patch: Partial<Kindergarten>) => void;
}
