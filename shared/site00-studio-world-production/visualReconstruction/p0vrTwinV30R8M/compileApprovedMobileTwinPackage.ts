import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import type { MobileTwinCompositionState, MobileTwinPackage } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import { P0_VR_TWIN_V30R8M_LINEAGE } from './constants.js';
import { compileVisualMobileTwinImplementationR8M2R4 } from '../p0vrTwinV30R8M2R4/compileVisualMobileTwinImplementationR8M2R4.js';
import type { CompiledMobileTwinImplementationDocument, CompiledMobileTwinNode, MobileTwinStructuredCompilerInput } from './types.js';

const FORBIDDEN_RASTER_PRIMITIVES = [
  'REFERENCE_AUTHORITY_SCREENSHOT',
  'IMPLEMENTATION_RENDER_SCREENSHOT',
  'SCREENSHOT_CROP',
  'FULL_PAGE_RASTER',
  'GHOST_LAYER',
  'BACKGROUND_SCREENSHOT',
  'actual-render screenshot as page',
  'blueprint screenshot as page',
];

export function loadStructuredBundle(
  pipeline: MobileTwinStructuredCompilerInput['pipeline'],
  pkg: MobileTwinPackage,
): { composition: MobileTwinCompositionState; bundle: MobileStructuredArtifactBundle } {
  const composition = pipeline.compositionStates.find((c) => c.id === pkg.compositionStateId);
  if (!composition) throw new Error('MOBILE_COMPOSITION_STATE_MISSING');
  const sb = pipeline.artifactsById[pkg.surgicalBlueprintId] as MobileStructuredArtifactBundle['surgicalBlueprint'] | undefined;
  const om = pipeline.artifactsById[pkg.objectMapId] as MobileStructuredArtifactBundle['objectMap'] | undefined;
  if (!sb || !om) throw new Error('MOBILE_TWIN_PACKAGE_STRUCTURE_MISSING');
  const bundle: MobileStructuredArtifactBundle = {
    surgicalBlueprint: sb,
    objectMap: om,
    canonicalAssetManifest: pipeline.artifactsById[pkg.canonicalAssetManifestId] as MobileStructuredArtifactBundle['canonicalAssetManifest'],
    functionBindingMap: pipeline.artifactsById[pkg.functionBindingMapId] as MobileStructuredArtifactBundle['functionBindingMap'],
    hostProjectOwnershipMap: pipeline.artifactsById[pkg.hostProjectOwnershipMapId] as MobileStructuredArtifactBundle['hostProjectOwnershipMap'],
    implementationPrimitiveContract: pipeline.artifactsById[pkg.implementationPrimitiveContractId] as MobileStructuredArtifactBundle['implementationPrimitiveContract'],
    reverseTraceabilityMap: pipeline.artifactsById[pkg.reverseTraceabilityMapId] as MobileStructuredArtifactBundle['reverseTraceabilityMap'],
  };
  return { composition, bundle };
}

function nodeStylesForObject(obj: MobileTwinCompositionState['objectDefinitions'][number]): Record<string, string> {
  const base: Record<string, string> = {
    boxSizing: 'border-box',
    border: obj.visualImportance === 'CRITICAL' ? '1px solid rgba(10,122,62,0.35)' : '1px solid rgba(0,0,0,0.08)',
    borderRadius: obj.objectType.includes('BUTTON') ? '999px' : '4px',
    background: obj.objectType.includes('TEXT') ? 'transparent' : 'rgba(255,255,255,0.92)',
    color: '#111',
    fontSize: obj.objectType.includes('HEADLINE') ? '18px' : '14px',
    fontWeight: obj.objectType.includes('HEADLINE') ? '700' : '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: obj.objectType.includes('TEXT') ? 'flex-start' : 'center',
    padding: '4px 8px',
  };
  return base;
}

/** Legacy R8M wireframe mapper — tests / rejection history only. */
export function compileApprovedMobileTwinPackageLegacyWireframe(
  input: MobileTwinStructuredCompilerInput,
): CompiledMobileTwinImplementationDocument {
  const { pipeline, packageId } = input;
  const pkg = pipeline.packages.find((p) => p.id === packageId);
  if (!pkg) throw new Error('MOBILE_TWIN_PACKAGE_MISSING');
  if (pkg.status !== 'APPROVED') throw new Error('MOBILE_TWIN_PACKAGE_NOT_APPROVED');

  const { composition, bundle } = loadStructuredBundle(pipeline, pkg);
  const interactions = new Map(composition.interactionDefinitions.map((i) => [i.objectId, i.intent]));

  const nodes: CompiledMobileTwinNode[] = composition.objectDefinitions.map((obj) => ({
    objectId: obj.objectId,
    primitive: obj.implementationPrimitive,
    semanticRole: obj.semanticRole,
    layout: {
      leftPct: obj.normalizedX * 100,
      topPct: obj.normalizedY * 100,
      widthPct: obj.normalizedWidth * 100,
      heightPct: obj.normalizedHeight * 100,
      zIndex: obj.zIndex,
    },
    styles: nodeStylesForObject(obj),
    functionTarget: obj.functionTarget,
    featureId: obj.featureId,
    ownership: obj.ownership,
    interactionIntent: interactions.get(obj.objectId) ?? null,
  }));

  const forbidden = [
    ...FORBIDDEN_RASTER_PRIMITIVES.filter((label) =>
      nodes.some((n) => n.primitive.toUpperCase().includes(label.replace(/ /g, '_').slice(0, 12))),
    ),
    ...nodes
      .filter((n) => FORBIDDEN_RASTER_PRIMITIVES.some((f) => n.primitive.toUpperCase().includes(f.split('_')[0]!)))
      .map((n) => n.primitive),
  ];

  return {
    lineage: P0_VR_TWIN_V30R8M_LINEAGE,
    viewport: 'MOBILE',
    widthPx: 390,
    heightPx: 844,
    nodes,
    sourceArtifactIds: [
      pkg.id,
      bundle.surgicalBlueprint.id,
      bundle.objectMap.id,
      bundle.canonicalAssetManifest.id,
      bundle.functionBindingMap.id,
      bundle.hostProjectOwnershipMap.id,
      bundle.implementationPrimitiveContract.id,
      bundle.reverseTraceabilityMap.id,
      composition.id,
    ],
    forbiddenPrimitiveScan: { violations: [...new Set(forbidden)], count: forbidden.length },
    structuredSource: 'COMPOSITION_AND_PACKAGE_ARTIFACTS',
  };
}

export function assertCompilerDoesNotUseRasterAuthorities(input: {
  actualRenderUri?: string | null;
  blueprintRenderUri?: string | null;
  document: CompiledMobileTwinImplementationDocument;
}): void {
  const doc = input.document;
  if (doc.structuredSource !== 'COMPOSITION_AND_PACKAGE_ARTIFACTS') {
    throw new Error('MOBILE_TWIN_COMPILER_RASTER_SOURCE_FORBIDDEN');
  }
  for (const node of doc.nodes) {
    const p = node.primitive.toUpperCase();
    if (p.includes('SCREENSHOT') || p.includes('RASTER') || p.includes('GHOST')) {
      throw new Error('MOBILE_TWIN_COMPILER_FORBIDDEN_PRIMITIVE');
    }
  }
  void input.actualRenderUri;
  void input.actualRenderUri;
  void input.blueprintRenderUri;
}

/** Actual-first pixel-fidelity reconstruction (R8M2R4) — production twin compile path. */
export function compileApprovedMobileTwinPackage(
  input: MobileTwinStructuredCompilerInput,
): CompiledMobileTwinImplementationDocument {
  return compileVisualMobileTwinImplementationR8M2R4(input);
}
