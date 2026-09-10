/**
 * P0.VR.8R3R4 — Playwright / Chromium readiness probe.
 */

export type PlaywrightReadinessErrorCode =
  | 'PLAYWRIGHT_NOT_INSTALLED'
  | 'CHROMIUM_MISSING'
  | 'BROWSER_LAUNCH_FAILED'
  | 'SYSTEM_DEPENDENCY_MISSING';

export type PlaywrightReadinessResult = {
  playwrightReady: boolean;
  browserReady: boolean;
  errorCode: PlaywrightReadinessErrorCode | null;
  errorMessage: string | null;
};

export async function probePlaywrightReadiness(): Promise<PlaywrightReadinessResult> {
  if (process.env.VITEST === 'true' && process.env.PLAYWRIGHT_PROBE_IN_TEST !== '1') {
    return { playwrightReady: true, browserReady: true, errorCode: null, errorMessage: null };
  }

  try {
    await import('playwright');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      playwrightReady: false,
      browserReady: false,
      errorCode: 'PLAYWRIGHT_NOT_INSTALLED',
      errorMessage: message,
    };
  }

  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true, timeout: 30_000 });
    await browser.close();
    return { playwrightReady: true, browserReady: true, errorCode: null, errorMessage: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    let errorCode: PlaywrightReadinessErrorCode = 'BROWSER_LAUNCH_FAILED';
    if (/executable doesn't exist|browser.*not found|chromium/i.test(message)) {
      errorCode = 'CHROMIUM_MISSING';
    } else if (/shared libraries|libnss|libatk|dependency/i.test(message)) {
      errorCode = 'SYSTEM_DEPENDENCY_MISSING';
    }
    return {
      playwrightReady: true,
      browserReady: false,
      errorCode,
      errorMessage: message,
    };
  }
}
