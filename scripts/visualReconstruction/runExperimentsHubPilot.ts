#!/usr/bin/env npx tsx
/**
 * P0.VR.1 Experiments Hub pilot — closed-loop visual reconstruction.
 * Usage: npx tsx scripts/visualReconstruction/runExperimentsHubPilot.ts [--skip-render]
 */

import { join } from 'node:path';
import { runVisualReconstructionLoop } from '../../shared/site00-studio-world-production/visualReconstruction/index.js';
import {
  EXPERIMENTS_HUB_PILOT_REFERENCE_FIXTURE,
  EXPERIMENTS_HUB_PILOT_ROUTE,
  EXPERIMENTS_HUB_RENDER_SELECTOR,
} from '../../shared/site00-brand-lore/visualReconstruction/experimentsHubPilotAdapter.js';

const skipRender = process.argv.includes('--skip-render');
const baseUrl = process.env.VR_BASE_URL ?? 'http://127.0.0.1:5174';
const outputDir = join('/tmp', 'site00-vr-experiments-hub-pilot', String(Date.now()));

async function main() {
  console.log('Visual Reconstruction Engine — Experiments Hub Pilot');
  console.log(`Reference: ${EXPERIMENTS_HUB_PILOT_REFERENCE_FIXTURE}`);
  console.log(`Route: ${EXPERIMENTS_HUB_PILOT_ROUTE}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Output: ${outputDir}`);

  const result = await runVisualReconstructionLoop({
    referenceImagePath: EXPERIMENTS_HUB_PILOT_REFERENCE_FIXTURE,
    targetRoute: EXPERIMENTS_HUB_PILOT_ROUTE,
    baseUrl,
    outputDir,
    renderSelector: EXPERIMENTS_HUB_RENDER_SELECTOR,
    skipRender,
    config: {
      maxIterations: skipRender ? 1 : 6,
      copyMatchMode: 'CANONICAL_REPOSITORY_COPY',
    },
  });

  console.log('\n--- RESULT ---');
  console.log('Status:', result.status);
  if (result.status === 'REFERENCE_MATCH_BLOCKED') {
    console.log('Blocker:', result.blocker);
  }
  console.log('Iterations:', result.report.iterations);
  console.log('Overall score:', (result.report.overallScore * 100).toFixed(1) + '%');
  console.log('Locked regions:', result.report.lockedRegions.filter((l) => l.state === 'LOCKED').length);
  console.log('Report:', join(outputDir, 'report.json'));
  console.log('Heatmap:', result.report.heatmapPath ?? 'n/a');

  process.exit(result.status === 'REFERENCE_MATCH_READY' ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
