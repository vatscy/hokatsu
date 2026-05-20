import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { KindergartenCard } from '../components/list/KindergartenCard';
import { SortSelector } from '../components/list/SortSelector';
import { useKindergartensStore } from '../stores/kindergartensStore';
import { compareKindergartens } from '../lib/scoring';

export function ListPage() {
  const loaded = useKindergartensStore((s) => s.loaded);
  const load = useKindergartensStore((s) => s.load);
  const list = useKindergartensStore((s) => s.list);
  const sortKey = useKindergartensStore((s) => s.sortKey);
  const sortDir = useKindergartensStore((s) => s.sortDir);
  const setSort = useKindergartensStore((s) => s.setSort);
  const remove = useKindergartensStore((s) => s.remove);

  const sorted = useMemo(() => {
    const next = [...list].sort((a, b) => compareKindergartens(a, b, sortKey));
    if (sortDir === 'desc') next.reverse();
    return next;
  }, [list, sortKey, sortDir]);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  return (
    <Container size="lg">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h1 className="text-xl font-bold">園一覧（{sorted.length}件）</h1>
        <Link
          to="/new"
          className="min-h-11 px-4 py-2 rounded-md bg-primary-600 text-white font-semibold hover:bg-primary-700"
        >
          ＋ 新規登録
        </Link>
      </div>

      <div className="mb-4">
        <SortSelector sortKey={sortKey} sortDir={sortDir} onChange={setSort} />
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          まだ登録された園がありません。
          <br />
          右上の「新規登録」から追加できます。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((record) => (
            <KindergartenCard key={record.id} record={record} onDelete={remove} />
          ))}
        </div>
      )}
    </Container>
  );
}
