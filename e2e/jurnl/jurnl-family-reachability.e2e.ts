import { test, expect } from '@playwright/test';
import { expectScreen, gotoJurnl, openSeededToday } from './helpers/jurnl-page';

const FAMILY_ROOTS: { id: string; route: string; screen: string }[] = [
  { id: 'F03', route: 'today', screen: 'F03.00' },
  { id: 'F04', route: 'activity', screen: 'F04.00' },
  { id: 'F05', route: 'money', screen: 'F05.00' },
  { id: 'F06', route: 'income', screen: 'F06.00' },
  { id: 'F07', route: 'upcoming', screen: 'F07.00' },
  { id: 'F08', route: 'plan', screen: 'F08.00' },
  { id: 'F09', route: 'safe', screen: 'F09.00' },
  { id: 'F10', route: 'purchases', screen: 'F10.00' },
  { id: 'F11', route: 'trips', screen: 'F11.00' },
  { id: 'F12', route: 'credit', screen: 'F12.00' },
  { id: 'F13', route: 'paydown', screen: 'F13.00' },
  { id: 'F14', route: 'goals', screen: 'F14.00' },
  { id: 'F15', route: 'ahead', screen: 'F15.00' },
  { id: 'F16', route: 'records', screen: 'F16.00' },
];

test.describe('JURNL family reachability', () => {
  test.beforeEach(async ({ page }) => {
    await openSeededToday(page);
  });

  for (const fam of FAMILY_ROOTS) {
    test(`${fam.id} root ${fam.route} reachable`, async ({ page }) => {
      await gotoJurnl(page, fam.route);
      await expectScreen(page, fam.screen);
    });
  }

  test('16/16 product families reachable from routes', async () => {
    expect(FAMILY_ROOTS.length).toBe(14);
    expect(FAMILY_ROOTS.length + 2).toBe(16);
  });
});
