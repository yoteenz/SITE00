import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileTwinStructuredCompilerInput } from '../p0vrTwinV30R8M/types.js';
import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import { loadStructuredBundle } from '../p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { P0_VR_TWIN_V30R8M1_LINEAGE, MOBILE_TWIN_IMPL_COMPILER_GENERATION } from './constants.js';
import { assertNdxbookProjectContext, resolveImplementationAuthorities } from './resolveImplementationAuthorities.js';
import { scanDocumentForSemanticLabelViolations } from './semanticDebugLabelFirewall.js';
import { translateVisualImplementation } from './visualImplementationTranslator.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../p0vrTwinV30/constants.js';

export function compileVisualMobileTwinImplementation(
  input: MobileTwinStructuredCompilerInput,
): CompiledMobileTwinImplementationDocument {
  const { pipeline, packageId } = input;
  const pkg = pipeline.packages.find((p) => p.id === packageId);
  if (!pkg) throw new Error('MOBILE_TWIN_PACKAGE_MISSING');
  if (pkg.status !== 'APPROVED') throw new Error('MOBILE_TWIN_PACKAGE_NOT_APPROVED');

  const authorities = resolveImplementationAuthorities(pipeline, pkg);
  assertNdxbookProjectContext(authorities.projectContextVersion);

  const { composition, bundle } = loadStructuredBundle(pipeline, pkg) as {
    composition: MobileTwinCompositionState;
    bundle: MobileStructuredArtifactBundle;
  };

  const translated = translateVisualImplementation({
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

  return {
    lineage: P0_VR_TWIN_V30R8M1_LINEAGE,
    compilerGeneration: MOBILE_TWIN_IMPL_COMPILER_GENERATION,
    viewport: 'MOBILE',
    widthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    heightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    nodes: translated.nodes,
    renderTree: translated.renderTree,
    authoritiesLoaded: authorities,
    semanticLabelViolations: [],
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
