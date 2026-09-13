import { buildSurgicalBlueprintTwin } from '../p0vrTwinV27/buildSurgicalBlueprintTwin.js';
import type { ConceptCompositionState } from '../p0vrTwinV27/types.js';
import type { SurgicalBlueprintData } from './types.js';

/** Structured sibling from ConceptCompositionState — not inferred from raster visuals. */
export function buildSurgicalBlueprintData(input: {
  generationBundleId: string;
  compositionState: ConceptCompositionState;
}): SurgicalBlueprintData {
  const twin = buildSurgicalBlueprintTwin({ compositionState: input.compositionState });
  return {
    surgicalBlueprintDataId: `sbd-${input.generationBundleId}`,
    generationBundleId: input.generationBundleId,
    compositionStateId: input.compositionState.compositionStateId,
    conceptId: input.compositionState.conceptId,
    conceptVersionId: input.compositionState.conceptVersionId,
    viewport: 'mobile',
    canvas: twin.canvas,
    objects: twin.objects,
    relationships: twin.relationships,
    typographyTokens: twin.typographyTokens,
    colorTokens: twin.colorTokens,
    surfaceTokens: twin.surfaceTokens,
    assetBindings: twin.assetBindings,
    functionTargets: twin.functionBindings,
    responsiveRules: twin.responsiveContracts,
    stateRules: twin.stateContracts,
    ownershipRules: twin.ownershipContracts,
    status: 'DRAFT',
  };
}
