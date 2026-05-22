import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchRemoteVersion } from './versionCheck';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchRemoteVersion', () => {
  it('返値が version 文字列を持つ正常な JSON ならその文字列を返す', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ version: 'abc123' }), { status: 200 })),
    );
    await expect(fetchRemoteVersion('/base/')).resolves.toBe('abc123');
  });

  it('HTTP エラー (404) は null を返す', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not found', { status: 404 })));
    await expect(fetchRemoteVersion('/base/')).resolves.toBeNull();
  });

  it('JSON が壊れていれば null を返す', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not json', { status: 200 })));
    await expect(fetchRemoteVersion('/base/')).resolves.toBeNull();
  });

  it('version フィールドが文字列でなければ null を返す', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ version: 123 }), { status: 200 })),
    );
    await expect(fetchRemoteVersion('/base/')).resolves.toBeNull();
  });

  it('fetch 自体が例外を投げても null を返す（ネットワーク断など）', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    await expect(fetchRemoteVersion('/base/')).resolves.toBeNull();
  });

  it('cache: no-store とクエリ付きで fetch を呼ぶ', async () => {
    const spy = vi.fn(async () => new Response(JSON.stringify({ version: 'x' }), { status: 200 }));
    vi.stubGlobal('fetch', spy);
    await fetchRemoteVersion('/base/');
    expect(spy).toHaveBeenCalledTimes(1);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/^\/base\/version\.json\?_=\d+$/);
    expect(init.cache).toBe('no-store');
  });
});
