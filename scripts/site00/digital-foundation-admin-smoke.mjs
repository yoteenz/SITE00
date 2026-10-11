#!/usr/bin/env node
/** Smoke: admin foundation API must not return LOCAL_API_ERROR / tsx paths. */
import { chromium } from 'playwright';

const base = process.env.BASE || 'http://127.0.0.1:5174';

const browser = await chromium.launch({ headless: true });
for (const vp of [
  { name: 'mobile', width: 393, height: 852 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const apiErrors = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/admin/site00-foundation')) {
      const text = await res.text().catch(() => '');
      if (text.includes('tsx/dist') || text.includes('LOCAL_API_ERROR')) apiErrors.push(text.slice(0, 200));
    }
  });
  await page.goto(`${base}/admin/site00/foundation`, { waitUntil: 'networkidle', timeout: 120_000 });
  const body = await page.locator('body').innerText();
  if (body.includes('tsx/dist') || body.includes('esm/index.mjs')) {
    console.error(`FAIL ${vp.name}: tsx error visible in page`);
    process.exitCode = 1;
  }
  if (apiErrors.length) {
    console.error(`FAIL ${vp.name}: API`, apiErrors);
    process.exitCode = 1;
  } else {
    console.log(`PASS ${vp.name}: no tsx runtime error on admin foundation route`);
  }
  await ctx.close();
}
await browser.close();
