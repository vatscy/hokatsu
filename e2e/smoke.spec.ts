import { test, expect } from '@playwright/test';

test('トップページが描画され、空状態メッセージが表示される', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /園一覧/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /新規登録/ })).toBeVisible();
  await expect(page.getByText('まだ登録された園がありません。')).toBeVisible();
});

test('新規登録リンクから登録ページに遷移できる', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /新規登録/ }).click();

  await expect(page).toHaveURL(/#\/new$/);
});
