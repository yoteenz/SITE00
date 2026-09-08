/**
 * Sprint B4.9R3 — Compile ONE reel-first storyboard prompt.
 * Describes complete imagined reel BEFORE individual still descriptions.
 */

import type { Entry002ReelVisualConception } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import type { FinalCinematicStoryboardBrief } from './entry002FinalCinematicStoryboardBrief.js';

export function compileReelFirstStoryboardPrompt(params: {
  conception: Entry002ReelVisualConception;
  brief: FinalCinematicStoryboardBrief;
}): string {
  const { conception, brief } = params;
  const momentBlocks = conception.selectedStoryboardMoments
    .map(
      (m) =>
        `Still ${String(m.momentNumber).padStart(2, '0')} — ${m.momentTitle} [covers: ${m.narrativeBeatsCovered.join(', ')}]: ${m.visualDescription}. Camera: ${m.cameraFraming}. Lighting: ${m.lightingState}. Environment: ${m.environmentState}.`,
    )
    .join('\n');

  return [
    'THIS IS ONE REEL, NOT NINE SEPARATE CONCEPTS.',
    'EVERY IMAGE ON THE BOARD MUST LOOK LIKE A FRAME CAPTURED FROM THE SAME CONTINUOUS FILM.',
    'KEEP THE SAME: ROOM, NDX, PHONE, LIGHTING WORLD, WARDROBE, SUBJECT IDENTITY, CAMERA LANGUAGE.',
    'ALLOW ONLY NATURAL SHOT-TO-SHOT PROGRESSION.',
    'DO NOT REDESIGN THE SCENE FOR EACH PANEL.',
    'DO NOT CREATE NINE DIFFERENT SETS.',
    'DO NOT CREATE NINE DIFFERENT FASHION SHOOTS.',
    'DO NOT CREATE AN INFOGRAPHIC.',
    'DO NOT CREATE AN EDITORIAL COLLAGE.',
    'DO NOT CREATE A CONTACT SHEET OF UNRELATED IMAGES.',
    'DO NOT IMITATE AUTHORITY-BOARD TYPOGRAPHY, COLUMNS, EVIDENCE LABELS, OR CARD LAYOUTS.',
    'Extract CINEMATIC VISUAL CONTENT from authorities — NOT their board design.',
    '',
    'NDXBOOK · ENTRY 002 · OH, NOW IT WAS FUN? · FINAL REEL STORYBOARD',
    '',
    'Generate ONE cinematic storyboard / visual story board image.',
    'Form: 3 columns × 3 rows — nine sequential stills from the SAME imagined reel.',
    'Cinematic images occupy 85–90% of board. Minimal text. Small restrained header only.',
    '',
    '=== THE COMPLETE REEL AS ONE CONTINUOUS FILM ===',
    `Visual premise: ${conception.visualPremise}`,
    `Physical world: ${conception.physicalWorld}`,
    `Starting reality: ${conception.startingReality}`,
    `Lighting arc: ${conception.lightingArc}`,
    `Camera grammar: ${conception.cameraLanguage}`,
    `NDX: ${conception.ndxBehavior}`,
    `Subject woman: ${conception.subjectBehavior}`,
    `Phone: ${conception.phoneBehavior}`,
    `Temporal progression: ${conception.temporalProgression}`,
    `Edit suite reveal: ${conception.editSuiteReveal}`,
    `Snap-back: ${conception.snapBackTreatment}`,
    '',
    'Continuity anchors (persistent across ALL stills):',
    ...conception.continuityAnchors.map((a) => `- ${a}`),
    '',
    'Character firewall:',
    `- NDX: ${brief.characterFirewall.ndx} — short lime-green nails`,
    `- Subject: ${brief.characterFirewall.subjectWoman} — French-tip nails, separate from NDX`,
    `- Phone content: ${brief.phoneContentRules.framing}, varied full-body poses, one woman's profile`,
    '',
    'Reference authorities (visual conditioning — ONE reel, do not merge identities):',
    ...Object.entries(conception.authorityRoles).map(([id, role]) => `- ${id}: ${role}`),
    '',
    'Mandatory interjection (Frame 08):',
    brief.mandatoryInterjection,
    '',
    '=== NINE SELECTED STILLS FROM THIS EXACT SAME REEL ===',
    momentBlocks,
    '',
    'The board must read as nine screenshots from one short film — chronologically inseparable.',
    'Opening still and final still must share the same environmental reality.',
  ].join('\n');
}
