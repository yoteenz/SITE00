/**
 * B5.2 — Entry 001 narrative continuity linkage (C1.0 adjacent layer).
 */

import type { Entry001NarrativeContinuityLink } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import { ENTRY_001_TITLE, ENTRY_001_SUBJECT } from '../../../../../shared/site00-expression-engine/constants.js';

export const ENTRY001_NARRATIVE_CONTINUITY: Entry001NarrativeContinuityLink = {
  entryId: 'entry-001',
  thesis: ENTRY_001_TITLE,
  argumentThemes: [
    'media / public complicity',
    'retrospective empathy',
    'public rehabilitation',
    'changed narrative',
    'apology after spectacle',
    'accountability after exploitation',
  ],
  narrativeAuthorityVersion: 'entry001-chapter-01-v001',
  reelGapAcknowledged: true,
};

export function entry001NarrativeDescriptor(): string {
  return `${ENTRY_001_SUBJECT} / MEDIA COMPLICITY — A DIFFERENT STORY STILL MATTERS.`;
}
