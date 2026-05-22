import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Kindergarten } from '../../types/kindergarten';
import { averageImpression, formatAverage } from '../../lib/scoring';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { KindergartenDetail } from './detail/KindergartenDetail';

interface Props {
  record: Kindergarten;
  onDelete: (id: string) => void;
}

export function KindergartenCard({ record, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const avg = averageImpression(record.impressions);
  const detailId = `kindergarten-detail-${record.id}`;

  return (
    <article className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-stretch">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={() => setOpen((v) => !v)}
          className="flex-1 min-w-0 text-left p-4 hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50"
        >
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
            <ChevronDownIcon
              className={`shrink-0 w-5 h-5 text-slate-400 self-center transition-transform ${
                open ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>
        <div className="flex flex-col items-center justify-center gap-1 px-1 border-l border-slate-100">
          <Link
            to={`/edit/${record.id}`}
            aria-label="編集"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-primary-700 hover:bg-primary-50"
          >
            <PencilIcon className="w-4 h-4" />
          </Link>
          <button
            type="button"
            aria-label="削除"
            onClick={() => {
              if (window.confirm(`「${record.name || '無題'}」を削除しますか？`)) {
                onDelete(record.id);
              }
            }}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-rose-600 hover:bg-rose-50"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {open && (
        <div id={detailId} className="border-t border-slate-100 bg-slate-50/50">
          <KindergartenDetail record={record} />
        </div>
      )}
    </article>
  );
}
