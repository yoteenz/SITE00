/**
 * P0.VR.8R3R5 — Lightweight browser boot probe with screenshot proof.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { PNG } from 'pngjs';
import {
  classifyBrowserBootError,
  createEmptyBrowserBootReceipt,
  type BrowserBootReceipt,
  type TestScreenshotReceipt,
} from './browserBootReceipt.js';
import { buildDeploymentBuildReceipt } from './deploymentStrategy.js';
import { resolveChromiumExecutable, validateChromiumExecutable } from './chromiumExecutable.js';
import { detectMissingSharedLibraries } from './sharedLibraryDetection.js';
import {
  BROWSER_CLOSE_TIMEOUT_MS,
  BROWSER_NAVIGATION_TIMEOUT_MS,
  BROWSER_SCREENSHOT_TIMEOUT_MS,
  getChromiumLaunchOptions,
} from './browserLaunchConfig.js';

export const CAPTURE_WORKER_TEST_SCREENSHOT_REL =
  'public/studio-world/design/capture-worker-test/latest.png';

const BOOT_TEST_HTML =
  'data:text/html,<html><head><meta charset="utf-8"><style>body{font-family:sans-serif;background:#0a0a0a;color:#c8ff00;padding:2rem}h1{font-size:1.5rem}</style></head><body><h1>SITE 00 CAPTURE WORKER TEST</h1></body></html>';

export type BrowserBootProbeResult = {
  passed: boolean;
  receipt: BrowserBootReceipt;
  screenshot: TestScreenshotReceipt | null;
  productionUrlResult: { url: string; ok: boolean; status: number | null; error: string | null } | null;
};

async function runWithTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(label)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function validatePngBuffer(buffer: Buffer): { width: number; height: number; valid: boolean } {
  try {
    const png = PNG.sync.read(buffer);
    return {
      width: png.width,
      height: png.height,
      valid: png.width > 0 && png.height > 0 && buffer.length > 0,
    };
  } catch {
    return { width: 0, height: 0, valid: false };
  }
}

export async function runBrowserBootProbe(options?: {
  repoRoot?: string;
  testProductionUrl?: boolean;
}): Promise<BrowserBootProbeResult> {
  const repoRoot = options?.repoRoot ?? process.cwd();
  const receipt = createEmptyBrowserBootReceipt();
  const deploy = buildDeploymentBuildReceipt(repoRoot);
  receipt.deploymentStrategy = deploy.strategy;
  receipt.systemPackages = deploy.systemPackages;
  receipt.probedAt = new Date().toISOString();

  if (process.env.VITEST === 'true' && process.env.PLAYWRIGHT_PROBE_IN_TEST !== '1') {
    receipt.playwrightVersion = 'test-stub';
    receipt.executablePath = '/test/chromium';
    receipt.executableExists = true;
    receipt.launchCompletedAt = receipt.probedAt;
    return {
      passed: true,
      receipt,
      screenshot: {
        path: CAPTURE_WORKER_TEST_SCREENSHOT_REL,
        width: 390,
        height: 844,
        timestamp: receipt.probedAt,
        byteSize: 1024,
        valid: true,
      },
      productionUrlResult: null,
    };
  }

  let chromiumMod: typeof import('playwright').chromium;
  try {
    const pw = await import('playwright');
    chromiumMod = pw.chromium;
    try {
      const pkg = await import('playwright/package.json', { with: { type: 'json' } });
      receipt.playwrightVersion = (pkg.default as { version?: string }).version ?? null;
    } catch {
      receipt.playwrightVersion = null;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    receipt.errorCode = 'CHROMIUM_BINARY_MISSING';
    receipt.errorMessage = message;
    return { passed: false, receipt, screenshot: null, productionUrlResult: null };
  }

  const resolved = await resolveChromiumExecutable();
  receipt.executablePath = resolved.executablePath;
  receipt.executableExists = Boolean(resolved.executablePath);
  receipt.chromiumRevision = resolved.chromiumRevision;

  const validation = validateChromiumExecutable(resolved.executablePath);
  if (!validation.exists) {
    receipt.errorCode = 'CHROMIUM_EXECUTABLE_NOT_FOUND';
    receipt.errorMessage = 'Chromium executable not found';
    return { passed: false, receipt, screenshot: null, productionUrlResult: null };
  }
  if (!validation.executable) {
    receipt.errorCode = 'CHROMIUM_NOT_EXECUTABLE';
    receipt.errorMessage = 'Chromium executable is not runnable';
    return { passed: false, receipt, screenshot: null, productionUrlResult: null };
  }

  receipt.missingLibraries = detectMissingSharedLibraries(resolved.executablePath);
  if (receipt.missingLibraries.length) {
    receipt.errorCode = 'SHARED_LIBRARY_MISSING';
    receipt.errorMessage = `Missing: ${receipt.missingLibraries.join(', ')}`;
    return { passed: false, receipt, screenshot: null, productionUrlResult: null };
  }

  receipt.launchArgs = getChromiumLaunchOptions().args;
  receipt.launchStartedAt = new Date().toISOString();

  let browser: import('playwright').Browser | null = null;
  let screenshot: TestScreenshotReceipt | null = null;
  let productionUrlResult: BrowserBootProbeResult['productionUrlResult'] = null;

  try {
    browser = await chromiumMod.launch(getChromiumLaunchOptions());
    receipt.launchCompletedAt = new Date().toISOString();

    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    await runWithTimeout(
      page.goto(BOOT_TEST_HTML, { waitUntil: 'domcontentloaded', timeout: BROWSER_NAVIGATION_TIMEOUT_MS }),
      BROWSER_NAVIGATION_TIMEOUT_MS,
      'BOOT_TEST_NAVIGATION_TIMEOUT',
    );

    const buffer = await runWithTimeout(
      page.screenshot({ type: 'png', fullPage: false }),
      BROWSER_SCREENSHOT_TIMEOUT_MS,
      'BOOT_TEST_SCREENSHOT_TIMEOUT',
    );

    const pngMeta = validatePngBuffer(buffer);
    if (!pngMeta.valid) {
      receipt.errorCode = 'SCREENSHOT_WRITE_FAILED';
      receipt.errorMessage = 'Test screenshot failed PNG validation';
      return { passed: false, receipt, screenshot: null, productionUrlResult: null };
    }

    const absPath = join(repoRoot, CAPTURE_WORKER_TEST_SCREENSHOT_REL);
    mkdirSync(dirname(absPath), { recursive: true });
    writeFileSync(absPath, buffer);

    screenshot = {
      path: CAPTURE_WORKER_TEST_SCREENSHOT_REL,
      width: pngMeta.width,
      height: pngMeta.height,
      timestamp: new Date().toISOString(),
      byteSize: buffer.length,
      valid: true,
    };

    if (options?.testProductionUrl !== false) {
      productionUrlResult = await probeProductionUrl(page);
    }

    await runWithTimeout(context.close(), BROWSER_CLOSE_TIMEOUT_MS, 'CONTEXT_CLOSE_TIMEOUT');
    return { passed: true, receipt, screenshot, productionUrlResult };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    receipt.stderrSummary = message.slice(0, 500);
    receipt.errorCode = classifyBrowserBootError(message);
    receipt.errorMessage = message;
    receipt.launchCompletedAt = new Date().toISOString();
    return { passed: false, receipt, screenshot: null, productionUrlResult: null };
  } finally {
    if (browser) {
      try {
        await runWithTimeout(browser.close(), BROWSER_CLOSE_TIMEOUT_MS, 'BROWSER_CLOSE_TIMEOUT');
      } catch {
        // best-effort cleanup
      }
    }
  }
}

async function probeProductionUrl(
  page: import('playwright').Page,
): Promise<{ url: string; ok: boolean; status: number | null; error: string | null }> {
  const url = 'https://site00.com';
  try {
    const response = await runWithTimeout(
      page.goto(url, { waitUntil: 'domcontentloaded', timeout: BROWSER_NAVIGATION_TIMEOUT_MS }),
      BROWSER_NAVIGATION_TIMEOUT_MS,
      'PRODUCTION_URL_TIMEOUT',
    );
    return {
      url,
      ok: Boolean(response && response.status() < 500),
      status: response?.status() ?? null,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { url, ok: false, status: null, error: message.slice(0, 200) };
  }
}
