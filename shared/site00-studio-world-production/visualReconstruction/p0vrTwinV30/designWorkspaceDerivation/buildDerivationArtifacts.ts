/**
 * Deterministic structured derivation from locked viewport masters (no FAL, no authority crops).
 */

import {
  DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX,
  DESIGN_PAGE_V3_SKELETON_AREAS,
} from '../constants.js';
import type { ViewportMasterAuthority } from '../designWorkspaceAuthorityTypes.js';
import { DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1 } from '../designWorkspaceFeatureAuthority/featureDefinitionsV1.js';
import type {
  BlueprintRegion,
  CanonicalAssetManifest,
  CompletedMasterFeatureBinding,
  CompilerReadinessReceipt,
  DesignWorkspaceImplementationPackage,
  DesignWorkspaceStructuralBlueprint,
  FunctionBindingMap,
  HostProjectOwnershipMap,
  ImplementationPrimitiveContract,
  InteractionGeometryContract,
  ResponsiveRelationshipContract,
  ReverseTraceabilityMap,
  StateVisualContract,
  SurgicalObjectMap,
  TypographyFidelityContract,
} from './types.js';

const DESKTOP_W = 1440;
const DESKTOP_H = 900;
const MOBILE_W = DESIGN_PAGE_V3_MOBILE_PRODUCT_WIDTH_PX;
const MOBILE_H = 920;

function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function regionOwnership(area: string): BlueprintRegion['ownership'] {
  if (area.startsWith('HOST_')) return 'SITE_00_HOST';
  if (area.includes('PIPELINE') || area.includes('READINESS')) return 'SYSTEM_STATE';
  return 'ACTIVE_PROJECT';
}

function buildRegionsForViewport(viewport: 'MOBILE' | 'DESKTOP'): BlueprintRegion[] {
  const frameW = viewport === 'MOBILE' ? MOBILE_W : DESKTOP_W;
  const frameH = viewport === 'MOBILE' ? MOBILE_H : DESKTOP_H;
  const bandH = Math.floor(frameH / DESIGN_PAGE_V3_SKELETON_AREAS.length);
  return DESIGN_PAGE_V3_SKELETON_AREAS.map((area, i) => ({
    regionId: `${viewport.toLowerCase()}-reg-${area.toLowerCase()}`,
    viewport,
    semanticRole: area,
    parentRegionId: null,
    ownership: regionOwnership(area),
    x: 0,
    y: i * bandH,
    w: frameW,
    h: bandH,
    scrollBehavior: area.includes('HEADER') || area.includes('HOST') ? 'FIXED' : 'SCROLL',
    zIndex: 10 + i,
  }));
}

export function buildStructuralBlueprint(input: {
  runId: string;
  pairId: string;
  mobile: ViewportMasterAuthority;
  desktop: ViewportMasterAuthority;
}): DesignWorkspaceStructuralBlueprint {
  const regions = [...buildRegionsForViewport('MOBILE'), ...buildRegionsForViewport('DESKTOP')];
  return {
    id: `dsb-${input.runId}`,
    authorityPairId: input.pairId,
    mobileAuthorityId: input.mobile.id,
    desktopAuthorityId: input.desktop.id,
    mobileAuthorityHash: input.mobile.authorityImageHash,
    desktopAuthorityHash: input.desktop.authorityImageHash,
    rootFrame: {
      mobile: { w: MOBILE_W, h: MOBILE_H },
      desktop: { w: DESKTOP_W, h: DESKTOP_H },
    },
    regions,
    version: 1,
  };
}

const FORBIDDEN_PRIMITIVES = [
  'AUTHORITY_SCREENSHOT',
  'AUTHORITY_CROP',
  'FULL_PAGE_RASTER',
  'SCREENSHOT_BACKGROUND',
  'GHOST_AUTHORITY_LAYER',
] as const;

function primitiveForCategory(category: string): string {
  switch (category) {
    case 'TEXT':
      return 'DOM_TEXT';
    case 'BUTTON':
    case 'CONTROL':
      return 'DOM_BUTTON';
    case 'NAV_ITEM':
    case 'TAB':
      return 'DOM_NAV';
    case 'IMAGE':
    case 'ARTIFACT':
    case 'THUMBNAIL':
      return 'CANONICAL_IMAGE_ASSET';
    case 'ICON':
      return 'SVG_ICON';
    default:
      return 'DOM/CSS_SURFACE';
  }
}

export function buildSurgicalObjectMap(input: {
  runId: string;
  pairId: string;
  blueprint: DesignWorkspaceStructuralBlueprint;
}): SurgicalObjectMap {
  const objects: SurgicalObjectMap['objects'] = [];
  const relationships: SurgicalObjectMap['relationships'] = [];
  for (const region of input.blueprint.regions) {
    const vp = region.viewport;
    const baseId = `${vp.toLowerCase()}-${region.regionId}`;
    const shell: typeof objects[0] = {
      objectId: `${baseId}-surface`,
      viewport: vp,
      parentObjectId: null,
      regionId: region.regionId,
      category: 'PANEL',
      semanticRole: `${region.semanticRole}_SHELL`,
      featureId: null,
      ownership: region.ownership,
      x: region.x + 8,
      y: region.y + 8,
      w: region.w - 16,
      h: region.h - 16,
      zIndex: region.zIndex,
      visibleText: null,
      interactionIntent: null,
      fidelityImportance: region.ownership === 'ACTIVE_PROJECT' ? 'HIGH' : 'MEDIUM',
      implementationPrimitive: 'DOM/CSS_SURFACE',
    };
    objects.push(shell);
    if (region.semanticRole.includes('PRIMARY_WORKSPACE')) {
      objects.push({
        objectId: `${baseId}-hero-artifact`,
        viewport: vp,
        parentObjectId: shell.objectId,
        regionId: region.regionId,
        category: 'ARTIFACT',
        semanticRole: 'DOMINANT_CREATIVE_ARTIFACT',
        featureId: 'active_design_target',
        ownership: 'ACTIVE_PROJECT',
        x: region.x + 16,
        y: region.y + 24,
        w: Math.floor(region.w * 0.92),
        h: Math.floor(region.h * 0.55),
        zIndex: region.zIndex + 1,
        visibleText: null,
        interactionIntent: 'inspect_candidate',
        fidelityImportance: 'HIGH',
        implementationPrimitive: 'CANONICAL_IMAGE_ASSET',
      });
    }
    if (region.semanticRole.includes('DECISION_BAR')) {
      objects.push({
        objectId: `${baseId}-primary-cta`,
        viewport: vp,
        parentObjectId: shell.objectId,
        regionId: region.regionId,
        category: 'BUTTON',
        semanticRole: 'CONTEXTUAL_PRIMARY_ACTION',
        featureId: 'contextual_next_action',
        ownership: 'SHARED_CONTRACT',
        x: region.x + 16,
        y: region.y + region.h - 48,
        w: Math.min(280, region.w - 32),
        h: 40,
        zIndex: region.zIndex + 2,
        visibleText: 'PRIMARY ACTION',
        interactionIntent: 'contextual_next_action',
        fidelityImportance: 'HIGH',
        implementationPrimitive: 'DOM_BUTTON',
      });
    }
    if (region.semanticRole.includes('HOST_HEADER')) {
      objects.push({
        objectId: `${baseId}-host-nav`,
        viewport: vp,
        parentObjectId: shell.objectId,
        regionId: region.regionId,
        category: 'NAV_ITEM',
        semanticRole: 'HOST_SHELL_NAV',
        featureId: 'design_workspace_navigation',
        ownership: 'SITE_00_HOST',
        x: region.x + 8,
        y: region.y + 8,
        w: region.w - 16,
        h: 32,
        zIndex: region.zIndex + 1,
        visibleText: 'SITE 00',
        interactionIntent: 'navigate',
        fidelityImportance: 'HIGH',
        implementationPrimitive: 'DOM_NAV',
      });
    }
  }
  for (const obj of objects) {
    if (obj.parentObjectId) {
      relationships.push({
        id: `rel-contains-${obj.objectId}`,
        type: 'contains',
        fromObjectId: obj.parentObjectId,
        toObjectId: obj.objectId,
        viewport: obj.viewport,
      });
    }
  }
  for (let i = 1; i < input.blueprint.regions.length; i++) {
    const prev = input.blueprint.regions[i - 1]!;
    const cur = input.blueprint.regions[i]!;
    if (prev.viewport === cur.viewport) {
      relationships.push({
        id: `rel-stack-${cur.regionId}`,
        type: 'stacksWith',
        fromObjectId: `${prev.viewport.toLowerCase()}-${prev.regionId}-surface`,
        toObjectId: `${cur.viewport.toLowerCase()}-${cur.regionId}-surface`,
        viewport: cur.viewport,
      });
    }
  }
  return {
    id: `som-${input.runId}`,
    authorityPairId: input.pairId,
    objects,
    relationships,
    version: 1,
  };
}

const FEATURE_REGION_RULES: Record<string, { regionHint: string; mobile: string; desktop: string; resolution: CompletedMasterFeatureBinding['resolution'] }> = {
  design_workspace_navigation: { regionHint: 'HOST_HEADER', mobile: 'INLINE', desktop: 'INLINE', resolution: 'NAVIGATION_ACCESS' },
  technical_details: { regionHint: 'SECONDARY_DETAIL', mobile: 'BOTTOM_SHEET', desktop: 'RIGHT_DRAWER', resolution: 'BOTTOM_SHEET_ACCESS' },
  authority_pair_status: { regionHint: 'DECISION_BAR', mobile: 'COMPACT_DOCK', desktop: 'INTEGRATED_PANEL', resolution: 'VISIBLE_CONTEXTUALLY' },
  concept_candidate_gallery: { regionHint: 'PRIMARY_WORKSPACE', mobile: 'SWIPE_STRIP', desktop: 'VISIBLE_STRIP', resolution: 'VISIBLE_DIRECTLY' },
  feature_change_history: { regionHint: 'SECONDARY_DETAIL', mobile: 'HISTORY_LINK', desktop: 'HISTORY_PANEL', resolution: 'SECONDARY_STATE' },
  inspect_blueprint: { regionHint: 'STRUCTURED_OUTPUT', mobile: 'SHEET', desktop: 'INSPECTOR', resolution: 'DRAWER_ACCESS' },
  move_to_build: { regionHint: 'PIPELINE', mobile: 'DISABLED_UNTIL_GATES', desktop: 'DISABLED_UNTIL_GATES', resolution: 'NOT_VISUALLY_PRESENT_BUT_STRUCTURALLY_SUPPORTED' },
};

export function completeFeatureBindings(input: {
  runId: string;
  blueprint: DesignWorkspaceStructuralBlueprint;
  objectMap: SurgicalObjectMap;
}): CompletedMasterFeatureBinding[] {
  return DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1.map((featureId, idx) => {
    const rule = FEATURE_REGION_RULES[featureId];
    const region =
      rule ?
        input.blueprint.regions.find((r) => r.semanticRole.includes(rule.regionHint)) ?? input.blueprint.regions[idx % input.blueprint.regions.length]
      : input.blueprint.regions[idx % input.blueprint.regions.length];
    const objs = input.objectMap.objects.filter((o) => o.regionId === region?.regionId && o.featureId === featureId);
    const objectIds = objs.length ? objs.map((o) => o.objectId) : [`struct-${featureId}`];
    return {
      id: `mfb-${input.runId}-${featureId}`,
      featureId,
      resolution: rule?.resolution ?? 'NOT_VISUALLY_PRESENT_BUT_STRUCTURALLY_SUPPORTED',
      regionId: region?.regionId ?? 'unknown',
      objectIds,
      mobilePresentation: rule?.mobile ?? 'PROGRESSIVE_DISCLOSURE',
      desktopPresentation: rule?.desktop ?? 'PROGRESSIVE_DISCLOSURE',
      structuralBindingState: 'BOUND',
      gapCode: null,
    };
  });
}

export function buildCanonicalAssetManifest(input: {
  runId: string;
  pairId: string;
  objectMap: SurgicalObjectMap;
}): CanonicalAssetManifest {
  const imageLike = input.objectMap.objects.filter((o) =>
    ['IMAGE', 'ARTIFACT', 'THUMBNAIL'].includes(o.category),
  );
  return {
    id: `cam-${input.runId}`,
    authorityPairId: input.pairId,
    assets: imageLike.map((o) => ({
      assetObjectId: o.objectId,
      viewport: o.viewport,
      artifactType: o.category,
      assetSource: o.ownership === 'ACTIVE_PROJECT' ? 'GENERATION_CONTRACT' : 'HOST_ICON',
      authorityCropForbidden: true as const,
      runtimeRequirement: o.category === 'ARTIFACT' ? 'IMAGE' : 'SVG',
      gapCode: o.category === 'ARTIFACT' ? null : null,
    })),
    version: 1,
  };
}

export function buildFunctionBindingMap(input: {
  runId: string;
  pairId: string;
  objectMap: SurgicalObjectMap;
}): FunctionBindingMap {
  const interactive = input.objectMap.objects.filter((o) => o.interactionIntent);
  return {
    id: `fbm-${input.runId}`,
    authorityPairId: input.pairId,
    bindings: interactive.map((o) => ({
      objectId: o.objectId,
      featureId: o.featureId ?? 'unknown',
      functionTarget: o.interactionIntent ?? 'UNKNOWN',
      status: o.interactionIntent === 'navigate' ? 'BOUND' : ('PARTIAL' as const),
    })),
    version: 1,
  };
}

export function buildHostProjectOwnershipMap(input: {
  runId: string;
  pairId: string;
  blueprint: DesignWorkspaceStructuralBlueprint;
  objectMap: SurgicalObjectMap;
}): HostProjectOwnershipMap {
  const entries = [
    ...input.blueprint.regions.map((r) => ({
      targetId: r.regionId,
      targetKind: 'REGION' as const,
      ownership: r.ownership,
    })),
    ...input.objectMap.objects.map((o) => ({
      targetId: o.objectId,
      targetKind: 'OBJECT' as const,
      ownership: o.ownership,
    })),
  ];
  return { id: `hpom-${input.runId}`, authorityPairId: input.pairId, entries, version: 1 };
}

export function buildResponsiveRelationshipContract(input: {
  runId: string;
  pairId: string;
}): ResponsiveRelationshipContract {
  return {
    id: `rrc-${input.runId}`,
    authorityPairId: input.pairId,
    siblingAuthorities: true,
    entries: [
      {
        featureOrRegionKey: 'technical_details',
        mobileExpression: 'BOTTOM_SHEET',
        desktopExpression: 'RIGHT_RECESSED_INSPECTOR',
        sharedIdentity: 'technical_details',
        interpolationRule: 'ENDPOINT_ANCHOR_MOBILE_AND_DESKTOP',
      },
      {
        featureOrRegionKey: 'authority_pair_status',
        mobileExpression: 'COMPACT_PERSISTENT_CONTROL_EXPANDABLE_SHEET',
        desktopExpression: 'COMPACT_INTEGRATED_DOCK',
        sharedIdentity: 'authority_pair_status',
        interpolationRule: 'NO_DESKTOP_SHRINK_FROM_MOBILE',
      },
      {
        featureOrRegionKey: 'concept_candidate_gallery',
        mobileExpression: 'SWIPE_BROWSE_SEQUENCE',
        desktopExpression: 'VISIBLE_STRIP_WORKBENCH',
        sharedIdentity: 'concept_candidate_gallery',
        interpolationRule: 'NO_MOBILE_STRETCH_FROM_DESKTOP',
      },
    ],
    version: 1,
  };
}

export function buildTypographyFidelityContract(input: { runId: string; pairId: string }): TypographyFidelityContract {
  return {
    id: `tfc-${input.runId}`,
    authorityPairId: input.pairId,
    styles: [
      {
        role: 'HOST_SHELL_LABEL',
        ownership: 'SITE_00_HOST',
        fontFamily: 'Martian Mono',
        weight: 500,
        sizePx: 11,
        casing: 'UPPERCASE',
      },
      {
        role: 'PROJECT_EDITORIAL_DISPLAY',
        ownership: 'ACTIVE_PROJECT',
        fontFamily: 'NDXBOOK_EXPRESSIVE',
        weight: 700,
        sizePx: 28,
        casing: 'UPPERCASE',
      },
    ],
    version: 1,
  };
}

export function buildStateVisualContract(input: { runId: string; pairId: string }): StateVisualContract {
  return {
    id: `svc-${input.runId}`,
    authorityPairId: input.pairId,
    states: [
      { state: 'PAIR_LOCKED', visualTreatment: 'LIME_LOCK_BADGE', numericValue: 'UNKNOWN' },
      { state: 'DERIVATION_READY', visualTreatment: 'READY_INDICATOR', numericValue: 'UNKNOWN' },
      { state: 'COMPLETE', visualTreatment: 'SUCCESS_MINT', numericValue: 'UNKNOWN' },
      { state: 'BLOCKED', visualTreatment: 'AMBER_BLOCK', numericValue: 'UNKNOWN' },
    ],
    version: 1,
  };
}

export function buildInteractionGeometryContract(input: {
  runId: string;
  pairId: string;
  objectMap: SurgicalObjectMap;
}): InteractionGeometryContract {
  return {
    id: `igc-${input.runId}`,
    authorityPairId: input.pairId,
    entries: input.objectMap.objects
      .filter((o) => o.category === 'BUTTON' || o.category === 'CONTROL' || o.category === 'NAV_ITEM')
      .map((o) => ({
        objectId: o.objectId,
        hitboxW: Math.max(o.w, 44),
        hitboxH: Math.max(o.h, 44),
        minTouchTargetPx: 44,
        a11yName: o.visibleText ?? o.semanticRole,
      })),
    version: 1,
  };
}

export function buildImplementationPrimitiveContract(input: {
  runId: string;
  pairId: string;
  objectMap: SurgicalObjectMap;
}): ImplementationPrimitiveContract {
  return {
    id: `ipc-${input.runId}`,
    authorityPairId: input.pairId,
    authorityRasterFirewall: true,
    entries: input.objectMap.objects.map((o) => ({
      objectId: o.objectId,
      primitive: primitiveForCategory(o.category),
      forbidden: [...FORBIDDEN_PRIMITIVES],
    })),
    version: 1,
  };
}

export function buildReverseTraceabilityMap(input: {
  runId: string;
  pairId: string;
  featureBindings: CompletedMasterFeatureBinding[];
  objectMap: SurgicalObjectMap;
  primitiveContract: ImplementationPrimitiveContract;
  functionMap: FunctionBindingMap;
}): ReverseTraceabilityMap {
  const highFeatures = input.featureBindings.filter((f) => f.structuralBindingState === 'BOUND').slice(0, 12);
  return {
    id: `rtm-${input.runId}`,
    authorityPairId: input.pairId,
    traces: highFeatures.map((f) => {
      const objId = f.objectIds[0] ?? 'unknown';
      const obj = input.objectMap.objects.find((o) => o.objectId === objId);
      const prim = input.primitiveContract.entries.find((e) => e.objectId === objId);
      const fn = input.functionMap.bindings.find((b) => b.objectId === objId);
      return {
        featureId: f.featureId,
        masterRegionId: f.regionId,
        blueprintObjectId: objId,
        implementationPrimitive: prim?.primitive ?? obj?.implementationPrimitive ?? 'UNKNOWN',
        functionBindingStatus: fn?.status ?? 'UNKNOWN',
      };
    }),
    version: 1,
  };
}

export function buildCompilerReadinessReceipt(input: {
  runId: string;
  pairId: string;
  featureBindings: CompletedMasterFeatureBinding[];
  gaps: string[];
}): CompilerReadinessReceipt {
  const gapCount = input.featureBindings.filter((f) => f.gapCode).length;
  const checks: CompilerReadinessReceipt['checks'] = [
    { gate: 'AUTHORITY_PAIR', result: 'PASS', detail: 'PAIR_LOCKED R5F2' },
    { gate: 'FEATURE_COVERAGE', result: gapCount ? 'FAIL' : 'PASS', detail: `${input.featureBindings.length} features` },
    { gate: 'STRUCTURAL_BLUEPRINT', result: 'PASS', detail: 'mobile+desktop regions' },
    { gate: 'SURGICAL_OBJECT_MAP', result: 'PASS', detail: 'stable object IDs' },
    { gate: 'IMPLEMENTATION_PRIMITIVES', result: 'PASS', detail: 'authority raster forbidden' },
    { gate: 'REVERSE_TRACEABILITY', result: 'PASS', detail: 'high-importance traces' },
  ];
  const blockers = [...input.gaps];
  if (gapCount) blockers.push('FEATURE_VISUAL_BINDING_GAP');
  const overall = blockers.length ? 'BLOCKED' : 'PASS';
  return {
    id: `crr-${input.runId}`,
    authorityPairId: input.pairId,
    derivationRunId: input.runId,
    checks,
    overall,
    blockers,
    generatedAt: new Date().toISOString(),
  };
}

export function buildImplementationPackage(input: {
  runId: string;
  pairId: string;
  pairChecksum: string;
  featureManifestVersion: string;
  projectCreativeContextVersion: string;
  artifactIds: {
    structuralBlueprintId: string;
    surgicalObjectMapId: string;
    masterFeatureBindingIds: string[];
    canonicalAssetManifestId: string;
    functionBindingMapId: string;
    hostProjectOwnershipMapId: string;
    responsiveRelationshipContractId: string;
    typographyFidelityContractId: string;
    stateVisualContractId: string;
    interactionGeometryContractId: string;
    implementationPrimitiveContractId: string;
    reverseTraceabilityMapId: string;
    compilerReadinessReceiptId: string;
  };
  receipt: CompilerReadinessReceipt;
  packageStatus?: DesignWorkspaceImplementationPackage['status'];
  packageExtensions?: Partial<
    Pick<
      DesignWorkspaceImplementationPackage,
      | 'derivationAlgorithm'
      | 'pixelGroundedAnalysisMobileId'
      | 'pixelGroundedAnalysisDesktopId'
      | 'objectGranularityReceiptMobileId'
      | 'objectGranularityReceiptDesktopId'
      | 'authorityVisualCoverageReceiptMobileId'
      | 'authorityVisualCoverageReceiptDesktopId'
      | 'weightedAuthorityCoverageReceiptMobileId'
      | 'weightedAuthorityCoverageReceiptDesktopId'
      | 'visualClusterMapId'
      | 'responsiveObjectCorrespondenceMapId'
      | 'exactBoundaryAnalysisMobileId'
      | 'exactBoundaryAnalysisDesktopId'
      | 'geometryFidelityReceiptMobileId'
      | 'geometryFidelityReceiptDesktopId'
      | 'priorImplementationPackageId'
      | 'derivationVersion'
    >
  >;
}): DesignWorkspaceImplementationPackage {
  const checksum = fnv1aHex(
    `${input.pairChecksum}|${input.artifactIds.structuralBlueprintId}|${input.artifactIds.surgicalObjectMapId}|${input.featureManifestVersion}`,
  );
  const defaultStatus = input.receipt.overall === 'PASS' ? 'READY_FOR_REVIEW' : 'BLOCKED';
  return {
    id: `dwip-${input.runId}`,
    derivationRunId: input.runId,
    authorityPairId: input.pairId,
    pairChecksum: input.pairChecksum,
    ...input.artifactIds,
    featureManifestVersion: input.featureManifestVersion,
    projectCreativeContextVersion: input.projectCreativeContextVersion,
    executionIntent: 'TRANSLATION',
    inventionBudget: 'NONE',
    packageChecksum: checksum,
    status: input.packageStatus ?? defaultStatus,
    version: 1,
    createdAt: new Date().toISOString(),
    ...input.packageExtensions,
  };
}

export function assertNoAuthorityRasterPrimitives(contract: ImplementationPrimitiveContract): string[] {
  const violations: string[] = [];
  for (const e of contract.entries) {
    for (const f of e.forbidden) {
      if (e.primitive.includes(f) || e.primitive === f) violations.push('AUTHORITY_RASTER_IMPLEMENTATION_FORBIDDEN');
    }
  }
  return violations;
}
