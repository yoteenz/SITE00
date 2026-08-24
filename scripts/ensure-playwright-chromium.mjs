/**
 * Install Playwright Chromium on Railway API deploys (skipped locally unless forced).
 */
import { execSync } from 'node:child_process';

if (process.env.PLAYWRIGHT_SKIP_INSTALL === '1') {
  process.exit(0);
}

const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID);
const forced = process.env.INSTALL_PLAYWRIGHT === '1';

if (!onRailway && !forced) {
  console.log('[playwright] skip install (set INSTALL_PLAYWRIGHT=1 to force)');
  process.exit(0);
}

console.log('[playwright] installing chromium for visual reference capture…');
execSync('npx playwright install chromium', { stdio: 'inherit' });
