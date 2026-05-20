import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const getShareString = useKindergartensStore((s) => s.getShareString);
  const importFromShare = useKindergartensStore((s) => s.importFromShare);
  const clearAll = useKindergartensStore((s) => s.clearAll);
  const list = useKindergartensStore((s) => s.list);
  const loaded = useKindergartensStore((s) => s.loaded);
  const load = useKindergartensStore((s) => s.load);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [shareInput, setShareInput] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
    };
  }, []);

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

  const handleCopyShare = async () => {
    if (copyState !== 'idle') return;
    if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
    setMessage(null);
    setCopyState('copying');

    // iOS Safari は writeText の前に await を挟むと user activation が失効して
    // NotAllowedError になる。ClipboardItem の値として Promise<Blob> を渡すと
    // Safari は clipboard.write の user activation を Promise 解決まで延長する。
    const blobPromise = getShareString().then(
      (text) => new Blob([text], { type: 'text/plain' }),
    );

    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/plain': blobPromise }),
        ]);
      } else {
        const blob = await blobPromise;
        await navigator.clipboard.writeText(await blob.text());
      }
      setCopyState('copied');
      copyTimerRef.current = setTimeout(() => setCopyState('idle'), 2000);
    } catch (err) {
      setCopyState('idle');
      setMessage({ type: 'error', text: `コピー失敗: ${(err as Error).message}` });
    }
  };

  const handleImportShare = async () => {
    setMessage(null);
    if (!shareInput.trim()) return;
    if (
      !window.confirm(
        '現在のデータをすべて上書きしてインポートします。よろしいですか？',
      )
    ) {
      return;
    }
    try {
      await importFromShare(shareInput.trim());
      setShareInput('');
      navigate('/');
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          err instanceof ImportFormatError
            ? `インポート失敗: ${err.message}`
            : `インポート失敗: ${(err as Error).message}`,
      });
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

      <section className="rounded-lg border border-slate-200 bg-white p-4 mb-4">
        <h2 className="font-semibold mb-2">文字列でデータ共有</h2>
        <p className="text-sm text-slate-600 mb-3">
          全データを圧縮した文字列でコピー・ペーストして端末間で共有できます。ファイルを使わずに別のブラウザへ移行できます。
        </p>
        <button
          type="button"
          onClick={handleCopyShare}
          disabled={copyState !== 'idle'}
          aria-busy={copyState === 'copying'}
          className="min-h-11 px-4 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        >
          {copyState === 'copying' ? 'コピー中…' : copyState === 'copied' ? 'コピー完了' : '共有文字列をコピー'}
        </button>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            共有文字列を貼り付け（<code className="font-mono text-xs">v1:...</code> の形式）
          </label>
          <textarea
            value={shareInput}
            onChange={(e) => setShareInput(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="v1:..."
          />
          <button
            type="button"
            onClick={handleImportShare}
            disabled={!shareInput.trim()}
            className="mt-2 min-h-11 px-4 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            貼り付けからインポート
          </button>
        </div>
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
