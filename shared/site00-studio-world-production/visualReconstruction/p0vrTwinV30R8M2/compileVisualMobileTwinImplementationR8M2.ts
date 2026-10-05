import type { MobileTwinStructuredCompilerInput } from '../p0vrTwinV30R8M/types.js';
import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import { loadStructuredBundle } from '../p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { assertNdxbookProjectContext, resolveImplementationAuthorities } from '../p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { scanDocumentForSemanticLabelViolations } from '../p0vrTwinV30R8M1/semanticDebugLabelFirewall.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../p0vrTwinV30/constants.js';
import {
  MOBILE_TWIN_IMPLEMENTATION_VERSION,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION,
  P0_VR_TWIN_V30R8M2_LINEAGE,
  R8M1_CORRECTION_REQUIRED_REASON,
} from './constants.js';
import { translateVisualImplementationR8M2 } from './visualImplementationTranslatorR8M2.js';
import { buildActualImplementationRegionMap } from './actualImplementationRegionMap.js';
import {
  buildRegionFidelityReceipts,
  evaluateVisualFidelityFromRegionReceipts,
} from './implementationRegionFidelityReceipt.js';
import { scanDocumentForAuthorityRasterViolations } from './runtimeAuthorityRasterFirewall.js';

export function compileVisualMobileTwinImplementationR8M2(
  input: MobileTwinStructuredCompilerInput,
): CompiledMobileTwinImplementationDocument {
  const { pipeline, packageId } = input;
  const pkg = pipeline.packages.find((p) => p.id === packageId);
  if (!pkg) throw new Error('MOBILE_TWIN_PACKAGE_MISSING');
  if (pkg.status !== 'APPROVED') throw new Error('MOBILE_TWIN_PACKAGE_NOT_APPROVED');

  const authorities = resolveImplementationAuthorities(pipeline, pkg);
  assertNdxbookProjectContext(authorities.projectContextVersion);

  const { composition, bundle } = loadStructuredBundle(pipeline, pkg);
  const translated = translateVisualImplementationR8M2({
    pipeline,
    pkg,
    composition,
    bundle,
    authorities,
  });

  const semanticLabelViolations = scanDocumentForSemanticLabelViolations(translated.nodes);
  if (semanticLabelViolations.length) {
    throw new Error(`SEMANTIC_DEBUG_LABEL_RENDERED:${semanticLabelViolations.join(',')}`);
  }

  const rasterViolations = scanDocumentForAuthorityRasterViolations(translated.nodes.map((n) => n.imageUri));
  if (rasterViolations.length) {
    throw new Error(`AUTHORITY_RASTER_REGION_RUNTIME_VIOLATION:${rasterViolations.join('|')}`);
  }

  const regionMap = buildActualImplementationRegionMap(composition);
  const regionFidelityReceipts = buildRegionFidelityReceipts({
    regions: regionMap,
    document: {
      renderTree: translated.renderTree,
      nodes: translated.nodes,
    } as CompiledMobileTwinImplementationDocument,
    assetTraces: translated.assetTraces,
  });
  const fidelity = evaluateVisualFidelityFromRegionReceipts(regionFidelityReceipts);

  return {
    lineage: P0_VR_TWIN_V30R8M2_LINEAGE,
    compilerGeneration: MOBILE_TWIN_IMPL_COMPILER_GENERATION,
    implementationVersion: MOBILE_TWIN_IMPLEMENTATION_VERSION,
    viewport: 'MOBILE',
    widthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    heightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    nodes: translated.nodes,
    renderTree: translated.renderTree,
    authoritiesLoaded: authorities,
    semanticLabelViolations: [],
    priorBuildCorrection: {
      priorGeneration: 'R8M1',
      reason: R8M1_CORRECTION_REQUIRED_REASON,
      status: 'CORRECTION_REQUIRED',
    },
    regionFidelityReceipts,
    actualImplementationRegionMap: regionMap,
    assetTraceability: translated.assetTraces,
    unresolvedAssetBindings: translated.unresolvedAssetBindings,
    visualFidelityEvaluation: fidelity,
    sourceArtifactIds: [
      pkg.id,
      bundle.surgicalBlueprint.id,
      bundle.objectMap.id,
      bundle.canonicalAssetManifest.id,
      authorities.actualRenderId,
      authorities.blueprintRenderId,
      composition.id,
    ],
    forbiddenPrimitiveScan: { violations: [], count: 0 },
    structuredSource: 'COMPOSITION_AND_PACKAGE_ARTIFACTS',
  };
}
