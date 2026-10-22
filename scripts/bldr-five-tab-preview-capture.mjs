import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const out = '/opt/cursor/artifacts/bldr-five-tab-preview';
mkdirSync(out, { recursive: true });
const base = process.env.BUILDER_PREVIEW_BASE ?? 'http://127.0.0.1:5176';
const route = '/bldr/studio/blueprint?reviewRoom=BLUEPRINT';
const tabs = ['OVERVIEW', 'STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE'];
const widths = [
  { w: 390, h: 844, tag: '390' },
  { w: 834, h: 1100, tag: '834' },
  { w: 1440, h: 900, tag: '1440' },
  { w: 1920, h: 1080, tag: '1920' },
];

const audit = { base, route, tabs: {}, lowercaseViolations: [], overflow: [] };

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 120_000 });
await page.waitForTimeout(2000);

for (const tab of tabs) {
  const btn = page.locator(`button:has-text("${tab}")`).first();
  await btn.click({ timeout: 15_000 });
  await page.waitForTimeout(800);
  audit.tabs[tab] = { clicked: true };
  for (const { w, h, tag } of widths) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    if (overflow) audit.overflow.push(`${tab}@${tag}`);
    await page.screenshot({ path: `${out}/tab-${tab.toLowerCase()}-${tag}.png`, fullPage: true });
  }
}

const bodyText = await page.locator('body').innerText();
const bad = bodyText.match(/\b[a-z]{4,}\b/g)?.filter((w) => !['http', 'https', 'email', 'gmail', 'true', 'false'].includes(w)) ?? [];
audit.lowercaseViolations = [...new Set(bad)].slice(0, 20);

writeFileSync(`${out}/audit.json`, JSON.stringify(audit, null, 2));
await browser.close();
console.log('Wrote', out);
