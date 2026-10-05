import type { TwinV4CanonicalViewport } from './twinV42Types.js';
import { TWIN_V42_PLAYWRIGHT_DEVICE_SCALE } from './constants.js';

export type TwinV4PlaywrightCaptureResult = {
  png: Buffer;
  fontStability: { documentFontsReady: boolean; fallbackFontsDetected: boolean };
  assetStability: { imagesLoaded: number; imagesPending: number; placeholderImages: number };
  browser: string;
  browserVersion: string;
};

export async function captureTwinV4LiveReconstructionScreenshot(input: {
  baseUrl: string;
  projectId: string;
  viewport: TwinV4CanonicalViewport;
  queryActualHash?: string;
  localStorageSeed?: Record<string, string>;
  correctionGeneration?: number;
}): Promise<TwinV4PlaywrightCaptureResult> {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const version = browser.version();
  try {
    const page = await browser.newPage({
      viewport: {
        width: input.viewport.width,
        height: input.viewport.height,
      },
      deviceScaleFactor: input.viewport.deviceScaleFactor,
    });
    if (input.localStorageSeed) {
      await page.addInitScript((seed) => {
        for (const [key, value] of Object.entries(seed as Record<string, string>)) {
          localStorage.setItem(key, value);
        }
      }, input.localStorageSeed);
    }
    const hashQ = input.queryActualHash ? `&actualHash=${encodeURIComponent(input.queryActualHash)}` : '';
    const genQ =
      input.correctionGeneration !== undefined ?
        `&correctionGeneration=${encodeURIComponent(String(input.correctionGeneration))}`
      : '';
    const route = `/projects/${input.projectId}/design/twin-v4?goldenDiffCapture=1&designPreview=1${hashQ}${genQ}`;
    await page.goto(`${input.baseUrl.replace(/\/$/, '')}${route}`, {
      waitUntil: 'networkidle',
      timeout: 120_000,
    });
    const liveSelector = '[data-testid="twin-v4-live-reconstruction"]';
    try {
      await page.waitForSelector(liveSelector, { state: 'attached', timeout: 60_000 });
      await page.waitForFunction(
        () => {
          const el = document.querySelector('[data-testid="twin-v4-live-reconstruction"]');
          return el instanceof HTMLElement && el.offsetWidth > 0 && el.offsetHeight > 0;
        },
        { timeout: 60_000 },
      );
    } catch {
      const attached = await page.locator(liveSelector).count();
      const errText = await page.locator('[data-testid="twin-v4-error"]').textContent().catch(() => null);
      const loading = await page.locator('[data-testid="twin-v4-loading"]').textContent().catch(() => null);
      const pageUrl = page.url();
      const bodySnippet = (await page.locator('body').innerText().catch(() => '')).slice(0, 240);
      const htmlLen = (await page.content().catch(() => '')).length;
      throw new Error(
        `TWIN_V42_PLAYWRIGHT_LIVE_RECONSTRUCTION_MISSING url=${pageUrl} attached=${attached} err=${errText ?? 'none'} loading=${loading ?? 'none'} body=${bodySnippet} htmlLen=${htmlLen}`,
      );
    }
    await page.evaluate(async () => {
      document.documentElement.classList.add('site00-twin-v4-qa-stable');
      await document.fonts.ready;
    });
    await page.waitForTimeout(300);
    const stability = await page.evaluate(() => {
      const imgs = [...document.images];
      const pending = imgs.filter((img) => !img.complete).length;
      const placeholders = imgs.filter((img) => img.src.includes('placeholder')).length;
      const fallbackFonts = getComputedStyle(document.body).fontFamily.includes('serif');
      return {
        documentFontsReady: document.fonts.status === 'loaded',
        fallbackFontsDetected: fallbackFonts,
        imagesLoaded: imgs.length - pending,
        imagesPending: pending,
        placeholderImages: placeholders,
      };
    });
    const png = await page.screenshot({ type: 'png', fullPage: false });
    return {
      png: Buffer.from(png),
      fontStability: {
        documentFontsReady: stability.documentFontsReady,
        fallbackFontsDetected: stability.fallbackFontsDetected,
      },
      assetStability: {
        imagesLoaded: stability.imagesLoaded,
        imagesPending: stability.imagesPending,
        placeholderImages: stability.placeholderImages,
      },
      browser: 'chromium',
      browserVersion: version,
    };
  } finally {
    await browser.close();
  }
}

export function twinV4PlaywrightDeviceScale(): number {
  return TWIN_V42_PLAYWRIGHT_DEVICE_SCALE;
}
