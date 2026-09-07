/**
 * Sprint B4.6 follow-up — Pre-storyboard visual authority prompts.
 */

import type { PreStoryboardVisualAuthority } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';

const NEGATIVE =
  'combined five-panel sheet, stick figure cartoon, full NDX portrait, model sheet, subject woman as NDX, two different women, comment graveyard UI, generic social dashboard, random sci-fi portal, Premiere, Final Cut';

export function compileEntry002PreStoryboardAuthorityPrompt(
  board: PreStoryboardVisualAuthority,
): { prompt: string; negativePrompt: string; promptLineage: string[] } {
  const prompt = [
    'Rough structured previsualization authority board — NOT story panels, NOT final cinematic storyboard.',
    'Single standalone authority board only — one glue reference, not a collage of five.',
    `Entry 002 REEL · Board ${board.boardNumber}: ${board.boardTitle}`,
    `Role: ${board.role}`,
    `Purpose: ${board.purpose}`,
    board.visualDescription,
    `Continuity rules: ${board.continuityRules.join('; ')}`,
    `Required: ${board.requiredVisualElements.join(', ')}`,
    `Forbidden: ${board.forbiddenElements.join(', ')}`,
    'Vertical 9:16 — black/lime/cream NDXBOOK palette.',
    board.role === 'SUBJECT_WOMAN_DUAL_ERA' || board.role === 'SUBJECT_FASHION_CONTINUITY'
      ? 'Subject woman fully visible where needed — same person 2016 and 2026. NOT NDX.'
      : '',
    board.role === 'NDX_PRESENCE' || board.role === 'NDX_HAND_NAIL_INTERACTION'
      ? 'NDX partial presence only — short lime nails if hands visible. NOT full protagonist reveal.'
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    prompt,
    negativePrompt: NEGATIVE,
    promptLineage: [
      'sprint-b46-followup-pre-storyboard-visual-authority',
      `pre-sba-${String(board.boardNumber).padStart(2, '0')}`,
      board.boardId,
      board.role,
    ],
  };
}
