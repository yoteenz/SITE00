import type { ConceptCompositionState } from '../p0vrTwinV27/types.js';

function legend(state: ConceptCompositionState): string {
  return state.compositionObjects.map((o) => o.objectId).join('\n');
}

export function buildAuthorityPromptFromCompositionState(
  state: ConceptCompositionState,
  pageIntentSummary: string,
): string {
  return [
    'NDXBOOK mobile overview — FINISHED AUTHORITY VISUAL.',
    `compositionStateId: ${state.compositionStateId}`,
    'NO blueprint labels or object ID overlays.',
    `Objects (${state.compositionObjects.length}):\n${legend(state)}`,
    `Brand: ${state.colorIntent}`,
    `Intent: ${pageIntentSummary}`,
  ].join('\n\n');
}

export function buildBlueprintTwinPromptFromCompositionState(
  state: ConceptCompositionState,
  pageIntentSummary: string,
): string {
  return [
    'NDXBOOK mobile overview — BLUEPRINT TWIN VISUAL (technical construction sheet).',
    `compositionStateId: ${state.compositionStateId} — SAME as authority pair.`,
    'Wireframe / labelled boundaries. Label each object with its objectId from list below.',
    'Same placement, hierarchy, nav, hero, progress, metrics — do not redesign layout.',
    `Objects:\n${legend(state)}`,
    `Intent: ${pageIntentSummary}`,
  ].join('\n\n');
}
