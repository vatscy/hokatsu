import { test, expect, type Page } from '@playwright/test';

// IndexedDB 'hokatsu' / store 'kindergartens' に直接シードする。
// Dexie を再オープンせず素の IDB API のみで行う（Playwright ページ側に Dexie は持ち込めない）。
async function seedKindergartens(page: Page, records: Array<Record<string, unknown>>) {
  await page.evaluate(async (rs) => {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.open('hokatsu', 1);
      req.onupgradeneeded = () => {
        // Dexie 未初期化の状態で開いた場合に備えてストアを作成する。
        const db = req.result;
        if (!db.objectStoreNames.contains('kindergartens')) {
          db.createObjectStore('kindergartens', { keyPath: 'id' });
        }
      };
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('kindergartens', 'readwrite');
        const store = tx.objectStore('kindergartens');
        rs.forEach((r) => store.put(r));
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, records);
}

async function clearStorages(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const del = indexedDB.deleteDatabase('hokatsu');
        del.onsuccess = () => {
          localStorage.clear();
          resolve();
        };
        del.onerror = () => resolve();
        del.onblocked = () => resolve();
      }),
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await clearStorages(page);
});

test('並び替え設定はリロード後も復元される', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const sortSelect = page.getByRole('combobox');
  const dirButton = page.getByRole('button', { name: /昇順／降順を切り替え/ });

  // 初期値: visitedAt + desc
  await expect(sortSelect).toHaveValue('visitedAt');
  await expect(dirButton).toHaveText(/降順/);

  await sortSelect.selectOption('averageImpression');
  await dirButton.click(); // desc -> asc

  await expect(sortSelect).toHaveValue('averageImpression');
  await expect(dirButton).toHaveText(/昇順/);

  await page.reload();
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('combobox')).toHaveValue('averageImpression');
  await expect(page.getByRole('button', { name: /昇順／降順を切り替え/ })).toHaveText(/昇順/);
});

test('園カードのヘッダクリックで詳細が展開・再クリックで折りたたまれる', async ({ page }) => {
  await seedKindergartens(page, [
    {
      id: 'seed-1',
      name: 'シード保育園',
      visitedAt: '2026-04-10',
      generalMemo: '見学時の備考メモ',
      impressions: {
        teacher: 4,
        childCare: 3,
        facility: null,
        toysBooks: null,
        principal: null,
      },
      createdAt: '2026-04-10T00:00:00.000Z',
      updatedAt: '2026-04-10T00:00:00.000Z',
    },
  ]);

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 並び替えセクションの combobox を avoid するため、園名で button を絞り込む
  const header = page.getByRole('button', { name: /シード保育園/ });
  await expect(header).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText('見学時の備考メモ')).toHaveCount(0);

  await header.click();
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('見学時の備考メモ')).toBeVisible();

  await header.click();
  await expect(header).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText('見学時の備考メモ')).toHaveCount(0);
});
