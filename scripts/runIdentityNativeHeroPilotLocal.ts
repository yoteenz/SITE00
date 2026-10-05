#!/usr/bin/env tsx
/** Local ONE-hero identity-native pilot (uses env FAL_KEY + Supabase storage). */
import { writeFileSync } from 'node:fs';
import { runMarkedUpCopyIdentityNativeHeroPilot } from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/markedUpCopyIdentityNativeHeroPilot.js';

async function main() {
  const result = await runMarkedUpCopyIdentityNativeHeroPilot({ orgSlug: 'ndxbook', dryRun: false });
  const outPath = '/tmp/marked-up-copy-identity-native-hero-pilot-local.json';
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ status: result.status, outPath, pilotId: result.pilot?.pilotId, publicUrl: result.pilot?.publicUrl }, null, 2));
  process.exit(result.status === 'PILOT_COMPLETE' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
