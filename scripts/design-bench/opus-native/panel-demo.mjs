/**
 * P0.VR.OPUS-NATIVE1 — records the design agent panel driving a real run.
 *
 * Drives the internal surface end to end: compile an estimate, confirm spend,
 * dispatch the proof run, watch the status transition through tool use and
 * rendering, see the patch land on the live page, then revert.
 *
 * Requires the API runtime on :3000 with SITE00_OPUS_NATIVE_ALLOW_SCRIPTED=1
 * and a dev server on :5175 proxying /api to it.
 */

import { chromium } from 'playwright';
import { mkdir, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.DEMO_BASE_URL ?? 'http://127.0.0.1:5175';
const ROUTE = '/projects/ndxbook/design/opus-native';
const OUT = '/opt/cursor/artifacts';
const VIDEO_DIR = '/tmp/opus-native-demo-video';

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 900 } },
  });
  const page = await context.newPage();

  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForSelector('.s00-opus-panel', { timeout: 30_000 });
  await page.waitForTimeout(1500);

  // Diagnostics are live before anything is dispatched.
  await page.screenshot({ path: path.join(OUT, 'opus-native-panel-ready.png') });

  const taskField = page.locator('textarea').first();
  await taskField.click();
  await taskField.type(
    'Darken the proof panel divider so the compartment boundary is legible at panel size.',
    { delay: 12 },
  );
  await page.waitForTimeout(800);

  // Estimate: compiles scoped context and projects the run cost.
  const estimateButton = page.getByRole('button', { name: 'Estimate' });
  await estimateButton.waitFor({ state: 'visible' });
  for (let i = 0; i < 40 && !(await estimateButton.isEnabled()); i += 1) {
    await page.waitForTimeout(250);
  }
  await estimateButton.click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, 'opus-native-panel-estimate.png') });

  // Spend must be acknowledged before dispatch is enabled.
  await page.locator('input[type="checkbox"]').check();
  await page.waitForTimeout(900);

  // Dispatch the proof through the real runtime loop.
  await page.getByRole('button', { name: /^Replay: first-proof-divider$/ }).click();

  const deadline = Date.now() + 90_000;
  let settled = false;
  while (Date.now() < deadline) {
    const status = (await page.locator('.s00-opus-status').innerText()).trim();
    if (status === 'WAITING FOR FOUNDER REVIEW' || status === 'ERROR') {
      settled = true;
      break;
    }
    await page.waitForTimeout(700);
  }
  if (!settled) throw new Error('run did not reach a terminal state in time');

  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, 'opus-native-panel-review.png'), fullPage: true });

  // Scroll the transcript and patch into view.
  await page.locator('.s00-opus-log').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);

  // Revert restores the exact pre-run bytes; the live page reflects it.
  await page.getByRole('button', { name: 'Revert' }).click();
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(OUT, 'opus-native-panel-reverted.png') });

  await context.close();
  await browser.close();

  const files = (await readdir(VIDEO_DIR)).filter((file) => file.endsWith('.webm'));
  if (files.length > 0) {
    // copy, not rename: /tmp and the artifact volume are different devices.
    await copyFile(path.join(VIDEO_DIR, files[0]), path.join(OUT, 'opus-native-panel-demo.webm'));
    console.log('video → /opt/cursor/artifacts/opus-native-panel-demo.webm');
  }
  console.log('done');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
