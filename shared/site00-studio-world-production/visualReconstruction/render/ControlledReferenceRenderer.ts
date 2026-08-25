/**
 * Playwright controlled reference renderer.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RenderedReferenceSnapshot } from '../types.js';
import type { RenderedDomMeasurement, RenderedDomMeasurementMap } from '../p0vr1d1/types.js';

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
  /** Force mobile or desktop founder workspace presentation */
  previewDeviceMode?: 'mobile' | 'desktop';
  /** Append query string (e.g. ?site00MobileLayout=1) */
  routeSearch?: string;
  /** Capture DOM measurements for VR regions after render */
  captureDomMeasurements?: boolean;
  domRegionSelector?: string;
};

export type ControlledRenderResult = RenderedReferenceSnapshot & {
  domMeasurement: RenderedDomMeasurementMap | null;
};

export async function renderControlledReference(input: ControlledRenderInput): Promise<ControlledRenderResult> {
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

  const previewMode = input.previewDeviceMode ?? 'desktop';
  await context.addInitScript((mode: string) => {
    sessionStorage.setItem('site00-immersive-complete', '1');
    sessionStorage.setItem('site00-assts-immersive-complete', '1');
    sessionStorage.setItem('site00_preview_device_mode', mode);
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
  }, previewMode);

  const page = await context.newPage();
  const search = input.routeSearch ?? (previewMode === 'mobile' ? '?site00MobileLayout=1' : '');
  const url = `${input.baseUrl}${input.route}${search.startsWith('?') ? search : search ? `?${search}` : ''}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(1500);

  const regionSelector = input.domRegionSelector ?? '[data-vr-region]';
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

  let domMeasurement: RenderedDomMeasurementMap | null = null;
  if (input.captureDomMeasurements) {
    const measurements = await page.evaluate((sel: string) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      return nodes.map((node) => {
        const el = node as HTMLElement;
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        return {
          regionId: el.dataset.vrRegion ?? el.dataset.visualReconstruction ?? 'unknown',
          actualX: rect.x,
          actualY: rect.y,
          actualWidth: rect.width,
          actualHeight: rect.height,
          computedPadding: styles.padding,
          computedMargin: styles.margin,
          computedGap: styles.gap,
          computedFontSize: styles.fontSize,
          computedLineHeight: styles.lineHeight,
          computedPosition: styles.position,
          computedDisplay: styles.display,
          computedGrid: styles.gridTemplateColumns !== 'none' ? styles.gridTemplateColumns : null,
          computedFlex: styles.flexDirection !== 'row' ? styles.flexDirection : styles.flexDirection,
          computedZIndex: styles.zIndex,
        };
      });
    }, regionSelector);

    domMeasurement = {
      mapId: renderId,
      route: input.route,
      renderAssetId: renderId,
      measurements: measurements as RenderedDomMeasurement[],
      capturedAt: new Date().toISOString(),
    };
    writeFileSync(join(input.outputDir, `${renderId}-dom.json`), JSON.stringify(domMeasurement, null, 2));
  }

  await browser.close();

  const snapshot: ControlledRenderResult = {
    renderId,
    route: input.route,
    viewport: input.viewport,
    timestamp: new Date().toISOString(),
    commit: input.commit ?? null,
    screenshotPath,
    reconstructionIteration: input.reconstructionIteration,
    blueprintVersion: input.blueprintVersion,
    domMeasurement,
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
