import { useState } from 'react';
import type { Kindergarten } from '../../types/kindergarten';
import { BasicSection } from './sections/BasicSection';
import { OperationSection } from './sections/OperationSection';
import { FacilitySection } from './sections/FacilitySection';
import { DailyOpsSection } from './sections/DailyOpsSection';
import { ActivitiesSection } from './sections/ActivitiesSection';
import { CostSection } from './sections/CostSection';
import { PeopleSection } from './sections/PeopleSection';
import { MiscSection } from './sections/MiscSection';

interface Props {
  initial: Partial<Kindergarten>;
  submitLabel: string;
  onSubmit: (value: Partial<Kindergarten>) => Promise<void> | void;
  onCancel: () => void;
  onDelete?: () => Promise<void> | void;
}

export function FormShell({ initial, submitLabel, onSubmit, onCancel, onDelete }: Props) {
  const [value, setValue] = useState<Partial<Kindergarten>>(initial);
  const [busy, setBusy] = useState(false);

  const patch = (delta: Partial<Kindergarten>) => {
    setValue((prev) => ({ ...prev, ...delta }));
  };

  const submit = async () => {
    setBusy(true);
    try {
      await onSubmit(value);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      <BasicSection value={value} onChange={patch} />
      <OperationSection value={value} onChange={patch} />
      <FacilitySection value={value} onChange={patch} />
      <DailyOpsSection value={value} onChange={patch} />
      <ActivitiesSection value={value} onChange={patch} />
      <CostSection value={value} onChange={patch} />
      <PeopleSection value={value} onChange={patch} />
      <MiscSection value={value} onChange={patch} />

      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-white/95 backdrop-blur border-t border-slate-200 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 px-4 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
          disabled={busy}
        >
          キャンセル
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="min-h-11 px-4 rounded-md border border-rose-300 text-rose-600 hover:bg-rose-50"
            disabled={busy}
          >
            削除
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          className="ml-auto min-h-11 px-5 rounded-md bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60"
          disabled={busy}
        >
          {busy ? '保存中...' : submitLabel}
        </button>
      </div>
    </div>
  );
}
