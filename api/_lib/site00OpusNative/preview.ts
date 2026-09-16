/**
 * P0.VR.OPUS-NATIVE1 — Phase 12 + 13: the visual loop.
 *
 * REFERENCE -> CURRENT RENDER -> DIFFERENCE -> PATCH -> RENDER -> SCREENSHOT ->
 * COMPARE -> CORRECT.
 *
 * Playwright is a devDependency, so it is imported dynamically and its absence
 * degrades to a named PREVIEW_FAILURE rather than crashing the API in a
 * production deploy that has no browser. The runtime treats a missing browser
 * as a blocked visual loop, which the protocol forbids self-certifying around —
 * the agent is told it could not see the render, and the review package says so.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import type { OpusNativeScreenshot, OpusNativeViewport } from '../../../shared/site00-opus-native/types.js';
import { opusNativeWorkDir, previewBaseUrl } from './config.js';

export const VIEWPORT_SIZES: Record<OpusNativeViewport, { width: number; height: number }> = {
  MOBILE: { width: 390, height: 844 },
  TABLET: { width: 834, height: 1112 },
  DESKTOP: { width: 1440, height: 900 },
};

export class PreviewUnavailableError extends Error {
  constructor(detail: string) {
    super(`PREVIEW_FAILURE: ${detail}`);
    this.name = 'PreviewUnavailableError';
  }
}

export class ScreenshotFailedError extends Error {
  constructor(detail: string) {
    super(`SCREENSHOT_FAILURE: ${detail}`);
    this.name = 'ScreenshotFailedError';
  }
}

async function loadChromium() {
  try {
    const playwright = await import('playwright');
    return playwright.chromium;
  } catch (error) {
    throw new PreviewUnavailableError(
      `playwright is not available in this environment (${(error as Error).message})`,
    );
  }
}

export async function previewReadiness(): Promise<{ ready: boolean; detail: string }> {
  let chromium;
  try {
    chromium = await loadChromium();
  } catch (error) {
    return { ready: false, detail: (error as Error).message };
  }

  const base = previewBaseUrl();
  try {
    const response = await fetch(base, { method: 'GET', signal: AbortSignal.timeout(4000) });
    if (!response.ok) {
      return { ready: false, detail: `preview server at ${base} returned ${response.status}` };
    }
  } catch (error) {
    return { ready: false, detail: `preview server at ${base} unreachable: ${(error as Error).message}` };
  }

  return { ready: Boolean(chromium), detail: `chromium ready, preview at ${base}` };
}

function screenshotDir(): string {
  return path.join(opusNativeWorkDir(), 'screenshots');
}

export interface CaptureInput {
  route: string;
  viewport: OpusNativeViewport;
  /** Optional label so before/after pairs are legible on disk. */
  label?: string;
  waitMs?: number;
}

export async function captureScreenshot(input: CaptureInput): Promise<OpusNativeScreenshot> {
  const chromium = await loadChromium();
  const size = VIEWPORT_SIZES[input.viewport] ?? VIEWPORT_SIZES.MOBILE;
  const url = new URL(input.route, previewBaseUrl()).toString();
  const screenshotId = `shot-${input.label ? `${input.label}-` : ''}${randomUUID().slice(0, 8)}`;
  const dir = screenshotDir();
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${screenshotId}.png`);

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    if (!response || !response.ok()) {
      throw new ScreenshotFailedError(`route ${url} returned ${response?.status() ?? 'no response'}`);
    }
    await page.waitForTimeout(input.waitMs ?? 600);
    await page.screenshot({ path: filePath, fullPage: false });
    return {
      screenshotId,
      viewport: input.viewport,
      width: size.width,
      height: size.height,
      path: filePath,
      at: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof ScreenshotFailedError) throw error;
    throw new ScreenshotFailedError((error as Error).message);
  } finally {
    await browser.close().catch(() => undefined);
  }
}

/** Phase 8 — inspect_dom. Measured boxes, not a description of the DOM. */
export async function inspectDom(input: {
  route: string;
  viewport: OpusNativeViewport;
  selectors: string[];
}): Promise<Array<{ selector: string; found: boolean; box: { x: number; y: number; width: number; height: number } | null; styles: Record<string, string> | null }>> {
  const chromium = await loadChromium();
  const size = VIEWPORT_SIZES[input.viewport] ?? VIEWPORT_SIZES.MOBILE;
  const url = new URL(input.route, previewBaseUrl()).toString();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.waitForTimeout(400);
    return await page.evaluate((selectors: string[]) => {
      return selectors.map((selector) => {
        const element = document.querySelector(selector);
        if (!element) return { selector, found: false, box: null, styles: null };
        const rect = element.getBoundingClientRect();
        const computed = window.getComputedStyle(element);
        const interesting = [
          'display', 'position', 'width', 'height', 'padding', 'margin',
          'border-top-width', 'border-bottom-width', 'border-color',
          'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color', 'background-color',
        ];
        const styles: Record<string, string> = {};
        for (const property of interesting) styles[property] = computed.getPropertyValue(property);
        return {
          selector,
          found: true,
          box: {
            x: Math.round(rect.x * 100) / 100,
            y: Math.round(rect.y * 100) / 100,
            width: Math.round(rect.width * 100) / 100,
            height: Math.round(rect.height * 100) / 100,
          },
          styles,
        };
      });
    }, input.selectors);
  } catch (error) {
    throw new ScreenshotFailedError(`inspect_dom failed: ${(error as Error).message}`);
  } finally {
    await browser.close().catch(() => undefined);
  }
}

/**
 * Quantitative comparison. The protocol forbids eyeballing a comparison, so
 * this returns a number the agent can track across iterations rather than an
 * impression it can rationalise.
 */
export async function compareScreenshots(
  aPath: string,
  bPath: string,
): Promise<{ diffPercent: number; changedRegions: Array<{ band: string; diffPercent: number }> }> {
  const sharp = (await import('sharp')).default;

  const [aMeta, bMeta] = await Promise.all([sharp(aPath).metadata(), sharp(bPath).metadata()]);
  const width = Math.min(aMeta.width ?? 0, bMeta.width ?? 0);
  const height = Math.min(aMeta.height ?? 0, bMeta.height ?? 0);
  if (width === 0 || height === 0) {
    throw new ScreenshotFailedError('cannot compare screenshots with zero dimensions');
  }

  const [a, b] = await Promise.all([
    sharp(aPath).extract({ left: 0, top: 0, width, height }).greyscale().raw().toBuffer(),
    sharp(bPath).extract({ left: 0, top: 0, width, height }).greyscale().raw().toBuffer(),
  ]);

  const bandCount = 8;
  const bandHeight = Math.max(1, Math.floor(height / bandCount));
  const bandDiffs = new Array(bandCount).fill(0);
  const bandTotals = new Array(bandCount).fill(0);
  let changed = 0;

  for (let i = 0; i < a.length && i < b.length; i += 1) {
    const y = Math.floor(i / width);
    const band = Math.min(bandCount - 1, Math.floor(y / bandHeight));
    bandTotals[band] += 1;
    if (Math.abs(a[i] - b[i]) > 8) {
      changed += 1;
      bandDiffs[band] += 1;
    }
  }

  const total = width * height;
  return {
    diffPercent: Math.round((changed / total) * 10_000) / 100,
    changedRegions: bandDiffs.map((count, index) => ({
      band: `band-${index + 1}/${bandCount}`,
      diffPercent: bandTotals[index] > 0 ? Math.round((count / bandTotals[index]) * 10_000) / 100 : 0,
    })),
  };
}

export async function writeScreenshotRecord(shot: OpusNativeScreenshot): Promise<void> {
  const dir = path.join(opusNativeWorkDir(), 'screenshots');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${shot.screenshotId}.json`), JSON.stringify(shot, null, 2), 'utf8');
}
