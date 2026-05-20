import { test, expect } from '@playwright/test';

// 「共有文字列をコピー」ボタンの回帰テスト。
// jsonIO の (De)CompressionStream 利用が Chromium のバックプレッシャでハングしないことを保証する。
// （Vitest は Node の CompressionStream を使うため同種のハングを検知できない。）
test('設定画面: 共有文字列をコピーが成功しクリップボードに v1: 文字列が入る', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.goto('/#/settings');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: '共有文字列をコピー' }).click();

  await expect(page.getByRole('button', { name: 'コピー完了' })).toBeVisible({ timeout: 5000 });

  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipText).toMatch(/^v1:/);
});
