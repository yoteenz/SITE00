/**
 * P0.VR.3J.2 — Execute Account auth capture + NDXBOOK Voice Lab family derivation.
 * Usage: npx tsx scripts/execute-p0vr3j2-captures.ts [baseUrl]
 */

import { executePreparedCaptures } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3j2/executePreparedCaptures.js';

const baseUrl = process.argv[2] ?? process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174';

async function main() {
  console.log(`P0.VR.3J.2 executing prepared captures from ${baseUrl} ...`);
  const report = await executePreparedCaptures({ baseUrl });
  console.log(JSON.stringify(report, null, 2));
  const ok =
    report.site00Health.valid === 27 &&
    report.account.successful >= 0 &&
    report.voiceLab.readyForFounderReview;
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
