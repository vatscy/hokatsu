import { test, expect } from '@playwright/test';

// Chromium の CompressionStream のバックプレッシャ仕様を低レイヤで検証する回帰テスト。
//
// 「readable を消費する前に await writer.write(...) を呼ぶとハングする」ことが
// shareIO 側のバグ（共有文字列コピーが何も起きない）の根因だったため、
// その挙動が将来も変わらない（= 並行ドレインが必要）ことをこのテストで保護する。
//
// この挙動は Node の CompressionStream では発生しないため Vitest では検知できない。
test('CompressionStream: readable を未消費だと writer.write/close がハングする', async ({ page }) => {
  await page.goto('/');

  const result = await page.evaluate(async () => {
    const withTimeout = <T,>(p: Promise<T>, ms: number, label: string) =>
      Promise.race<string>([
        p.then(() => `${label}: resolved`),
        new Promise<string>((r) => setTimeout(() => r(`${label}: TIMEOUT`), ms)),
      ]);

    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    return {
      write: await withTimeout(writer.write(new TextEncoder().encode('test')), 1500, 'write'),
      close: await withTimeout(writer.close(), 1500, 'close'),
    };
  });

  expect(result.write).toBe('write: TIMEOUT');
  expect(result.close).toBe('close: TIMEOUT');
});

test('CompressionStream: readable を並行ドレインすれば writer.write/close が完了する', async ({ page }) => {
  await page.goto('/');

  const result = await page.evaluate(async () => {
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    const writeDone = (async () => {
      await writer.write(new TextEncoder().encode('test'));
      await writer.close();
    })();
    const reader = cs.readable.getReader();
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
    }
    await writeDone;
    return total;
  });

  expect(result).toBeGreaterThan(0);
});
