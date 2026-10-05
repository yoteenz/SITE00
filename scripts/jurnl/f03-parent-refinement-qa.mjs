/**
 * F03 parent refinement QA: icon slots, single plus, editorial header actions.
 * Run from the repo root against the local Vite server.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.SITE00_QA_BASE ?? 'http://127.0.0.1:5191';
const outDir = '/opt/cursor/artifacts/jurnl-f03-refinement';
const viewports = [
  { name: 'mobile', width: 393, height: 852 },
  { name: 'tablet', width: 834, height: 1194 },
  { name: 'desktop', width: 1440, height: 900 },
];

async function readState(page) {
  return page.evaluate(() => {
    const doc = document.scrollingElement;
    const stage = document.querySelector('[data-jrn-app-stage="canvas"]') || document.querySelector('.jrn');
    const stageBox = stage?.getBoundingClientRect();
    const add = document.querySelector('[data-jrn-trigger="nav-add"]');
    const addBox = add?.getBoundingClientRect();
    const plus = add?.querySelector('svg');
    const plusBox = plus?.getBoundingClientRect();
    const secs = [...document.querySelectorAll('.jrn-home__sec')].map((row) => {
      const label = row.querySelector(':scope > span');
      const action = row.querySelector('.jrn-inline-action');
      const labelBox = label?.getBoundingClientRect();
      const actionBox = action?.getBoundingClientRect();
      const text = action?.querySelector('span');
      const textBox = text?.getBoundingClientRect();
      const style = action ? getComputedStyle(action) : null;
      return {
        label: label?.textContent?.trim() ?? '',
        action: action?.textContent?.trim() ?? '',
        role: action?.getAttribute('data-jrn-role') ?? '',
        border: style ? `${style.borderTopWidth} ${style.borderTopStyle}` : '',
        radius: style?.borderRadius ?? '',
        baselineDelta: labelBox && textBox ? Math.round((labelBox.bottom - textBox.bottom) * 10) / 10 : null,
        rowHeight: Math.round(row.getBoundingClientRect().height),
      };
    });
    const why = document.querySelector('[data-jrn-trigger="today-why"]');
    const whyStyle = why ? getComputedStyle(why) : null;
    const icons = [...document.querySelectorAll('[data-jrn-icon]')].map((node) => node.getAttribute('data-jrn-icon'));
    const navIcons = [...document.querySelectorAll('.jrn-nav [data-jrn-icon]')].map((node) => node.getAttribute('data-jrn-icon'));
    const addText = add?.textContent?.replace(/\s+/g, '') ?? '';
    return {
      plusCount: add?.querySelectorAll('[data-jrn-icon="plus"]').length ?? 0,
      addText,
      plusOffsetX: addBox && plusBox ? Math.round((plusBox.left + plusBox.width / 2 - (addBox.left + addBox.width / 2)) * 10) / 10 : null,
      plusOffsetY: addBox && plusBox ? Math.round((plusBox.top + plusBox.height / 2 - (addBox.top + addBox.height / 2)) * 10) / 10 : null,
      navRadius: add ? getComputedStyle(add).borderRadius : '',
      secs,
      whyBackground: whyStyle?.backgroundColor ?? '',
      whyBorder: whyStyle ? `${whyStyle.borderTopWidth} ${whyStyle.borderTopStyle}` : '',
      navIcons,
      iconCount: icons.length,
      pageScroll: doc ? doc.scrollHeight - doc.clientHeight : null,
      stageScroll: stage ? stage.scrollHeight - stage.clientHeight : null,
      overflowX: doc ? doc.scrollWidth - doc.clientWidth : null,
      stageOverflowX: stageBox ? Math.round(stage.scrollWidth - stage.clientWidth) : null,
    };
  });
}

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
await mkdir(outDir, { recursive: true });
const report = {};

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    recordVideo: viewport.name === 'mobile' ? { dir: outDir, size: { width: viewport.width, height: viewport.height } } : undefined,
  });
  const page = await context.newPage();
  await page.goto(`${base}/production/jurnl/runtime/today`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-jrn-trigger="nav-add"]');
  await page.waitForTimeout(400);
  const before = await readState(page);
  await page.screenshot({ path: `${outDir}/today-${viewport.name}.png` });
  await page.locator('.jrn-home__panel').first().screenshot({ path: `${outDir}/panel-${viewport.name}.png` });
  await page.locator('.jrn-nav').screenshot({ path: `${outDir}/nav-${viewport.name}.png` });

  await page.locator('[data-jrn-trigger="today-upcoming"]').click();
  await page.waitForTimeout(200);
  const expanded = await page.locator('.jrn-home__sec').first().innerText();
  await page.locator('[data-jrn-trigger="today-activity"]').click();
  await page.waitForURL(/\/activity/);
  const activity = page.url();
  await page.goto(`${base}/production/jurnl/runtime/today`, { waitUntil: 'networkidle' });
  await page.locator('[data-jrn-trigger="nav-add"]').click();
  await page.waitForSelector('[data-jrn-overlay="quick-add"]');
  const quickAdd = await page.locator('[data-jrn-overlay="quick-add"]').count();

  report[viewport.name] = { ...before, expandedHeader: expanded.replace(/\s+/g, ' ').trim(), activity, quickAdd };
  await context.close();
}

await browser.close();
await writeFile(`${outDir}/measure.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
