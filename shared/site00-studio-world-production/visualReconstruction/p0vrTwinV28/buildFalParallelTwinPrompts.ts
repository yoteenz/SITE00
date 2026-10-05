import type { MinimalTwinGenerationState } from './types.js';

function objectLegendBlock(state: MinimalTwinGenerationState): string {
  return state.objectIds
    .map((id, i) => {
      const short = id.replace(/\./g, '-').slice(0, 12);
      return `${id} (label code ${String(i + 1).padStart(2, '0')}/${short})`;
    })
    .join('\n');
}

export function buildAuthorityVisualPrompt(state: MinimalTwinGenerationState, pageIntentSummary: string): string {
  return [
    'NDXBOOK mobile overview client canvas — FINISHED AUTHORITY VISUAL (founder review quality).',
    '375×812 mobile artboard. Polish, brand-correct, editorial NDX lime/black/white.',
    'NO blueprint labels, NO wireframe boxes, NO debug text, NO object ID overlays.',
    `compositionStateId: ${state.compositionStateId}`,
    `Locked object set (${state.objectIds.length} objects) — same layout as shared twin state:`,
    objectLegendBlock(state),
    `Host boundary: ${state.hostBoundary}`,
    `Brand: ${state.brandContext.colorLanguage.join(', ')} · ${state.brandContext.typographicGrammar.slice(0, 3).join('; ')}`,
    `Page intent: ${pageIntentSummary}`,
    'Render all nav items, hero, progress, metrics, focus, milestone, activity in one cohesive page.',
  ].join('\n\n');
}

export function buildBlueprintTwinVisualPrompt(state: MinimalTwinGenerationState, pageIntentSummary: string): string {
  return [
    'NDXBOOK mobile overview — SURGICAL BLUEPRINT TWIN VISUAL (technical construction sheet).',
    'SAME EXACT composition, hierarchy, scale, and placement as the paired authority visual for this state.',
    '375×812 mobile artboard. Wireframe / technical drawing / labelled construction map treatment.',
    `compositionStateId: ${state.compositionStateId} (MUST MATCH AUTHORITY PAIR)`,
    'Label EVERY object boundary with its objectId (or legible short code tied to this list):',
    objectLegendBlock(state),
    'Show: object boundaries, text bounds, nav item bounds, divider extents, surface boundaries,',
    'progress track/fill geometry, metric cells, asset boundaries, NDX overlay boundary, activity row.',
    'Do NOT change column count, hero shape, nav order, or asset placement vs the shared state.',
    'Do NOT render as a polished marketing page — this is the blueprint twin artifact only.',
    `Page intent (layout only): ${pageIntentSummary}`,
  ].join('\n\n');
}

export function buildStandaloneAssetProofPrompt(state: MinimalTwinGenerationState, objectId: string): string {
  const intent = state.assetIntents.find((a) => a.objectId === objectId);
  return [
    `Standalone isolated asset for objectId ${objectId} from composition ${state.compositionStateId}.`,
    intent?.intent.includes('TRANSPARENT')
      ? 'Transparent background required. Single subject only. No UI chrome.'
      : 'Single subject asset. No baked text or nav.',
    'Match silhouette and color intent from the authority page hero/overlay role.',
    `Role: ${intent?.intent ?? 'GENERATED_ASSET'}`,
  ].join('\n');
}
