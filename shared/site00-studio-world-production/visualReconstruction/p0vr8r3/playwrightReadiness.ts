/**
 * P0.VR.8R3R4 / P0.VR.8R3R5 — Playwright / Chromium readiness probe.
 */

import { checkBrowserReadiness } from './browserReadiness.js';
import type { BrowserBootErrorCode } from './browserBootReceipt.js';

export type PlaywrightReadinessErrorCode =
  | 'PLAYWRIGHT_NOT_INSTALLED'
  | 'CHROMIUM_MISSING'
  | 'BROWSER_LAUNCH_FAILED'
  | 'SYSTEM_DEPENDENCY_MISSING'
  | BrowserBootErrorCode;

export type PlaywrightReadinessResult = {
  playwrightReady: boolean;
  browserReady: boolean;
  errorCode: PlaywrightReadinessErrorCode | null;
  errorMessage: string | null;
  browserBootReceipt?: import('./browserBootReceipt.js').BrowserBootReceipt;
};

function mapErrorCode(code: string | null): PlaywrightReadinessErrorCode | null {
  if (!code) return null;
  if (code === 'CHROMIUM_BINARY_MISSING' || code === 'CHROMIUM_EXECUTABLE_NOT_FOUND') return 'CHROMIUM_MISSING';
  if (code === 'SHARED_LIBRARY_MISSING') return 'SYSTEM_DEPENDENCY_MISSING';
  if (code === 'BROWSER_LAUNCH_FAILED') return 'BROWSER_LAUNCH_FAILED';
  return code as PlaywrightReadinessErrorCode;
}

export async function probePlaywrightReadiness(): Promise<PlaywrightReadinessResult> {
  const state = await checkBrowserReadiness();
  if (!state.playwrightReady) {
    return {
      playwrightReady: false,
      browserReady: false,
      errorCode: 'PLAYWRIGHT_NOT_INSTALLED',
      errorMessage: state.receipt.errorMessage,
      browserBootReceipt: state.receipt,
    };
  }

  return {
    playwrightReady: true,
    browserReady: state.browserLaunchReady,
    errorCode: state.browserLaunchReady ? null : mapErrorCode(state.receipt.errorCode),
    errorMessage: state.browserLaunchReady ? null : state.receipt.errorMessage,
    browserBootReceipt: state.receipt,
  };
}
