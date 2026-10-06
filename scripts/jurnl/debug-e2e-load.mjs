import { chromium } from 'playwright';
import { buildJurnlE2eBootstrap, JURNL_E2E_STORAGE } from '../../src/projects/jurnl/e2e/fixture.ts';

const b = buildJurnlE2eBootstrap();
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.addInitScript(
  ({ storage, session, device, snapshot }) => {
    localStorage.setItem(storage.session, JSON.stringify(session));
    localStorage.setItem(storage.device, JSON.stringify(device));
    localStorage.setItem(storage.repositoryKey, JSON.stringify(snapshot));
  },
  { storage: JURNL_E2E_STORAGE, session: b.session, device: b.device, snapshot: b.snapshot },
);
const url = process.env.JURNL_E2E_BASE_URL ?? 'http://127.0.0.1:5174';
await page.goto(`${url}/production/jurnl/runtime/today`, { waitUntil: 'networkidle', timeout: 120_000 });
console.log('jurnl', await page.locator('[data-project-runtime="jurnl"]').count());
await browser.close();
