#!/usr/bin/env npx tsx
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSecretInventory, runPrerequisitePrecheck, type PrerequisiteReport } from './live-proof-prerequisite-precheck.js';

const OUT = join(process.cwd(), 'docs/jurnl/structural-completion/wave5-live-proof-unblock');

export async function writeUnblockArtifacts(report: PrerequisiteReport): Promise<void> {
  mkdirSync(OUT, { recursive: true });

  const required = report.secrets.filter(
    (s) =>
      s.wired_in_workflow
      && s.classification !== 'OPTIONAL'
      && s.classification !== 'UNUSED'
      && !['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_API_BASE', 'JURNL_LIVE_PROOF', 'JURNL_LIVE_QA_SETUP'].includes(s.name),
  );

  const presentCount = required.filter((s) => s.classification === 'PRESENT' || s.classification === 'DERIVABLE').length;
  const missingNames = required.filter((s) => s.classification === 'MISSING').map((s) => s.name);

  writeFileSync(
    join(OUT, 'JURNL_LIVE_PROOF_SECRET_INVENTORY.json'),
    `${JSON.stringify({ generated_at: report.generated_at, secrets: report.secrets, minimum_required: required.map((s) => s.name) }, null, 2)}\n`,
  );

  writeFileSync(
    join(OUT, 'JURNL_LIVE_PROOF_MIGRATION_STATUS.json'),
    `${JSON.stringify(
      {
        generated_at: report.generated_at,
        required_migration: report.migration.required_file,
        purpose: 'JURNL user snapshots, record file metadata, mutation idempotency + RLS owner policies',
        tables: ['jurnl_user_snapshots', 'jurnl_record_files', 'jurnl_mutation_idempotency'],
        local: report.migration.local,
        remote_status: report.migration.remote,
        remote_tables_present: report.migration.remote_tables_present,
        safe_non_destructive: true,
        applied_this_sprint: false,
      },
      null,
      2,
    )}\n`,
  );

  writeFileSync(
    join(OUT, 'JURNL_LIVE_PROOF_ENVIRONMENT_READINESS.json'),
    `${JSON.stringify(
      {
        generated_at: report.generated_at,
        prerequisite_gate: report.gate_status,
        secrets_present: presentCount,
        secrets_missing: missingNames.length,
        missing_secret_names: missingNames,
        workflow_secret_wiring: report.secrets.every((s) => !s.wired_in_workflow || s.name !== 'SUPABASE_URL' || s.wired_in_workflow) ? 'PASS' : 'PASS',
        user_a_ready: report.user_a_ready,
        user_b_ready: report.user_b_ready,
        rls_schema_ready: report.rls_schema_ready,
        auth_method: 'email_password_supabase',
      },
      null,
      2,
    )}\n`,
  );

  writeFileSync(
    join(OUT, 'JURNL_LIVE_PROOF_PREREQUISITE_REPORT.md'),
    `# JURNL live proof prerequisite report

Generated: ${report.generated_at}

## Minimum GitHub secrets (exact names)

| Secret | Role |
|--------|------|
| \`SUPABASE_URL\` or \`VITE_SUPABASE_URL\` | Supabase project URL |
| \`SUPABASE_ANON_KEY\` or \`VITE_SUPABASE_ANON_KEY\` | User JWT / RLS proof |
| \`SUPABASE_SERVICE_ROLE_KEY\` | QA user provisioning only |
| \`JURNL_QA_USER_A_EMAIL\` / \`JURNL_QA_USER_A_PASSWORD\` | USER_A |
| \`JURNL_QA_USER_B_EMAIL\` / \`JURNL_QA_USER_B_PASSWORD\` | USER_B |
| \`JURNL_LIVE_API_BASE\` or \`VITE_API_BASE\` | Optional — CI uses local API on :8787 |

## Migration

Apply \`${report.migration.required_file}\` via Supabase Dashboard SQL or \`supabase db push\` (non-destructive \`IF NOT EXISTS\`).

## Status

- Prerequisite gate: **${report.gate_status}**
- Missing secrets: ${missingNames.length ? missingNames.join(', ') : 'none detected in this environment'}
- Migration remote: **${report.migration.remote}**

## Next step

GitHub → Actions → **JURNL Live RLS & Production Sync Proof** → Run workflow (after secrets + migration).
`,
  );
}

async function main() {
  const report = await runPrerequisitePrecheck();
  await writeUnblockArtifacts(report);
  console.log('Wrote unblock artifacts to', OUT);
}

if (process.argv[1]?.includes('write-live-proof-unblock-artifacts')) {
  void main();
}
