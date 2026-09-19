/**
 * Sprint B4.9 — Compile final cinematic storyboard brief from approved authorities.
 */

import type { ReelTreatmentAuthority } from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import type { PreStoryboardVisualAuthorityPack } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID } from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import {
  assertStoryboardCompilationFailClosed,
  resolveFinalStoryboardCompilationContract,
} from './entry002FinalStoryboardCompilationContract.js';
import { buildEntry002FinalCinematicStoryboardPanels } from './entry002FinalCinematicStoryboardPanels.js';
import { ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS } from './entry002PreStoryboardFounderApproval.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import { ENTRY_002_WORLD_ID } from './entry002Blueprint.js';

export type FinalCinematicStoryboardBrief = {
  storyboardId: typeof ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID;
  entryId: 'entry-002';
  entryTitle: string;
  treatmentId: string;
  chapterId: string;
  worldId: string;
  authorityIds: string[];
  authorityAssetUrls: string[];
  characterFirewall: {
    ndx: string;
    subjectWoman: string;
    ndxNails: 'SHORT_LIME_GREEN';
    subjectNails: 'FRENCH_TIPS';
    subjectPedicure: 'FRENCH_TIPS';
  };
  phoneContentRules: {
    framing: 'FULL_BODY_OUTFIT_LED';
    poseVariation: true;
    noRepeatedIdenticalPortrait: true;
  };
  mandatoryInterjection: 'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.';
  panels: FinalCinematicStoryboardPanel[];
  referenceConditioning: Array<{ authorityId: string; previewUrl: string | null }>;
  historicalSequenceExcluded: 'NDX-ENTRY-002-REEL-CINEMATIC-SEQUENCE-001';
};

export function compileEntry002FinalCinematicStoryboardBrief(params: {
  treatment: ReelTreatmentAuthority;
  preStoryboardAuthorityPack: PreStoryboardVisualAuthorityPack;
}): FinalCinematicStoryboardBrief {
  const contract = resolveFinalStoryboardCompilationContract(params.preStoryboardAuthorityPack);
  assertStoryboardCompilationFailClosed(contract);

  const panels = buildEntry002FinalCinematicStoryboardPanels();
  const authorityIds = ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS.map((a) => a.authorityId);

  return {
    storyboardId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID,
    entryId: 'entry-002',
    entryTitle: params.treatment.entryTitle,
    treatmentId: params.treatment.treatmentId,
    chapterId: CHAPTER_01_ID,
    worldId: ENTRY_002_WORLD_ID,
    authorityIds,
    authorityAssetUrls: params.preStoryboardAuthorityPack.authorities
      .map((a) => a.previewUrl)
      .filter((u): u is string => Boolean(u)),
    characterFirewall: {
      ndx: contract.characterSeparation.ndx,
      subjectWoman: contract.characterSeparation.subjectWoman,
      ndxNails: 'SHORT_LIME_GREEN',
      subjectNails: 'FRENCH_TIPS',
      subjectPedicure: 'FRENCH_TIPS',
    },
    phoneContentRules: {
      framing: 'FULL_BODY_OUTFIT_LED',
      poseVariation: true,
      noRepeatedIdenticalPortrait: true,
    },
    mandatoryInterjection: 'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.',
    panels,
    referenceConditioning: params.preStoryboardAuthorityPack.authorities.map((a) => ({
      authorityId: a.boardId,
      previewUrl: a.previewUrl,
    })),
    historicalSequenceExcluded: 'NDX-ENTRY-002-REEL-CINEMATIC-SEQUENCE-001',
  };
}

export function buildFinalCinematicStoryboardPrompt(brief: FinalCinematicStoryboardBrief): string {
  const panelSummary = brief.panels
    .map((p) => `Panel ${p.panelNumber}: ${p.panelTitle} — ${p.visualDescription}`)
    .join('\n');
  return [
    `FINAL CINEMATIC STORYBOARD — ${brief.entryTitle}`,
    `15-panel vertical cinematic storyboard strip for Entry 002 reel.`,
    `NDX: partial observer, lime nails, never full protagonist. Subject woman: same woman 2016+2026, French tips, black bodycon/choker.`,
    `Phone content: full-body outfit-led varied poses. Cultural glitch not sci-fi.`,
    `Mandatory interjection panel: ${brief.mandatoryInterjection}`,
    panelSummary,
  ].join('\n\n');
}
