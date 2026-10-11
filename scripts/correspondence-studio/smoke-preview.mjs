#!/usr/bin/env node
import { chromium } from 'playwright';

const base = process.env.PREVIEW_BASE ?? 'http://127.0.0.1:5176';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(`${base}/admin/site00/correspondence-studio`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const url = page.url();
const h1 = await page.locator('h1').first().textContent();
await page.screenshot({ path: '/opt/cursor/artifacts/cs_home.png', fullPage: true });
await page.getByRole('link', { name: 'DIGITAL FOUNDATION' }).click();
await page.waitForTimeout(1500);
await page.getByRole('link', { name: 'OPEN CAMPAIGN' }).click();
await page.waitForTimeout(1500);
await page.getByRole('link', { name: /PERSONAL FOUNDATION INVITATION/i }).click();
await page.waitForTimeout(3000);
await page.screenshot({ path: '/opt/cursor/artifacts/cs_b01_desktop.png', fullPage: true });
await page.getByRole('button', { name: 'MOBILE' }).click();
await page.waitForTimeout(1500);
await page.screenshot({ path: '/opt/cursor/artifacts/cs_b01_mobile.png', fullPage: true });
const iframe = page.frameLocator('iframe[title="Correspondence email preview"]');
const iframeCount = await page.locator('iframe[title="Correspondence email preview"]').count();
await browser.close();
console.log(JSON.stringify({ url, h1, iframeCount, pass: url.includes('correspondence-studio') && h1?.includes('CREATIVE') }));
