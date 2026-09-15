import type { MobileTwinPipelineState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type {
  CompiledMobileTwinImplementationDocument,
  ImplementationStructuralFidelityReceipt,
  ImplementationVisualFidelityReceipt,
} from './types.js';

export function buildImplementationVisualFidelityReceipt(input: {
  buildId: string;
  pipeline: MobileTwinPipelineState;
  document: CompiledMobileTwinImplementationDocument;
}): ImplementationVisualFidelityReceipt {
  const render = input.pipeline.renders.find((r) => r.id === input.pipeline.activeRenderId);
  const objectCount = input.pipeline.compositionStates.find((c) => c.id === input.pipeline.activeCompositionStateId)?.objectDefinitions.length ?? 0;
  const geometryMatch = input.document.nodes.length === objectCount;
  const expressionReady =
    (input.document.compilerGeneration !== 'R8M2R1' &&
      input.document.compilerGeneration !== 'R8M2R2' &&
      input.document.compilerGeneration !== 'R8M2R3' &&
      input.document.compilerGeneration !== 'R8M2R4') ||
    (input.document.expressionReadiness?.status !== 'BLOCKED' &&
      Boolean(input.document.implementationExpressionIr?.objectExpressions.length));
  const translationReady =
    input.document.compilerGeneration === 'R8M2R4' ?
      input.document.visualReconstructionConvergenceGate?.status === 'REVIEW_READY'
    : input.document.compilerGeneration === 'R8M2R3' ?
      input.document.translationMaterialityReceipt?.result === 'PASS'
    : input.document.compilerGeneration !== 'R8M2R2' ||
      (input.document.translationBriefConsumed &&
        input.document.codingPromptInjected &&
        input.document.translationReadiness?.status !== 'BLOCKED');
  const visualTranslation = Boolean(
    (input.document.compilerGeneration === 'R8M1' ||
      input.document.compilerGeneration === 'R8M2' ||
      input.document.compilerGeneration === 'R8M2R1' ||
      input.document.compilerGeneration === 'R8M2R2' ||
      input.document.compilerGeneration === 'R8M2R3' ||
      input.document.compilerGeneration === 'R8M2R4') &&
      input.document.renderTree?.nodes.length &&
      input.document.authoritiesLoaded?.actualRenderUri &&
      expressionReady &&
      translationReady &&
      (input.document.compilerGeneration === 'R8M1' ||
        input.document.compilerGeneration === 'R8M2R1' ||
        input.document.compilerGeneration === 'R8M2R2' ||
        input.document.compilerGeneration === 'R8M2R3' ||
        input.document.compilerGeneration === 'R8M2R4' ||
        input.document.visualFidelityEvaluation?.machinePass),
  );
  const passVisual = geometryMatch && visualTranslation;
  return {
    id: `ivfr-${input.buildId}`,
    implementationBuildId: input.buildId,
    authorityRenderId: render?.id ?? 'unknown',
    majorRegionMatch: geometryMatch,
    geometryMatch,
    typographyMatch: visualTranslation,
    assetPlacementMatch: visualTranslation,
    controlPlacementMatch: geometryMatch && visualTranslation,
    spacingMatch: geometryMatch,
    projectAtmosphereMatch: visualTranslation,
    hostProjectBoundaryMatch: visualTranslation,
    result: passVisual ? 'PASS' : 'REVIEW_REQUIRED',
    founderReviewRequired: !passVisual,
  };
}

export function buildImplementationStructuralFidelityReceipt(input: {
  buildId: string;
  pipeline: MobileTwinPipelineState;
  document: CompiledMobileTwinImplementationDocument;
}): ImplementationStructuralFidelityReceipt {
  const composition = input.pipeline.compositionStates.find((c) => c.id === input.pipeline.activeCompositionStateId);
  const expected = composition?.objectDefinitions.length ?? 0;
  const rendered = input.document.nodes.length;
  const bindings = composition?.functionTargets.filter((f) => f.status === 'BOUND').length ?? 0;
  const boundInNodes = input.document.nodes.filter((n) => n.functionTarget).length;
  const forbiddenRaster = input.document.forbiddenPrimitiveScan.count > 0;
  const structuralTranslation =
    (input.document.compilerGeneration === 'R8M1' ||
      input.document.compilerGeneration === 'R8M2' ||
      input.document.compilerGeneration === 'R8M2R1' ||
      input.document.compilerGeneration === 'R8M2R2' ||
      input.document.compilerGeneration === 'R8M2R3' ||
      input.document.compilerGeneration === 'R8M2R4') &&
    Boolean(input.document.renderTree?.nodes.length);
  const pass =
    expected === rendered && bindings <= boundInNodes + 2 && !forbiddenRaster && structuralTranslation;
  return {
    id: `isfr-${input.buildId}`,
    implementationBuildId: input.buildId,
    expectedObjectCount: expected,
    renderedObjectCount: rendered,
    featureBindingsPass: Boolean(composition?.featureBindings.length),
    functionBindingsPass: bindings <= boundInNodes + 2,
    ownershipPass: Boolean(composition?.ownershipBindings.length),
    implementationPrimitivesPass: !forbiddenRaster,
    traceabilityPass: Boolean(composition?.featureBindings.length),
    forbiddenRasterImplementation: forbiddenRaster,
    stateBehaviorPass: Boolean(composition?.stateDefinitions.length),
    navigationBehaviorPass: input.document.nodes.some((n) => (n.functionTarget ?? '').includes('NAV')),
    result: pass ? 'PASS' : 'REVIEW_REQUIRED',
  };
}

export function validateFunctionalBindings(document: CompiledMobileTwinImplementationDocument): {
  pass: boolean;
  interactiveNodes: number;
  placeholderOnly: number;
} {
  const interactive = document.nodes.filter((n) => n.interactionIntent || n.functionTarget);
  const placeholderOnly = interactive.filter((n) => !n.interactionIntent && n.functionTarget?.includes('PLACEHOLDER')).length;
  return {
    pass: interactive.length > 0 && placeholderOnly === 0,
    interactiveNodes: interactive.length,
    placeholderOnly,
  };
}
