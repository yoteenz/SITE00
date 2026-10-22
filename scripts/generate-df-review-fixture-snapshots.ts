/**
 * Generates offline review fixture snapshots for `/foundation/review` when preview bootstrap API is unavailable (vite preview / CI dist).
 * Run: npx tsx scripts/generate-df-review-fixture-snapshots.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import {
  createArtifactForLead,
  getClientArtifactPayloadByToken,
  markQuoteCommerciallyReady,
  materializeFixtureScenario,
  getCommercialConfig,
} from '../api/_lib/digitalFoundation/service.js';
import { listCatalogForClient } from '../shared/site00-digital-foundation/quoteEngine.js';
import { completeIntakeWithContactPhone } from '../tests/helpers/dfTestContactPhone.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src/site00/pages/foundation/generated');
const outFile = join(outDir, 'reviewFixtureSnapshots.json');

async function snapshotFixture(id: string) {
  resetDigitalFoundationMemoryStore();
  const { token } = await materializeFixtureScenario(id);
  return { token, payload: getClientArtifactPayloadByToken(token) };
}

async function snapshotIntakeSubmitted() {
  resetDigitalFoundationMemoryStore();
  const a = createArtifactForLead({ business_name: 'Review · Intake submitted' });
  completeIntakeWithContactPhone(a.artifact_id);
  return { token: a.public_token, payload: getClientArtifactPayloadByToken(a.public_token) };
}

async function snapshotSignatureApproval() {
  resetDigitalFoundationMemoryStore();
  const base = await snapshotFixture('J_PAYMENT_SUCCESS');
  const payload = structuredClone(base.payload) as typeof base.payload;
  payload.client_actions = [
    {
      request_id: 'review-signature-approval-01',
      artifact_id: payload.artifact.artifact_id,
      action_type: 'APPROVE_SIGNATURE',
      title: 'Professional email signature',
      detail: 'Review and approve the signature SITE 00 prepared for your primary mailbox.',
      status: 'OPEN',
      created_at: new Date().toISOString(),
      completed_at: null,
      response: null,
    },
  ];
  if (payload.operations_summary) payload.operations_summary.needs_you_count = 1;
  return { token: base.token, payload };
}

async function snapshotProposalReady() {
  resetDigitalFoundationMemoryStore();
  const a = createArtifactForLead({ business_name: 'Review · Proposal ready' });
  completeIntakeWithContactPhone(a.artifact_id);
  markQuoteCommerciallyReady(a.artifact_id);
  return { token: a.public_token, payload: getClientArtifactPayloadByToken(a.public_token) };
}

async function main() {
  resetDigitalFoundationMemoryStore();
  const config = getCommercialConfig();
  const catalog = listCatalogForClient(config);

  const fixtures = {
    A_BASE: await snapshotFixture('A_BASE'),
    INTAKE_SUBMITTED: await snapshotIntakeSubmitted(),
    PROPOSAL_READY: await snapshotProposalReady(),
    J_PAYMENT_SUCCESS: await snapshotFixture('J_PAYMENT_SUCCESS'),
    K_PAYMENT_FAILURE: await snapshotFixture('K_PAYMENT_FAILURE'),
    M_COMPLETE_CREDIT: await snapshotFixture('M_COMPLETE_CREDIT'),
    J_SIGNATURE_APPROVAL: await snapshotSignatureApproval(),
  };

  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    outFile,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        catalog: { catalog, config },
        fixtures,
      },
      null,
      2,
    ),
  );
  console.log(`Wrote ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
