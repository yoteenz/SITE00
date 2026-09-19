/**
 * P0.5C.7 — NDXConstructionHistory
 * Each slide implies how NDX physically assembled the page.
 */

import type { ArtBoardRetainedFirstSlideContract } from './types.js';
import type { NDXPageObjectContract } from './ndxPageObjectContract.js';

export type ConstructionAction =
  | 'TORE_FROM_NOTEBOOK'
  | 'TAPED_CLIPPING'
  | 'ADDED_PHOTO_LATER'
  | 'CIRCLED_CLAIM'
  | 'WROTE_MARGIN_NOTE'
  | 'CROSSED_OUT_PRIOR_THOUGHT'
  | 'STAPLED_RECEIPT'
  | 'ADDED_INDEX_TAB'
  | 'FOLDED_CORNER'
  | 'HIGHLIGHTED_PHRASE'
  | 'LAYERED_CORRECTION'
  | 'PUNCHED_HOLES'
  | 'SCANNED_PAGE'
  | 'CLIPPED_INSERT'
  | 'WROTE_ON_RECEIPT'
  | 'TAPED_PHOTO'
  | 'DREW_ARROW'
  | 'UNDERLINED_KEYWORD';

export type NDXConstructionHistory = {
  /** Primary assembly action — how the page began. */
  originAction: ConstructionAction;
  /** Subsequent modifications NDX made. */
  modificationActions: ConstructionAction[];
  /** Human-readable narrative of assembly. */
  narrative: string;
  /** Visual evidence that must survive in final image. */
  survivingEvidence: string[];
  /** Does the page preserve evidence of assembly? */
  preservesAssemblyEvidence: boolean;
};

const TOPIC_CONSTRUCTION: Record<number, { origin: ConstructionAction; mods: ConstructionAction[]; narrative: string; evidence: string[] }> = {
  1: {
    origin: 'STAPLED_RECEIPT',
    mods: ['CIRCLED_CLAIM', 'WROTE_MARGIN_NOTE', 'TAPED_CLIPPING'],
    narrative: 'NDX pulled receipts from checkout, stapled them to office sheet, circled subscription creep, wrote margin calculation',
    evidence: ['staple shadow', 'pen circle on receipt line', 'margin arithmetic'],
  },
  2: {
    origin: 'TORE_FROM_NOTEBOOK',
    mods: ['WROTE_MARGIN_NOTE', 'HIGHLIGHTED_PHRASE'],
    narrative: 'NDX timed checkout on graph paper, wrote elapsed minutes in margin, highlighted waste phrase',
    evidence: ['handwritten elapsed time', 'highlighter stroke on grid'],
  },
  3: {
    origin: 'LAYERED_CORRECTION',
    mods: ['CROSSED_OUT_PRIOR_THOUGHT', 'WROTE_MARGIN_NOTE', 'FOLDED_CORNER'],
    narrative: 'NDX found archival insert, crossed out first read, folded corner after reconsideration',
    evidence: ['cross-out visible', 'correction slip overlay', 'dog-ear fold'],
  },
  4: {
    origin: 'TORE_FROM_NOTEBOOK',
    mods: ['CROSSED_OUT_PRIOR_THOUGHT', 'CIRCLED_CLAIM'],
    narrative: 'NDX tore magazine page, crossed out headline, circled contradiction in body copy',
    evidence: ['torn edge', 'cross-out ink', 'pen circle'],
  },
  5: {
    origin: 'TORE_FROM_NOTEBOOK',
    mods: ['WROTE_MARGIN_NOTE', 'DREW_ARROW', 'HIGHLIGHTED_PHRASE'],
    narrative: 'NDX wrote judgment in notebook margin, drew arrow to evidence, highlighted key phrase',
    evidence: ['margin handwriting', 'arrow to clipping', 'lime highlight'],
  },
  6: {
    origin: 'STAPLED_RECEIPT',
    mods: ['WROTE_ON_RECEIPT', 'TAPED_PHOTO'],
    narrative: 'NDX stapled thermal receipt, annotated total, taped product photo beside it',
    evidence: ['thermal print', 'staple', 'taped photo edge'],
  },
  7: {
    origin: 'CLIPPED_INSERT',
    mods: ['WROTE_MARGIN_NOTE', 'ADDED_INDEX_TAB'],
    narrative: 'NDX clipped index card to page, added tab label, wrote quick note on corner',
    evidence: ['paper clip shadow', 'index tab', 'corner annotation'],
  },
  8: {
    origin: 'SCANNED_PAGE',
    mods: ['TAPED_CLIPPING', 'CIRCLED_CLAIM', 'WROTE_MARGIN_NOTE'],
    narrative: 'NDX scanned UI screenshot, taped source clipping over it, circled contradiction',
    evidence: ['scan crop', 'tape edge', 'pen circle on screenshot'],
  },
  9: {
    origin: 'TORE_FROM_NOTEBOOK',
    mods: ['TAPED_PHOTO', 'WROTE_MARGIN_NOTE', 'HIGHLIGHTED_PHRASE'],
    narrative: 'NDX assembled contact sheet, taped selected frame, marked keeper with margin note',
    evidence: ['contact sheet grid', 'tape on chosen frame', 'margin mark'],
  },
};

export function resolveNDXConstructionHistory(
  contract: ArtBoardRetainedFirstSlideContract,
  topicIndex: number,
  _pageObject?: NDXPageObjectContract,
): NDXConstructionHistory {
  const profile = TOPIC_CONSTRUCTION[topicIndex] ?? TOPIC_CONSTRUCTION[1]!;
  const ab = contract.artBoardDirection;
  const ndxAdded = ab.constructionHistory.ndxAdded;

  const modificationActions = profile.mods.filter((_, i) => i < ndxAdded.length + 1);
  const survivingEvidence = [
    ...profile.evidence,
    ...ndxAdded.slice(0, 2).map((a) => `${a} visible on surface`),
  ];

  return {
    originAction: profile.origin,
    modificationActions,
    narrative: profile.narrative,
    survivingEvidence,
    preservesAssemblyEvidence: survivingEvidence.length >= 1 && modificationActions.length >= 1,
  };
}

export function constructionHistoryFromPageObject(pageObject: NDXPageObjectContract): NDXConstructionHistory {
  const mods: ConstructionAction[] = [];
  if (pageObject.attachmentMethod === 'TAPE') mods.push('TAPED_CLIPPING');
  if (pageObject.attachmentMethod === 'STAPLE') mods.push('STAPLED_RECEIPT');
  if (pageObject.handMarkMode === 'CROSSED_OUT') mods.push('CROSSED_OUT_PRIOR_THOUGHT');
  if (pageObject.handMarkMode === 'CIRCLED') mods.push('CIRCLED_CLAIM');
  if (pageObject.foldBehavior !== 'NONE') mods.push('FOLDED_CORNER');
  if (pageObject.photoIntegrationMode === 'TAPED_PHOTO') mods.push('TAPED_PHOTO');

  return {
    originAction: pageObject.tearBehavior !== 'NONE' ? 'TORE_FROM_NOTEBOOK' : 'CLIPPED_INSERT',
    modificationActions: mods.length ? mods : ['WROTE_MARGIN_NOTE'],
    narrative: pageObject.constructionHistory.join(' → '),
    survivingEvidence: pageObject.surfaceMarks,
    preservesAssemblyEvidence: mods.length >= 1 || pageObject.constructionHistory.length >= 2,
  };
}

export function constructionHistoryImplemented(): true {
  return true;
}
