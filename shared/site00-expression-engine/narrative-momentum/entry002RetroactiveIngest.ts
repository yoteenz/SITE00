/**
 * Entry 002 retroactive narrative momentum — preserves approved visual assets.
 */

import { NDXBOOK_PROOF_BRAND_ID, NDXBOOK_PROOF_PROJECT_KEY } from '../constants.js';
import type { CompileNarrativeMomentumInput, NarrativeMomentumPlan } from './types.js';
import { compileNarrativeMomentumPlan } from './compileNarrativeMomentumPlan.js';

export type Entry002RetroactiveSources = {
  territoryId: string;
  territoryLabel: string;
  chapterMapping: NonNullable<CompileNarrativeMomentumInput['chapterMapping']>;
  premise: string;
};

export function buildEntry002RetroactiveSources(): Entry002RetroactiveSources {
  return {
    territoryId: 'entry-002-territory-edit-suite',
    territoryLabel: 'THE NOSTALGIA EDIT SUITE (THE ROOM WHERE IT HAPPENS)',
    premise: 'WHAT WE ONCE CALLED TACKY, BASIC, AND OVERDONE NOW GETS REMEMBERED AS AN ENTIRE ERA.',
    chapterMapping: {
      premise:
        'WHAT WE ONCE CALLED TACKY, BASIC, AND OVERDONE NOW GETS REMEMBERED AS AN ENTIRE ERA.',
      claim: '"2016 WAS ICONIC." / "TAKE ME BACK." / "WE DIDN\'T KNOW HOW GOOD WE HAD IT."',
      receipt:
        'THE SAME ERA WAS DESCRIBED IN REAL TIME AS: TACKY, BASIC, OVERDONE, DOING TOO MUCH, PLAYED OUT, EVERYBODY LOOKED THE SAME',
      contradiction: 'THE VISUAL CODES DID NOT CHANGE. THE CULTURAL LABEL DID.',
      lens: 'NOSTALGIA / CULTURAL REVISION',
      interjection: 'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.',
      synthesis:
        'TIME CAN TURN EMBARRASSMENT INTO NOSTALGIA BY EDITING THE MEMORY RATHER THAN CHANGING THE OBJECT.',
    },
  };
}

export function compileEntry002RetroactiveNarrativeMomentum(
  priorPlans: readonly NarrativeMomentumPlan[] = [],
): NarrativeMomentumPlan {
  const src = buildEntry002RetroactiveSources();
  const plan = compileNarrativeMomentumPlan({
    projectId: NDXBOOK_PROOF_PROJECT_KEY,
    entryId: 'entry-002',
    topic: '2016 IG BADDIE FASHION',
    creativeTerritoryId: src.territoryId,
    creativeTerritoryLabel: src.territoryLabel,
    brandId: NDXBOOK_PROOF_BRAND_ID,
    contentObjective:
      'Move audience from nostalgia-as-fashion-era to recognition of collective memory re-editing.',
    audienceStartingBelief: '2016 aesthetic = nostalgia / fashion era worth returning to.',
    audienceDesiredShift:
      'Recognize how collective taste rewrites what it once mocked — same codes, new label.',
    availableProof: [],
    chapterMapping: src.chapterMapping,
    layerMode: 'RETROACTIVE_AUTHORITY_LAYER',
    priorPlans,
  });
  return plan;
}
