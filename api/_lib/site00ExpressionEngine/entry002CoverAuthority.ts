/**
 * Sprint B3.1 — founder-refined Entry 002 cover creative anchor authority.
 */

import type { Entry002FounderCoverAuthority } from '../../../shared/site00-expression-engine/chapterCoverGrammarTypes.js';
import { B3_GENERATED_ANCHOR_ASSET_ID } from './entry002B3FounderOverride.js';
import { buildEntry002FounderCoverPresentationSpec } from './chapterCoverPresentationGrammar.js';

const NOW = '2026-09-07T20:00:00.000Z';

export function buildEntry002FounderCoverAuthority(): Entry002FounderCoverAuthority {
  return {
    authorityType: 'CREATIVE_ANCHOR_AUTHORITY',
    entryId: 'entry-002',
    entryNumber: 2,
    format: 'COVER',
    aspect: '9:16',
    subject: '2016 IG BADDIE FASHION',
    title: 'OH, NOW IT WAS FUN?',
    presentation: buildEntry002FounderCoverPresentationSpec(),
    founderJudgment: 'LOVE_IT',
    canonState: 'CREATIVE_ANCHOR_APPROVED',
    supersedesAssetId: B3_GENERATED_ANCHOR_ASSET_ID,
    propagateDownstream: false,
    registeredAt: NOW,
  };
}

export function registerEntry002FounderCoverAuthority(): Entry002FounderCoverAuthority {
  return buildEntry002FounderCoverAuthority();
}
