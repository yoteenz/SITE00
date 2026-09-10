/**
 * P0.VR.8R3R5 — Chromium executable resolution for Railway / Playwright.
 */

import { accessSync, constants, existsSync } from 'node:fs';

export type ChromiumExecutableResolution = {
  executablePath: string | null;
  source: 'playwright-bundled' | 'playwright-env' | 'system' | 'none';
  chromiumRevision: string | null;
  playwrightVersion: string | null;
};

export async function resolveChromiumExecutable(): Promise<ChromiumExecutableResolution> {
  let playwrightVersion: string | null = null;
  let chromiumRevision: string | null = null;

  try {
    const pw = await import('playwright');
    try {
      const pkg = await import('playwright/package.json', { with: { type: 'json' } });
      playwrightVersion = (pkg.default as { version?: string }).version ?? null;
    } catch {
      playwrightVersion = null;
    }
    const executablePath = pw.chromium.executablePath();
    if (executablePath && existsSync(executablePath)) {
      return {
        executablePath,
        source: process.env.PLAYWRIGHT_BROWSERS_PATH ? 'playwright-env' : 'playwright-bundled',
        chromiumRevision: playwrightVersion,
        playwrightVersion,
      };
    }
    chromiumRevision = playwrightVersion;
  } catch {
    // Playwright not installed
  }

  const envPath = process.env.CHROMIUM_PATH?.trim();
  if (envPath && existsSync(envPath)) {
    return {
      executablePath: envPath,
      source: 'system',
      chromiumRevision,
      playwrightVersion,
    };
  }

  const systemCandidates = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'];
  for (const candidate of systemCandidates) {
    if (existsSync(candidate)) {
      return {
        executablePath: candidate,
        source: 'system',
        chromiumRevision,
        playwrightVersion,
      };
    }
  }

  return {
    executablePath: null,
    source: 'none',
    chromiumRevision,
    playwrightVersion,
  };
}

export function validateChromiumExecutable(executablePath: string | null): {
  exists: boolean;
  executable: boolean;
} {
  if (!executablePath || !existsSync(executablePath)) {
    return { exists: false, executable: false };
  }
  try {
    accessSync(executablePath, constants.X_OK);
    return { exists: true, executable: true };
  } catch {
    return { exists: true, executable: false };
  }
}
