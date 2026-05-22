export const APP_VERSION = __APP_VERSION__;

// dev ビルドでは version.json を発行していないため、チェック自体をスキップする。
export const IS_VERSION_CHECK_ENABLED = APP_VERSION !== 'dev';

export type VersionJson = { version: string };

export async function fetchRemoteVersion(baseUrl: string): Promise<string | null> {
  try {
    // CDN・ブラウザの中間キャッシュを完全に避けるため no-store + クエリで一意化する。
    const url = `${baseUrl}version.json?_=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (
      typeof data === 'object' &&
      data !== null &&
      'version' in data &&
      typeof (data as { version: unknown }).version === 'string'
    ) {
      return (data as VersionJson).version;
    }
    return null;
  } catch {
    return null;
  }
}
