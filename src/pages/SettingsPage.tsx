import { useRef, useState } from 'react';
import { Container } from '../components/layout/Container';
import {
  defaultExportFileName,
  downloadJsonFile,
  ImportFormatError,
} from '../lib/jsonIO';
import { useKindergartensStore } from '../stores/kindergartensStore';

type Message = { type: 'info' | 'error'; text: string } | null;

export function SettingsPage() {
  const exportJson = useKindergartensStore((s) => s.exportJson);
  const importJson = useKindergartensStore((s) => s.importJson);
  const clearAll = useKindergartensStore((s) => s.clearAll);
  const list = useKindergartensStore((s) => s.list);
  const loaded = useKindergartensStore((s) => s.loaded);
  const load = useKindergartensStore((s) => s.load);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<Message>(null);

  if (!loaded) {
    void load();
  }

  const handleExport = async () => {
    setMessage(null);
    const text = await exportJson();
    downloadJsonFile(text, defaultExportFileName());
    setMessage({ type: 'info', text: `${list.length}件をエクスポートしました。` });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (file: File) => {
    setMessage(null);
    try {
      const text = await file.text();
      if (
        !window.confirm(
          '現在のデータをすべて上書きしてインポートします。よろしいですか？',
        )
      ) {
        return;
      }
      const { count } = await importJson(text);
      setMessage({ type: 'info', text: `${count}件をインポートしました。` });
    } catch (err) {
      const text =
        err instanceof ImportFormatError
          ? `インポート失敗: ${err.message}`
          : `インポート失敗: ${(err as Error).message}`;
      setMessage({ type: 'error', text });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        '全データを削除します（取り消せません）。先にエクスポートでバックアップしましたか？',
      )
    ) {
      return;
    }
    await clearAll();
    setMessage({ type: 'info', text: '全データを削除しました。' });
  };

  return (
    <Container>
      <h1 className="text-xl font-bold mb-4">設定</h1>

      {message && (
        <div
          className={
            'rounded-md border px-3 py-2 mb-4 text-sm ' +
            (message.type === 'error'
              ? 'border-rose-300 bg-rose-50 text-rose-700'
              : 'border-primary-300 bg-primary-50 text-primary-800')
          }
        >
          {message.text}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4 mb-4">
        <h2 className="font-semibold mb-2">エクスポート</h2>
        <p className="text-sm text-slate-600 mb-3">
          全データを JSON ファイルとしてダウンロードします。端末故障時のバックアップや、別端末への移行に使えます。
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="min-h-11 px-4 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          JSON をダウンロード
        </button>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 mb-4">
        <h2 className="font-semibold mb-2">インポート（全件上書き）</h2>
        <p className="text-sm text-slate-600 mb-3">
          JSON ファイルから読み込みます。<strong className="text-rose-600">既存データはすべて上書き</strong>されます（Phase 1 仕様）。
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImportFile(file);
          }}
        />
        <button
          type="button"
          onClick={handleImportClick}
          className="min-h-11 px-4 rounded-md border border-slate-300 hover:bg-slate-50"
        >
          JSON ファイルを選択
        </button>
      </section>

      <section className="rounded-lg border border-rose-200 bg-white p-4">
        <h2 className="font-semibold mb-2 text-rose-700">全データ削除</h2>
        <p className="text-sm text-slate-600 mb-3">
          このブラウザに保存されている全件を削除します。取り消せません。
        </p>
        <button
          type="button"
          onClick={handleClearAll}
          className="min-h-11 px-4 rounded-md border border-rose-400 text-rose-700 hover:bg-rose-50"
        >
          全削除
        </button>
      </section>
    </Container>
  );
}
