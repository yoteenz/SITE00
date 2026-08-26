/**
 * Capture all SITE 00 composer draft implementation snapshots (9 pages × 3 viewports).
 * Usage: npx tsx scripts/capture-composer-draft-snapshots.ts [baseUrl]
 */

import { registerSite00DesignPilot } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00PilotRegistration.js';
import { captureComposerDraftSnapshots } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3j/composerDraftBackfill.js';

const baseUrl = process.argv[2] ?? process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174';

async function main() {
  registerSite00DesignPilot();
  console.log(`Capturing composer drafts from ${baseUrl} ...`);
  const result = await captureComposerDraftSnapshots({ baseUrl });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
