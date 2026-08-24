/**
 * P0.5E.2 — NdxAudienceBookBehavior
 * Participatory book language — organic community behavior only.
 */

import { NDX_AUDIENCE_BOOK_BEHAVIORS } from './constants.js';
import type { NdxAudienceBookBehavior, NdxAudienceBookBehaviorSpec } from './types.js';

const BEHAVIOR_SPECS: Record<NdxAudienceBookBehavior, Omit<NdxAudienceBookBehaviorSpec, 'behavior'>> = {
  ADD_IT_TO_THE_BOOK: {
    publicLabel: 'Add it to the Book',
    supportsCommunitySubmission: true,
    organicBehaviorOnly: true,
  },
  BOOKMARK_THIS: {
    publicLabel: 'Bookmark this',
    supportsCommunitySubmission: false,
    organicBehaviorOnly: true,
  },
  TURN_THE_PAGE: {
    publicLabel: 'Turn the page',
    supportsCommunitySubmission: false,
    organicBehaviorOnly: true,
  },
  FLIP_BACK: {
    publicLabel: 'Flip back',
    supportsCommunitySubmission: false,
    organicBehaviorOnly: true,
  },
  KEEP_READING: {
    publicLabel: 'Keep reading',
    supportsCommunitySubmission: false,
    organicBehaviorOnly: true,
  },
  DOG_EAR_THIS: {
    publicLabel: 'Dog-ear this',
    supportsCommunitySubmission: true,
    organicBehaviorOnly: true,
  },
  CHECK_THE_FOOTNOTES: {
    publicLabel: 'Check the footnotes',
    supportsCommunitySubmission: false,
    organicBehaviorOnly: true,
  },
};

export function buildNdxAudienceBookBehaviors(): NdxAudienceBookBehaviorSpec[] {
  return NDX_AUDIENCE_BOOK_BEHAVIORS.map((behavior) => ({
    behavior,
    ...BEHAVIOR_SPECS[behavior],
  }));
}

export function addItToTheBookSupportsCommunitySubmission(): true {
  return true;
}

export function audienceOrganicBehaviorTarget(): string {
  return '@ndxbook ADD THIS TO THE BOOK.';
}

export function doNotManufactureFakeCommunityBehavior(): true {
  return true;
}
