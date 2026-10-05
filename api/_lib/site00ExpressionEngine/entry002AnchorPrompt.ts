/**
 * Sprint B3 — compile ENTRY 002 COVER anchor prompt from selected composition route.
 */

import type { Entry002AnchorCompositionRoute } from '../../../shared/site00-expression-engine/anchorTypes.js';
import { ENTRY_002_THESIS, ENTRY_002_TITLE } from '../../../shared/site00-expression-engine/constants.js';

export function compileEntry002AnchorPrompt(route: Entry002AnchorCompositionRoute): {
  prompt: string;
  negativePrompt: string;
  promptLineage: string[];
  contentPolicySafePrompt: string;
} {
  const fashion = route.fashionEvidence.join(', ').toLowerCase();

  const prompt = [
    `Cinematic editorial photograph for NDXBOOK ${ENTRY_002_TITLE}.`,
    `THESIS: ${ENTRY_002_THESIS}.`,
    `SUBJECT FOCAL POINT (MUST DOMINATE): 2016 Instagram baddie fashion — ${fashion}.`,
    `COMPOSITION: ${route.focalMechanism}. Camera: ${route.cameraMechanism}.`,
    `WORLD (background support only): surreal physical nostalgia edit suite — ${route.editSuiteBehavior}. NOT software UI.`,
    `ARTIFACT: ${route.artifactBehavior}.`,
    `PHONE (evidence/interjection device, NOT the world): ${route.phoneBehavior}.`,
    `CULTURAL CONTRADICTION VISUAL: same fashion codes, different cultural labels — tacky/basic/overdone becoming iconic/nostalgic.`,
    `TEXT DISCIPLINE — ONLY these words visible: ${route.visibleCopy.join(' | ')} | ${route.marginalInterjection}.`,
    'No random floating phrases. No decorative quote walls. No Adobe Premiere. No Final Cut. No dashboard UI.',
    'No VHS retro. No lime collage. No television. No broadcast grammar. No generic social media UI poster.',
    'Not 2020s clean girl, Y2K, coquette, or current streetwear. Photorealistic fashion editorial lighting.',
  ].join('\n');

  const negativePrompt = [
    'software screenshot',
    'Adobe Premiere',
    'Final Cut',
    'dashboard UI',
    'comment graveyard',
    'giant phone feed',
    'television',
    'broadcast',
    'VHS',
    'lime collage',
    'random floating text',
    'quote wall',
    'moodboard',
    'Y2K',
    'clean girl aesthetic',
    'coquette',
    'generic club fashion',
    '2020s fashion',
  ].join(', ');

  const promptLineage = [
    'sprint-b3-entry-002-creative-anchor',
    route.routeId,
    'chapter-01-which-one-is-it',
    'territory-nostalgia-edit-suite',
    ENTRY_002_TITLE,
  ];

  const contentPolicySafePrompt = [
    `High-end fashion editorial photograph for NDXBOOK entry cover.`,
    `Subject: glamorous 2016-era Instagram fashion editorial look — ${fashion.replace(/bodycon/g, 'fitted silhouette')}.`,
    `Scene: surreal cinematic physical film-editing studio with timeline strips and splice markers (not computer software).`,
    `Composition: ${route.focalMechanism.replace(/razor/gi, 'edit blade')}.`,
    `Small smartphone on table showing archived fashion commentary (evidence prop, not giant screen).`,
    `Physical timeline labeled 2016, cream tape, restrained lime accent on cut markers.`,
    `Typography sparse: NDXBOOK, ENTRY 002, OH NOW IT WAS FUN, WHEN CRINGE BECOMES NOSTALGIA, 2016.`,
    `One margin note: THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.`,
    `Photorealistic, dimensional depth, fashion-forward, editorial lighting.`,
  ].join(' ');

  return { prompt, negativePrompt, promptLineage, contentPolicySafePrompt };
}
