/**
 * P0.VR.8R3R5 — Railway-safe Chromium launch configuration.
 */

export const BROWSER_LAUNCH_TIMEOUT_MS = 30_000;
export const BROWSER_NAVIGATION_TIMEOUT_MS = 20_000;
export const BROWSER_SCREENSHOT_TIMEOUT_MS = 15_000;
export const BROWSER_CLOSE_TIMEOUT_MS = 10_000;

export function getRailwayChromiumLaunchArgs(): string[] {
  const args = ['--no-sandbox', '--disable-setuid-sandbox'];
  if (process.env.RAILWAY_ENVIRONMENT || process.env.DISABLE_DEV_SHM === '1') {
    args.push('--disable-dev-shm-usage');
  }
  return args;
}

export function getChromiumLaunchOptions(): {
  headless: boolean;
  timeout: number;
  args: string[];
} {
  return {
    headless: true,
    timeout: BROWSER_LAUNCH_TIMEOUT_MS,
    args: getRailwayChromiumLaunchArgs(),
  };
}
