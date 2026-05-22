import { useUpdateAvailable } from '../../hooks/useUpdateAvailable';

export function UpdateBanner() {
  const available = useUpdateAvailable();
  if (!available) return null;

  return (
    <div
      role="alert"
      className="sticky top-[57px] z-30 bg-amber-100 border-b border-amber-300 text-amber-900"
    >
      <div className="mx-auto max-w-screen-lg px-4 py-2 flex items-center gap-3 text-sm">
        <span className="flex-1">新しいバージョンがあります。</span>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-3 py-1 rounded-md bg-amber-600 text-white text-xs font-medium hover:bg-amber-700"
        >
          更新する
        </button>
      </div>
    </div>
  );
}
