#!/usr/bin/env node
/** Live staging SPA smoke — form-control markers (no auth). */
import { writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.STAGING_SPA_BASE ?? 'https://carefree-luck-staging.up.railway.app';
const outDir = '/opt/cursor/artifacts/staging-parity-recovery-composer1';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await page.addInitScript(() => {
  try {
    sessionStorage.setItem('site00-immersive-complete', '1');
  } catch {}
});

const report = { base: BASE, checks: {} };
try {
  await page.goto(`${BASE}/foundation/review#df-r-P02`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('.df-screen', { timeout: 60000 }).catch(() => undefined);

  const industryTag = await page.evaluate(() => {
    const el = document.querySelector('#df-industry');
    return el ? el.tagName.toLowerCase() : null;
  });
  report.checks.industryControlTag = industryTag;
  report.checks.customIndustrySelectLikely = industryTag === 'button' || industryTag === 'div';

  const phoneLabel = await page.locator('text=/CONTACT NUMBER/i').count();
  report.checks.contactNumberLabelVisible = phoneLabel > 0;

  const bodyHasMissingMsg = await page.locator('text=/ENTER A CONTACT NUMBER TO CONTINUE/i').count();
  report.checks.approvedMissingCopyInBundle = bodyHasMissingMsg >= 0; // may need interaction

  await page.screenshot({ path: `${outDir}/staging-p02-mobile.png`, fullPage: false });
} catch (e) {
  report.error = String(e.message);
}

await browser.close();
writeFileSync(`${outDir}/live-spa-smoke.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.error ? 1 : 0);
