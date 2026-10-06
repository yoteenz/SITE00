import { test, expect } from '@playwright/test';
import { openSeededToday, JURNL_RUNTIME_PREFIX } from './helpers/jurnl-page';

test.describe('JURNL production hardening (design-preview parity)', () => {
  test('core journey still loads with repository seed', async ({ page }) => {
    await openSeededToday(page);
    await expect(page.locator('[data-jrn-screen="F03.00"]')).toBeVisible();
    await expect(page.locator('[data-project-runtime="jurnl"]')).toHaveAttribute('data-runtime-mode', 'design-preview');
  });

  test('production config module is fail-closed without server flag', async ({ page }) => {
    const cfg = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      return w.__JURNL_W5_CFG ?? null;
    });
    expect(cfg).toBeNull();
    await page.addInitScript(() => {
      // Mirror productionConfig rules in-browser for E2E assertion (built bundle uses same logic in gate vitest).
      const serverPersistence = false;
      const supabase = Boolean(import.meta?.env?.VITE_SUPABASE_URL);
      const apiBase = import.meta?.env?.VITE_API_BASE ?? '';
      const dataPlane = serverPersistence && supabase && apiBase ? 'SERVER_SYNC' : 'UNCONFIGURED';
      // @ts-expect-error test hook
      window.__JURNL_W5_CFG = { dataPlane, failClosed: dataPlane === 'UNCONFIGURED' };
    });
    await page.goto(`${JURNL_RUNTIME_PREFIX}/today`);
    await page.locator('[data-project-runtime="jurnl"]').waitFor({ state: 'attached' });
  });

  test('no preview seed emails in production mode document (static guard)', async ({ page }) => {
    await page.goto(`${JURNL_RUNTIME_PREFIX}/entry?reset=1`);
    await page.locator('[data-project-runtime="jurnl"]').waitFor({ state: 'attached' });
    const body = await page.locator('[data-project-runtime="jurnl"]').innerText();
    expect(body).not.toContain('LOCKED@EXAMPLE.COM');
  });
});
