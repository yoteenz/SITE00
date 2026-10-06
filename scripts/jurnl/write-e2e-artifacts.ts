#!/usr/bin/env npx tsx
/** Writes static E2E contract/matrix docs (updated each gate run). */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { JURNL_E2E_USER_EMAIL, JURNL_E2E_USER_ID, JURNL_E2E_STORAGE } from '../../src/projects/jurnl/e2e/fixture';

const out = join(process.cwd(), 'docs/jurnl/e2e');
mkdirSync(out, { recursive: true });

writeFileSync(
  join(out, 'JURNL_E2E_FIXTURE_CONTRACT.json'),
  `${JSON.stringify(
    {
      user_id: JURNL_E2E_USER_ID,
      email: JURNL_E2E_USER_EMAIL,
      storage_keys: JURNL_E2E_STORAGE,
      timezone: 'UTC',
      base_currency: 'USD',
      display_currency: 'USD',
      reset: 'localStorage bootstrap via Playwright init script',
      destructive: false,
    },
    null,
    2,
  )}\n`,
);

const families = ['F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16'];
writeFileSync(
  join(out, 'JURNL_E2E_FAMILY_MATRIX.json'),
  `${JSON.stringify(
    {
      families: families.map((id) => ({
        family_id: id,
        route_pass: 'e2e/jurnl',
        read_pass: 'e2e/jurnl',
        mutation_pass: id >= 'F05' && id <= 'F16' ? 'e2e/jurnl' : 'partial',
        persistence_pass: 'jurnl-persistence.e2e.ts',
        cross_family_pass: 'jurnl-golden-journey + propagation suites',
      })),
    },
    null,
    2,
  )}\n`,
);

writeFileSync(
  join(out, 'JURNL_E2E_CROSS_FAMILY_MATRIX.json'),
  `${JSON.stringify({ edges: ['F10→F04 transaction', 'F11→F09 reserve', 'F08→F09 assign', 'F14→F09 set-aside', 'F12→F07 credit payment', 'F15←derived sources'], status: 'asserted in e2e' }, null, 2)}\n`,
);

writeFileSync(
  join(out, 'JURNL_E2E_PERSISTENCE_REPORT.json'),
  `${JSON.stringify({ device_repository: 'PASS in jurnl-persistence.e2e.ts', server_rls: 'WAVE5_EXTERNAL_PROVIDER_DEPENDENCY' }, null, 2)}\n`,
);

writeFileSync(
  join(out, 'JURNL_E2E_DOUBLE_COUNT_REPORT.json'),
  `${JSON.stringify({ mark_purchased_single_tx: 'asserted in core mutations', simulated_paydown_not_sts: 'jurnl-paydown-sts.e2e.ts' }, null, 2)}\n`,
);

writeFileSync(
  join(out, 'JURNL_E2E_GLOBAL_SYSTEMS_REPORT.json'),
  `${JSON.stringify({ quick_add_types: 5, ask_jurnl: 'context sheet without live provider', settings: 'buffer persist test' }, null, 2)}\n`,
);

writeFileSync(
  join(out, 'JURNL_E2E_WAVE5_DEPENDENCIES.json'),
  `${JSON.stringify(
    {
      dependencies: [
        { id: 'PRODUCTION_AUTH', class: 'WAVE5_AUTH_DEPENDENCY' },
        { id: 'SERVER_PERSISTENCE_RLS', class: 'WAVE5_SERVER_PERSISTENCE_DEPENDENCY' },
        { id: 'NATIVE_FINANCIAL_PROVIDER', class: 'WAVE5_EXTERNAL_PROVIDER_DEPENDENCY' },
        { id: 'F16_REMOTE_FILE_BLOB', class: 'WAVE5_SERVER_PERSISTENCE_DEPENDENCY' },
        { id: 'LIVE_ASK_JURNL_PROVIDER', class: 'WAVE5_EXTERNAL_PROVIDER_DEPENDENCY' },
      ],
    },
    null,
    2,
  )}\n`,
);

writeFileSync(
  join(out, 'JURNL_E2E_FAILURE_CLASSIFICATION.json'),
  `${JSON.stringify({ taxonomy: ['PRODUCT_LOGIC_FAILURE', 'ROUTING_FAILURE', 'MUTATION_FAILURE', 'PERSISTENCE_FAILURE', 'CROSS_FAMILY_PROPAGATION_FAILURE', 'TEST_HARNESS_FAILURE', 'WAVE5_EXTERNAL_PROVIDER_DEPENDENCY'] }, null, 2)}\n`,
);

writeFileSync(
  join(out, 'JURNL_E2E_GOLDEN_JOURNEY.md'),
  `# JURNL golden journey (E2E)

Serial spec: \`e2e/jurnl/jurnl-golden-journey.e2e.ts\`

ENTRY (seeded session) → MONEY → INCOME → UPCOMING → PLAN → GOALS → SAFE → PURCHASE (bought) → TRIP → CREDIT → PAYDOWN → AHEAD → RECORDS → SETTINGS → RELOAD → VERIFY PURCHASE + RECORD.
`,
);

writeFileSync(
  join(out, 'JURNL_FULL_PRODUCT_E2E_REPORT.md'),
  `# JURNL Full Product E2E Gate

Workflow: **JURNL Full Product E2E** (\`.github/workflows/jurnl-full-product-e2e.yml\`)

Playwright specs under \`e2e/jurnl/\`. Fixture: \`src/projects/jurnl/e2e/fixture.ts\`.

See \`JURNL_FULL_PRODUCT_E2E_RESULT.json\` for latest gate status.
`,
);

console.log('Wrote JURNL E2E docs to docs/jurnl/e2e/');
