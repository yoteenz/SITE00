/**
 * Run THE MARKED-UP COPY board pilot v3 — Sonnet creative-director pass.
 */
import { runMarkedUpCopyBoardPilotV3 } from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/markedUpCopyBoardPilotV3.js';

const dryRun = process.argv.includes('--dry-run');

runMarkedUpCopyBoardPilotV3({ orgSlug: 'ndxbook', dryRun })
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (result.status === 'BLOCKED_ON_SONNET_ART_DIRECTION') {
      process.exit(2);
    }
    process.exit(result.status === 'PASS' ? 0 : 1);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
