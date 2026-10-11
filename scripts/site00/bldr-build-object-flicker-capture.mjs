#!/usr/bin/env node
/**
 * Headless Build Object luminance stability probe + optional WebM clips for flicker forensics.
 *
 * Usage:
 *   node scripts/site00/bldr-build-object-flicker-capture.mjs --base http://127.0.0.1:5174 --out /opt/cursor/artifacts/site00-bldr-build-object-flicker
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const base = arg('--base', 'http://127.0.0.1:5174');
const outDir = arg('--out', '/opt/cursor/artifacts/site00-bldr-build-object-flicker');
const dwellMs = Number(arg('--dwell', '12000'));

const scenarios = [
  { name: '01_CURRENT_FLICKER', query: 'bsFlickerForensic=animateLighting', label: 'animateLighting (regression)' },
  { name: '02_ALL_EFFECTS_DISABLED_STATIC_BASELINE', query: 'bsFlickerForensic=static', label: 'static baseline' },
  { name: '03_GLASS_OPAQUE_TEST', query: 'bsFlickerForensic=opaqueGlass', label: 'opaque glass' },
  { name: '04_POSTFX_DISABLED_TEST', query: 'bsFlickerForensic=static', label: 'postfx n/a (static repeat)' },
  { name: '05_FINAL_FIXED_STATE', query: '', label: 'production static default' },
];

async function sampleCanvas(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('.bs-object__canvas');
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) return null;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return null;
      const w = canvas.width;
      const h = canvas.height;
      const buf = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      let r = 0;
      let g = 0;
      let b = 0;
      const n = w * h;
      for (let i = 0; i < buf.length; i += 4) {
        r += buf[i];
        g += buf[i + 1];
        b += buf[i + 2];
      }
      return { r: r / n, g: g / n, b: b / n, w, h, via: 'webgl' };
    }
    const w = canvas.width;
    const h = canvas.height;
    const img = ctx.getImageData(0, 0, w, h).data;
    let r = 0;
    let g = 0;
    let b = 0;
    const n = w * h;
    for (let i = 0; i < img.length; i += 4) {
      r += img[i];
      g += img[i + 1];
      b += img[i + 2];
    }
    return { r: r / n, g: g / n, b: b / n, w, h, via: '2d' };
  });
}

async function runScenario(browser, scenario) {
  const url = `${base}/bldr/studio/place${scenario.query ? `?${scenario.query}` : ''}`;
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    recordVideo: { dir: outDir, size: { width: 390, height: 844 } },
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForSelector('.bs-object__host[data-env="ready"], .bs-object__host[data-env="fallback"]', { timeout: 90_000 });
  await page.waitForTimeout(1500);

  const samples = [];
  const start = Date.now();
  while (Date.now() - start < dwellMs) {
    const s = await sampleCanvas(page);
    if (s) samples.push({ t: Date.now() - start, ...s });
    await page.waitForTimeout(120);
  }

  let maxDelta = 0;
  for (let i = 1; i < samples.length; i += 1) {
    const a = samples[i - 1];
    const b = samples[i];
    const d = Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b));
    if (d > maxDelta) maxDelta = d;
  }

  const video = page.video();
  await context.close();
  const videoPath = video ? await video.path() : null;
  const targetWebm = path.join(outDir, `${scenario.name}.webm`);
  if (videoPath) {
    const { rename, copyFile } = await import('node:fs/promises');
    try {
      await rename(videoPath, targetWebm);
    } catch {
      await copyFile(videoPath, targetWebm).catch(() => undefined);
    }
  }

  return { scenario: scenario.name, url, label: scenario.label, samples: samples.length, maxChannelDelta: maxDelta, video: videoPath ? targetWebm : null };
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
for (const scenario of scenarios) {
  // eslint-disable-next-line no-console
  console.log('Capturing', scenario.name);
  results.push(await runScenario(browser, scenario));
}
await browser.close();

const report = { capturedUtc: new Date().toISOString(), base, dwellMs, results };
await writeFile(path.join(outDir, 'capture-metrics.json'), JSON.stringify(report, null, 2));
// eslint-disable-next-line no-console
console.log(JSON.stringify(report, null, 2));
