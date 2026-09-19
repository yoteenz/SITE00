#!/usr/bin/env npx tsx
/**
 * Sprint A — run /enter desktop Experience Engine proof loop (live browser required).
 */
import { runEnterDesktopProofLoop } from '../../api/_lib/site00ExperienceEngine/experienceEngineService.js';

async function main() {
  const proof = await runEnterDesktopProofLoop({
    baseUrl: process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174',
    maxIterations: Number(process.env.EE_MAX_ITERATIONS ?? 5),
  });
  const latest = proof.iterations[proof.iterations.length - 1];
  console.log(JSON.stringify({ promotion: proof.promotion, latest, iterationCount: proof.iterations.length }, null, 2));
  if (!proof.promotion.eligible) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
