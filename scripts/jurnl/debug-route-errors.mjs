import { chromium } from '@playwright/test';
import { buildJurnlE2eBootstrap, JURNL_E2E_STORAGE } from '../../src/projects/jurnl/e2e/fixture.ts';

const b = buildJurnlE2eBootstrap();
const base = process.env.JURNL_E2E_BASE_URL ?? 'http://127.0.0.1:4174';
const routes = ['today', 'income', 'upcoming', 'money'];

const browser = await chromium.launch();
for (const route of routes) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.addInitScript(
    ({ storage, session, device, snapshot }) => {
      localStorage.setItem(storage.session, JSON.stringify(session));
      localStorage.setItem(storage.device, JSON.stringify(device));
      localStorage.setItem(storage.repositoryKey, JSON.stringify(snapshot));
    },
    { storage: JURNL_E2E_STORAGE, session: b.session, device: b.device, snapshot: b.snapshot },
  );
  await page.goto(`${base}/production/jurnl/runtime/${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(2000);
  const count = await page.locator('[data-project-runtime="jurnl"]').count();
  console.log(route, 'jurnl=', count, 'errors=', errors.slice(0, 3));
  await page.close();
}
await browser.close();
