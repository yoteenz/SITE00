#!/usr/bin/env npx tsx
/**
 * P0.VR.4R1 — One-shot live acceptance runner (outside vitest).
 * Usage: npx tsx scripts/run-p0vr4r1-live-acceptance.ts [--love-it] [--apply]
 */
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { runLiveProjectsHeaderPlanetAcceptance } from '../shared/site00-studio-world-production/visualReconstruction/p0vr4r1/liveAcceptancePipeline.js';

const repoRoot = join(process.cwd());
const loveIt = process.argv.includes('--love-it');
const apply = process.argv.includes('--apply');

async function main() {
  delete process.env.VITEST;
  const result = await runLiveProjectsHeaderPlanetAcceptance({
    repoRoot,
    falKey: process.env.FAL_KEY,
    explicitFounderAction: true,
    founderLoveIt: loveIt,
    applyToPage: apply,
  });

  const outPath = join(repoRoot, 'tmp/p0vr4r1-live-acceptance-result.json');
  writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.blocked ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
