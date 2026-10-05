import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import { buildActualImplementationRegionMap } from '../p0vrTwinV30R8M2/actualImplementationRegionMap.js';
import type { ActualRegionReconstructionContract, CompositionRelationshipTargets, VisualReconstructionPlan } from './actualFirstTypes.js';
import { CRITICAL_RECONSTRUCTION_REGIONS, type CriticalReconstructionRegionId } from './constants.js';

function mapToReconstructionId(regionId: string): CriticalReconstructionRegionId {
  if (regionId === 'HOST_HEADER') return 'HOST_SHELL';
  return regionId as CriticalReconstructionRegionId;
}

export function buildVisualReconstructionPlan(input: {
  composition: MobileTwinCompositionState;
  regionContracts: ActualRegionReconstructionContract[];
  compositionTargets: CompositionRelationshipTargets;
  translationBriefId: string;
}): VisualReconstructionPlan {
  const regionMap = buildActualImplementationRegionMap(input.composition);
  const sectionOrder = CRITICAL_RECONSTRUCTION_REGIONS.filter((id) =>
    regionMap.some((r) => mapToReconstructionId(r.regionId) === id),
  );

  const regionProportions: Record<string, number> = {};
  for (const c of input.regionContracts) {
    regionProportions[c.regionId] = c.targetHeightRatio;
  }

  const decisions = input.regionContracts.map((c) => {
    const structured = regionMap.find((r) => mapToReconstructionId(r.regionId) === c.regionId);
    return {
      decisionId: `vrd-${c.regionId.toLowerCase()}`,
      description: `Reconstruct ${c.regionId} at ${Math.round(c.targetWidthRatio * 100)}% width with ${c.targetInternalColumns} columns`,
      actualEvidenceRegion: c.regionId,
      blueprintEvidenceRegion: c.regionId,
      translationEvidence: input.translationBriefId,
      structuredObjectIds: structured?.objectIds.slice(0, 12) ?? [],
    };
  });

  const body = JSON.stringify({ sectionOrder, regionProportions, decisions });
  return {
    id: `vrp-${fnv1aHex(body).slice(0, 12)}`,
    pageComposition: `Canonical mobile column; hero grid ${input.compositionTargets.heroLeftRightRatio} headline vs artifact; authority rail ${input.compositionTargets.heroToAuthorityPanelRatio}:1`,
    sectionOrder,
    regionProportions,
    nestingDescription: 'HOST_SHELL > PROJECT_CONTEXT > stage > HERO_WORKSPACE (3-col) > bands below',
    sideBySideRelationships: [
      `headline:artifact:authority=${input.compositionTargets.headlineBlockWidthRatio}:${input.compositionTargets.artifactWidthRatio}:remainder`,
    ],
    visualWeightHierarchy: ['HERO headline', 'authority rail', 'gallery strip', 'structured band'],
    assetPlacementNotes: ['Hero artifact cover center', 'Gallery 3/4 tiles'],
    typographyTargetsSummary: ['Headline 22px/900 two lines max'],
    controlGroupTargetsSummary: ['Authority vertical rail 6px gap'],
    responsivePreservationStrategy: 'Lock canonical 390×844 match first; stack only after convergence PASS',
    decisions,
    hash: fnv1aHex(body),
  };
}

export function assertVisualReconstructionPlanGrounded(plan: VisualReconstructionPlan): void {
  for (const id of ['HERO_WORKSPACE', 'AUTHORITY_PANEL', 'CANDIDATE_GALLERY', 'STRUCTURED_OUTPUT', 'READINESS'] as const) {
    const d = plan.decisions.find((x) => x.actualEvidenceRegion === id);
    if (!d?.actualEvidenceRegion) {
      throw new Error(`RECONSTRUCTION_PLAN_MISSING_ACTUAL_EVIDENCE:${id}`);
    }
  }
}
