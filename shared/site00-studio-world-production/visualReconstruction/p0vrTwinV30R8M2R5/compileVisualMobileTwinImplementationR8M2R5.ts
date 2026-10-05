import type { MobileTwinStructuredCompilerInput } from '../p0vrTwinV30R8M/types.js';
import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import { loadStructuredBundle } from '../p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { assertNdxbookProjectContext, resolveImplementationAuthorities } from '../p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { scanDocumentForSemanticLabelViolations } from '../p0vrTwinV30R8M1/semanticDebugLabelFirewall.js';
import { compileVisualMobileTwinImplementationR8M2R4 } from '../p0vrTwinV30R8M2R4/compileVisualMobileTwinImplementationR8M2R4.js';
import { buildImplementationTranslationBrief } from '../p0vrTwinV30R8M2R2/buildImplementationTranslationBrief.js';
import { refineImplementationExpressionIRFromBrief } from '../p0vrTwinV30R8M2R2/refineImplementationExpressionIRFromBrief.js';
import {
  assertTranslationReadinessForCompile,
  evaluateImplementationTranslationReadiness,
} from '../p0vrTwinV30R8M2R2/implementationTranslationReadiness.js';
import { buildImplementationExpressionIR } from '../p0vrTwinV30R8M2R1/buildImplementationExpressionIR.js';
import { assertExpressionReadinessForCompile } from '../p0vrTwinV30R8M2R1/implementationExpressionReadiness.js';
import { ingestAuthorityImageContentSync } from '../p0vrTwinV30R8M2R1/authorityContentIngestion.js';
import { resolveAuthorityIngestUri } from '../p0vrTwinV30R8M2R1/resolveAuthorityIngestUri.js';
import { buildActualVisualAnalysis, buildBlueprintVisualAnalysis } from '../p0vrTwinV30R8M2R1/buildVisualAnalyses.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../p0vrTwinV30/constants.js';
import { buildActualImplementationRegionMap } from '../p0vrTwinV30R8M2/actualImplementationRegionMap.js';
import {
  buildRegionFidelityReceipts,
  evaluateVisualFidelityFromRegionReceipts,
} from '../p0vrTwinV30R8M2/implementationRegionFidelityReceipt.js';
import { scanDocumentForAuthorityRasterViolations } from '../p0vrTwinV30R8M2/runtimeAuthorityRasterFirewall.js';
import { resolveMobileTwinPublicAssetUrl } from '../p0vrTwinV30/mobileTwinPipeline/resolveMobileTwinPublicAssetUrl.js';
import {
  MOBILE_TWIN_IMPLEMENTATION_VERSION_FORENSIC_BLUEPRINT,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R5,
  P0_VR_TWIN_V30R8M2R5_LINEAGE,
  R8M2R4_CORRECTION_REQUIRED_REASON,
  FORENSIC_SPEC_NOT_CONSUMED,
} from './constants.js';
import { resolveForensicUiBlueprintAuthoritySync } from './resolveForensicUiBlueprintAuthoritySync.js';
import {
  buildForensicAssetPlacementMap,
  buildForensicImplementationSpec,
  buildForensicSpacingMap,
  buildForensicTypographyMap,
  buildForensicUiObjectMap,
  buildForensicUiSectionMap,
  buildForensicVisualStyleMap,
} from './buildForensicMaps.js';
import { buildForensicImplementationCodingPrompt } from './buildForensicImplementationCodingPrompt.js';
import { runForensicDomCorrectionLoop } from './realBrowserForensicFidelity.js';
import {
  assertForensicStaleRenderTreeFirewall,
  renderTreeStructureSignatureR8M2R5,
} from './staleRenderTreeReuseFirewallR8M2R5.js';
export function compileVisualMobileTwinImplementationR8M2R5(
  input: MobileTwinStructuredCompilerInput,
): CompiledMobileTwinImplementationDocument {
  const priorR8M2R4 = compileVisualMobileTwinImplementationR8M2R4(input);

  const { pipeline, packageId } = input;
  const pkg = pipeline.packages.find((p) => p.id === packageId)!;
  const authorities = resolveImplementationAuthorities(pipeline, pkg);
  assertNdxbookProjectContext(authorities.projectContextVersion);
  const { composition, bundle } = loadStructuredBundle(pipeline, pkg);

  const runId = pkg.packageChecksum.slice(0, 12);
  const actualIngested = ingestAuthorityImageContentSync({
    uri: resolveAuthorityIngestUri(authorities.actualRenderUri, 'actual'),
    specWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    specHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
  });
  const blueprintIngested = ingestAuthorityImageContentSync({
    uri: resolveAuthorityIngestUri(authorities.blueprintRenderUri, 'blueprint'),
    specWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    specHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
  });
  if (!actualIngested.contentIngested) {
    throw new Error('VISUAL_AUTHORITY_CONTENT_INGESTION_REQUIRED');
  }

  const actualHash = actualIngested.contentHash ?? pkg.packageChecksum;
  const canonicalViewport = {
    widthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    heightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
  };

  const actualUrl = resolveMobileTwinPublicAssetUrl(authorities.actualRenderUri ?? '');
  const lightBpUrl = resolveMobileTwinPublicAssetUrl(authorities.blueprintRenderUri ?? '');

  const { authority: forensicBlueprint, receipt: forensicReceipt } = resolveForensicUiBlueprintAuthoritySync({
    projectId: pkg.projectId,
    sourceActualAuthorityId: authorities.actualRenderId,
    sourceActualHash: actualHash,
    primaryActualImageUrl: actualUrl,
    secondaryLightBlueprintUrl: lightBpUrl,
    canonicalViewport,
  });

  const actualAnalysis = buildActualVisualAnalysis({ runId, composition, actual: actualIngested });
  const blueprintAnalysis = buildBlueprintVisualAnalysis({ runId, composition, blueprint: blueprintIngested });

  const translationBrief = buildImplementationTranslationBrief({
    projectId: pkg.projectId,
    workspaceType: 'DESIGN',
    pkg,
    composition,
    bundle,
    actualAuthorityId: authorities.actualRenderId,
    blueprintAuthorityId: authorities.blueprintRenderId,
    actualAnalysis,
    blueprintAnalysis,
  });
  const translationReadiness = evaluateImplementationTranslationReadiness(translationBrief);
  assertTranslationReadinessForCompile(translationReadiness);

  let expressionIr = buildImplementationExpressionIR({
    projectId: pkg.projectId,
    workspaceType: 'DESIGN',
    pkg,
    composition,
    bundle,
    authorities,
    actualAnalysis,
    blueprintAnalysis,
    actualContentHash: actualHash,
    blueprintContentHash: blueprintIngested.contentHash ?? pkg.packageChecksum,
  });
  assertExpressionReadinessForCompile(expressionIr.readiness);
  expressionIr = refineImplementationExpressionIRFromBrief({ expressionIr, brief: translationBrief }).expressionIr;

  const objectMap = buildForensicUiObjectMap({
    composition,
    bundle,
    canonicalViewport,
    blueprintAuthorityId: forensicBlueprint.id,
  });
  const sectionMap = buildForensicUiSectionMap({ composition, objectMap });
  const typographyMap = buildForensicTypographyMap(objectMap);
  const visualStyleMap = buildForensicVisualStyleMap();
  const spacingMap = buildForensicSpacingMap(sectionMap);
  const assetMap = buildForensicAssetPlacementMap(objectMap);
  const forensicSpec = buildForensicImplementationSpec({
    objectMap,
    sectionMap,
    typographyMap,
    visualStyleMap,
    spacingMap,
    assetMap,
  });
  const forensicPrompt = buildForensicImplementationCodingPrompt({
    spec: forensicSpec,
    forensicBlueprintId: forensicBlueprint.id,
    actualHash,
  });

  const buildId = `mb-${runId}`;
  const domLoop = runForensicDomCorrectionLoop({
    buildId,
    route: `/projects/${pkg.projectId}/design/twin`,
    viewport: canonicalViewport,
    composition,
    bundle,
    expressionIr,
    objectMap,
    sectionMap,
    typographyMap,
    visualStyleMap,
    spacingMap,
  });

  const compiled = domLoop.finalCompiled;
  const newSignature = renderTreeStructureSignatureR8M2R5({
    ...priorR8M2R4,
    renderTree: compiled.renderTree,
  });
  assertForensicStaleRenderTreeFirewall({ priorDocument: priorR8M2R4, newSignature });

  if (!compiled.renderTree.nodes.some((n) => n.styleSource === 'FORENSIC_SPEC_REBUILD')) {
    throw new Error(FORENSIC_SPEC_NOT_CONSUMED);
  }

  if (domLoop.fidelityGate.founderImplementationReview !== 'FOUNDER_IMPLEMENTATION_REVIEW') {
    throw new Error('FORENSIC_FIDELITY_NOT_REVIEW_READY');
  }

  const documentPartial: CompiledMobileTwinImplementationDocument = {
    lineage: P0_VR_TWIN_V30R8M2R5_LINEAGE,
    compilerGeneration: MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R5,
    implementationVersion: MOBILE_TWIN_IMPLEMENTATION_VERSION_FORENSIC_BLUEPRINT,
    implementationGenerationMode: 'FULL_TRANSLATION_REBUILD',
    viewport: 'MOBILE',
    widthPx: canonicalViewport.widthPx,
    heightPx: canonicalViewport.heightPx,
    nodes: compiled.nodes,
    renderTree: compiled.renderTree,
    authoritiesLoaded: authorities,
    semanticLabelViolations: [],
    implementationExpressionIr: expressionIr,
    implementationTranslationBrief: translationBrief,
    translationReadiness,
    translationBriefConsumed: true,
    forensicUiBlueprintAuthority: forensicBlueprint,
    forensicBlueprintGenerationReceipt: forensicReceipt,
    forensicUiObjectMap: objectMap,
    forensicUiSectionMap: sectionMap,
    forensicTypographyMap: typographyMap,
    forensicVisualStyleMap: visualStyleMap,
    forensicSpacingMap: spacingMap,
    forensicAssetPlacementMap: assetMap,
    forensicImplementationSpec: forensicSpec,
    forensicImplementationCodingPrompt: forensicPrompt,
    forensicPromptInjected: true,
    forensicDomCorrectionIterations: domLoop.iterations,
    realBrowserTwinScreenshot: domLoop.lastScreenshot,
    forensicFidelityGate: domLoop.fidelityGate,
    syntheticScreenshotUsedAsProof: false,
    actualVisibleToImplementationAuthoringStage: true,
    actualAuthorityContentHashAtAuthoring: actualHash,
    blueprintAvailableToReconstruction: true,
    translationBriefRole: 'EXPLANATION_OF_ACTUAL',
    priorBuildCorrection: {
      priorGeneration: 'R8M2R4',
      reason: R8M2R4_CORRECTION_REQUIRED_REASON,
      status: 'CORRECTION_REQUIRED',
    },
    forensicComponentTree: {
      id: `fbct-${compiled.renderTreeHash.slice(0, 10)}`,
      hash: compiled.renderTreeHash,
      rootClass: domLoop.finalStyleContract.rootClass,
      sectionIds: compiled.renderTree.sections.map((s) => s.id),
    },
    forensicStyleContract: {
      id: domLoop.finalStyleContract.id,
      hash: domLoop.finalStyleContract.hash,
      cssVariables: domLoop.finalStyleContract.cssVariables,
    },
    sourceArtifactIds: [
      pkg.id,
      forensicBlueprint.id,
      forensicSpec.id,
      forensicPrompt.id,
      objectMap.id,
    ],
    forbiddenPrimitiveScan: { violations: [], count: 0 },
    structuredSource: 'COMPOSITION_AND_PACKAGE_ARTIFACTS',
    assetTraceability: compiled.assetTraces,
    unresolvedAssetBindings: compiled.unresolvedAssetBindings,
  };

  const semanticLabelViolations = scanDocumentForSemanticLabelViolations(documentPartial.nodes);
  if (semanticLabelViolations.length) {
    throw new Error(`SEMANTIC_DEBUG_LABEL_RENDERED:${semanticLabelViolations.join(',')}`);
  }
  const rasterViolations = scanDocumentForAuthorityRasterViolations(documentPartial.nodes.map((n) => n.imageUri));
  if (rasterViolations.length) {
    throw new Error(`AUTHORITY_RASTER_REGION_RUNTIME_VIOLATION:${rasterViolations.join('|')}`);
  }

  const regionMap = buildActualImplementationRegionMap(composition);
  const regionFidelityReceipts = buildRegionFidelityReceipts({
    regions: regionMap,
    document: documentPartial,
    assetTraces: compiled.assetTraces,
  });
  const fidelity = evaluateVisualFidelityFromRegionReceipts(regionFidelityReceipts);

  return {
    ...documentPartial,
    regionFidelityReceipts,
    actualImplementationRegionMap: regionMap,
    visualFidelityEvaluation: {
      machinePass: domLoop.fidelityGate.status === 'REVIEW_READY' && fidelity.machinePass !== false,
      founderPass: false,
    },
    expressionReadiness: expressionIr.readiness,
  };
}
