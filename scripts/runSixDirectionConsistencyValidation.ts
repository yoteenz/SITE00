#!/usr/bin/env tsx
/**
 * Run NDXBOOK six-direction blind creative consistency validation for an active replay.
 *
 * Usage:
 *   tsx scripts/runSixDirectionConsistencyValidation.ts [--replay-id=<uuid>]
 */

import {
  findActiveSubmittedReplay,
  getPersonalityReplay,
} from '../api/_lib/site00Evolve/creativeDirection/personalityReplay/replayService.js';
import {
  buildSixDirectionDirectionReport,
  executeSixDirectionConsistencyValidation,
} from '../api/_lib/site00Evolve/creativeDirection/personalityReplay/sixDirectionConsistencyService.js';
import { orgIdFromSlug } from '../api/_lib/site00Evolve/orgRegistry.js';

async function main(): Promise<void> {
  const replayIdArg = process.argv.find((a) => a.startsWith('--replay-id='))?.split('=')[1];
  const orgId = orgIdFromSlug('ndxbook');

  let replayId = replayIdArg;
  if (!replayId) {
    const active = await findActiveSubmittedReplay(orgId);
    if (!active?.heroAsset) {
      throw new Error('No completed replay with hero found — complete blind replay first');
    }
    replayId = active.replayId;
  }

  console.log(`[six-direction] starting validation for replay ${replayId}`);
  const result = await executeSixDirectionConsistencyValidation(replayId);
  const run = result.sixDirectionConsistency;
  if (!run) throw new Error('No six-direction run persisted');

  console.log('\n--- DIRECTION REPORT ---\n');
  console.log(buildSixDirectionDirectionReport(run.directions));

  console.log('\n--- VERDICT ---');
  console.log(JSON.stringify(run.consistencyVerdict, null, 2));

  console.log('\n--- COMPARISON SCORER AUDIT ---');
  console.log(JSON.stringify(run.comparisonScorerAudit, null, 2));

  if (run.status === 'FAILED') {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
