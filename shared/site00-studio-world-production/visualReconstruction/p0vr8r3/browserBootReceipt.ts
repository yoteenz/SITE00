/**
 * P0.VR.8R3R5 — Browser boot receipt (internal diagnostics, no secrets).
 */

export type BrowserBootErrorCode =
  | 'CHROMIUM_BINARY_MISSING'
  | 'CHROMIUM_EXECUTABLE_NOT_FOUND'
  | 'CHROMIUM_NOT_EXECUTABLE'
  | 'SHARED_LIBRARY_MISSING'
  | 'BROWSER_LAUNCH_FAILED'
  | 'SANDBOX_FAILURE'
  | 'SHM_FAILURE'
  | 'FONT_RUNTIME_FAILURE'
  | 'CERTIFICATE_RUNTIME_FAILURE'
  | 'BROWSER_CRASH_ON_START'
  | 'SCREENSHOT_WRITE_FAILED'
  | 'UNKNOWN_BROWSER_RUNTIME_ERROR';

export type BrowserBootReceipt = {
  playwrightVersion: string | null;
  chromiumRevision: string | null;
  executablePath: string | null;
  executableExists: boolean;
  launchStartedAt: string | null;
  launchCompletedAt: string | null;
  exitCode: number | null;
  stderrSummary: string | null;
  missingLibraries: string[];
  errorCode: BrowserBootErrorCode | null;
  errorMessage: string | null;
  launchArgs: string[];
  deploymentStrategy: string | null;
  systemPackages: string[];
  probedAt: string;
};

export type BrowserReadinessState = {
  playwrightReady: boolean;
  chromiumInstalled: boolean;
  executableFound: boolean;
  systemDependenciesReady: boolean;
  browserLaunchReady: boolean;
  networkReady: boolean;
  screenshotReady: boolean;
  receipt: BrowserBootReceipt;
};

export type TestScreenshotReceipt = {
  path: string;
  width: number;
  height: number;
  timestamp: string;
  byteSize: number;
  valid: boolean;
};

export function createEmptyBrowserBootReceipt(): BrowserBootReceipt {
  return {
    playwrightVersion: null,
    chromiumRevision: null,
    executablePath: null,
    executableExists: false,
    launchStartedAt: null,
    launchCompletedAt: null,
    exitCode: null,
    stderrSummary: null,
    missingLibraries: [],
    errorCode: null,
    errorMessage: null,
    launchArgs: [],
    deploymentStrategy: null,
    systemPackages: [],
    probedAt: new Date().toISOString(),
  };
}

export function classifyBrowserBootError(message: string): BrowserBootErrorCode {
  const lower = message.toLowerCase();
  if (/executable doesn't exist|browser.*not found|chromium.*missing/i.test(message)) {
    return 'CHROMIUM_EXECUTABLE_NOT_FOUND';
  }
  if (/not executable|eacces|permission denied/i.test(message)) {
    return 'CHROMIUM_NOT_EXECUTABLE';
  }
  if (/shared libraries|ldd|libnss|libgbm|libatk|dependency/i.test(message)) {
    return 'SHARED_LIBRARY_MISSING';
  }
  if (/sandbox|setuid/i.test(lower)) return 'SANDBOX_FAILURE';
  if (/\/dev\/shm|shared memory|shm/i.test(lower)) return 'SHM_FAILURE';
  if (/font|pango|cairo/i.test(lower)) return 'FONT_RUNTIME_FAILURE';
  if (/certificate|cert|tls|ssl/i.test(lower)) return 'CERTIFICATE_RUNTIME_FAILURE';
  if (/crash|sigsegv|killed/i.test(lower)) return 'BROWSER_CRASH_ON_START';
  if (/screenshot|png|write/i.test(lower)) return 'SCREENSHOT_WRITE_FAILED';
  if (/launch/i.test(lower)) return 'BROWSER_LAUNCH_FAILED';
  return 'UNKNOWN_BROWSER_RUNTIME_ERROR';
}

export function founderBrowserFailureMessage(receipt: BrowserBootReceipt): string {
  if (receipt.errorCode === 'SHARED_LIBRARY_MISSING' && receipt.missingLibraries.length) {
    return 'Chromium is installed, but a required system library is missing.';
  }
  if (receipt.errorCode === 'CHROMIUM_EXECUTABLE_NOT_FOUND' || receipt.errorCode === 'CHROMIUM_BINARY_MISSING') {
    return 'Chromium was not found in the deployed runtime image.';
  }
  if (receipt.errorCode === 'SANDBOX_FAILURE') {
    return 'Chromium could not start because container sandbox restrictions blocked launch.';
  }
  if (receipt.errorCode === 'SCREENSHOT_WRITE_FAILED') {
    return 'The browser started, but the test screenshot could not be saved.';
  }
  return 'The worker is online, but the browser could not start.';
}
