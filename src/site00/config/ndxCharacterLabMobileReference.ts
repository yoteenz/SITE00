/**
 * P0.VR.1D.11 — Mobile Character Lab full-screen reference snapshot (visual authority).
 */

export const NDX_CHARACTER_LAB_REFERENCE_PATH =
  '/visual-references/founder/ndxbook/mobile-character-lab-fullscreen-reference.png';

export const NDX_CHARACTER_LAB_TITLE = 'CHARACTER LAB';

export const NDX_CHARACTER_LAB_TABS = ['LANGUAGE LAB', 'VOICE LAB', 'CASTING'] as const;
export type NdxCharacterLabTab = (typeof NDX_CHARACTER_LAB_TABS)[number];
export const NDX_CHARACTER_LAB_DEFAULT_TAB: NdxCharacterLabTab = 'LANGUAGE LAB';

export const NDX_CHARACTER_LAB_PORTRAIT_PATH =
  '/visual-references/founder/ndxbook/character-lab-artwork/character-portrait.webp';

export const NDX_CHARACTER_LAB_PORTRAIT_OBJECT_POSITION = 'center 18%';

export const NDX_CHARACTER_LAB_LANGUAGE_NOTE_SURFACE_PATH =
  '/visual-references/founder/ndxbook/character-lab-artwork/language-note-surface.webp';

export const NDX_CHARACTER_LAB_LANGUAGE_NOTE_LINES = [
  'Search. Frame.',
  'Sees patterns.',
  'Doesn\u2019t perform.',
  'Explains. Like',
  'a friend talking',
  'to her',
] as const;

export const NDX_CHARACTER_LAB_LANGUAGE_NOTE_EMPHASIS = 'best friend.';

export const NDX_CHARACTER_LAB_STICKY_NOTE_SURFACE_PATH =
  '/visual-references/founder/ndxbook/character-lab-artwork/working-draft-sticky-note.webp';

export const NDX_CHARACTER_LAB_STICKY_NOTE_LINES = ['working', 'draft', 'v0.2'] as const;

export const NDX_CHARACTER_LAB_WHO_SHE_IS = [
  'Pattern recognizer',
  'Skeptical by default',
  'Playful, but truthful',
  'Built for the Long Run',
] as const;

export const NDX_CHARACTER_LAB_QUOTE_LINES = [
  'I\u2019M NOT HERE TO BE RIGHT.',
  'I\u2019M HERE TO SHOW YOU',
  'WHAT MAKES SENSE.',
] as const;

export type NdxCharacterLabPerformanceMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  vrRegionId: string;
};

export const NDX_CHARACTER_LAB_PERFORMANCE: NdxCharacterLabPerformanceMetric[] = [
  {
    id: 'content-tiles',
    label: 'CONTENT TILES',
    value: '128K',
    delta: '\u2191 12%',
    vrRegionId: 'ndx.character.performance.card.1',
  },
  {
    id: 'stories',
    label: 'STORIES',
    value: '8.7K',
    delta: '\u2191 31%',
    vrRegionId: 'ndx.character.performance.card.2',
  },
  {
    id: 'reels',
    label: 'REELS',
    value: '3.2K',
    delta: '\u2191 16%',
    vrRegionId: 'ndx.character.performance.card.3',
  },
  {
    id: 'profile-views',
    label: 'PROFILE VIEWS',
    value: '+1.1K',
    delta: '\u2191 18%',
    vrRegionId: 'ndx.character.performance.card.4',
  },
];

export const NDX_CHARACTER_LAB_PERFORMANCE_PERIOD = 'This month';
