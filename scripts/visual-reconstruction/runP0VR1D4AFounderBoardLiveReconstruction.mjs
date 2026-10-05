#!/usr/bin/env node
/**
 * P0.VR.1D.4A — Execute founder mood board ingest + live 6×6 reconstruction.
 */
import { runFounderMoodBoardIngestAndLiveReconstruction } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr1d4a/index.js';

const desktopSource = process.argv[2];
const mobileSource = process.argv[3];
const maxIterations = Number(process.env.VR_MAX_ITERATIONS ?? '2');

const report = await runFounderMoodBoardIngestAndLiveReconstruction({
  desktopSourcePath: desktopSource,
  mobileSourcePath: mobileSource,
  skipPersist: !desktopSource || !mobileSource,
  maxIterations,
  executePatches: process.env.VR_EXECUTE_PATCHES !== '0',
  baseUrl: process.env.VR_BASE_URL ?? 'http://127.0.0.1:5174',
});

console.log(JSON.stringify({
  blocked: report.reconstructionBlocked,
  founderSource: report.founderReferenceProof.source,
  fixtureFallback: report.founderReferenceProof.fixtureFallback,
  desktopScreens: report.desktopScreens.length,
  mobileScreens: report.mobileScreens.length,
  desktopPasses: report.desktopScreens.filter((s) => s.status === 'VISUAL_PASS' || s.status === 'PIXEL_PASS').length,
  mobilePasses: report.mobileScreens.filter((s) => s.status === 'VISUAL_PASS' || s.status === 'PIXEL_PASS').length,
  screens: [...report.desktopScreens, ...report.mobileScreens].map((s) => ({
    screenId: s.screenId,
    status: s.status,
    visual: s.finalVisualScore,
    structural: s.finalStructuralScore,
    patches: s.patchesGenerated,
    blocker: s.blocker,
  })),
}, null, 2));

process.exit(report.reconstructionBlocked ? 1 : 0);
