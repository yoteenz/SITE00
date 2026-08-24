/**
 * Playwright controlled reference renderer.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RenderedReferenceSnapshot } from '../types.js';

export type ControlledRenderInput = {
  route: string;
  baseUrl: string;
  viewport: { width: number; height: number; deviceScaleFactor: number };
  outputDir: string;
  reconstructionIteration: number;
  blueprintVersion: string;
  commit?: string | null;
  selector?: string;
  storageStatePath?: string | null;
};

export async function renderControlledReference(input: ControlledRenderInput): Promise<RenderedReferenceSnapshot> {
  mkdirSync(input.outputDir, { recursive: true });
  const renderId = `render-${input.reconstructionIteration}-${Date.now()}`;
  const screenshotPath = join(input.outputDir, `${renderId}.png`);

  const playwright = await importPlaywright();
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: input.viewport.width, height: input.viewport.height },
    deviceScaleFactor: input.viewport.deviceScaleFactor,
    storageState: input.storageStatePath ?? undefined,
  });

  await context.addInitScript(() => {
    sessionStorage.setItem('site00-immersive-complete', '1');
    sessionStorage.setItem('site00-assts-immersive-complete', '1');
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;
    document.documentElement.appendChild(style);
  });

  const page = await context.newPage();
  await page.goto(`${input.baseUrl}${input.route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(1500);

  if (input.selector) {
    const el = page.locator(input.selector);
    const visible = await el.isVisible().catch(() => false);
    if (visible) {
      await el.screenshot({ path: screenshotPath });
    } else {
      await page.screenshot({ path: screenshotPath, fullPage: false });
    }
  } else {
    await page.screenshot({ path: screenshotPath, fullPage: false });
  }

  await browser.close();

  const snapshot: RenderedReferenceSnapshot = {
    renderId,
    route: input.route,
    viewport: input.viewport,
    timestamp: new Date().toISOString(),
    commit: input.commit ?? null,
    screenshotPath,
    reconstructionIteration: input.reconstructionIteration,
    blueprintVersion: input.blueprintVersion,
  };

  writeFileSync(join(input.outputDir, `${renderId}.json`), JSON.stringify(snapshot, null, 2));
  return snapshot;
}

async function importPlaywright() {
  try {
    return await import('playwright');
  } catch {
    throw new Error('Playwright unavailable — install playwright for controlled rendering');
  }
}
