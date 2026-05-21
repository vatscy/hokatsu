import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// 設定画面の txt ファイルダウンロード／アップロードのラウンドトリップ回帰テスト。
// - download: Blob + URL.createObjectURL を介すため、Vitest の jsdom Pass では実挙動を担保できない。
// - upload: <input type="file"> + FileReader.text() の経路。
// - 全件上書きの window.confirm を介すため、Playwright で dialog ハンドラを設定する必要がある。
test('設定画面: txt ファイルでダウンロード→クリア→アップロードのラウンドトリップが成立する', async ({
  page,
}) => {
  // 1. 1 件登録する。
  await page.goto('/');
  await page.getByRole('link', { name: /新規登録/ }).click();
  await page.getByLabel('園名').fill('ラウンドトリップ保育園');
  await page.getByRole('button', { name: '保存' }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByText('ラウンドトリップ保育園')).toBeVisible();

  // 2. 設定画面 → txt ダウンロード。
  await page.goto('/#/settings');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'txt ファイルをダウンロード' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^hokatsu-\d{8}\.txt$/);
  const downloadedPath = await download.path();
  const content = await readFile(downloadedPath, 'utf-8');
  expect(content).toMatch(/^h1:/);

  // 3. 全削除（confirm を accept）。
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: '全削除' }).click();
  await expect(page.getByText('全データを削除しました。')).toBeVisible();

  // 一覧が空になっているか念のため確認。
  await page.goto('/');
  await expect(page.getByText('まだ登録された園がありません。')).toBeVisible();

  // 4. 設定画面 → txt アップロード。
  await page.goto('/#/settings');
  page.once('dialog', (d) => void d.accept());
  await page.locator('input[type="file"]').setInputFiles({
    name: 'restore.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(content, 'utf-8'),
  });

  // 5. インポート完了で自動的に一覧へ戻り、データが復元される。
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByText('ラウンドトリップ保育園')).toBeVisible();
});

test('設定画面: 不正な内容の txt アップロードはエラー表示される', async ({ page }) => {
  await page.goto('/#/settings');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'garbage.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not a share string'),
  });
  await expect(page.getByText(/インポート失敗/)).toBeVisible();
});
