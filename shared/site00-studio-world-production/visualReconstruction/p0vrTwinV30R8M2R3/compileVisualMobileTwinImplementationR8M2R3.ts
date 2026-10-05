import type { MobileTwinStructuredCompilerInput } from '../p0vrTwinV30R8M/types.js';
import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import { loadStructuredBundle } from '../p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { assertNdxbookProjectContext, resolveImplementationAuthorities } from '../p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { scanDocumentForSemanticLabelViolations } from '../p0vrTwinV30R8M1/semanticDebugLabelFirewall.js';
import { compileVisualMobileTwinImplementationR8M2R2 } from '../p0vrTwinV30R8M2R2/compileVisualMobileTwinImplementationR8M2R2.js';
import { buildImplementationTranslationBrief } from '../p0vrTwinV30R8M2R2/buildImplementationTranslationBrief.js';
import { refineImplementationExpressionIRFromBrief } from '../p0vrTwinV30R8M2R2/refineImplementationExpressionIRFromBrief.js';
import { buildVisualImplementationCodingPrompt } from '../p0vrTwinV30R8M2R2/buildVisualImplementationCodingPrompt.js';
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
import {
  MOBILE_TWIN_IMPLEMENTATION_VERSION_TRANSLATION_REBUILD,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R3,
  P0_VR_TWIN_V30R8M2R3_LINEAGE,
  R8M2R2_CORRECTION_REQUIRED_REASON,
} from './constants.js';
import {
  assertGenerationModeAllowed,
  resolveProductionImplementationGenerationMode,
} from './implementationGenerationMode.js';
import { buildTranslationDrivenImplementationPlan } from './buildTranslationDrivenImplementationPlan.js';
import { buildTranslationDrivenComponentTree } from './buildTranslationDrivenComponentTree.js';
import { buildTranslationDrivenStyleSystem } from './buildTranslationDrivenStyleSystem.js';
import { buildTranslationDrivenCssContract } from './buildTranslationDrivenCssContract.js';
import { compileTranslationDrivenOutput } from './compileTranslationDrivenOutput.js';
import {
  assertStaleRenderTreeReuseFirewall,
  renderTreeStructureSignature,
} from './staleRenderTreeReuseFirewall.js';
import { buildTranslationMaterialityReceipt, assertTranslationMaterialityForCompile } from './translationMaterialityReceipt.js';
import { buildTranslationDrivenRegionConvergenceReceipts } from './translationDrivenRegionConvergence.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';

export function compileVisualMobileTwinImplementationR8M2R3(
  input: MobileTwinStructuredCompilerInput,
): CompiledMobileTwinImplementationDocument {
  const generationMode = resolveProductionImplementationGenerationMode();
  assertGenerationModeAllowed(generationMode);

  const priorR8M2R2 = compileVisualMobileTwinImplementationR8M2R2(input);
  const priorLayoutContractHash = fnv1aHex(renderTreeStructureSignature(priorR8M2R2));
  const priorStyleContractHash = fnv1aHex('r8m2r2-legacy-styles');

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
  expressionIr = refineImplementationExpressionIRFromBrief({ expressionIr, brief: translationBrief }).expressionIr;

  const codingPrompt = buildVisualImplementationCodingPrompt(translationBrief);
  if (!codingPrompt.fullText.includes('HERO WORKSPACE')) {
    throw new Error('TRANSLATION_BRIEF_NOT_CONSUMED');
  }

  const plan = buildTranslationDrivenImplementationPlan({
    brief: translationBrief,
    codingPrompt,
    expressionIr,
    pkg,
    composition,
    bundle,
  });
  const styleSystem = buildTranslationDrivenStyleSystem({ brief: translationBrief, expressionIr });
  const cssContract = buildTranslationDrivenCssContract(styleSystem);
  const componentTree = buildTranslationDrivenComponentTree({ plan, composition, expressionIr });

  const compiled = compileTranslationDrivenOutput({
    composition,
    bundle,
    expressionIr,
    componentTree,
    cssContract,
    styleSystem,
  });

  const newComponentCompositionHash = componentTree.hash;
  const documentPartial: CompiledMobileTwinImplementationDocument = {
    lineage: P0_VR_TWIN_V30R8M2R3_LINEAGE,
    compilerGeneration: MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R3,
    implementationVersion: MOBILE_TWIN_IMPLEMENTATION_VERSION_TRANSLATION_REBUILD,
    implementationGenerationMode: generationMode,
    viewport: 'MOBILE',
    widthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    heightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    nodes: compiled.nodes,
    renderTree: compiled.renderTree,
    authoritiesLoaded: authorities,
    semanticLabelViolations: [],
    implementationExpressionIr: expressionIr,
    implementationTranslationBrief: translationBrief,
    visualImplementationCodingPrompt: codingPrompt,
    translationReadiness,
    translationBriefConsumed: true,
    codingPromptInjected: true,
    translationDrivenImplementationPlan: plan,
    translationDrivenComponentTree: componentTree,
    translationDrivenStyleSystem: styleSystem,
    translationDrivenCssContract: cssContract,
    priorBuildCorrection: {
      priorGeneration: 'R8M2R2',
      reason: R8M2R2_CORRECTION_REQUIRED_REASON,
      status: 'CORRECTION_REQUIRED',
    },
    sourceArtifactIds: [
      pkg.id,
      translationBrief.id,
      codingPrompt.id,
      expressionIr.id,
      plan.id,
      componentTree.id,
      cssContract.id,
    ],
    forbiddenPrimitiveScan: { violations: [], count: 0 },
    structuredSource: 'COMPOSITION_AND_PACKAGE_ARTIFACTS',
    assetTraceability: compiled.assetTraces,
    unresolvedAssetBindings: compiled.unresolvedAssetBindings,
  };

  assertStaleRenderTreeReuseFirewall({
    generationMode,
    priorDocument: priorR8M2R2,
    newRenderTreeHash: renderTreeStructureSignature(documentPartial),
    newComponentCompositionHash,
    priorReusedVisualCss: false,
  });

  const materiality = buildTranslationMaterialityReceipt({
    priorDocument: priorR8M2R2,
    newDocument: documentPartial,
    priorLayoutContractHash,
    newLayoutContractHash: compiled.layoutContractHash,
    priorStyleContractHash,
    newStyleContractHash: cssContract.hash,
  });
  assertTranslationMaterialityForCompile(materiality);

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
  const regionConvergenceReceipts = buildTranslationDrivenRegionConvergenceReceipts(documentPartial);

  return {
    ...documentPartial,
    regionFidelityReceipts,
    actualImplementationRegionMap: regionMap,
    visualFidelityEvaluation: fidelity,
    translationMaterialityReceipt: materiality,
    translationDrivenRegionConvergenceReceipts: regionConvergenceReceipts,
    expressionReadiness: expressionIr.readiness,
  };
}
