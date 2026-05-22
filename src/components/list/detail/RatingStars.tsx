import type { Rating } from '../../../types/kindergarten';

interface Props {
  value: Rating | undefined;
}

export function RatingStars({ value }: Props) {
  if (value == null) return <span className="text-slate-400">—</span>;
  const filled = '★'.repeat(value);
  const empty = '☆'.repeat(5 - value);
  return (
    <span>
      <span className="text-amber-500" aria-hidden="true">
        {filled}
      </span>
      <span className="text-slate-300" aria-hidden="true">
        {empty}
      </span>
      <span className="ml-2 text-xs text-slate-500">({value}/5)</span>
    </span>
  );
}
