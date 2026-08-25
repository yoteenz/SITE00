#!/usr/bin/env npx tsx
/**
 * P0.VR.1D.2 — Live NDX project hub reconstruction runner (skipRender=false).
 *
 * Usage:
 *   npx tsx scripts/visualReconstruction/runNdxProjectHubLiveReconstruction.ts
 *   NDX_FOUNDER_DESKTOP_BOARD_PATH=/path/desktop.png NDX_FOUNDER_MOBILE_BOARD_PATH=/path/mobile.png npx tsx ...
 *   npx tsx scripts/visualReconstruction/runNdxProjectHubLiveReconstruction.ts --allow-fixture-fallback
 */

import { join } from 'node:path';
import { runNdxProjectHubLiveReconstruction } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr1d2/index.js';

const allowFixtureFallback = process.argv.includes('--allow-fixture-fallback');
const baseUrl = process.env.VR_BASE_URL ?? 'http://127.0.0.1:5174';
const outputDir = join('/tmp', 'ndx-project-hub-live-vr', String(Date.now()));

async function main() {
  console.log('P0.VR.1D.2 — NDX Project Hub Live Reconstruction');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Output: ${outputDir}`);
  console.log(`allowFixtureFallback: ${allowFixtureFallback}`);

  const report = await runNdxProjectHubLiveReconstruction({
    baseUrl,
    outputDir,
    allowFixtureFallback,
    maxIterations: 2,
  });

  console.log('\n--- FOUNDER BOARDS ---');
  console.log(JSON.stringify(report.founderBoards, null, 2));
  console.log('\n--- BOARD DIMENSIONS ---');
  console.log(JSON.stringify(report.boardDimensions, null, 2));

  if (!report.actualReconstructionExecuted) {
    console.error('\nFOUNDER BOARDS NOT AVAILABLE — place boards at:');
    console.error('  visual-references/founder/ndxbook/desktop-mood-board.png');
    console.error('  visual-references/founder/ndxbook/mobile-mood-board.png');
    console.error('Or set NDX_FOUNDER_DESKTOP_BOARD_PATH / NDX_FOUNDER_MOBILE_BOARD_PATH');
    process.exit(2);
  }

  for (const screen of [...report.desktopScreens, ...report.mobileScreens]) {
    console.log(
      `\n${screen.viewportClass.toUpperCase()} ${screen.screenId} @ ${screen.route}`,
    );
    console.log(
      `  viewport: ${screen.viewportUsed.width}x${screen.viewportUsed.height} (${screen.geometry.viewportConfidence})`,
    );
    console.log(
      `  crop: ${screen.geometry.cropWidth}x${screen.geometry.cropHeight} resolution=${screen.resolution.status}`,
    );
    console.log(
      `  scores: structural=${(screen.structuralScore * 100).toFixed(1)}% visual=${(screen.visualScore * 100).toFixed(1)}% status=${screen.status}`,
    );
    console.log(`  patches: ${screen.patchInstructions.length} locked: ${screen.lockedRegionIds.length}`);
    if (screen.domDelta?.entries.length) {
      const e = screen.domDelta.entries[0]!;
      console.log(`  DOM delta sample: ${e.regionId} ${e.property} ref=${e.referenceValue} render=${e.renderedValue} Δ=${e.delta}`);
    }
  }

  console.log('\n--- SUMMARY ---');
  console.log(`desktopVisualPass: ${report.desktopVisualPass}`);
  console.log(`mobileVisualPass: ${report.mobileVisualPass}`);
  console.log(`pixelPass: ${report.pixelPass}`);
  console.log(`fixtureSubstitution: ${report.founderBoards.fixtureSubstitution}`);
  console.log(`report: ${join(outputDir, 'report.json')}`);
  process.exit(report.desktopVisualPass && report.mobileVisualPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
