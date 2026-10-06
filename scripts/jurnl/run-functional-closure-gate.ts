#!/usr/bin/env npx tsx
import { execSync } from 'node:child_process';

let exitCode = 0;

try {
  execSync('npm test -- --run tests/jurnlTimezoneEdges.test.ts tests/jurnlUploadGuard.test.ts tests/jurnlErrorTelemetry.test.ts tests/jurnlDeviceServerMerge.test.ts tests/jurnlWave5Production.test.ts tests/jurnl*.test.ts', {
    stdio: 'inherit',
  });
} catch {
  exitCode = 1;
}

try {
  execSync('npx playwright install chromium', { stdio: 'inherit', env: { ...process.env, INSTALL_PLAYWRIGHT: '1' } });
  process.env.JURNL_E2E_BASE_URL = process.env.JURNL_E2E_BASE_URL ?? 'http://127.0.0.1:4174';
  process.env.JURNL_E2E_WEBSERVER_CMD =
    process.env.JURNL_E2E_WEBSERVER_CMD ?? 'npm run build && npm run preview -- --port 4174 --strictPort --host 127.0.0.1';
  execSync('npm run jurnl:e2e:gate', { stdio: 'inherit' });
  execSync('npm run jurnl:e2e:wave5', { stdio: 'inherit' });
  execSync('npx playwright test e2e/jurnl/jurnl-a11y-core.e2e.ts -c playwright.config.ts --project=mobile', { stdio: 'inherit' });
  execSync('npx playwright test e2e/jurnl/jurnl-a11y-core.e2e.ts -c playwright.config.ts --project=tablet', { stdio: 'inherit' });
} catch {
  exitCode = 1;
}

execSync('npx tsx scripts/jurnl/write-functional-closure-artifacts.ts', { stdio: 'inherit' });
process.exit(exitCode);
