import type { SortDir, SortKey } from '../../stores/kindergartensStore';

interface Props {
  sortKey: SortKey;
  sortDir: SortDir;
  onChange: (key: SortKey, dir: SortDir) => void;
}

const KEY_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'visitedAt', label: '見学日' },
  { value: 'averageImpression', label: '印象評価平均' },
  { value: 'name', label: '園名' },
  { value: 'distanceFromHomeKm', label: '家からの距離 (km)' },
  { value: 'distanceFromHomeMin', label: '家からの時間 (分)' },
];

export function SortSelector({ sortKey, sortDir, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-slate-600">並び替え:</span>
      <select
        className="min-h-11 px-2 rounded-md border border-slate-300 bg-white"
        value={sortKey}
        onChange={(e) => onChange(e.target.value as SortKey, sortDir)}
      >
        {KEY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onChange(sortKey, sortDir === 'asc' ? 'desc' : 'asc')}
        className="min-h-11 px-3 rounded-md border border-slate-300 bg-white text-sm hover:bg-slate-50"
        aria-label="昇順／降順を切り替え"
      >
        {sortDir === 'asc' ? '昇順 ↑' : '降順 ↓'}
      </button>
    </div>
  );
}
