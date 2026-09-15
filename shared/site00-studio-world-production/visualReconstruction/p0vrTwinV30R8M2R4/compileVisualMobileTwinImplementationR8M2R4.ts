import type { MobileTwinStructuredCompilerInput } from '../p0vrTwinV30R8M/types.js';
import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import { loadStructuredBundle } from '../p0vrTwinV30R8M/compileApprovedMobileTwinPackage.js';
import { assertNdxbookProjectContext, resolveImplementationAuthorities } from '../p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { scanDocumentForSemanticLabelViolations } from '../p0vrTwinV30R8M1/semanticDebugLabelFirewall.js';
import { compileVisualMobileTwinImplementationR8M2R3 } from '../p0vrTwinV30R8M2R3/compileVisualMobileTwinImplementationR8M2R3.js';
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
import {
  MOBILE_TWIN_IMPLEMENTATION_VERSION_ACTUAL_FIRST,
  MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R4,
  P0_VR_TWIN_V30R8M2R4_LINEAGE,
  R8M2R3_CORRECTION_REQUIRED_REASON,
} from './constants.js';
import { buildActualToCodeReconstructionDirective } from './buildActualToCodeReconstructionDirective.js';
import { buildRegionReconstructionContracts } from './buildRegionReconstructionContracts.js';
import {
  buildAssetReconstructionTargets,
  buildCompositionRelationshipTargets,
  buildControlReconstructionTargets,
  buildTypographyReconstructionTargets,
  buildVisualWeightContract,
} from './buildVisualWeightAndTargets.js';
import { runActualAssetIdentityGate } from './actualAssetIdentityGate.js';
import { buildActualFirstVisualReconstructionPrompt } from './buildActualFirstVisualReconstructionPrompt.js';
import { assertVisualReconstructionPlanGrounded, buildVisualReconstructionPlan } from './buildVisualReconstructionPlan.js';
import { buildActualFirstComponentTree } from './buildActualFirstComponentTree.js';
import { runIterativePixelFidelityLoop } from './visualComparisonAndLoop.js';
import {
  assertActualFirstStaleRenderTreeFirewall,
  renderTreeStructureSignatureR8M2R4,
} from './staleRenderTreeReuseFirewallR8M2R4.js';
import {
  assertActualFirstMaterialChangeForCompile,
  buildActualFirstMaterialChangeReceipt,
} from './actualFirstMaterialChangeGate.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';

export function compileVisualMobileTwinImplementationR8M2R4(
  input: MobileTwinStructuredCompilerInput,
): CompiledMobileTwinImplementationDocument {
  const priorR8M2R3 = compileVisualMobileTwinImplementationR8M2R3(input);
  const priorLiveHash = fnv1aHex(renderTreeStructureSignatureR8M2R4(priorR8M2R3));

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
  if (!actualIngested.contentHash) {
    throw new Error('ACTUAL_IMAGE_CONTENT_REQUIRED_FOR_AUTHORING');
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

  const regionContracts = buildRegionReconstructionContracts({ composition, actualAnalysis, blueprintAnalysis });
  const compositionTargets = buildCompositionRelationshipTargets(composition);
  const visualWeightContract = buildVisualWeightContract(composition);
  const typographyTargets = buildTypographyReconstructionTargets(composition);
  const controlTargets = buildControlReconstructionTargets(composition);
  const assetTargets = buildAssetReconstructionTargets(composition);
  const assetIdentityGate = runActualAssetIdentityGate({ composition, bundle, assetTargets });

  const reconstructionPlan = buildVisualReconstructionPlan({
    composition,
    regionContracts,
    compositionTargets,
    translationBriefId: translationBrief.id,
  });
  assertVisualReconstructionPlanGrounded(reconstructionPlan);

  const directive = buildActualToCodeReconstructionDirective({
    packageId: pkg.id,
    actualAuthorityId: authorities.actualRenderId,
    blueprintAuthorityId: authorities.blueprintRenderId,
    translationBriefId: translationBrief.id,
    expressionIrId: expressionIr.id,
  });

  const actualFirstPrompt = buildActualFirstVisualReconstructionPrompt({
    brief: translationBrief,
    plan: reconstructionPlan,
    actualContentHash: actualIngested.contentHash ?? '',
    blueprintContentHash: blueprintIngested.contentHash ?? '',
  });

  const componentTree = buildActualFirstComponentTree({
    plan: reconstructionPlan,
    composition,
    expressionIr,
  });

  const buildId = `mb-${runId}`;
  const loop = runIterativePixelFidelityLoop({
    actualContentHash: actualIngested.contentHash ?? pkg.packageChecksum,
    actualAnalysis,
    buildId,
    implementationVersion: MOBILE_TWIN_IMPLEMENTATION_VERSION_ACTUAL_FIRST,
    widthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    heightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    composition,
    bundle,
    expressionIr,
    componentTree,
    compositionTargets,
  });

  const lastIter = loop.iterations[loop.iterations.length - 1]!;
  const materiality = buildActualFirstMaterialChangeReceipt({
    priorLiveScreenshotHash: priorLiveHash,
    newLiveScreenshotHash: lastIter.liveScreenshot.screenshotHash,
    distanceToActualBefore: loop.distanceToActualBefore,
    distanceToActualAfter: loop.distanceToActualAfter,
  });
  assertActualFirstMaterialChangeForCompile(materiality);

  const compiled = loop.finalCompiled;
  const newSignature = renderTreeStructureSignatureR8M2R4({
    ...priorR8M2R3,
    renderTree: compiled.renderTree,
  });

  assertActualFirstStaleRenderTreeFirewall({
    priorDocument: priorR8M2R3,
    newSignature,
    newComponentHash: fnv1aHex(newSignature),
  });

  const documentPartial: CompiledMobileTwinImplementationDocument = {
    lineage: P0_VR_TWIN_V30R8M2R4_LINEAGE,
    compilerGeneration: MOBILE_TWIN_IMPL_COMPILER_GENERATION_R8M2R4,
    implementationVersion: MOBILE_TWIN_IMPLEMENTATION_VERSION_ACTUAL_FIRST,
    implementationGenerationMode: 'FULL_TRANSLATION_REBUILD',
    viewport: 'MOBILE',
    widthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    heightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    nodes: compiled.nodes,
    renderTree: compiled.renderTree,
    authoritiesLoaded: authorities,
    semanticLabelViolations: [],
    implementationExpressionIr: expressionIr,
    implementationTranslationBrief: translationBrief,
    visualImplementationCodingPrompt: priorR8M2R3.visualImplementationCodingPrompt,
    actualFirstVisualReconstructionPrompt: actualFirstPrompt,
    actualToCodeReconstructionDirective: directive,
    visualReconstructionPlan: reconstructionPlan,
    regionReconstructionContracts: regionContracts,
    visualWeightContract,
    compositionRelationshipTargets: compositionTargets,
    typographyReconstructionTargets: typographyTargets,
    controlReconstructionTargets: controlTargets,
    assetReconstructionTargets: assetTargets,
    actualAssetIdentityGateResults: assetIdentityGate,
    reconstructionIterations: loop.iterations,
    visualReconstructionConvergenceGate: loop.convergenceGate,
    actualFirstMaterialChangeReceipt: materiality,
    actualVisibleToImplementationAuthoringStage: true,
    actualAuthorityContentHashAtAuthoring: actualIngested.contentHash ?? null,
    blueprintAvailableToReconstruction: true,
    translationBriefRole: 'EXPLANATION_OF_ACTUAL',
    liveImplementationCanonicalScreenshot: lastIter.liveScreenshot,
    actualToLiveVisualComparison: lastIter.comparison,
    perceptualDifferenceMap: lastIter.differenceMap,
    actualToLiveRegionDrifts: lastIter.regionDrifts,
    responsiveAdaptationDeferredUntilCanonicalMatch: true,
    translationReadiness,
    translationBriefConsumed: true,
    codingPromptInjected: true,
    actualFirstPromptInjected: true,
    priorBuildCorrection: {
      priorGeneration: 'R8M2R3',
      reason: R8M2R3_CORRECTION_REQUIRED_REASON,
      status: 'CORRECTION_REQUIRED',
    },
    sourceArtifactIds: [
      pkg.id,
      directive.id,
      actualFirstPrompt.id,
      reconstructionPlan.id,
      componentTree.id,
      loop.finalStyleContract.id,
    ],
    forbiddenPrimitiveScan: { violations: [], count: 0 },
    structuredSource: 'COMPOSITION_AND_PACKAGE_ARTIFACTS',
    assetTraceability: compiled.assetTraces,
    unresolvedAssetBindings: compiled.unresolvedAssetBindings,
    actualFirstComponentTree: {
      id: componentTree.id,
      hash: componentTree.hash,
      rootClass: loop.finalStyleContract.rootClass,
      sectionIds: compiled.renderTree.sections.map((s) => s.id),
    },
    actualFirstLayoutContract: { id: `aflc-${compiled.layoutContractHash.slice(0, 10)}`, hash: compiled.layoutContractHash },
    actualFirstStyleContract: {
      id: loop.finalStyleContract.id,
      hash: loop.finalStyleContract.hash,
      cssVariables: loop.finalStyleContract.cssVariables,
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
    assetTraces: compiled.assetTraces,
  });
  const fidelity = evaluateVisualFidelityFromRegionReceipts(regionFidelityReceipts);

  if (loop.convergenceGate.founderImplementationReview !== 'FOUNDER_IMPLEMENTATION_REVIEW') {
    throw new Error('VISUAL_RECONSTRUCTION_NOT_REVIEW_READY');
  }

  return {
    ...documentPartial,
    regionFidelityReceipts,
    actualImplementationRegionMap: regionMap,
    visualFidelityEvaluation: {
      machinePass: loop.convergenceGate.status === 'REVIEW_READY' && fidelity.machinePass !== false,
      founderPass: false,
    },
    expressionReadiness: expressionIr.readiness,
  };
}
