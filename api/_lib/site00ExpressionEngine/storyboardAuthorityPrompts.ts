/**
 * Sprint B4.6 — Structural storyboard board prompts (rough previsualization authority).
 */

import type { StoryboardBoard } from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import { buildEntry002CharacterAuthoritySet } from './storyboardContinuityRules.js';
import { buildEntry002ReelTreatmentAuthority } from './entry002ReelTreatment.js';

const NEGATIVE =
  'stick figure cartoon, polished campaign poster, combined multi-panel sheet, desktop NLE UI, Premiere, Final Cut, comment graveyard UI, NDX as full visible protagonist, two different women, parody 2016, generic modern fashion influencer, Entry 001 TV broadcast, floating text everywhere, software dashboard';

export function compileEntry002StructuralBoardPrompt(board: StoryboardBoard): {
  prompt: string;
  negativePrompt: string;
  promptLineage: string[];
} {
  const treatment = buildEntry002ReelTreatmentAuthority();
  const character = buildEntry002CharacterAuthoritySet();

  const prompt = [
    'Rough structured cinematic previsualization storyboard board — NOT a finished poster, NOT stick figures.',
    'Single standalone board only — one major reel segment, not a collage of five boards.',
    `Entry 002 REEL · ${treatment.entryTitle} · ${treatment.subject}`,
    `Board ${board.boardNumber}: ${board.boardTitle}`,
    `Story function: ${board.storyFunction}`,
    `Argument role: ${board.argumentGrammarRole}`,
    board.visualDescription,
    `NDX presence: ${board.ndxPresence}. ${character.ndxPresenceProfile.nailAuthority}`,
    `Subject woman: ${board.subjectWomanPresence}. ${character.subjectWomanContinuityProfile.identityLock}`,
    `Required elements: ${board.requiredVisualElements.join(', ')}`,
    `Continuity: ${board.continuityNotes}`,
    `Transition in: ${board.transitionIn}. Transition out: ${board.transitionOut}.`,
    'Vertical 9:16 rough previs — black/lime/cream NDXBOOK palette, phone as evidence device, edit-suite metaphor physical not software.',
    board.boardNumber === 5
      ? 'Mandatory interjection readable: THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.'
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    prompt,
    negativePrompt: NEGATIVE,
    promptLineage: [
      'sprint-b46-entry-002-structural-storyboard',
      `sba-board-${String(board.boardNumber).padStart(2, '0')}`,
      board.boardId,
      board.argumentGrammarRole,
    ],
  };
}
