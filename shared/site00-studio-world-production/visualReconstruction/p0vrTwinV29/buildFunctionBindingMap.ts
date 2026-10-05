import type { ConceptCompositionState } from '../p0vrTwinV27/types.js';
import type { SurgicalBlueprintData } from './types.js';
import type { FunctionBindingMap } from './types.js';

export function buildFunctionBindingMap(input: {
  generationBundleId: string;
  compositionState: ConceptCompositionState;
  surgicalData: SurgicalBlueprintData;
}): FunctionBindingMap {
  const bindings = input.surgicalData.functionTargets.map((t, i) => ({
    functionBindingId: `fb-${input.generationBundleId}-${i}`,
    objectId: t.objectId,
    functionalRole: t.functionKey,
    sourceFunction: t.functionKey,
    dataSource: 'site00_live',
    route: t.functionKey.includes('section_nav') ? t.functionKey : null,
    action: t.functionKey.includes('quick') ? 'cta' : null,
    interaction: t.functionKey.includes('nav') ? 'navigation' : null,
    requiredStates: ['KNOWN', 'UNKNOWN', 'LOADING', 'ERROR'],
    status: 'BOUND' as const,
  }));

  return {
    functionBindingMapId: `fbm-${input.generationBundleId}`,
    generationBundleId: input.generationBundleId,
    compositionStateId: input.compositionState.compositionStateId,
    conceptId: input.compositionState.conceptId,
    conceptVersionId: input.compositionState.conceptVersionId,
    bindings,
    status: bindings.length > 0 ? 'COMPLETE' : 'INCOMPLETE',
  };
}
