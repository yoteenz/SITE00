#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const REPO = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(REPO, 'docs/production/provider-gateway/PROVIDER_CALL_SITE_INVENTORY.json');

const PATTERNS = [
  { id: 'fal_client', re: '@fal-ai/client' },
  { id: 'openai', re: 'from [\'"]openai[\'"]|@anthropic-ai/sdk|anthropic' },
  { id: 'xai', re: 'xai|grok-4|XAI_API' },
];

function rg(pattern) {
  try {
    const out = execSync(`rg -l "${pattern}" --glob '*.ts' --glob '*.tsx' --glob '*.mjs' .`, {
      cwd: REPO,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
    return out.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

const files = new Set();
for (const p of PATTERNS) {
  for (const f of rg(p.re.replace(/"/g, '\\"'))) files.add(f);
}

const approvedGateway = 'shared/site00-production-guardrails/providerGateway/';
const entries = [...files].sort().map((file) => {
  const paid = file.includes('generation') || file.includes('Dispatch') || file.includes('fal');
  const gatewayRequired = paid && !file.includes('test') && !file.startsWith('scripts/');
  let migration_status = 'ALLOWLISTED_TEMPORARY';
  if (file.startsWith(approvedGateway)) migration_status = 'ALREADY_GATEWAYED';
  else if (file.includes('.test.')) migration_status = 'TEST_OR_MOCK';
  else if (file === 'shared/site00-visual-generation/falImageViaProductionGateway.ts') migration_status = 'ALREADY_GATEWAYED';
  return {
    file,
    function: null,
    provider: file.includes('fal') ? 'fal' : file.includes('openai') ? 'openai' : 'mixed',
    model: null,
    project_scope: 'mixed',
    generation_type: paid ? 'IMAGE' : 'NON_GENERATIVE',
    paid: gatewayRequired,
    current_guard: file.includes('precheck') ? 'precheck' : 'direct',
    current_reference_handling: 'varies',
    current_spend_confirmation: 'founderConfirmedSpend_or_none',
    current_ledger: 'fragmented',
    current_result_persistence: 'varies',
    current_error_handling: 'varies',
    gateway_required: gatewayRequired,
    migration_status,
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  repoRoot: REPO,
  callSitesDiscovered: entries.length,
  paidGenerationCallSites: entries.filter((e) => e.paid).length,
  entries,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${OUT} (${entries.length} files)`);
