import type { Page } from '@playwright/test';
import {
  buildJurnlE2eBootstrap,
  buildJurnlE2eEmptyDomainsBootstrap,
  JURNL_E2E_STORAGE,
  type JurnlE2eBootstrap,
} from '../../../src/projects/jurnl/e2e/fixture';

export const JURNL_RUNTIME_PREFIX = '/production/jurnl/runtime';

const E2E_SEED_FLAG = 'jurnl.e2e.seed.v1';

export async function bootstrapJurnl(page: Page, bootstrap: JurnlE2eBootstrap = buildJurnlE2eBootstrap()) {
  await page.addInitScript(
    ({ storage, session, device, snapshot, seedFlag }) => {
      if (sessionStorage.getItem(seedFlag)) return;
      localStorage.clear();
      localStorage.setItem(storage.session, JSON.stringify(session));
      localStorage.setItem(storage.device, JSON.stringify(device));
      localStorage.setItem(storage.repositoryKey, JSON.stringify(snapshot));
      sessionStorage.setItem(seedFlag, '1');
    },
    {
      storage: JURNL_E2E_STORAGE,
      session: bootstrap.session,
      device: bootstrap.device,
      snapshot: bootstrap.snapshot,
      seedFlag: E2E_SEED_FLAG,
    },
  );
}

/**
 * Clears the one-time seed flag so the next navigation re-applies bootstrap (new fixture).
 * A page that has not navigated yet (about:blank) has no app origin and therefore no flag to clear; reading
 * sessionStorage there is a browser security error, so there is nothing to do.
 */
export async function resetJurnlE2eSeedFlag(page: Page) {
  if (page.url() === 'about:blank') return;
  await page.evaluate((flag) => sessionStorage.removeItem(flag), E2E_SEED_FLAG);
}

/** The canonical Safe to Spend value (cents, signed) from the F09 parent's stable value hook. */
export async function safeToSpendCents(page: Page): Promise<number> {
  await gotoJurnl(page, 'safe');
  const el = page.locator('[data-jrn-value="safe-to-spend"]').first();
  await el.waitFor({ state: 'attached', timeout: 30_000 });
  return Number(await el.getAttribute('data-jrn-amount-cents'));
}

/** The stored repository snapshot for the E2E user (device adapter), for asserting canonical state. */
export async function storedSnapshot(page: Page): Promise<Record<string, unknown> & { trips: { title: string; reserved_amount: number }[]; planIntentions: { title: string; assigned_amount: number }[]; obligations: { name: string; amount: number; obligation_id: string }[] }> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), JURNL_E2E_STORAGE.repositoryKey);
}

export async function gotoJurnl(page: Page, route = 'today') {
  await page.goto(`${JURNL_RUNTIME_PREFIX}/${route.replace(/^\/+/, '')}`, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.locator('[data-testid="project-runtime-loading"]').waitFor({ state: 'detached', timeout: 120_000 }).catch(() => undefined);
  await page.locator('[data-project-runtime="jurnl"]').waitFor({ state: 'attached', timeout: 120_000 });
}

export async function openSeededToday(page: Page, emptyDomains = false) {
  await bootstrapJurnl(page, emptyDomains ? buildJurnlE2eEmptyDomainsBootstrap() : buildJurnlE2eBootstrap());
  await gotoJurnl(page, 'today');
}

export function trigger(page: Page, name: string) {
  return page.locator(`[data-jrn-trigger="${name}"]`);
}

export async function clickTrigger(page: Page, name: string) {
  const el = trigger(page, name);
  await el.first().scrollIntoViewIfNeeded();
  await el.first().click();
}

export async function expectScreen(page: Page, screenId: string) {
  await page.locator(`[data-jrn-screen="${screenId}"]`).waitFor({ state: 'attached', timeout: 30_000 });
}
