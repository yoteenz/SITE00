/**
 * Sprint B4.9R3/R4 — Compile ONE reel-first storyboard prompt with visual authority binding.
 */

import type { Entry002ReelVisualConception } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import type { Entry002StoryboardVisualAuthorityManifest } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import type { FinalCinematicStoryboardBrief } from './entry002FinalCinematicStoryboardBrief.js';

const AUTHORITY_ROLE_DESCRIPTIONS: Record<string, string> = {
  NDX_IDENTITY_PRESENCE:
    'how NDX is visually withheld — partial observer framing, silhouette, shadow, high messy 3C bun, light-skinned Black woman, dark styling, noir observer energy',
  SUBJECT_WOMAN_IDENTITY:
    'exact subject-woman identity — face, skin tone, body, sleek straight dark hair, glam makeup, glossy lips, black choker, same-woman continuity',
  NDX_HANDS_LIME_NAILS_INTERACTIONS:
    'NDX hands — skin tone, proportions, SHORT LIME-GREEN NAILS, phone grip, tapping, scrolling, evidence manipulation',
  SUBJECT_WARDROBE_FASHION_CONTINUITY:
    'black bodycon, choker, bomber, thigh-high boot/clear heel, statement bag, French manicure/pedicure, sleek hair, baddie fashion codes both eras',
  PHONE_PROFILE_CULTURAL_GLITCH:
    'phone hold, full-body subject in phone, profile scroll backward, 2016 Instagram, dimensional memory, receipts, crack/signal-break/snap-back',
};

export function compileReelFirstStoryboardPrompt(params: {
  conception: Entry002ReelVisualConception;
  brief: FinalCinematicStoryboardBrief;
  visualAuthorityManifest?: Entry002StoryboardVisualAuthorityManifest;
}): string {
  const { conception, brief, visualAuthorityManifest } = params;
  const momentBlocks = conception.selectedStoryboardMoments
    .map(
      (m) =>
        `Still ${String(m.momentNumber).padStart(2, '0')} — ${m.momentTitle} [covers: ${m.narrativeBeatsCovered.join(', ')}]: ${m.visualDescription}. Camera: ${m.cameraFraming}. Lighting: ${m.lightingState}. Environment: ${m.environmentState}.`,
    )
    .join('\n');

  const authorityVisualBlocks = visualAuthorityManifest
    ? visualAuthorityManifest.entries
        .sort((a, b) => a.referencePriority - b.referencePriority)
        .map(
          (entry, idx) =>
            `REFERENCE ${idx + 1} (${entry.referenceRole}) — ${entry.authorityId}: ${AUTHORITY_ROLE_DESCRIPTIONS[entry.referenceRole] ?? entry.referenceRole}`,
        )
    : Object.entries(conception.authorityRoles).map(
        ([id, role], idx) => `REFERENCE ${idx + 1} — ${id}: ${role}`,
      );

  return [
    'THIS IS ONE REEL, NOT NINE SEPARATE CONCEPTS.',
    'EVERY IMAGE ON THE BOARD MUST LOOK LIKE A FRAME CAPTURED FROM THE SAME CONTINUOUS FILM.',
    '',
    'THE FIVE ATTACHED IMAGES ARE STRICT VISUAL AUTHORITIES FOR THE SAME REEL.',
    'DO NOT TREAT THEM AS FIVE DIFFERENT CONCEPTS.',
    'DO NOT COPY THEIR BOARD LAYOUTS.',
    'EXTRACT AND PRESERVE THEIR APPROVED CINEMATIC CONTENT:',
    'REFERENCE 1 = NDX IDENTITY / PRESENCE',
    'REFERENCE 2 = SUBJECT WOMAN IDENTITY',
    'REFERENCE 3 = NDX HANDS / LIME NAILS / INTERACTIONS',
    'REFERENCE 4 = SUBJECT WARDROBE / FASHION CONTINUITY',
    'REFERENCE 5 = PHONE / PROFILE / CULTURAL GLITCH LANGUAGE',
    'COMBINE THESE FIVE AUTHORITIES INTO ONE CONTINUOUS FILM.',
    'THE RESULT SHOULD LOOK AS IF THESE FIVE APPROVED BOARDS WERE CREATED FIRST TO DEFINE DIFFERENT PARTS OF THE EXACT REEL YOU ARE NOW STORYBOARDING.',
    'DO NOT INVENT REPLACEMENT CHARACTERS.',
    'DO NOT INVENT REPLACEMENT WARDROBE.',
    'DO NOT INVENT A NEW PHONE-GLITCH LANGUAGE.',
    'DO NOT RESET THE VISUAL WORLD BETWEEN PANELS.',
    '',
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
    '=== ONE CONTINUOUS REEL ===',
    `Visual premise: ${conception.visualPremise}`,
    `Physical world: ${conception.physicalWorld}`,
    `Starting reality: ${conception.startingReality}`,
    `Lighting arc: ${conception.lightingArc}`,
    `Camera grammar: ${conception.cameraLanguage}`,
    '',
    '=== APPROVED VISUAL AUTHORITIES (content only — not board layout) ===',
    ...authorityVisualBlocks,
    '',
    '=== NDX FROM AUTHORITY 01 ===',
    `NDX: ${conception.ndxBehavior}`,
    '',
    '=== SUBJECT WOMAN FROM AUTHORITY 02 ===',
    `Subject woman: ${conception.subjectBehavior}`,
    '',
    '=== NDX HANDS FROM AUTHORITY 03 ===',
    'Short lime-green nails on NDX hands — never French tips on NDX.',
    '',
    '=== SUBJECT FASHION FROM AUTHORITY 04 ===',
    'Black bodycon, choker, bomber, boots/heels, French tips on subject only.',
    '',
    '=== PHONE / CULTURAL GLITCH FROM AUTHORITY 05 ===',
    `Phone: ${conception.phoneBehavior}`,
    `Temporal progression: ${conception.temporalProgression}`,
    `Glitch escalation: ${conception.glitchEscalation}`,
    '',
    '=== REEL PROGRESSION ===',
    `Edit suite reveal: ${conception.editSuiteReveal}`,
    `Interjection: ${conception.interjectionTreatment}`,
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
    '=== PROHIBITED DRIFT ===',
    'No replacement characters. No replacement wardrobe. No new phone-glitch vocabulary. No environment reset between panels.',
    '',
    'Mandatory interjection (Frame 08):',
    brief.mandatoryInterjection,
    '',
    '=== NINE SELECTED STILLS FROM THIS EXACT SAME REEL ===',
    momentBlocks,
    '',
    'The board must read as nine screenshots from one short film — chronologically inseparable.',
    'Opening still and final still must share the same environmental reality.',
    'REQUEST ONE 3×3 CINEMATIC STORYBOARD IMAGE.',
  ].join('\n');
}
