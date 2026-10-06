#!/usr/bin/env npx tsx
/**
 * Runs JURNL full-product Playwright gate and writes docs/jurnl/e2e/JURNL_FULL_PRODUCT_E2E_RESULT.json
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const reportJson = join(root, 'test-results/jurnl-e2e-report.json');
const outDir = join(root, 'docs/jurnl/e2e');

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
    execSync('npx playwright test -c playwright.config.ts', { stdio: 'inherit', env: process.env });
  } catch {
    exitCode = 1;
  }

  let stats = { passed: 0, failed: 0, skipped: 0, tests: [] as unknown[] };
  if (existsSync(reportJson)) {
    try {
      const parsed = JSON.parse(readFileSync(reportJson, 'utf8')) as { suites?: unknown[]; stats?: typeof stats };
      if (parsed.stats) stats = { ...stats, ...parsed.stats, tests: parsed.suites ?? [] };
    } catch {
      /* ignore */
    }
  }

  const gateStatus =
    exitCode === 0 ? 'PASS'
    : stats.failed > 0 ? 'FAIL'
    : 'AWAITING_GITHUB_ACTIONS_LIVE_PROOF';

  const result = {
    sprint: 'P0.JURNL.FULL-PRODUCT-E2E-GATE1',
    generated_at: new Date().toISOString(),
    gate_status: gateStatus,
    playwright_exit_code: exitCode,
    stats,
    workflow_name: 'JURNL Full Product E2E',
    families_included: 16,
    note: 'Local or CI run — GitHub Actions run id appended by workflow when available.',
  };

  writeFileSync(join(outDir, 'JURNL_FULL_PRODUCT_E2E_RESULT.json'), `${JSON.stringify(result, null, 2)}\n`);

  execSync('npx tsx scripts/jurnl/write-e2e-artifacts.ts', { stdio: 'inherit' });

  process.exit(exitCode);
}

main();
