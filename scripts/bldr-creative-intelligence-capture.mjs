#!/usr/bin/env node
/**
 * Captures STRUCTURE and PAGES tabs for three spatial configs (creative variation).
 * Usage: node scripts/bldr-creative-intelligence-capture.mjs [baseUrl]
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:5174';
const outDir = '/opt/cursor/artifacts/bldr-creative-intelligence';
mkdirSync(outDir, { recursive: true });

const CONFIGS = {
  configA: { placePath: 'ADVANCED', feelVibe: 'MODERN', workModules: ['PAGES', 'SHOP'], pace: 'STANDARD' },
  configB: { placePath: 'ADVANCED', feelVibe: 'BOLD', workModules: ['PAGES', 'SHOP'], pace: 'STANDARD' },
  configC: { placePath: 'ADVANCED', feelVibe: 'EDITORIAL', workModules: ['PAGES', 'SHOP', 'PORTAL'], pace: 'STANDARD' },
};

const WIDTHS = [390, 1024, 1440];

function spatialState(partial) {
  return {
    version: 1,
    room: 'BLUEPRINT',
    placePath: null,
    feelVibe: null,
    workModules: ['PAGES'],
    pace: null,
    paceNotes: '',
    blueprintSection: 'OVERVIEW',
    buildObjectView: 'FRONT',
    savedAt: new Date().toISOString(),
    ...partial,
  };
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

for (const [name, cfg] of Object.entries(CONFIGS)) {
  await page.goto(`${baseUrl}/bldr/studio`, { waitUntil: 'networkidle' });
  await page.evaluate((state) => {
    localStorage.setItem('site00.bldr.spatialStudio.v1', JSON.stringify(state));
  }, spatialState({ ...cfg, room: 'BLUEPRINT', blueprintSection: 'STRUCTURE' }));
  await page.goto(`${baseUrl}/bldr/studio`, { waitUntil: 'networkidle' });
  await page.getByRole('tab', { name: 'STRUCTURE' }).click();
  await page.waitForTimeout(800);
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(outDir, `${name}-structure-${width}.png`), fullPage: true });
  }
  await page.getByRole('tab', { name: 'PAGES' }).click();
  await page.waitForTimeout(500);
  const details = page.locator('.bs-pageitem summary');
  const count = await details.count();
  for (let i = 0; i < Math.min(count, 4); i++) {
    await details.nth(i).click();
  }
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.screenshot({ path: join(outDir, `${name}-pages-disclosures-1024.png`), fullPage: true });
}

await browser.close();
console.log(`Wrote captures to ${outDir}`);
