import { Link } from 'react-router-dom';
import type { Kindergarten } from '../../types/kindergarten';
import { averageImpression, formatAverage } from '../../lib/scoring';

interface Props {
  record: Kindergarten;
  onDelete: (id: string) => void;
}

export function KindergartenCard({ record, onDelete }: Props) {
  const avg = averageImpression(record.impressions);

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">
            {record.name || <span className="text-slate-400">（園名未入力）</span>}
          </h3>
          <div className="text-sm text-slate-600 mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {record.visitedAt && <span>見学日: {record.visitedAt}</span>}
            {record.category && <span>{record.category}</span>}
            {record.distanceFromHomeMin != null && (
              <span>家から {record.distanceFromHomeMin}分</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-slate-500">印象評価</div>
          <div className="text-2xl font-bold text-amber-500">{formatAverage(avg)}</div>
        </div>
      </div>

      <div className="flex gap-2 mt-1">
        <Link
          to={`/edit/${record.id}`}
          className="min-h-11 px-3 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
        >
          編集
        </Link>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`「${record.name || '無題'}」を削除しますか？`)) {
              onDelete(record.id);
            }
          }}
          className="min-h-11 px-3 py-2 rounded-md border border-rose-300 text-rose-600 text-sm hover:bg-rose-50"
        >
          削除
        </button>
      </div>
    </div>
  );
}
