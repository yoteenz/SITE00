#!/usr/bin/env node
/** Origin expanded panels — framework icon audit @ 390x844 */
import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.env.SITE00_AUDIT_BASE_URL || 'http://127.0.0.1:5174';
const OUT = 'docs/site00/public-redesign/FOUNDER_VISUAL_PATCH_AUDIT1/origin-expanded-crawl.json';

const PANELS = [
  { panel: 'idnty', cardLabel: 'EXPAND IDNTY' },
  { panel: 'bldr', cardLabel: 'EXPAND BLDR' },
  { panel: 'evolve', cardLabel: 'EXPAND EVOLVE' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/origin`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);

  const results = [];
  for (const { panel, cardLabel } of PANELS) {
    await page.goto(`${BASE}/origin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const btn = page.locator('button.s00pr-origincard').filter({ hasText: panel.toUpperCase() });
    await btn.first().click({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1200);

    const metrics = await page.evaluate(() => {
      const broken = [];
      for (const img of document.querySelectorAll('img')) {
        const src = img.currentSrc || img.src;
        if (!src || src.startsWith('data:')) continue;
        if (!img.complete || img.naturalWidth === 0) {
          broken.push({ src: src.slice(0, 220), className: img.className, alt: img.alt });
        }
      }
      return {
        broken,
        frameworkIcons: [...document.querySelectorAll('.s00pr-framework__icon, .site00-bldr-framework-icon, .site00-idnty-framework-icon, .site00-evolve-framework-icon')].map(
          (el) => ({ tag: el.tagName, src: el.src?.slice(0, 220), className: el.className, nw: el.naturalWidth }),
        ),
      };
    });

    results.push({ panel, cardLabel, metrics });
  }

  await browser.close();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
  console.log('Wrote', OUT);
}

main();
