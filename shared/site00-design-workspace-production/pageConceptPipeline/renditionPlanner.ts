import type { PageConceptRenditionSlotId } from './types.js';

export type PageNbpRenditionPlan = {
  slot: PageConceptRenditionSlotId;
  label: string;
  renditionDirective: string;
};

export function planPageNbpRenditions(): readonly PageNbpRenditionPlan[] {
  return [
    {
      slot: 'RENDITION_A',
      label: 'RENDITION A',
      renditionDirective:
        'Closest faithful refinement of the GPT2 page authority concept.',
    },
    {
      slot: 'RENDITION_B',
      label: 'RENDITION B',
      renditionDirective:
        'Stronger spatial composition while preserving the same GPT2 page concept.',
    },
    {
      slot: 'RENDITION_C',
      label: 'RENDITION C',
      renditionDirective:
        'Most expressive interpretation within approved page creative latitude.',
    },
  ] as const;
}
