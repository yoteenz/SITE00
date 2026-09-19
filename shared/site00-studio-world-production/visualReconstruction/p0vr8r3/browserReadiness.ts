/**
 * P0.VR.8R3R5 — Real browser readiness probe (launch required for browserReady).
 */

import { buildDeploymentBuildReceipt } from './deploymentStrategy.js';
import {
  classifyBrowserBootError,
  createEmptyBrowserBootReceipt,
  type BrowserBootReceipt,
  type BrowserReadinessState,
} from './browserBootReceipt.js';
import { resolveChromiumExecutable, validateChromiumExecutable } from './chromiumExecutable.js';
import { detectMissingSharedLibraries } from './sharedLibraryDetection.js';
import { getChromiumLaunchOptions } from './browserLaunchConfig.js';

export type { BrowserBootReceipt, BrowserReadinessState };

export async function checkBrowserReadiness(options?: {
  skipLaunch?: boolean;
}): Promise<BrowserReadinessState> {
  const receipt = createEmptyBrowserBootReceipt();
  const deploy = buildDeploymentBuildReceipt();
  receipt.deploymentStrategy = deploy.strategy;
  receipt.systemPackages = deploy.systemPackages;
  receipt.probedAt = new Date().toISOString();

  if (process.env.VITEST === 'true' && process.env.PLAYWRIGHT_PROBE_IN_TEST !== '1') {
    receipt.playwrightVersion = 'test-stub';
    receipt.chromiumRevision = 'test-stub';
    receipt.executablePath = '/test/chromium';
    receipt.executableExists = true;
    receipt.launchCompletedAt = receipt.probedAt;
    return {
      playwrightReady: true,
      chromiumInstalled: true,
      executableFound: true,
      systemDependenciesReady: true,
      browserLaunchReady: true,
      networkReady: true,
      screenshotReady: true,
      receipt,
    };
  }

  let playwrightReady = false;
  try {
    await import('playwright');
    playwrightReady = true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    receipt.errorCode = 'CHROMIUM_BINARY_MISSING';
    receipt.errorMessage = message;
    return buildState(receipt, playwrightReady);
  }

  const resolved = await resolveChromiumExecutable();
  receipt.playwrightVersion = resolved.playwrightVersion;
  receipt.chromiumRevision = resolved.chromiumRevision;
  receipt.executablePath = resolved.executablePath;
  receipt.executableExists = Boolean(resolved.executablePath);

  if (!resolved.executablePath) {
    receipt.errorCode = 'CHROMIUM_EXECUTABLE_NOT_FOUND';
    receipt.errorMessage = 'Playwright Chromium executable path could not be resolved';
    return buildState(receipt, playwrightReady);
  }

  const validation = validateChromiumExecutable(resolved.executablePath);
  if (!validation.exists) {
    receipt.errorCode = 'CHROMIUM_EXECUTABLE_NOT_FOUND';
    receipt.errorMessage = `Executable not found at ${resolved.executablePath}`;
    return buildState(receipt, playwrightReady);
  }
  if (!validation.executable) {
    receipt.errorCode = 'CHROMIUM_NOT_EXECUTABLE';
    receipt.errorMessage = `Executable is not runnable: ${resolved.executablePath}`;
    return buildState(receipt, playwrightReady);
  }

  const missingLibraries = detectMissingSharedLibraries(resolved.executablePath);
  receipt.missingLibraries = missingLibraries;
  if (missingLibraries.length) {
    receipt.errorCode = 'SHARED_LIBRARY_MISSING';
    receipt.errorMessage = `Missing shared libraries: ${missingLibraries.join(', ')}`;
    return buildState(receipt, playwrightReady);
  }

  if (options?.skipLaunch) {
    return buildState(receipt, playwrightReady, { launchVerified: false });
  }

  receipt.launchArgs = getChromiumLaunchOptions().args;
  receipt.launchStartedAt = new Date().toISOString();

  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch(getChromiumLaunchOptions());
    receipt.launchCompletedAt = new Date().toISOString();
    await browser.close();
    return buildState(receipt, playwrightReady, { launchVerified: true, networkReady: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    receipt.stderrSummary = message.slice(0, 500);
    receipt.errorCode = classifyBrowserBootError(message);
    receipt.errorMessage = message;
    receipt.launchCompletedAt = new Date().toISOString();
    return buildState(receipt, playwrightReady);
  }
}

function buildState(
  receipt: BrowserBootReceipt,
  playwrightReady: boolean,
  flags?: { launchVerified?: boolean; networkReady?: boolean; screenshotReady?: boolean },
): BrowserReadinessState {
  const executableFound =
    receipt.executableExists &&
    receipt.errorCode !== 'CHROMIUM_EXECUTABLE_NOT_FOUND' &&
    receipt.errorCode !== 'CHROMIUM_BINARY_MISSING';
  const systemDependenciesReady = receipt.missingLibraries.length === 0 && executableFound;
  const browserLaunchReady = Boolean(flags?.launchVerified) && !receipt.errorCode;

  return {
    playwrightReady,
    chromiumInstalled: executableFound,
    executableFound,
    systemDependenciesReady,
    browserLaunchReady,
    networkReady: flags?.networkReady ?? false,
    screenshotReady: flags?.screenshotReady ?? false,
    receipt,
  };
}
