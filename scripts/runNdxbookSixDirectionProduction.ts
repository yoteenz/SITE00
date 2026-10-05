/**
 * NDX BOOK six-direction production pipeline — v1 completion + Stage A proofs.
 *
 * Run: npx tsx scripts/runNdxbookSixDirectionProduction.ts [--dry-run] [--skip-v1] [--all-proofs]
 */

import { runSixDirectionProductionPipeline } from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/sixDirectionProductionOrchestrator.js';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipV1 = args.includes('--skip-v1');
const includeAllProofTypes = args.includes('--all-proofs');

async function main() {
  console.log('NDX BOOK — Six-Direction Production Pipeline');
  console.log(`FAL_KEY: ${process.env.FAL_KEY ? 'configured' : 'missing'}`);
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing'}`);
  console.log(`dryRun=${dryRun} skipV1=${skipV1} allProofs=${includeAllProofTypes}`);

  const result = await runSixDirectionProductionPipeline({
    completeV1: !skipV1,
    dryRun,
    includeAllProofTypes,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
