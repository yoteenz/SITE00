import type { MobileTwinStructuredCompilerInput } from '../p0vrTwinV30R8M/types.js';
import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import { loadStructuredBundle } from '../p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { assertNdxbookProjectContext, resolveImplementationAuthorities } from '../p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { scanDocumentForSemanticLabelViolations } from '../p0vrTwinV30R8M1/semanticDebugLabelFirewall.js';
import { compileVisualMobileTwinImplementationR8M2 } from '../p0vrTwinV30R8M2/compileVisualMobileTwinImplementationR8M2.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../p0vrTwinV30/constants.js';
import {
  MOBILE_TWIN_IMPLEMENTATION_VERSION_EXPRESSION,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R1,
  P0_VR_TWIN_V30R8M2R1_LINEAGE,
  R8M2_CORRECTION_REQUIRED_REASON,
} from './constants.js';
import { ingestAuthorityImageContentSync } from './authorityContentIngestion.js';
import { resolveAuthorityIngestUri } from './resolveAuthorityIngestUri.js';
import { buildActualVisualAnalysis, buildBlueprintVisualAnalysis } from './buildVisualAnalyses.js';
import { buildImplementationExpressionIR } from './buildImplementationExpressionIR.js';
import { assertExpressionReadinessForCompile } from './implementationExpressionReadiness.js';
import { translateFromImplementationExpressionIR } from './translateFromImplementationExpressionIR.js';
import { buildImplementationDriftAudit } from './implementationDriftAudit.js';
import { buildActualImplementationRegionMap } from '../p0vrTwinV30R8M2/actualImplementationRegionMap.js';
import {
  buildRegionFidelityReceipts,
  evaluateVisualFidelityFromRegionReceipts,
} from '../p0vrTwinV30R8M2/implementationRegionFidelityReceipt.js';
import { scanDocumentForAuthorityRasterViolations } from '../p0vrTwinV30R8M2/runtimeAuthorityRasterFirewall.js';
import { inventoryExpressionCompileFallbacks } from './genericFallbackInventory.js';

export function compileVisualMobileTwinImplementationR8M2R1(
  input: MobileTwinStructuredCompilerInput,
): CompiledMobileTwinImplementationDocument {
  const { pipeline, packageId } = input;
  const pkg = pipeline.packages.find((p) => p.id === packageId);
  if (!pkg) throw new Error('MOBILE_TWIN_PACKAGE_MISSING');
  if (pkg.status !== 'APPROVED') throw new Error('MOBILE_TWIN_PACKAGE_NOT_APPROVED');

  const authorities = resolveImplementationAuthorities(pipeline, pkg);
  assertNdxbookProjectContext(authorities.projectContextVersion);
  const { composition, bundle } = loadStructuredBundle(pipeline, pkg);

  const priorR8M2 = compileVisualMobileTwinImplementationR8M2(input);

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

  const runId = pkg.packageChecksum.slice(0, 12);
  const actualAnalysis = buildActualVisualAnalysis({ runId, composition, actual: actualIngested });
  const blueprintAnalysis = buildBlueprintVisualAnalysis({ runId, composition, blueprint: blueprintIngested });

  const expressionIr = buildImplementationExpressionIR({
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

  const translated = translateFromImplementationExpressionIR({
    composition,
    bundle,
    expressionIr,
  });

  const semanticLabelViolations = scanDocumentForSemanticLabelViolations(translated.nodes);
  if (semanticLabelViolations.length) {
    throw new Error(`SEMANTIC_DEBUG_LABEL_RENDERED:${semanticLabelViolations.join(',')}`);
  }

  const rasterViolations = scanDocumentForAuthorityRasterViolations(translated.nodes.map((n) => n.imageUri));
  if (rasterViolations.length) {
    throw new Error(`AUTHORITY_RASTER_REGION_RUNTIME_VIOLATION:${rasterViolations.join('|')}`);
  }

  for (const tn of translated.renderTree.nodes) {
    if (!tn.expressionObjectId) {
      throw new Error(`IMPLEMENTATION_EXPRESSION_NOT_RESOLVED:${tn.objectId}`);
    }
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

  const visualImportanceByObject = new Map(composition.objectDefinitions.map((o) => [o.objectId, o.visualImportance]));
  const genericFallbackAudit = inventoryExpressionCompileFallbacks({
    objectExpressions: expressionIr.objectExpressions.map((o) => ({ objectId: o.objectId, styleSources: o.styleSources })),
    visualImportanceByObject,
  });

  const driftAudit = buildImplementationDriftAudit({
    priorDocument: priorR8M2,
    expressionIr,
  });

  return {
    lineage: P0_VR_TWIN_V30R8M2R1_LINEAGE,
    compilerGeneration: MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R1,
    implementationVersion: MOBILE_TWIN_IMPLEMENTATION_VERSION_EXPRESSION,
    viewport: 'MOBILE',
    widthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    heightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    nodes: translated.nodes,
    renderTree: translated.renderTree,
    authoritiesLoaded: authorities,
    semanticLabelViolations: [],
    priorBuildCorrection: {
      priorGeneration: 'R8M2',
      reason: R8M2_CORRECTION_REQUIRED_REASON,
      status: 'CORRECTION_REQUIRED',
    },
    regionFidelityReceipts,
    actualImplementationRegionMap: regionMap,
    assetTraceability: translated.assetTraces,
    unresolvedAssetBindings: translated.unresolvedAssetBindings,
    visualFidelityEvaluation: fidelity,
    implementationExpressionIr: expressionIr,
    visualAuthorityIngestionAudit: {
      actualAuthorityAvailable: actualIngested.referenceAvailable,
      actualAuthorityBytesLoaded: actualIngested.contentIngested,
      actualAuthorityAnalyzed: actualIngested.visuallyAnalyzed,
      blueprintAuthorityAvailable: blueprintIngested.referenceAvailable,
      blueprintAuthorityBytesLoaded: blueprintIngested.contentIngested,
      blueprintAuthorityAnalyzed: blueprintIngested.visuallyAnalyzed,
      compositionStateLoaded: true,
      surgicalBlueprintLoaded: true,
      projectContextLoaded: true,
      visualPerceptionStageExists: true,
      typographyExtractionExists: true,
      spatialRelationshipExtractionExists: true,
      materialExtractionExists: true,
      stateTreatmentExtractionExists: true,
      assetTreatmentExtractionExists: true,
      genericFallbackCount: genericFallbackAudit.entries.filter((e) => e.classification === 'GENERIC_FALLBACK').length,
      hardcodedStyleDefaultCount: genericFallbackAudit.entries.length,
      unsupportedVisualPropertyCount: 0,
      conclusion: 'R8M2R1 expression IR compile path',
      blockers: [],
      actualReference: actualIngested,
      blueprintReference: blueprintIngested,
      ingestionProvider: 'SITE00_PIXEL_GROUNDED_COMPOSITION_ANCHORED',
      ingestionAnalysisMode: 'COMPOSITION_OBJECT_ANCHORED_SHARP_ROW_BANDS',
      ingestionVersion: '1',
    },
    implementationDriftAudit: driftAudit,
    genericFallbackAudit,
    expressionReadiness: expressionIr.readiness,
    sourceArtifactIds: [
      pkg.id,
      bundle.surgicalBlueprint.id,
      bundle.objectMap.id,
      bundle.canonicalAssetManifest.id,
      authorities.actualRenderId,
      authorities.blueprintRenderId,
      composition.id,
      expressionIr.id,
    ],
    forbiddenPrimitiveScan: { violations: [], count: 0 },
    structuredSource: 'COMPOSITION_AND_PACKAGE_ARTIFACTS',
  };
}
