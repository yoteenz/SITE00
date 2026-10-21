#!/usr/bin/env node
/** Capture live staging console/page errors after loader (white screen forensics). */
import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.STAGING_BASE || 'https://carefree-luck-staging.up.railway.app';
const routes = ['/', '/origin/sign-in', '/admin/site00/foundation-readiness'];

const logs = [];
const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices['iPhone 13'],
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});

for (const route of routes) {
  const page = await context.newPage();
  const events = [];
  page.on('console', (msg) => events.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', (err) => events.push({ type: 'pageerror', text: err.message, stack: err.stack }));
  page.on('requestfailed', (req) =>
    events.push({ type: 'requestfailed', text: `${req.url()} ${req.failure()?.errorText}` }),
  );

  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);

  const rootHtml = await page.locator('#root').innerHTML().catch(() => '');
  const rootVisible = await page.locator('#root').isVisible().catch(() => false);
  const bootShell = await page.locator('#site00-assts-boot-shell').getAttribute('hidden').catch(() => null);
  const htmlClass = await page.evaluate(() => document.documentElement.className);
  const bodyText = (await page.locator('body').innerText().catch(() => '')).slice(0, 500);
  const mounted = await page.evaluate(() => document.getElementById('root')?.getAttribute('data-site00-app-mounted'));

  await page.screenshot({ path: `/opt/cursor/artifacts/forensic-staging-${route.replace(/\//g, '_') || 'home'}.png`, fullPage: true });

  logs.push({ route, rootVisible, bootShellHidden: bootShell !== null, htmlClass, mounted, rootHtmlLen: rootHtml.length, bodyText, events: events.filter((e) => e.type === 'error' || e.type === 'pageerror' || e.type === 'requestfailed') });
  await page.close();
}

await browser.close();
fs.writeFileSync('/opt/cursor/artifacts/forensic-staging-console.json', JSON.stringify(logs, null, 2));
console.log(JSON.stringify(logs, null, 2));

const failed = logs.some((l) => l.events.length > 0 && l.route === '/');
process.exit(failed ? 1 : 0);
