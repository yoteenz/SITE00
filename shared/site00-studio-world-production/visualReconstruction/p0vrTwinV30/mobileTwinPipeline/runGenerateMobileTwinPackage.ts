import type { DesignPageAuthorityReviewSession } from '../types.js';
import {
  assertMobileTwinPackagePreconditions,
  buildBlueprintTwinSvgDataUrl,
  finalizeMobileTwinPackageSession,
  fnv1aHex,
} from './runGenerateMobileTwinPackageCore.js';

/** Browser-safe Phase B — blueprint twin SVG as data URL (no sharp). */
export async function runGenerateMobileTwinPackage(
  session: DesignPageAuthorityReviewSession,
): Promise<DesignPageAuthorityReviewSession> {
  assertMobileTwinPackagePreconditions(session);
  const pipeline = session.mobileTwinPipeline!;
  const render = pipeline.renders.find((r) => r.id === pipeline.activeRenderId)!;
  const composition = pipeline.compositionStates.find((c) => c.id === render.compositionStateId)!;
  const runId = `r7m-pkg-${Date.now()}`;
  const svg = buildBlueprintTwinSvgDataUrl(composition, render.widthPx, render.heightPx);
  const twinWritten = { publicPath: svg, hash: fnv1aHex(svg) };
  return finalizeMobileTwinPackageSession(session, twinWritten, runId);
}

export function canGenerateMobileTwinPackage(session: DesignPageAuthorityReviewSession): boolean {
  const p = session.mobileTwinPipeline;
  return Boolean(p?.renderGate === 'FROZEN' || p?.renderGate === 'APPROVED') && Boolean(p?.implementationVisualAuthority);
}
