/**
 * Sprint B4.9R2 — Compile ONE multi-panel storyboard generation prompt from planning manifest.
 */

import type { FinalCinematicStoryboardPanelManifestEntry } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import type { FinalCinematicStoryboardBrief } from './entry002FinalCinematicStoryboardBrief.js';

export function compileSingleMultiPanelStoryboardPrompt(params: {
  manifest: FinalCinematicStoryboardPanelManifestEntry[];
  brief: FinalCinematicStoryboardBrief;
}): string {
  const panelBlocks = params.manifest
    .map(
      (p) =>
        `Panel ${String(p.panelNumber).padStart(2, '0')} [${p.beatId}]: ${p.storyFunction}. ${p.description}. Camera: ${p.cameraFraming}. NDX: ${p.ndxVisibility}. Subject: ${p.subjectVisibility}. Phone: ${p.phoneState}. Era: ${p.era}.${p.requiredText ? ` Mandatory visible text: "${p.requiredText}".` : ''}`,
    )
    .join('\n');

  return [
    'Generate ONE SINGLE professional cinematic storyboard sheet image.',
    'NDXBOOK · ENTRY 002 · OH, NOW IT WAS FUN? · FINAL CINEMATIC STORYBOARD',
    '',
    'CRITICAL: This must be ONE unified vertical storyboard image containing 16 DISTINCT sequential panels in a clean 4×4 grid.',
    'NOT a poster. NOT a moodboard. NOT one hero frame with notes. NOT a technical spec card.',
    'Images dominate. Text is secondary — only small panel numbers and restrained board labeling.',
    '',
    'CHARACTER FIREWALL:',
    `- NDX: ${params.brief.characterFirewall.ndx} — partial observer only, short lime-green nails, never full protagonist reveal.`,
    `- Subject woman: ${params.brief.characterFirewall.subjectWoman} — French-tip nails/pedicure, separate from NDX.`,
    `- Phone content: ${params.brief.phoneContentRules.framing}, varied full-body poses, no repeated identical portrait.`,
    '',
    'REFERENCE AUTHORITIES (visual conditioning — do not merge identities):',
    ...params.brief.authorityIds.map((id) => `- ${id}`),
    '',
    'MANDATORY INTERJECTION (Panel 15 exact line):',
    params.brief.mandatoryInterjection,
    '',
    '16-PANEL CHRONOLOGICAL SEQUENCE:',
    panelBlocks,
    '',
    'The single image must allow a viewer to follow the complete reel from discovery through snap-back without reading external documentation.',
  ].join('\n');
}
