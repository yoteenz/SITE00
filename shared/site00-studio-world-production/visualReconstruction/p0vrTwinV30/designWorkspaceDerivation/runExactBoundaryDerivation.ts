import { P0_VR_TWIN_V30R6F2_LINEAGE } from '../constants.js';
import type { ViewportMasterAuthority } from '../designWorkspaceAuthorityTypes.js';
import { DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1 } from '../designWorkspaceFeatureAuthority/featureDefinitionsV1.js';
import {
  auditObjectGranularity,
  buildAuthorityVisualCoverageReceipt,
  buildWeightedAuthorityCoverageReceipt,
  extractPixelGroundedRelationships,
  runAuthorityVisualCoverageGate,
} from './pixelGroundedAuthorityAnalysis.js';
import {
  analyzeExactBoundaryAuthority,
  runGeometryFidelityGate,
} from './exactBoundaryAnalysis.js';
import type { ExactBoundaryAnalysis } from './geometryFidelityTypes.js';
import { DERIVATION_ALGORITHM_R6F2 } from './geometryFidelityTypes.js';
import {
  assertNoAuthorityRasterPrimitives,
  buildCanonicalAssetManifest,
  buildHostProjectOwnershipMap,
  buildImplementationPackage,
  buildImplementationPrimitiveContract,
  buildInteractionGeometryContract,
  buildResponsiveRelationshipContract,
  buildReverseTraceabilityMap,
  buildStateVisualContract,
  buildTypographyFidelityContract,
} from './buildDerivationArtifacts.js';
import { buildScopedCompilerReadinessReceipt } from './scopedCompilerReadiness.js';
import type {
  CompletedMasterFeatureBinding,
  DesignWorkspaceDerivationArtifactBundle,
  DesignWorkspaceStructuralBlueprint,
  FeatureVisualResolution,
  FunctionBindingMap,
} from './types.js';
import type { PixelGroundedSurgicalObjectMap, PixelMeasuredObject, ResponsiveObjectCorrespondenceMap, VisualClusterMap } from './pixelGroundedTypes.js';

function buildBlueprintFromExactFixed(input: {
  runId: string;
  pairId: string;
  mobile: ViewportMasterAuthority;
  desktop: ViewportMasterAuthority;
  mobileAnalysis: ExactBoundaryAnalysis;
  desktopAnalysis: ExactBoundaryAnalysis;
}): DesignWorkspaceStructuralBlueprint {
  const regionsFrom = (a: ExactBoundaryAnalysis) => {
    const topLevel = a.measuredObjects.filter((o) => !o.parentObjectId && o.category === 'PANEL');
    return topLevel.map((o) => ({
      regionId: o.regionId,
      viewport: o.viewport,
      semanticRole: o.semanticRole,
      parentRegionId: null,
      ownership: o.ownership,
      x: o.x,
      y: o.y,
      w: o.w,
      h: o.h,
      scrollBehavior: 'SCROLL' as const,
      zIndex: o.zIndex,
    }));
  };
  const mobileW = Math.max(...input.mobileAnalysis.measuredObjects.map((o) => o.x + o.w), 100);
  const mobileH = Math.max(...input.mobileAnalysis.measuredObjects.map((o) => o.y + o.h), 100);
  const deskW = Math.max(...input.desktopAnalysis.measuredObjects.map((o) => o.x + o.w), 100);
  const deskH = Math.max(...input.desktopAnalysis.measuredObjects.map((o) => o.y + o.h), 100);
  return {
    id: `dsb-eb-${input.runId}`,
    authorityPairId: input.pairId,
    mobileAuthorityId: input.mobile.id,
    desktopAuthorityId: input.desktop.id,
    mobileAuthorityHash: input.mobile.authorityImageHash,
    desktopAuthorityHash: input.desktop.authorityImageHash,
    rootFrame: {
      mobile: { w: mobileW, h: mobileH },
      desktop: { w: deskW, h: deskH },
    },
    regions: [...regionsFrom(input.mobileAnalysis), ...regionsFrom(input.desktopAnalysis)],
    version: 2,
  };
}

function reconcileFeatureBindings(input: {
  runId: string;
  mobileObjects: PixelMeasuredObject[];
  desktopObjects: PixelMeasuredObject[];
}): CompletedMasterFeatureBinding[] {
  const FEATURE_RULES: Record<string, FeatureVisualResolution> = {
    technical_details: 'BOTTOM_SHEET_ACCESS',
    feature_change_history: 'SECONDARY_STATE',
    move_to_build: 'NOT_VISUALLY_PRESENT_BUT_STRUCTURALLY_SUPPORTED',
  };
  return DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1.map((featureId) => {
    const mob = input.mobileObjects.filter((o) => o.featureId === featureId);
    const desk = input.desktopObjects.filter((o) => o.featureId === featureId);
    const objectIds = [...mob, ...desk].map((o) => o.objectId);
    const resolution = FEATURE_RULES[featureId] ?? (objectIds.length ? 'VISIBLE_DIRECTLY' : 'NOT_VISUALLY_PRESENT_BUT_STRUCTURALLY_SUPPORTED');
    return {
      id: `mfb-eb-${input.runId}-${featureId}`,
      featureId,
      resolution,
      regionId: mob[0]?.regionId ?? desk[0]?.regionId ?? 'structural',
      objectIds: objectIds.length ? objectIds : [`struct-${featureId}`],
      mobilePresentation: mob.length ? 'VISIBLE_CONTROL' : 'PROGRESSIVE_DISCLOSURE',
      desktopPresentation: desk.length ? 'VISIBLE_CONTROL' : 'PROGRESSIVE_DISCLOSURE',
      structuralBindingState: 'BOUND',
      gapCode: null,
    };
  });
}

function buildFunctionBindingsHardened(input: {
  runId: string;
  pairId: string;
  objects: PixelMeasuredObject[];
}): FunctionBindingMap {
  const interactive = input.objects.filter((o) => o.interactionIntent && (o.category === 'BUTTON' || o.category === 'CONTROL' || o.category === 'NAV_ITEM'));
  const bindings: FunctionBindingMap['bindings'] = interactive.map((o) => ({
    objectId: o.objectId,
    featureId: o.featureId ?? 'unknown',
    functionTarget: o.interactionIntent ?? 'UNKNOWN',
    status: o.interactionIntent === 'navigate' ? ('BOUND' as const) : ('PARTIAL' as const),
  }));
  bindings.push({
    objectId: 'none',
    featureId: 'move_to_build',
    functionTarget: 'move_to_build',
    status: 'MISSING',
  });
  return { id: `fbm-eb-${input.runId}`, authorityPairId: input.pairId, bindings, version: 2 };
}

function buildVisualClusterMap(input: { runId: string; pairId: string; objects: PixelMeasuredObject[] }): VisualClusterMap {
  const clusterDefs = [
    { clusterId: 'host-header-cluster', label: 'HOST HEADER CLUSTER', match: (o: PixelMeasuredObject) => o.objectId.includes('host') },
    { clusterId: 'artifact-evidence-cluster', label: 'ARTIFACT EVIDENCE CLUSTER', match: (o: PixelMeasuredObject) => o.objectId.includes('dominant') || o.objectId.includes('artifact') },
    { clusterId: 'authority-pair-cluster', label: 'AUTHORITY PAIR CLUSTER', match: (o: PixelMeasuredObject) => o.objectId.includes('authority') || o.objectId.includes('promote') || o.objectId.includes('lock-pair') },
    { clusterId: 'pipeline-readiness-cluster', label: 'PIPELINE READINESS CLUSTER', match: (o: PixelMeasuredObject) => o.objectId.includes('readiness') },
  ];
  return {
    id: `vcm-eb-${input.runId}`,
    authorityPairId: input.pairId,
    clusters: clusterDefs.flatMap((c) =>
      (['MOBILE', 'DESKTOP'] as const).map((viewport) => ({
        clusterId: `${c.clusterId}-${viewport.toLowerCase()}`,
        viewport,
        label: c.label,
        objectIds: input.objects.filter((o) => o.viewport === viewport && c.match(o)).map((o) => o.objectId),
      })),
    ),
    version: 1,
  };
}

function buildResponsiveObjectCorrespondence(input: {
  runId: string;
  pairId: string;
  featureBindings: CompletedMasterFeatureBinding[];
}): ResponsiveObjectCorrespondenceMap {
  return {
    id: `rocm-eb-${input.runId}`,
    authorityPairId: input.pairId,
    entries: input.featureBindings
      .filter((f) => f.objectIds.some((id) => id.startsWith('mobile-')) && f.objectIds.some((id) => id.startsWith('desktop-')))
      .slice(0, 20)
      .map((f) => ({
        featureId: f.featureId,
        mobileObjectIds: f.objectIds.filter((id) => id.startsWith('mobile-')),
        desktopObjectIds: f.objectIds.filter((id) => id.startsWith('desktop-')),
        transformationClass:
          f.featureId === 'technical_details' ? 'PANEL_TO_SHEET'
          : f.featureId === 'concept_candidate_gallery' ? 'STRIP_TO_CAROUSEL'
          : 'SAME_ROLE_REPOSITIONED',
      })),
    version: 1,
  };
}

function buildTypographyFromPixels(input: {
  runId: string;
  pairId: string;
  objects: PixelMeasuredObject[];
}) {
  const textObjects = input.objects.filter((o) => o.typographyBlock);
  const base = buildTypographyFidelityContract({ runId: input.runId, pairId: input.pairId });
  return {
    ...base,
    id: `tfc-eb-${input.runId}`,
    styles: [
      ...base.styles,
      ...textObjects.slice(0, 6).map((o) => ({
        role: o.semanticRole,
        ownership: o.ownership === 'SITE_00_HOST' ? ('SITE_00_HOST' as const) : ('ACTIVE_PROJECT' as const),
        fontFamily: o.ownership === 'SITE_00_HOST' ? 'Martian Mono' : 'NDXBOOK_EXPRESSIVE',
        weight: o.visualImportance === 'CRITICAL' ? 700 : 500,
        sizePx: Math.max(10, Math.round(o.h * 0.45)),
        casing: o.typographyBlock!.casing === 'UNKNOWN' ? 'MIXED' : o.typographyBlock!.casing,
        lineCount: o.typographyBlock!.lineCount,
        lineWidthPx: o.typographyBlock!.approximateLineWidthPx,
      })),
    ],
  };
}

export type ExactBoundaryDerivationOutput = {
  bundle: DesignWorkspaceDerivationArtifactBundle;
  mobileAnalysis: ExactBoundaryAnalysis;
  desktopAnalysis: ExactBoundaryAnalysis;
  artifactExtras: Record<string, unknown>;
  visualCoverageGatePass: boolean;
  geometryFidelityGatePass: boolean;
  algorithm: typeof DERIVATION_ALGORITHM_R6F2;
};

export async function buildExactBoundaryDerivationBundle(input: {
  runId: string;
  pairId: string;
  pairChecksum: string;
  mobile: ViewportMasterAuthority;
  desktop: ViewportMasterAuthority;
  featureManifestVersion: string;
  projectCreativeContextVersion: string;
  translationApproved?: boolean;
  correctionInProgress?: boolean;
  priorPackageId?: string | null;
}): Promise<ExactBoundaryDerivationOutput> {
  const mobileAnalysis = await analyzeExactBoundaryAuthority({
    runId: input.runId,
    master: input.mobile,
    featureManifestVersion: input.featureManifestVersion,
    projectCreativeContextVersion: input.projectCreativeContextVersion,
  });
  const desktopAnalysis = await analyzeExactBoundaryAuthority({
    runId: input.runId,
    master: input.desktop,
    featureManifestVersion: input.featureManifestVersion,
    projectCreativeContextVersion: input.projectCreativeContextVersion,
  });

  const mobilePg = await import('./pixelGroundedAuthorityAnalysis.js').then((m) =>
    m.analyzePixelGroundedAuthority({
      runId: input.runId,
      master: input.mobile,
      featureManifestVersion: input.featureManifestVersion,
      projectCreativeContextVersion: input.projectCreativeContextVersion,
    }),
  );
  const desktopPg = await import('./pixelGroundedAuthorityAnalysis.js').then((m) =>
    m.analyzePixelGroundedAuthority({
      runId: input.runId,
      master: input.desktop,
      featureManifestVersion: input.featureManifestVersion,
      projectCreativeContextVersion: input.projectCreativeContextVersion,
    }),
  );

  const mobileGranularity = auditObjectGranularity({ viewport: 'MOBILE', analysis: mobilePg, runId: input.runId });
  const desktopGranularity = auditObjectGranularity({ viewport: 'DESKTOP', analysis: desktopPg, runId: input.runId });
  const mobileCoverage = buildAuthorityVisualCoverageReceipt({ analysis: mobilePg, runId: input.runId });
  const desktopCoverage = buildAuthorityVisualCoverageReceipt({ analysis: desktopPg, runId: input.runId });
  const mobileWeighted = buildWeightedAuthorityCoverageReceipt({ analysis: mobilePg, coverage: mobileCoverage, runId: input.runId });
  const desktopWeighted = buildWeightedAuthorityCoverageReceipt({ analysis: desktopPg, coverage: desktopCoverage, runId: input.runId });
  const coverageGate = runAuthorityVisualCoverageGate({
    mobile: mobileCoverage,
    desktop: desktopCoverage,
    mobileWeighted,
    desktopWeighted,
    mobileGranularity,
    desktopGranularity,
  });

  const geometryGate = runGeometryFidelityGate({
    mobile: mobileAnalysis.geometryFidelityReceipt,
    desktop: desktopAnalysis.geometryFidelityReceipt,
  });

  const allObjects = [...mobileAnalysis.measuredObjects, ...desktopAnalysis.measuredObjects] as PixelMeasuredObject[];
  const surgicalObjectMap: PixelGroundedSurgicalObjectMap = {
    id: `som-eb-${input.runId}`,
    authorityPairId: input.pairId,
    objects: allObjects,
    relationships: [
      ...extractPixelGroundedRelationships(mobileAnalysis.measuredObjects as PixelMeasuredObject[]),
      ...extractPixelGroundedRelationships(desktopAnalysis.measuredObjects as PixelMeasuredObject[]),
    ],
    version: 2,
    derivationAlgorithm: 'R6F2',
  };

  const structuralBlueprint = buildBlueprintFromExactFixed({
    runId: input.runId,
    pairId: input.pairId,
    mobile: input.mobile,
    desktop: input.desktop,
    mobileAnalysis,
    desktopAnalysis,
  });

  const featureBindings = reconcileFeatureBindings({
    runId: input.runId,
    mobileObjects: mobileAnalysis.measuredObjects as PixelMeasuredObject[],
    desktopObjects: desktopAnalysis.measuredObjects as PixelMeasuredObject[],
  });

  const canonicalAssetManifest = buildCanonicalAssetManifest({ runId: input.runId, pairId: input.pairId, objectMap: surgicalObjectMap });
  const functionBindingMap = buildFunctionBindingsHardened({ runId: input.runId, pairId: input.pairId, objects: allObjects });
  const hostProjectOwnershipMap = buildHostProjectOwnershipMap({
    runId: input.runId,
    pairId: input.pairId,
    blueprint: structuralBlueprint,
    objectMap: surgicalObjectMap,
  });
  const responsiveRelationshipContract = buildResponsiveRelationshipContract({ runId: input.runId, pairId: input.pairId });
  const typographyFidelityContract = buildTypographyFromPixels({ runId: input.runId, pairId: input.pairId, objects: allObjects });
  const stateVisualContract = buildStateVisualContract({ runId: input.runId, pairId: input.pairId });
  const interactionGeometryContract = buildInteractionGeometryContract({ runId: input.runId, pairId: input.pairId, objectMap: surgicalObjectMap });
  const implementationPrimitiveContract = buildImplementationPrimitiveContract({ runId: input.runId, pairId: input.pairId, objectMap: surgicalObjectMap });
  assertNoAuthorityRasterPrimitives(implementationPrimitiveContract);
  const reverseTraceabilityMap = buildReverseTraceabilityMap({
    runId: input.runId,
    pairId: input.pairId,
    featureBindings,
    objectMap: surgicalObjectMap,
    primitiveContract: implementationPrimitiveContract,
    functionMap: functionBindingMap,
  });

  const gatesPass = coverageGate.pass && geometryGate.pass;
  const scoped = buildScopedCompilerReadinessReceipt({
    runId: input.runId,
    pairId: input.pairId,
    visualCoverageGatePass: coverageGate.pass,
    geometryFidelityGatePass: geometryGate.pass,
    mobileCoverage,
    desktopCoverage,
    mobileGranularity,
    desktopGranularity,
    translationApproved: Boolean(input.translationApproved),
    correctionInProgress: Boolean(input.correctionInProgress),
  });

  const visualClusterMap = buildVisualClusterMap({ runId: input.runId, pairId: input.pairId, objects: allObjects });
  const responsiveObjectCorrespondence = buildResponsiveObjectCorrespondence({ runId: input.runId, pairId: input.pairId, featureBindings });

  let packageStatus: 'FOUNDER_REVIEW_READY' | 'BLOCKED' = gatesPass ? 'FOUNDER_REVIEW_READY' : 'BLOCKED';
  if (input.correctionInProgress && !geometryGate.pass) {
    packageStatus = 'BLOCKED';
  }

  const implementationPackage = buildImplementationPackage({
    runId: input.runId,
    pairId: input.pairId,
    pairChecksum: input.pairChecksum,
    featureManifestVersion: input.featureManifestVersion,
    projectCreativeContextVersion: input.projectCreativeContextVersion,
    artifactIds: {
      structuralBlueprintId: structuralBlueprint.id,
      surgicalObjectMapId: surgicalObjectMap.id,
      masterFeatureBindingIds: featureBindings.map((b) => b.id),
      canonicalAssetManifestId: canonicalAssetManifest.id,
      functionBindingMapId: functionBindingMap.id,
      hostProjectOwnershipMapId: hostProjectOwnershipMap.id,
      responsiveRelationshipContractId: responsiveRelationshipContract.id,
      typographyFidelityContractId: typographyFidelityContract.id,
      stateVisualContractId: stateVisualContract.id,
      interactionGeometryContractId: interactionGeometryContract.id,
      implementationPrimitiveContractId: implementationPrimitiveContract.id,
      reverseTraceabilityMapId: reverseTraceabilityMap.id,
      compilerReadinessReceiptId: scoped.receipt.id,
    },
    receipt: scoped.receipt,
    packageStatus,
    packageExtensions: {
      derivationAlgorithm: 'R6F2',
      pixelGroundedAnalysisMobileId: mobileAnalysis.id,
      pixelGroundedAnalysisDesktopId: desktopAnalysis.id,
      objectGranularityReceiptMobileId: mobileGranularity.id,
      objectGranularityReceiptDesktopId: desktopGranularity.id,
      authorityVisualCoverageReceiptMobileId: mobileCoverage.id,
      authorityVisualCoverageReceiptDesktopId: desktopCoverage.id,
      weightedAuthorityCoverageReceiptMobileId: mobileWeighted.id,
      weightedAuthorityCoverageReceiptDesktopId: desktopWeighted.id,
      visualClusterMapId: visualClusterMap.id,
      responsiveObjectCorrespondenceMapId: responsiveObjectCorrespondence.id,
      exactBoundaryAnalysisMobileId: mobileAnalysis.id,
      exactBoundaryAnalysisDesktopId: desktopAnalysis.id,
      geometryFidelityReceiptMobileId: mobileAnalysis.geometryFidelityReceipt.id,
      geometryFidelityReceiptDesktopId: desktopAnalysis.geometryFidelityReceipt.id,
      priorImplementationPackageId: input.priorPackageId ?? null,
      derivationVersion: 2,
    },
  });

  const bundle: DesignWorkspaceDerivationArtifactBundle = {
    structuralBlueprint,
    surgicalObjectMap,
    featureBindings,
    canonicalAssetManifest,
    functionBindingMap,
    hostProjectOwnershipMap,
    responsiveRelationshipContract,
    typographyFidelityContract,
    stateVisualContract,
    interactionGeometryContract,
    implementationPrimitiveContract,
    reverseTraceabilityMap,
    compilerReadinessReceipt: scoped.receipt,
    implementationPackage,
  };

  const artifactExtras: Record<string, unknown> = {
    [mobileAnalysis.id]: mobileAnalysis,
    [desktopAnalysis.id]: desktopAnalysis,
    [mobileAnalysis.geometryFidelityReceipt.id]: mobileAnalysis.geometryFidelityReceipt,
    [desktopAnalysis.geometryFidelityReceipt.id]: desktopAnalysis.geometryFidelityReceipt,
    [mobileGranularity.id]: mobileGranularity,
    [desktopGranularity.id]: desktopGranularity,
    [mobileCoverage.id]: mobileCoverage,
    [desktopCoverage.id]: desktopCoverage,
    [mobileWeighted.id]: mobileWeighted,
    [desktopWeighted.id]: desktopWeighted,
    [visualClusterMap.id]: visualClusterMap,
    [responsiveObjectCorrespondence.id]: responsiveObjectCorrespondence,
    [`readiness-scopes-${input.runId}`]: scoped,
    [`geometry-gate-${input.runId}`]: geometryGate,
  };

  return {
    bundle,
    mobileAnalysis,
    desktopAnalysis,
    artifactExtras,
    visualCoverageGatePass: coverageGate.pass,
    geometryFidelityGatePass: geometryGate.pass,
    algorithm: DERIVATION_ALGORITHM_R6F2,
  };
}

export { P0_VR_TWIN_V30R6F2_LINEAGE };
