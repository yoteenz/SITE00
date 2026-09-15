import { readTwinV42GoldenDiffBundle, writeTwinV42GoldenDiffBundle } from './twinV42Persistence.js';
import { runTwinV4GoldenDiffLoop } from './runTwinV4GoldenDiffLoop.js';
import { auditTwinV4LiveDomForRasterCheat } from './twinV4RasterCheatFirewall.js';
import { P0_VR_TWIN_V42_LINEAGE } from './constants.js';
import type { TwinV4GoldenAuthority, TwinV4CanonicalViewport, TwinV42GoldenDiffBundle } from './twinV42Types.js';
import { loadGoldenPngBufferForNode } from './twinV42NodeGoldenLoader.js';

export async function compileTwinV42GoldenDiffGate(input: {
  goldenAuthority: TwinV4GoldenAuthority;
  canonicalViewport: TwinV4CanonicalViewport;
  purgeReceipt: TwinV42GoldenDiffBundle['purgeReceipt'];
  baseUrl: string;
  projectId: string;
  goldenPng?: Buffer;
  artifactDir?: string;
  queryActualHash?: string;
  localStorageSeed?: Record<string, string>;
}): Promise<TwinV42GoldenDiffBundle> {
  const goldenPng = input.goldenPng ?? loadGoldenPngBufferForNode(input.goldenAuthority);
  const loop = await runTwinV4GoldenDiffLoop({
    goldenAuthority: input.goldenAuthority,
    goldenPng,
    viewport: input.canonicalViewport,
    baseUrl: input.baseUrl,
    projectId: input.projectId,
    artifactDir: input.artifactDir,
    queryActualHash: input.queryActualHash,
    localStorageSeed: input.localStorageSeed,
  });

  const rasterFirewall = auditTwinV4LiveDomForRasterCheat({
    liveHtml: '',
    goldenUrl: input.goldenAuthority.artifactUrl,
  });
  rasterFirewall.runtimeRasterUsage = loop.gate.rasterCheatViolations;

  let proof = loop.proof;
  let gate = { ...loop.gate, rasterCheatViolations: rasterFirewall.violations.length };
  let proofBlockedReason: string | null = null;

  if (rasterFirewall.violations.length > 0) {
    proof = 'NO';
    gate = { ...gate, status: 'DIFF_FAILED' };
    proofBlockedReason = 'RASTER_CHEAT_FIREWALL';
  } else if (gate.status === 'REVIEW_READY') {
    proofBlockedReason = null;
  } else if (loop.stalled) {
    proofBlockedReason = 'DIFF_CONVERGENCE_STALLED';
  } else {
    proofBlockedReason = 'THRESHOLD_NOT_MET';
  }

  if (gate.status === 'REVIEW_READY' && !loop.fontStability.documentFontsReady) {
    gate = { ...gate, status: 'IMPLEMENTING' };
    proof = 'INCONCLUSIVE';
    proofBlockedReason = 'FONT_STABILITY';
  }

  const bundle: TwinV42GoldenDiffBundle = {
    lineage: P0_VR_TWIN_V42_LINEAGE,
    goldenAuthority: input.goldenAuthority,
    canonicalViewport: input.canonicalViewport,
    purgeReceipt: input.purgeReceipt,
    iterations: loop.iterations,
    fontStability: loop.fontStability,
    assetStability: loop.assetStability,
    rasterFirewall,
    gate,
    reconstructionEngineProof: proof,
    proofBlockedReason,
  };

  writeTwinV42GoldenDiffBundle(bundle);
  return bundle;
}

export function readTwinV42GateForUi(): TwinV42GoldenDiffBundle | null {
  return readTwinV42GoldenDiffBundle();
}
