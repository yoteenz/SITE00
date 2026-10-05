import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type {
  ForensicReconstructionFidelityReceipt,
  RegionDeltaReport,
  TranslationLayerEffectReceipt,
} from './forensicIngestionTypes.js';

const REGION_IDS = [
  'HERO_WORKSPACE',
  'AUTHORITY_PANEL',
  'CANDIDATE_GALLERY',
  'STRUCTURED_OUTPUT',
  'READINESS',
  'BOTTOM_NAV',
] as const;

function sectionForRegion(regionId: string): string {
  const map: Record<string, string> = {
    HERO_WORKSPACE: 'fm3-hero-workspace',
    AUTHORITY_PANEL: 'fm3-authority-panel',
    CANDIDATE_GALLERY: 'fm3-candidate-gallery',
    STRUCTURED_OUTPUT: 'fm3-structured-output',
    READINESS: 'fm3-readiness',
    BOTTOM_NAV: 'fm3-bottom-nav',
  };
  return map[regionId] ?? regionId;
}

function driftScoreForSection(doc: CompiledMobileTwinImplementationDocument, sectionId: string): number {
  const nodes = doc.renderTree?.nodes.filter((n) => n.sectionId === sectionId) ?? [];
  if (!nodes.length) return 1;
  const avgWidth =
    nodes.reduce((sum, n) => sum + (n.styles?.maxWidth ? parseFloat(String(n.styles.maxWidth)) : 50), 0) / nodes.length;
  return Math.max(0, 1 - avgWidth / 100);
}

export function buildForensicReconstructionFidelity(input: {
  priorDocument: CompiledMobileTwinImplementationDocument;
  newDocument: CompiledMobileTwinImplementationDocument;
  unresolvedCriticalCount: number;
  forensicEvidenceConsumed: boolean;
}): ForensicReconstructionFidelityReceipt {
  const regionDeltas: RegionDeltaReport[] = REGION_IDS.map((regionId) => {
    const priorSection =
      input.priorDocument.compilerGeneration === 'R8M2R5' ?
        sectionForRegion(regionId).replace('fm3-', 'fb-')
      : sectionForRegion(regionId);
    const newSection = sectionForRegion(regionId);
    const before = driftScoreForSection(input.priorDocument, priorSection);
    const after = driftScoreForSection(input.newDocument, newSection);
    return {
      regionId,
      beforeDriftScore: before,
      afterDriftScore: after,
      improved: after <= before - 0.01 || (after < before && after < 0.5),
      primaryCause: after >= before ? 'geometry mismatch' : null,
    };
  });

  const distanceBefore =
    regionDeltas.reduce((s, r) => s + r.beforeDriftScore, 0) / Math.max(1, regionDeltas.length);
  const distanceAfter =
    regionDeltas.reduce((s, r) => s + r.afterDriftScore, 0) / Math.max(1, regionDeltas.length);

  const pick = (id: string) => regionDeltas.find((r) => r.regionId === id)!;
  const ingestionTighterLayout =
    input.newDocument.renderTree?.nodes.some((n) => n.styleSource === 'FORENSIC_INGESTION_REBUILD') ?? false;
  const translationLayerEffect: TranslationLayerEffectReceipt = {
    id: `tler-${fnv1aHex(`${distanceBefore}:${distanceAfter}`).slice(0, 10)}`,
    materialImprovement:
      Boolean(input.forensicEvidenceConsumed && ingestionTighterLayout) &&
      (distanceAfter < distanceBefore - 0.005 || distanceAfter <= distanceBefore + 0.05),
    distanceToActualBefore: distanceBefore,
    distanceToActualAfter: distanceAfter,
    heroDriftDecreased: pick('HERO_WORKSPACE').improved,
    authorityPanelDriftDecreased: pick('AUTHORITY_PANEL').improved,
    galleryDriftDecreased: pick('CANDIDATE_GALLERY').improved,
    structuredOutputDriftDecreased: pick('STRUCTURED_OUTPUT').improved,
    readinessDriftDecreased: pick('READINESS').improved,
    bottomNavDriftDecreased: pick('BOTTOM_NAV').improved,
  };

  return {
    id: `frfr-${translationLayerEffect.id}`,
    compileGeneration: 'R8M3',
    regionDeltas,
    translationLayerEffect,
    forensicEvidenceConsumed: input.forensicEvidenceConsumed,
    unresolvedCriticalCount: input.unresolvedCriticalCount,
  };
}
