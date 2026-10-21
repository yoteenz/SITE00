#!/usr/bin/env node
/** Live staging mobile browser smoke — carefree-luck (no localhost). */
import { chromium, devices } from 'playwright';

const BASE = 'https://carefree-luck-staging.up.railway.app';
const READINESS = `${BASE}/admin/site00/foundation-readiness`;
const OUT = '/opt/cursor/artifacts/live-staging-readiness-mobile.png';
const OUT_ERR = '/opt/cursor/artifacts/live-staging-readiness-console.txt';

const adminInit = () => {
  localStorage.setItem('isSignedIn', 'true');
  localStorage.setItem(
    'currentUser',
    JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin', firstName: 'Founder' }),
  );
};

async function runBrowser(name, contextOpts) {
  const browser = await chromium.launch();
  const logs = [];
  try {
    const context = await browser.newContext(contextOpts);
    await context.addInitScript(adminInit);
    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') logs.push(`[${name}] ${msg.text()}`);
    });
    page.on('pageerror', (err) => logs.push(`[${name}:pageerror] ${err.message}`));

    await page.goto(READINESS, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').innerText();
    const blank = bodyText.trim().length < 40;
    const hasTitle = /DIGITAL FOUNDATION|ADMIN · INITIALIZATION FAILED|SIGN IN/i.test(bodyText);
    const hasSynthetic = bodyText.includes('Synthetic intake');
    const hasCreate = bodyText.includes('Create test client');

    if (name === 'webkit-mobile') {
      await page.screenshot({ path: OUT, fullPage: true });
    }

    return { name, blank, hasTitle, hasSynthetic, hasCreate, bodyPreview: bodyText.slice(0, 500), logs };
  } finally {
    await browser.close();
  }
}

const webkitResult = await runBrowser('mobile-safari-compat', {
  ...devices['iPhone 13'],
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const chromeResult = await runBrowser('chromium-mobile', { ...devices['iPhone 13'] });

const unauthBrowser = await chromium.launch();
const unauthContext = await unauthBrowser.newContext({ ...devices['iPhone 13'] });
const unauthPage = await unauthContext.newPage();
await unauthPage.goto(READINESS, { waitUntil: 'networkidle', timeout: 60000 });
const unauthUrl = unauthPage.url();
const unauthText = await unauthPage.locator('body').innerText();
await unauthBrowser.close();

const allLogs = [...webkitResult.logs, ...chromeResult.logs];
await import('node:fs/promises').then((fs) => fs.writeFile(OUT_ERR, allLogs.join('\n'), 'utf8'));

const pass =
  !webkitResult.blank &&
  webkitResult.hasTitle &&
  webkitResult.hasSynthetic &&
  webkitResult.hasCreate &&
  !chromeResult.blank &&
  /sign-in/i.test(unauthText + unauthUrl);

console.log(JSON.stringify({ pass, webkitResult, chromeResult, unauthUrl, unauthHasSignIn: /sign-in|SIGN IN/i.test(unauthText) }, null, 2));
process.exit(pass ? 0 : 1);
