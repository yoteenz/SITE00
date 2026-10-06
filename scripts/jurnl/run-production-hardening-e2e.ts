#!/usr/bin/env npx tsx
/**
 * Wave 5 production-hardening Playwright gate + artifact writer.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const reportJson = join(root, 'test-results/jurnl-e2e-report.json');
const outDir = join(root, 'docs/jurnl/structural-completion/wave5');

function main() {
  mkdirSync(join(root, 'test-results'), { recursive: true });
  mkdirSync(outDir, { recursive: true });

  process.env.INSTALL_PLAYWRIGHT = '1';
  process.env.JURNL_E2E_BASE_URL = process.env.JURNL_E2E_BASE_URL ?? 'http://127.0.0.1:4174';
  process.env.JURNL_E2E_WEBSERVER_CMD =
    process.env.JURNL_E2E_WEBSERVER_CMD ?? 'npm run build && npm run preview -- --port 4174 --strictPort --host 127.0.0.1';

  let exitCode = 0;
  try {
    execSync('npx playwright install chromium', { stdio: 'inherit' });
    execSync('npx playwright test e2e/jurnl/jurnl-production-hardening.e2e.ts -c playwright.config.ts', {
      stdio: 'inherit',
      env: process.env,
    });
  } catch {
    exitCode = 1;
  }

  let stats = { passed: 0, failed: 0, skipped: 0 };
  if (existsSync(reportJson)) {
    try {
      const parsed = JSON.parse(readFileSync(reportJson, 'utf8')) as { stats?: typeof stats };
      if (parsed.stats) stats = parsed.stats;
    } catch {
      /* ignore */
    }
  }

  const gateStatus = exitCode === 0 && stats.failed === 0 ? 'PASS' : stats.failed > 0 ? 'FAIL' : 'NOT_RUN';

  const result = {
    sprint: 'P0.JURNL.WAVE5-PRODUCTION-HARDENING',
    generated_at: new Date().toISOString(),
    gate_status: gateStatus,
    playwright_exit_code: exitCode,
    stats,
    workflow_name: 'JURNL Production Hardening E2E',
    live_rls: process.env.JURNL_RLS_LIVE === '1' ? 'ATTEMPTED' : 'SKIPPED_NO_ENV',
  };

  writeFileSync(join(outDir, 'JURNL_PRODUCTION_HARDENING_E2E_RESULT.json'), `${JSON.stringify(result, null, 2)}\n`);
  execSync('npx tsx scripts/jurnl/write-wave5-artifacts.ts', { stdio: 'inherit' });

  process.exit(exitCode);
}

main();
