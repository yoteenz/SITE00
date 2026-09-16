/**
 * P0.VR.DESIGNBENCH.OPUS-ASSET-PERSISTENCE1 — walkthrough recording.
 * Canonical -> List -> Canonical -> hard reload, showing the approved Grok
 * plates holding their identity across every switch.
 */

import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';

const run = promisify(execFile);
const BASE = process.env.PROOF_BASE_URL ?? 'http://127.0.0.1:5174';
const ROUTE = '/projects/ndxbook/design/twin-opus-direct';
const VIDEO_DIR = '/tmp/opus-asset-demo-video';
const OUT = '/opt/cursor/artifacts';

await rm(VIDEO_DIR, { recursive: true, force: true });
await mkdir(VIDEO_DIR, { recursive: true });
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  recordVideo: { dir: VIDEO_DIR, size: { width: 390, height: 844 } },
});
const page = await context.newPage();

const click = async (label) => {
  await page.getByRole('radio', { name: label, exact: true }).click();
  await page.waitForTimeout(1600);
};

await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-tod-slot]');
await page.waitForTimeout(2200);

await page.mouse.wheel(0, 900);
await page.waitForTimeout(1400);
await page.mouse.wheel(0, 900);
await page.waitForTimeout(1400);
await page.mouse.wheel(0, -1800);
await page.waitForTimeout(1200);

await click('LIST');
// Scroll the list hero into full view so the shared plate is unmistakable.
await page.mouse.wheel(0, 500);
await page.waitForTimeout(2200);
await page.mouse.wheel(0, 500);
await page.waitForTimeout(2200);
await page.mouse.wheel(0, -1000);
await page.waitForTimeout(1200);

await click('CANONICAL');
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('[data-tod-slot]');
// Hold only once every plate has actually decoded, so the recording shows the
// settled page rather than the in-flight blank frame.
await page.waitForFunction(
  () =>
    [...document.querySelectorAll('[data-tod-slot]')].every(
      (img) => img.complete && img.naturalWidth > 0,
    ),
  null,
  { timeout: 20_000 },
);
await page.waitForTimeout(3500);
await page.mouse.wheel(0, 700);
await page.waitForTimeout(2500);

await context.close();
await browser.close();

const [file] = (await readdir(VIDEO_DIR)).filter((name) => name.endsWith('.webm'));
const webm = `${VIDEO_DIR}/${file}`;
const mp4 = `${OUT}/opus-asset-persistence-demo.mp4`;
await run('ffmpeg', ['-y', '-i', webm, '-movflags', 'faststart', '-pix_fmt', 'yuv420p', mp4]);
await copyFile(mp4, mp4);
console.log(`wrote ${mp4}`);
