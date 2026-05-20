import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { FormShell } from '../components/form/FormShell';
import { useKindergartensStore } from '../stores/kindergartensStore';
import type { Kindergarten } from '../types/kindergarten';
import { kindergartenRepo } from '../db/repository';

export function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const update = useKindergartensStore((s) => s.update);
  const remove = useKindergartensStore((s) => s.remove);

  const [record, setRecord] = useState<Kindergarten | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setRecord(null);
      return;
    }
    kindergartenRepo.getById(id).then((r) => {
      if (!cancelled) setRecord(r ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (record === undefined) {
    return (
      <Container>
        <p className="text-slate-500">読み込み中...</p>
      </Container>
    );
  }
  if (record === null || !id) {
    return (
      <Container>
        <p className="text-rose-600">該当する園が見つかりません。</p>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="text-xl font-bold mb-4">編集</h1>
      <FormShell
        initial={record}
        submitLabel="更新"
        onSubmit={async (value) => {
          await update(id, value);
          navigate('/');
        }}
        onCancel={() => navigate(-1)}
        onDelete={async () => {
          if (!window.confirm('この園の記録を削除しますか？')) return;
          await remove(id);
          navigate('/');
        }}
      />
    </Container>
  );
}
