import type { WorkspaceConceptSlotId } from './types.js';

export type WorkspaceNbpRenditionPlan = {
  slot: WorkspaceConceptSlotId;
  renditionDirective: string;
  label: string;
};

/** Derives three distinguishable NBP rendition prompts from one GPT2 authority concept. */
export function planWorkspaceNbpRenditions(): readonly WorkspaceNbpRenditionPlan[] {
  return [
    {
      slot: 'CONCEPT_A',
      label: 'RENDITION A',
      renditionDirective:
        'Closest faithful refinement of the GPT2 authority concept — preserve composition and hierarchy with polish only.',
    },
    {
      slot: 'CONCEPT_B',
      label: 'RENDITION B',
      renditionDirective:
        'Stronger spatial and compositional interpretation — same concept, bolder panel geometry and rhythm.',
    },
    {
      slot: 'CONCEPT_C',
      label: 'RENDITION C',
      renditionDirective:
        'Most expressive interpretation within approved creative latitude — richer material and typographic treatment.',
    },
  ] as const;
}

export function listExpectedNbpRenditionJobKeys(): readonly string[] {
  return [
    'RENDITION_A:MOBILE',
    'RENDITION_A:DESKTOP',
    'RENDITION_B:MOBILE',
    'RENDITION_B:DESKTOP',
    'RENDITION_C:MOBILE',
    'RENDITION_C:DESKTOP',
  ];
}
