import { test } from '@playwright/test';

test('성도각성 탭 스크린샷', async ({ page }) => {
  // Check 페이지로 직접 이동
  await page.goto('http://localhost:3000/check');

  // 페이지 로딩 대기
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 성도각성 탭 클릭 (Stellar Awakening)
  const staralignTab = page.getByRole('tab', { name: /Stellar Awakening/i });
  await staralignTab.click();

  // 탭 내용 로딩 대기
  await page.waitForTimeout(2000);

  // 전체 페이지 스크린샷
  await page.screenshot({
    path: 'test-results/staralign-full.png',
    fullPage: true
  });

  // 카드 영역만 스크린샷
  const cardContainer = page.locator('.grid').first();
  if (await cardContainer.count() > 0) {
    await cardContainer.screenshot({
      path: 'test-results/staralign-cards.png'
    });
  }

  console.log('스크린샷 저장 완료: test-results/staralign-full.png, test-results/staralign-cards.png');
});
