#!/usr/bin/env node
/**
 * P0.VR.1D.3 — Execute single-screen NDX overview menu-open live reconstruction.
 */

import { runNdxOverviewMenuOpenLiveReconstruction } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr1d3/index.js';

const baseUrl = process.env.VITE_DEV_URL ?? 'http://127.0.0.1:5174';
const outputDir = process.env.VR_OUTPUT_DIR ?? `/tmp/vr-p0vr1d3-${Date.now()}`;

const report = await runNdxOverviewMenuOpenLiveReconstruction({
  baseUrl,
  outputDir,
  maxIterations: 2,
});

console.log(JSON.stringify(report, null, 2));
