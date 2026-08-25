/**
 * P0.CB.1 — NDXBOOK Launch Row 01 pilot metadata (adapter layer — not generic engine).
 */

import { randomUUID } from 'node:crypto';
import { NDX_LAUNCH_ROW_01_CAMPAIGN_ID } from '../constants.js';
import type { FounderCreativeProvenance, FounderCreativeParentSequence, PhotographySourceMode } from '../types.js';
import type { SlideReferenceSeed as DecompSeed } from '../referenceDecomposition.js';

export const NDX_FOUNDER_CREATIVE_PROVENANCE: FounderCreativeProvenance = {
  origin: 'FOUNDER_CREATED',
  creativeAuthority: 'FOUNDER_APPROVED',
  generationProvenance: 'EXTERNAL_CHATGPT_CREATIVE_SESSION',
  canonStatus: 'CAMPAIGN_APPROVED_CREATIVE',
  learningPermission: 'CREATIVE_SIGNAL_ALLOWED',
};

export const MEET_NDX_SEQUENCE_ID = 'seq-meet-ndx';
export const PERSONAL_BRAND_SEQUENCE_ID = 'seq-personal-brand';
export const SAVED_THIS_WEEK_SEQUENCE_ID = 'seq-saved-this-week-001';

export function buildNdxLaunchRow01ParentSequences(): FounderCreativeParentSequence[] {
  return [
    {
      sequenceId: MEET_NDX_SEQUENCE_ID,
      campaignId: NDX_LAUNCH_ROW_01_CAMPAIGN_ID,
      title: 'MEET NDX',
      format: 'CAROUSEL_SEQUENCE',
      role: 'CHARACTER_WORLD',
      franchise: null,
      entry: null,
      provenance: NDX_FOUNDER_CREATIVE_PROVENANCE,
      referenceBoardId: null,
      slideIds: [],
      rowIndex: 0,
      caption: null,
      notes: 'Character/world introduction — HQ desk photograph available',
      reconstructionStatus: 'PENDING',
      sequenceReviewStatus: 'PENDING',
    },
    {
      sequenceId: PERSONAL_BRAND_SEQUENCE_ID,
      campaignId: NDX_LAUNCH_ROW_01_CAMPAIGN_ID,
      title: 'EVERYBODY HAS A PERSONAL BRAND',
      format: 'CAROUSEL_SEQUENCE',
      role: 'POINT_OF_VIEW',
      franchise: null,
      entry: null,
      provenance: NDX_FOUNDER_CREATIVE_PROVENANCE,
      referenceBoardId: null,
      slideIds: [],
      rowIndex: 1,
      caption: null,
      notes: 'Editorial POV carousel — 12 slides',
      reconstructionStatus: 'PENDING',
      sequenceReviewStatus: 'PENDING',
    },
    {
      sequenceId: SAVED_THIS_WEEK_SEQUENCE_ID,
      campaignId: NDX_LAUNCH_ROW_01_CAMPAIGN_ID,
      title: 'THINGS I SAVED THIS WEEK',
      format: 'CAROUSEL_SEQUENCE',
      role: 'CONTENT_FRANCHISE',
      franchise: 'THINGS_I_SAVED_THIS_WEEK',
      entry: '001',
      provenance: NDX_FOUNDER_CREATIVE_PROVENANCE,
      referenceBoardId: null,
      slideIds: [],
      rowIndex: 2,
      caption: null,
      notes: 'Archive/evidence franchise entry 001 — 12 slides',
      reconstructionStatus: 'PENDING',
      sequenceReviewStatus: 'PENDING',
    },
  ];
}

export function meetNdxSlideSeeds(): DecompSeed[] {
  return [
    { slideNumber: 1, observableCopy: ['NDX desk portrait — culture wall collage'], compositionNotes: ['Portrait at desk', 'Mug NDX', 'Laptop sticky note lime'], hasPhotography: true, hasTypography: true, hasAnnotations: true },
    { slideNumber: 2, observableCopy: ['I keep noticing things.', 'things people say.', 'things people don\'t say.', 'so i started writing them down.'], compositionNotes: ['Cream paper', 'Serif headline', 'Lime handwriting'], hasPhotography: false, hasTypography: true, hasAnnotations: true },
    { slideNumber: 3, observableCopy: ['wait. who decided that?', 'everybody knows ≠ everybody is right.'], compositionNotes: ['Spiral notebook top-down', 'Coffee ring stain'], hasPhotography: true, hasTypography: true, hasAnnotations: true },
    { slideNumber: 4, observableCopy: ['I change my mind.', 'I just like knowing why.'], compositionNotes: ['Side profile writing', 'Warm desk lamp'], hasPhotography: true, hasTypography: true, hasAnnotations: false },
    { slideNumber: 5, observableCopy: ['CULTURE IS DATA.', 'unfortunately, so is the group chat.*'], compositionNotes: ['Collage layout', 'Group chat screenshot', 'Portrait inset'], hasPhotography: true, hasTypography: true, hasAnnotations: true },
    { slideNumber: 6, observableCopy: ['I have opinions.', 'Some of them are probably wrong.', 'we\'ll find out.'], compositionNotes: ['Solid black background', 'Centered serif'], hasPhotography: false, hasTypography: true, hasAnnotations: true },
    { slideNumber: 7, observableCopy: ['IN THE BOOK —', 'culture, money, beauty, behavior...', 'subject to change. obviously.'], compositionNotes: ['Handwritten list', 'Black bracket annotation'], hasPhotography: false, hasTypography: true, hasAnnotations: true },
    { slideNumber: 8, observableCopy: ['I\'m not here to tell you what to think.', 'You can read over my shoulder.'], compositionNotes: ['Split screen', 'City night portrait'], hasPhotography: true, hasTypography: true, hasAnnotations: true },
    { slideNumber: 9, observableCopy: ['NDXBOOK', 'PAGE 001', 'the book is open.'], compositionNotes: ['Closing cover', 'Lime dot accent'], hasPhotography: false, hasTypography: true, hasAnnotations: false },
  ];
}

export function personalBrandSlideSeeds(): DecompSeed[] {
  const headlines = [
    'EVERYBODY HAS A PERSONAL BRAND.',
    'Your personal brand isn\'t a logo.',
    'IT\'S NOT FAKE.',
    'EXAMPLES:',
    'People are reading you anyway.',
    'YOUR BRAND IS ALREADY ANSWERING:',
    'THE PROBLEM ISNT THAT YOU HAVE A PERSONAL BRAND.',
    'BUILD IT ON PURPOSE.',
    'A FEW REMINDERS:',
    'At the end of the day, your brand is what people say about you when you\'re not in the room.',
    'MAKE SURE THEY\'RE SAYING WHAT YOU WANT TO BE TRUE.',
    'NDX.',
  ];
  return headlines.map((headline, i) => ({
    slideNumber: i + 1,
    observableCopy: [headline],
    compositionNotes: [
      i === 0 ? 'Intro — lime underline' : '',
      i === 3 || i === 4 || i === 9 ? 'Split with portrait photo' : 'Editorial type slide',
      'Black/cream palette',
    ].filter(Boolean),
    hasPhotography: [3, 4, 9].includes(i),
    hasTypography: true,
    hasAnnotations: [0, 2, 7, 8, 11].includes(i),
  }));
}

export function savedThisWeekSlideSeeds(): DecompSeed[] {
  const titles = [
    'THINGS I SAVED THIS WEEK.',
    'Quiet quitting clipping — Forbes',
    'Text thread screenshot',
    'Rhode lip treatment product photo',
    'Billboard photo — NOBODY CARES',
    'Anxiety poll screenshot',
    'SZA interview clipping',
    'Whole Foods receipt',
    'FKA twigs tweet screenshot',
    'The Atlantic loneliness cover',
    'REMINDER TO SELF list',
    'that\'s this week. NDXBOOK',
  ];
  return titles.map((title, i) => ({
    slideNumber: i + 1,
    observableCopy: [title],
    compositionNotes: [
      'Tactile archive/scrapbook grammar',
      i === 0 ? 'Spiral notebook title slide' : 'Evidence artifact slide',
      'Tape/paper clip/scotch tape motifs',
      'Lime highlighter interventions',
    ],
    hasPhotography: [3, 4, 6, 9].includes(i),
    hasTypography: true,
    hasAnnotations: true,
  }));
}

export function ndxPilotReferenceAssetId(sequenceId: string): string {
  return `ref-board-${sequenceId}-${randomUUID().slice(0, 8)}`;
}

export function ndxGridForSequence(sequenceId: string): { rows: number; cols: number; count: number } {
  if (sequenceId === MEET_NDX_SEQUENCE_ID) return { rows: 3, cols: 3, count: 9 };
  if (sequenceId === PERSONAL_BRAND_SEQUENCE_ID) return { rows: 3, cols: 4, count: 12 };
  return { rows: 4, cols: 3, count: 12 };
}

export function defaultPhotoSourceModeForSequence(sequenceId: string): PhotographySourceMode {
  if (sequenceId === MEET_NDX_SEQUENCE_ID) return 'USE_EXISTING_ASSET';
  return 'REFERENCE_ONLY';
}

export function slideSeedsForSequence(sequenceId: string): DecompSeed[] {
  if (sequenceId === MEET_NDX_SEQUENCE_ID) return meetNdxSlideSeeds();
  if (sequenceId === PERSONAL_BRAND_SEQUENCE_ID) return personalBrandSlideSeeds();
  return savedThisWeekSlideSeeds();
}
