import type { PageViewportId } from '../designProjectBinding/pageViewportAuthority.js';

export type PageConceptViewportGalleryAction = {
  id: string;
  label: string;
  icon: 'sliders' | 'cycle' | 'inspect' | 'expand';
};

const INSPECT = { id: 'inspect', label: 'INSPECT', icon: 'inspect' as const };
const FULLSCREEN = { id: 'fullscreen', label: 'FULLSCREEN', icon: 'expand' as const };

export function resolvePageConceptViewportGalleryActions(input: {
  viewport: PageViewportId;
  canonicalGpt2: boolean;
}): readonly PageConceptViewportGalleryAction[] {
  if (!input.canonicalGpt2) {
    return [
      { id: 'refine', label: 'REFINE CONCEPT', icon: 'sliders' },
      { id: 'regenerate', label: 'REGENERATE CONCEPT', icon: 'cycle' },
      { id: 'inspect', label: 'INSPECT CANDIDATE', icon: 'inspect' },
      { id: 'fullscreen', label: 'VIEW FULLSCREEN', icon: 'expand' },
    ];
  }
  if (input.viewport === 'TABLET') {
    return [
      { id: 'use-tablet', label: 'USE THIS TABLET VERSION', icon: 'cycle' },
      { id: 'regenerate-tablet', label: 'REGENERATE TABLET', icon: 'sliders' },
      INSPECT,
      FULLSCREEN,
    ];
  }
  if (input.viewport === 'DESKTOP') {
    return [
      { id: 'use-desktop', label: 'USE THIS DESKTOP VERSION', icon: 'cycle' },
      { id: 'regenerate-desktop', label: 'REGENERATE DESKTOP', icon: 'sliders' },
      INSPECT,
      FULLSCREEN,
    ];
  }
  return [
    { id: 'select-mobile', label: 'SELECT MOBILE CONCEPT', icon: 'cycle' },
    { id: 'refine', label: 'REFINE CONCEPT', icon: 'sliders' },
    { id: 'regenerate', label: 'REGENERATE CONCEPT', icon: 'cycle' },
    INSPECT,
    FULLSCREEN,
  ];
}
