/**
 * P0.5C.7 — NDX_NOTEBOOK_CAROUSEL_NORTH_STAR_SET
 * Register approved launch carousels as visual evidence — NOT literal templates.
 */

import {
  MEET_NDX_SEQUENCE_ID,
  PERSONAL_BRAND_SEQUENCE_ID,
  SAVED_THIS_WEEK_SEQUENCE_ID,
  meetNdxSlideSeeds,
  personalBrandSlideSeeds,
  savedThisWeekSlideSeeds,
} from '../../site00-studio-world-production/founderCreativeIngestion/adapters/ndxLaunchRow01Pilot.js';

export const NDX_NOTEBOOK_CAROUSEL_NORTH_STAR_SET_ID = 'NDX_NOTEBOOK_CAROUSEL_NORTH_STAR_SET' as const;

export type NorthStarCarouselEvidence = {
  sequenceId: string;
  title: string;
  role: 'CHARACTER_WORLD' | 'POINT_OF_VIEW' | 'CONTENT_FRANCHISE';
  slideCount: number;
  evidenceCategories: string[];
  usedAsLiteralTemplate: false;
  notes: string;
};

export const NDX_NOTEBOOK_CAROUSEL_NORTH_STAR_SET: NorthStarCarouselEvidence[] = [
  {
    sequenceId: MEET_NDX_SEQUENCE_ID,
    title: 'MEET NDX',
    role: 'CHARACTER_WORLD',
    slideCount: meetNdxSlideSeeds().length,
    evidenceCategories: [
      'physical page construction',
      'torn edges',
      'punch holes / spiral notebook',
      'photography integration',
      'uppercase authorship',
      'cream/black materiality',
      'lime restraint',
      'bespoke composition per slide',
    ],
    usedAsLiteralTemplate: false,
    notes: 'Character/world introduction — evidence for Book-world page-making, not layout clone.',
  },
  {
    sequenceId: PERSONAL_BRAND_SEQUENCE_ID,
    title: 'EVERYBODY HAS A PERSONAL BRAND',
    role: 'POINT_OF_VIEW',
    slideCount: personalBrandSlideSeeds().length,
    evidenceCategories: [
      'editorial typography variation',
      'black page + cream page alternation',
      'lime underline interventions',
      'portrait photo integration',
      'uppercase headline authority',
    ],
    usedAsLiteralTemplate: false,
    notes: 'Editorial POV carousel — typographic range inside Book world.',
  },
  {
    sequenceId: SAVED_THIS_WEEK_SEQUENCE_ID,
    title: 'THINGS I SAVED THIS WEEK',
    role: 'CONTENT_FRANCHISE',
    slideCount: savedThisWeekSlideSeeds().length,
    evidenceCategories: [
      'tactile archive/scrapbook grammar',
      'tape/paper clip motifs',
      'evidence artifacts',
      'authentic source case preserved',
      'NDX uppercase on authored slides',
      'spiral notebook title slide',
    ],
    usedAsLiteralTemplate: false,
    notes: 'Archive/evidence franchise — canonical physical page lineage evidence.',
  },
];

export function northStarSetRegistered(): boolean {
  return NDX_NOTEBOOK_CAROUSEL_NORTH_STAR_SET.length === 3;
}

export function northStarUsedAsLiteralTemplate(): false {
  return false;
}

export function getNorthStarBySequenceId(sequenceId: string): NorthStarCarouselEvidence | undefined {
  return NDX_NOTEBOOK_CAROUSEL_NORTH_STAR_SET.find((n) => n.sequenceId === sequenceId);
}
