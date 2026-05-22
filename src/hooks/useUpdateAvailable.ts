import { useEffect, useState } from 'react';
import { APP_VERSION, IS_VERSION_CHECK_ENABLED, fetchRemoteVersion } from '../lib/versionCheck';

// version.json をマウント時 + タブ復帰時に確認し、自身のビルドと差分があれば true を返す。
// 一度 true になったらバナーを継続表示するため、戻すことはしない。
export function useUpdateAvailable(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!IS_VERSION_CHECK_ENABLED) return;

    let cancelled = false;
    const baseUrl = import.meta.env.BASE_URL;

    const check = async () => {
      if (cancelled) return;
      const remote = await fetchRemoteVersion(baseUrl);
      if (cancelled) return;
      if (remote && remote !== APP_VERSION) {
        setAvailable(true);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void check();
    };
    const onFocus = () => void check();

    void check();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return available;
}
