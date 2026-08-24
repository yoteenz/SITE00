#!/usr/bin/env npx tsx
/**
 * P0.VR.1A founder reference calibration runner.
 * Usage: npx tsx scripts/visualReconstruction/runFounderCalibration.ts [--skip-render]
 */

import { join } from 'node:path';
import { runFounderReferenceCalibration } from '../../shared/site00-studio-world-production/visualReconstruction/index.js';

const skipRender = process.argv.includes('--skip-render');
const baseUrl = process.env.VR_BASE_URL ?? 'http://127.0.0.1:5174';
const outputDir = join('/tmp', 'site00-vr-founder-calibration', String(Date.now()));

async function main() {
  console.log('Visual Reconstruction Engine — P0.VR.1A Founder Calibration');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Output: ${outputDir}`);

  const result = await runFounderReferenceCalibration({
    baseUrl,
    outputDir,
    skipRender,
  });

  console.log('\n--- CALIBRATION SUMMARY ---');
  for (const report of result.reports) {
    console.log(
      `${report.routeId}: pixel=${(report.pixelScore * 100).toFixed(1)}% grammar=${(report.designGrammarScore * 100).toFixed(1)}% brand=${(report.brandScore * 100).toFixed(1)}%`,
    );
    console.log(`  root cause: ${report.forensicRootCause}`);
    console.log(`  critical: ${report.readiness.criticalFailures.join(', ') || 'none'}`);
  }
  console.log(`Forensic entries: ${result.forensic.length}`);
  console.log(`Desktop ref: ${result.referenceSet.desktop.referenceId}`);
  console.log(`Mobile ref: ${result.referenceSet.mobile.referenceId}`);
  console.log(`Reports: ${join(outputDir, 'calibration-reports.json')}`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
