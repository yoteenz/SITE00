import type { MobileTwinStructuredCompilerInput } from '../p0vrTwinV30R8M/types.js';
import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import { loadStructuredBundle } from '../p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { assertNdxbookProjectContext, resolveImplementationAuthorities } from '../p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { scanDocumentForSemanticLabelViolations } from '../p0vrTwinV30R8M1/semanticDebugLabelFirewall.js';
import { compileVisualMobileTwinImplementationR8M2R1 } from '../p0vrTwinV30R8M2R1/compileVisualMobileTwinImplementationR8M2R1.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../p0vrTwinV30/constants.js';
import { ingestAuthorityImageContentSync } from '../p0vrTwinV30R8M2R1/authorityContentIngestion.js';
import { resolveAuthorityIngestUri } from '../p0vrTwinV30R8M2R1/resolveAuthorityIngestUri.js';
import { buildActualVisualAnalysis, buildBlueprintVisualAnalysis } from '../p0vrTwinV30R8M2R1/buildVisualAnalyses.js';
import { buildImplementationExpressionIR } from '../p0vrTwinV30R8M2R1/buildImplementationExpressionIR.js';
import { translateFromImplementationExpressionIR } from '../p0vrTwinV30R8M2R1/translateFromImplementationExpressionIR.js';
import { buildImplementationDriftAudit } from '../p0vrTwinV30R8M2R1/implementationDriftAudit.js';
import { inventoryExpressionCompileFallbacks } from '../p0vrTwinV30R8M2R1/genericFallbackInventory.js';
import { assertExpressionReadinessForCompile } from '../p0vrTwinV30R8M2R1/implementationExpressionReadiness.js';
import { buildActualImplementationRegionMap } from '../p0vrTwinV30R8M2/actualImplementationRegionMap.js';
import {
  buildRegionFidelityReceipts,
  evaluateVisualFidelityFromRegionReceipts,
} from '../p0vrTwinV30R8M2/implementationRegionFidelityReceipt.js';
import { scanDocumentForAuthorityRasterViolations } from '../p0vrTwinV30R8M2/runtimeAuthorityRasterFirewall.js';
import {
  MOBILE_TWIN_IMPLEMENTATION_VERSION_TRANSLATION,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R2,
  P0_VR_TWIN_V30R8M2R2_LINEAGE,
  R8M2R1_CORRECTION_REQUIRED_REASON,
} from './constants.js';
import { buildImplementationTranslationBrief } from './buildImplementationTranslationBrief.js';
import { refineImplementationExpressionIRFromBrief } from './refineImplementationExpressionIRFromBrief.js';
import { buildVisualImplementationCodingPrompt } from './buildVisualImplementationCodingPrompt.js';
import {
  assertTranslationReadinessForCompile,
  evaluateImplementationTranslationReadiness,
} from './implementationTranslationReadiness.js';
import { applyTranslationBriefToCompiledNodes } from './applyTranslationBriefToCompiledNodes.js';
import { buildImplementationTranslationFidelityReceipt } from './implementationTranslationFidelityReceipt.js';

export function compileVisualMobileTwinImplementationR8M2R2(
  input: MobileTwinStructuredCompilerInput,
): CompiledMobileTwinImplementationDocument {
  const priorR8M2R1 = compileVisualMobileTwinImplementationR8M2R1(input);

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

  if (!actualIngested.contentIngested || !blueprintIngested.contentIngested) {
    throw new Error('VISUAL_AUTHORITY_CONTENT_INGESTION_REQUIRED');
  }

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
    actualContentHash: actualIngested.contentHash ?? pkg.packageChecksum,
    blueprintContentHash: blueprintIngested.contentHash ?? pkg.packageChecksum,
  });

  assertExpressionReadinessForCompile(expressionIr.readiness);

  const { expressionIr: refinedIr, changes: expressionChangesFromBrief } = refineImplementationExpressionIRFromBrief({
    expressionIr,
    brief: translationBrief,
  });
  expressionIr = refinedIr;

  const codingPrompt = buildVisualImplementationCodingPrompt(translationBrief);

  const translated = translateFromImplementationExpressionIR({
    composition,
    bundle,
    expressionIr,
  });

  const applied = applyTranslationBriefToCompiledNodes({
    nodes: translated.nodes,
    renderTreeNodes: translated.renderTree.nodes,
    context: { brief: translationBrief, codingPrompt, expressionIr },
  });

  const documentPartial: CompiledMobileTwinImplementationDocument = {
    ...priorR8M2R1,
    lineage: P0_VR_TWIN_V30R8M2R2_LINEAGE,
    compilerGeneration: MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R2,
    implementationVersion: MOBILE_TWIN_IMPLEMENTATION_VERSION_TRANSLATION,
    nodes: applied.nodes,
    renderTree: priorR8M2R1.renderTree ?
      { ...priorR8M2R1.renderTree, nodes: applied.renderTreeNodes }
    : undefined,
    implementationExpressionIr: expressionIr,
    implementationTranslationBrief: translationBrief,
    visualImplementationCodingPrompt: codingPrompt,
    translationReadiness,
    translationPromptTrace: applied.traceLinks,
    expressionChangesFromBrief,
    translationBriefConsumed: true,
    codingPromptInjected: true,
    priorBuildCorrection: {
      priorGeneration: 'R8M2R1',
      reason: R8M2R1_CORRECTION_REQUIRED_REASON,
      status: 'CORRECTION_REQUIRED',
    },
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
    assetTraces: translated.assetTraces,
  });
  const fidelity = evaluateVisualFidelityFromRegionReceipts(regionFidelityReceipts);

  const visualImportanceByObject = new Map(composition.objectDefinitions.map((o) => [o.objectId, o.visualImportance]));
  const genericFallbackAudit = inventoryExpressionCompileFallbacks({
    objectExpressions: expressionIr.objectExpressions.map((o) => ({ objectId: o.objectId, styleSources: o.styleSources })),
    visualImportanceByObject,
  });

  const driftAudit = buildImplementationDriftAudit({
    priorDocument: priorR8M2R1,
    expressionIr,
  });

  const buildId = `build-${pkg.id}-${translationBrief.hash.slice(0, 8)}`;
  const translationFidelityReceipt = buildImplementationTranslationFidelityReceipt({
    buildId,
    brief: translationBrief,
    codingPrompt,
    document: documentPartial,
  });

  return {
    ...documentPartial,
    regionFidelityReceipts,
    actualImplementationRegionMap: regionMap,
    assetTraceability: translated.assetTraces,
    unresolvedAssetBindings: translated.unresolvedAssetBindings,
    visualFidelityEvaluation: fidelity,
    genericFallbackAudit,
    implementationDriftAudit: driftAudit,
    expressionReadiness: expressionIr.readiness,
    implementationTranslationFidelityReceipt: translationFidelityReceipt,
    sourceArtifactIds: [
      ...(priorR8M2R1.sourceArtifactIds ?? []),
      translationBrief.id,
      codingPrompt.id,
      expressionIr.id,
    ],
  };
}
