import { expect, test, type Page } from '@playwright/test';

const characterApiPattern = /\/character(?:\?.*)?$/;

async function expectCharacterApiOK(page: Page) {
  const response = await page.waitForResponse((res) => (
    characterApiPattern.test(new URL(res.url()).pathname) && res.status() === 200
  ));
  const body = await response.json();

  expect(body).toHaveProperty('data');
  expect(Array.isArray(body.data)).toBe(true);
  expect(body.data.length).toBeGreaterThan(0);
}

test('home renders with character API data', async ({ page }) => {
  const apiResponse = expectCharacterApiOK(page);

  await page.goto('/');
  await apiResponse;

  await expect(page.getByRole('banner')).toContainText('AE Check');
  await expect(page.getByRole('heading', { name: 'AE Check' }).nth(1)).toBeVisible();
  await expect(page.getByText(/Total Characters:/)).toBeVisible();
  await expect(page.getByText('Check', { exact: true })).toBeVisible();
});

test('check renders with character API data', async ({ page }) => {
  const apiResponse = expectCharacterApiOK(page);

  await page.goto('/check');
  await apiResponse;

  await expect(page.getByRole('banner')).toContainText('AE Check');
  await expect(page.getByRole('tablist')).toBeVisible();
  await expect(page.getByRole('tab').first()).toBeVisible();
  await expect(page.locator('main, body')).not.toContainText('Server is currently offline');
});
