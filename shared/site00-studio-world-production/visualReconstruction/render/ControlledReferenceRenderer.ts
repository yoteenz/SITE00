/**
 * Playwright controlled reference renderer.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { RenderedReferenceSnapshot } from '../types.js';
import type { RenderedDomMeasurement, RenderedDomMeasurementMap } from '../p0vr1d1/types.js';
import { loadVisualCaptureAuthContext } from '../../../site00-visual-reference/captureAuthContext.js';

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
  /** Wait for this selector before screenshot (surface identity) */
  waitForSelector?: string | null;
};

export type ControlledRenderResult = RenderedReferenceSnapshot & {
  domMeasurement: RenderedDomMeasurementMap | null;
  finalUrl: string;
};

function resolveStorageStatePath(input: ControlledRenderInput): string | undefined {
  if (input.storageStatePath) return input.storageStatePath;
  const auth = loadVisualCaptureAuthContext({ route: input.route });
  if (!auth?.storageState) return undefined;
  const tempPath = join(tmpdir(), `site00-vr-storage-${Date.now()}.json`);
  writeFileSync(tempPath, JSON.stringify(auth.storageState));
  return tempPath;
}

export async function renderControlledReference(input: ControlledRenderInput): Promise<ControlledRenderResult> {
  mkdirSync(input.outputDir, { recursive: true });
  const renderId = `render-${input.reconstructionIteration}-${Date.now()}`;
  const screenshotPath = join(input.outputDir, `${renderId}.png`);
  const storageStatePath = resolveStorageStatePath(input);

  const playwright = await importPlaywright();
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: input.viewport.width, height: input.viewport.height },
    deviceScaleFactor: input.viewport.deviceScaleFactor,
    storageState: storageStatePath,
  });

  const previewMode = input.previewDeviceMode ?? 'desktop';
  const routePath = input.route.split('?')[0] ?? input.route;
  const routeRequiresAuth =
    routePath.startsWith('/projects') || routePath.startsWith('/control') || routePath === '/account';
  await context.addInitScript(({ mode, needsAuth }: { mode: string; needsAuth: boolean }) => {
    sessionStorage.setItem('site00-immersive-complete', '1');
    sessionStorage.setItem('site00-assts-immersive-complete', '1');
    sessionStorage.setItem('site00_preview_device_mode', mode);
    sessionStorage.setItem('site00_ctrl_room_restore_v1', '1');
    if (needsAuth) {
      const currentUser = JSON.stringify({
        email: 'vr-render@site00.dev',
        firstName: 'VR',
        lastName: 'Render',
        id: 'vr-render-user',
      });
      localStorage.setItem('isSignedIn', 'true');
      localStorage.setItem('currentUser', currentUser);
      localStorage.setItem('baw_auth_backup', JSON.stringify({ isSignedIn: true, currentUser }));
    }
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
  }, { mode: previewMode, needsAuth: routeRequiresAuth });

  const page = await context.newPage();
  const search = input.routeSearch ?? (previewMode === 'mobile' ? '?site00MobileLayout=1' : '');
  const url = `${input.baseUrl}${input.route}${search.startsWith('?') ? search : search ? `?${search}` : ''}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForLoadState('domcontentloaded');
  const waitSelector =
    input.waitForSelector ??
    (input.route.includes('/projects/ndxbook') ? '[data-vr-region="ndx.header"]' : input.selector ?? null);
  if (waitSelector) {
    await page.locator(waitSelector).first().waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(1500);

  const finalUrl = page.url();
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
    finalUrl,
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
