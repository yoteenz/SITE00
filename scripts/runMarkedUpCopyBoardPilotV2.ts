/**
 * Run THE MARKED-UP COPY board pilot v2 — repair + reference-conditioned regeneration.
 */
import { runMarkedUpCopyBoardPilotV2 } from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/markedUpCopyBoardPilotV2.js';

async function main() {
  console.log('THE MARKED-UP COPY — Board Pilot V2');
  console.log(`FAL_KEY: ${process.env.FAL_KEY ? 'configured' : 'missing'}`);
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing'}`);

  const result = await runMarkedUpCopyBoardPilotV2({ orgSlug: 'ndxbook' });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
