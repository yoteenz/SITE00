#!/usr/bin/env node
/**
 * Isolated staging Supabase durability check (service role via env — never log secrets).
 * Creates one synthetic artifact, updates phone, reloads from DB.
 */
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const outDir = '/opt/cursor/artifacts/form-control-staging-b';
mkdirSync(outDir, { recursive: true });

const env = {
  ...process.env,
  SITE00_DF_PERSISTENCE_TEST: '1',
  SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE: '1',
};

const cmd =
  'npx vitest run tests/digitalFoundationPersistence.test.ts --reporter=json --outputFile=/opt/cursor/artifacts/form-control-staging-b/vitest-persistence.json';

let exitCode = 0;
let stdout = '';
try {
  stdout = execSync(cmd, { cwd: process.cwd(), env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
} catch (e) {
  exitCode = e.status ?? 1;
  stdout = (e.stdout ?? '') + (e.stderr ?? '');
}

const report = {
  checkedAt: new Date().toISOString(),
  command: cmd,
  exitCode,
  stdoutTail: stdout.slice(-2000),
};
writeFileSync(`${outDir}/live-supabase-acceptance.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(exitCode === 0 ? 0 : 1);
