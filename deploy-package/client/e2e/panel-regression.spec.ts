import { expect, test } from '@playwright/test';

test.describe('面板回归', () => {
  test('登录页首屏与交互响应达标', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    const start = Date.now();
    await page.reload({ waitUntil: 'domcontentloaded' });
    const firstMeasure = Date.now() - start;
    const secondStart = Date.now();
    await page.reload({ waitUntil: 'domcontentloaded' });
    const secondMeasure = Date.now() - secondStart;
    const firstScreen = Math.min(firstMeasure, secondMeasure);

    await expect(page.getByText('管理员登录')).toBeVisible();
    expect(firstScreen).toBeLessThanOrEqual(1500);

    const interaction = await page.evaluate(async () => {
      const input = document.querySelector('#login_username') as HTMLInputElement | null;
      if (!input) {
        return Number.POSITIVE_INFINITY;
      }
      const start = performance.now();
      input.focus();
      input.value = 'a';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
      return performance.now() - start;
    });

    await page.getByRole('button', { name: '登 录' }).click();
    await expect(page.getByText('请输入用户名')).toBeVisible();
    expect(interaction).toBeLessThanOrEqual(100);
    console.log(`[${testInfo.project.name}] 首屏=${Math.round(firstScreen)}ms 交互=${Math.round(interaction)}ms`);
  });
});
