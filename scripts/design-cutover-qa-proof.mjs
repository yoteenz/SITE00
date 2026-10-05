#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.argv[2] ?? 'http://127.0.0.1:5174').replace(/\/$/, '');
const outDir = '/opt/cursor/artifacts/design-cutover-qa';
mkdirSync(outDir, { recursive: true });

const report = { base, checks: {} };

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.addInitScript(() => {
  window.localStorage.setItem('isSignedIn', 'true');
  window.localStorage.setItem(
    'currentUser',
    JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin', name: 'Design Cutover QA' }),
  );
});
const page = await context.newPage();

await page.goto(`${base}/production/ndxbook/design`, { waitUntil: 'networkidle', timeout: 120_000 });
await page.getByTestId('design-unified-workspace').waitFor({ state: 'attached', timeout: 60_000 });
report.checks.unifiedVisible = true;
report.checks.productionShell = (await page.getByTestId('design-unified-workspace').getAttribute('data-production-shell')) === '1';
report.checks.hubBottomNav = (await page.getByTestId('hub-bottom-nav').count()) > 0;
report.checks.dwsFootnavAbsent = (await page.getByTestId('dws-footnav').count()) === 0;
report.checks.designNavActive = (await page.getByTestId('nav-design').getAttribute('class'))?.includes('is-active') === true;
report.checks.internalModes = (await page.getByTestId('dws-modes').count()) > 0;

await page.getByTestId('dws-modes').locator('[data-mode-tab="compiler"]').click();
report.checks.compilerMode = (await page.getByTestId('design-unified-workspace').getAttribute('data-mode')) === 'compiler';

await page.goto(`${base}/production/ndxbook/design-workspace`, { waitUntil: 'networkidle' });
report.checks.aliasRedirectUrl = page.url().includes('/production/ndxbook/design');

await page.goto(`${base}/production/ndxbook/design/pages`, { waitUntil: 'networkidle' });
report.checks.legacySectionRedirect = page.url().endsWith('/production/ndxbook/design') || page.url().includes('/production/ndxbook/design?');

await page.screenshot({ path: join(outDir, 'mobile-design-cutover.png') });
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();

const ok =
  report.checks.unifiedVisible &&
  report.checks.productionShell &&
  report.checks.hubBottomNav &&
  report.checks.dwsFootnavAbsent &&
  report.checks.aliasRedirectUrl;
process.exit(ok ? 0 : 1);
