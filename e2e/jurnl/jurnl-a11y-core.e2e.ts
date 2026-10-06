import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openSeededToday, gotoJurnl } from './helpers/jurnl-page';

const CORE_ROUTES = ['today', 'money', 'plan', 'safe', 'goals', 'records', 'account'] as const;

test.describe('JURNL core accessibility (automated)', () => {
  test.beforeEach(async ({ page }) => {
    await openSeededToday(page);
  });

  for (const route of CORE_ROUTES) {
    test(`axe ${route} — no critical/serious`, async ({ page }) => {
      await gotoJurnl(page, route);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const blocking = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0);
    });
  }
});
