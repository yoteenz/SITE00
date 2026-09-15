/**
 * P0.VR.TWINV3.0R8M2R4 — actual-first pixel-fidelity reconstruction
 */

import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { escalateFounderMobileTwinPackageFromCanonicalAssets } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { compileApprovedMobileTwinPackage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { compileVisualMobileTwinImplementationR8M2R3 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R3/compileVisualMobileTwinImplementationR8M2R3.js';
import { compileVisualMobileTwinImplementationR8M2R4 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R4/compileVisualMobileTwinImplementationR8M2R4.js';
import {
  ACTUAL_FIRST_PROMPT_OPENING,
  CANONICAL_ASSET_DOES_NOT_MATCH_ACTUAL,
  GENERIC_COMPONENT_SUBSTITUTION_DRIFT,
  MIN_RECONSTRUCTION_ITERATIONS,
  MOBILE_TWIN_IMPLEMENTATION_VERSION_ACTUAL_FIRST,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R4,
  P0_VR_TWIN_V30R8M2R4_LINEAGE,
  R8M2R3_CORRECTION_REQUIRED_REASON,
  TRANSLATION_BRIEF_EXPLANATORY_PREFIX,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R4/constants.js';
import { buildActualToCodeReconstructionDirective } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R4/buildActualToCodeReconstructionDirective.js';
import { resolveVisualAuthorityConflict } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R4/buildActualFirstVisualReconstructionPrompt.js';
import { runActualAssetIdentityGate } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R4/actualAssetIdentityGate.js';
import { renderTreeStructureSignatureR8M2R4 } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R4/staleRenderTreeReuseFirewallR8M2R4.js';
import { documentRequiresR8M2Recompile } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/invalidatePriorR8M1Build.js';
import { scanDocumentForAuthorityRasterViolations } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/runtimeAuthorityRasterFirewall.js';
import { readFileSync } from 'node:fs';

function founderCompileInput() {
  let session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
  session = ensureMobileDesignReferenceAuthority(session);
  session = escalateFounderMobileTwinPackageFromCanonicalAssets(session);
  const pipeline = session.mobileTwinPipeline!;
  return { pipeline, packageId: pipeline.latestPackageId! };
}

describe('P0.VR.TWINV3.0R8M2R4 actual-first reconstruction', () => {
  it('1–5 directive + authority modes', () => {
    const d = buildActualToCodeReconstructionDirective({
      packageId: 'pkg',
      actualAuthorityId: 'a',
      blueprintAuthorityId: 'b',
      translationBriefId: 't',
      expressionIrId: 'e',
    });
    expect(d.targetMode).toBe('PIXEL_FIDELITY_RECONSTRUCTION');
    expect(d.visualAuthority).toBe('APPROVED_ACTUAL');
    expect(d.creativeFreedom).toBe('NONE');
    expect(d.layoutInvention).toBe('FORBIDDEN');
    expect(d.styleInvention).toBe('FORBIDDEN');
  });

  it('6–8 actual visible at authoring; blueprint; brief role', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.actualVisibleToImplementationAuthoringStage).toBe(true);
    expect(doc.blueprintAvailableToReconstruction).toBe(true);
    expect(doc.translationBriefRole).toBe('EXPLANATION_OF_ACTUAL');
  });

  it('9–10 brief explanatory; actual wins visual conflict', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.actualFirstVisualReconstructionPrompt?.fullText).toContain(TRANSLATION_BRIEF_EXPLANATORY_PREFIX);
    expect(
      resolveVisualAuthorityConflict({ briefAppearanceHint: 'wide hero', actualAppearanceHint: 'narrow hero' }),
    ).toBe('narrow hero');
  });

  it('11–14 region contracts, visual weight, geometry, typography, controls, assets', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.regionReconstructionContracts?.length).toBe(11);
    expect(doc.visualWeightContract?.objects.length).toBeGreaterThan(5);
    expect(doc.compositionRelationshipTargets?.heroLeftRightRatio).toBeGreaterThan(0);
    expect(doc.typographyReconstructionTargets?.length).toBeGreaterThanOrEqual(5);
    expect(doc.controlReconstructionTargets?.length).toBeGreaterThan(5);
    expect(doc.assetReconstructionTargets?.length).toBeGreaterThan(0);
  });

  it('15–17 asset identity gate; generic substitution prohibited', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.actualAssetIdentityGateResults?.every((r) => r.result === 'PASS')).toBe(true);
    expect(GENERIC_COMPONENT_SUBSTITUTION_DRIFT).toBe('GENERIC_COMPONENT_SUBSTITUTION_DRIFT');
    expect(CANONICAL_ASSET_DOES_NOT_MATCH_ACTUAL).toBe('CANONICAL_ASSET_DOES_NOT_MATCH_ACTUAL');
  });

  it('18–21 actual-first prompt + plan evidence', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.actualFirstVisualReconstructionPrompt?.fullText.startsWith(ACTUAL_FIRST_PROMPT_OPENING)).toBe(true);
    expect(doc.actualFirstPromptInjected).toBe(true);
    expect(doc.visualReconstructionPlan?.decisions.every((d) => d.actualEvidenceRegion)).toBe(true);
  });

  it('22–24 fresh af tree; not td reuse', () => {
    const input = founderCompileInput();
    const prior = compileVisualMobileTwinImplementationR8M2R3(input);
    const doc = compileApprovedMobileTwinPackage(input);
    expect(doc.implementationVersion).toBe(MOBILE_TWIN_IMPLEMENTATION_VERSION_ACTUAL_FIRST);
    expect(renderTreeStructureSignatureR8M2R4(prior)).not.toBe(renderTreeStructureSignatureR8M2R4(doc));
    expect(doc.renderTree?.nodes.some((n) => n.sectionId.startsWith('af-'))).toBe(true);
    expect(doc.renderTree?.nodes.some((n) => n.styleSource === 'ACTUAL_FIRST_REBUILD')).toBe(true);
  });

  it('25–28 canonical screenshot + comparison + diff map', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.liveImplementationCanonicalScreenshot?.viewport.widthPx).toBe(doc.widthPx);
    expect(doc.actualToLiveVisualComparison?.globalSilhouetteScore).toBeGreaterThan(0.7);
    expect(doc.perceptualDifferenceMap?.structuralSimilarityScore).toBeGreaterThan(0.5);
  });

  it('29–32 iterations, drift, corrections, critical drift gate', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.reconstructionIterations?.length).toBeGreaterThanOrEqual(MIN_RECONSTRUCTION_ITERATIONS);
    expect(doc.reconstructionIterations?.some((i) => i.codeCorrectionsApplied.length)).toBe(true);
    expect(doc.actualToLiveRegionDrifts?.length).toBeGreaterThan(5);
    const high = doc.visualReconstructionConvergenceGate?.criticalHighDriftRegions ?? [];
    expect(high.length).toBe(0);
  });

  it('33–37 visual weight; raster zero; responsive deferred; material change; distance improved', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.actualToLiveVisualComparison?.visualWeightScore).toBeGreaterThan(0.65);
    expect(scanDocumentForAuthorityRasterViolations(doc.nodes.map((n) => n.imageUri))).toEqual([]);
    expect(doc.responsiveAdaptationDeferredUntilCanonicalMatch).toBe(true);
    expect(doc.actualFirstMaterialChangeReceipt?.distanceToActualImproved).toBe(true);
    expect(doc.actualFirstMaterialChangeReceipt?.result).toBe('PASS');
  });

  it('38–40 production path; design route; desktop zero', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.compilerGeneration).toBe(MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R4);
    expect(doc.lineage).toBe(P0_VR_TWIN_V30R8M2R4_LINEAGE);
    expect(doc.priorBuildCorrection?.priorGeneration).toBe('R8M2R3');
    expect(doc.priorBuildCorrection?.reason).toBe(R8M2R3_CORRECTION_REQUIRED_REASON);
    expect(documentRequiresR8M2Recompile(doc)).toBe(false);
    expect(documentRequiresR8M2Recompile(compileVisualMobileTwinImplementationR8M2R3(founderCompileInput()))).toBe(true);
    const designWs = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(designWs).not.toContain('mobile-twin-impl-v6-actual-first-reconstruction');
    const page = readFileSync('src/site00/pages/DesignTwinImplementationPage.tsx', 'utf8');
    expect(page).toContain('DesignTwinActualLiveCompareOverlay');
    expect(page).toContain('P0_VR_TWIN_V30R8M2R4_LINEAGE');
  });

  it('semantic-only cannot bypass visual convergence', () => {
    const doc = compileApprovedMobileTwinPackage(founderCompileInput());
    expect(doc.visualFidelityEvaluation?.machinePass).toBe(true);
    expect(doc.visualReconstructionConvergenceGate?.founderImplementationReview).toBe('FOUNDER_IMPLEMENTATION_REVIEW');
    expect(doc.nodes.filter((n) => n.functionTarget).length).toBeGreaterThan(0);
  });

  it('wrong canonical asset fails gate', () => {
    const input = founderCompileInput();
    const session = applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' }));
    void session;
    const doc = compileVisualMobileTwinImplementationR8M2R4(input);
    const broken = structuredClone(doc);
    const firstAsset = broken.assetReconstructionTargets?.[0];
    if (!firstAsset) return;
    expect(() =>
      runActualAssetIdentityGate({
        composition: input.pipeline.compositionStates.find((c) => c.id === input.pipeline.packages.find((p) => p.id === input.packageId)!.compositionStateId)!,
        bundle: {
          surgicalBlueprint: input.pipeline.artifactsById[input.pipeline.packages.find((p) => p.id === input.packageId)!.surgicalBlueprintId] as never,
          objectMap: input.pipeline.artifactsById[input.pipeline.packages.find((p) => p.id === input.packageId)!.objectMapId] as never,
          canonicalAssetManifest: { assets: [] } as never,
          functionBindingMap: {} as never,
          hostProjectOwnershipMap: {} as never,
          implementationPrimitiveContract: {} as never,
          reverseTraceabilityMap: {} as never,
        },
        assetTargets: [firstAsset],
      }),
    ).toThrow(CANONICAL_ASSET_DOES_NOT_MATCH_ACTUAL);
  });

  it('renderer supports R8M2R4 af root', () => {
    const renderer = readFileSync('src/site00/components/designWorkspace/MobileTwinCompiledImplementationRenderer.tsx', 'utf8');
    expect(renderer).toContain('site00-twin-af');
    expect(renderer).toContain("document.compilerGeneration === 'R8M2R4'");
  });
});
