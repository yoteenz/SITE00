/**
 * Install Playwright Chromium on Railway API deploys (skipped locally unless forced).
 * Browsers persist under PLAYWRIGHT_BROWSERS_PATH (see nixpacks.toml).
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

if (process.env.PLAYWRIGHT_SKIP_INSTALL === '1') {
  process.exit(0);
}

const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID);
const forced = process.env.INSTALL_PLAYWRIGHT === '1';
const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH || join(process.cwd(), '.cache', 'ms-playwright');

if (!onRailway && !forced) {
  console.log('[playwright] skip install (set INSTALL_PLAYWRIGHT=1 to force)');
  process.exit(0);
}

if (existsSync(browsersPath)) {
  try {
    execSync('npx playwright install chromium', {
      stdio: 'inherit',
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browsersPath },
    });
    console.log('[playwright] chromium verified at', browsersPath);
    process.exit(0);
  } catch {
    console.log('[playwright] reinstalling chromium…');
  }
}

console.log('[playwright] installing chromium for visual reference capture…');
execSync('npx playwright install chromium', {
  stdio: 'inherit',
  env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browsersPath },
});
