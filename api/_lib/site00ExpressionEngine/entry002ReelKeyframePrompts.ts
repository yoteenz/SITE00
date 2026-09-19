/**
 * Sprint B4.2 — locked frame-specific REEL keyframe production prompts.
 */

import type { ReelKeyframeRole } from '../../../shared/site00-expression-engine/entry002ReelTypes.js';

const START_NEGATIVE = [
  'edit suite room establishing shot',
  'television',
  'broadcast imagery',
  'comment wall',
  'multiple comments',
  'floating text',
  'graphic flyer composition',
  'software UI',
  'Y2K fashion',
  'modern influencer',
].join(', ');

const MID_NEGATIVE = [
  'Premiere UI',
  'Final Cut UI',
  'software timeline',
  'dashboard',
  'comment feed',
  'quote wall',
  'VHS aesthetic',
  'generic collage',
  'multiple label pairs',
  'television',
  'broadcast room',
].join(', ');

const END_NEGATIVE = [
  'approved cover copy',
  'static poster layout',
  'television',
  'broadcast',
  'quote wall',
  'floating decorative text',
  'graphic flyer',
  'software UI',
].join(', ');

export type ReelKeyframePromptBundle = {
  role: ReelKeyframeRole;
  prompt: string;
  negativePrompt: string;
  promptLineage: string[];
  contentPolicySafePrompt: string;
  narrativeRole: 'CLAIM' | 'CONTRADICTION' | 'INTERJECTION_SYNTHESIS';
};

export function compileEntry002ReelKeyframePrompt(role: ReelKeyframeRole): ReelKeyframePromptBundle {
  if (role === 'START') {
    const prompt = [
      'Vertical 9:16 cinematic film still. Pure or near-pure black frame.',
      'ONE physical smartphone is the hero object — dark tactile body, subtle wear, cinematic realism, lime-green edge underglow.',
      'Phone screen shows exactly ONE present-day nostalgia claim: "2016 WAS ICONIC." — not a comment wall.',
      'Screen also shows a clear archived 2016 Instagram baddie fashion image: black choker, bodycon silhouette, bomber jacket, overlined nude lip — curated combination, not every motif.',
      'Must read 2016 IG BADDIE FASHION before Nostalgia Edit Suite. No full edit suite room. Phone as cultural evidence device and archive portal.',
      'NDXBOOK cinematic — sparse text, black and lime identity, tactile realism.',
    ].join(' ');
    return {
      role,
      prompt,
      negativePrompt: START_NEGATIVE,
      promptLineage: ['sprint-b4.2-reel-kf-raster', 'START', 'CLAIM', 'ARCHIVE_ENTRY'],
      contentPolicySafePrompt: prompt,
      narrativeRole: 'CLAIM',
    };
  }

  if (role === 'MID') {
    const prompt = [
      'Vertical 9:16 cinematic film still. The Nostalgia Edit Suite — physical, cinematic, surreal, dark, tactile editing room.',
      'Central idea immediately legible: THE FASHION IMAGE STAYS THE SAME. THE LABEL CHANGES.',
      'ONE physical 2016 Instagram baddie fashion memory image mounted on a tactile timeline strip.',
      'Old label TACKY is being physically cut and removed. New label ICONIC is being spliced into the same position. ONE label pair only.',
      'Light table, film memory strips, cream date tape, metal edit blade at splice seam, lime cut marker, dim dimensional room depth.',
      'Edit blade is symbolic editing equipment — not violent. NOT software UI, NOT comment feed, NOT quote wall.',
    ].join(' ');
    return {
      role,
      prompt,
      negativePrompt: MID_NEGATIVE,
      promptLineage: ['sprint-b4.2-reel-kf-raster', 'MID', 'CONTRADICTION', 'RECLASSIFICATION'],
      contentPolicySafePrompt: prompt,
      narrativeRole: 'CONTRADICTION',
    };
  }

  const prompt = [
    'Vertical 9:16 cinematic film still. Entry 002 synthesis — resolved, post-edit, quiet, intentional.',
    'Primary copy dominates: "THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND." — sparse narratively required typography.',
    'Entry identity below or after: ENTRY 002 — 2016 IG BADDIE FASHION.',
    'Inside the Nostalgia Edit Suite — may retain physical timeline, phone, lime edit marker, edit suite depth.',
    'NOT a copy of the cover composition. NOT a static poster. Reel has arrived at synthesis filing state.',
    'No random floating text, no quote walls, no TV or broadcast staging.',
  ].join(' ');
  return {
    role,
    prompt,
    negativePrompt: END_NEGATIVE,
    promptLineage: ['sprint-b4.2-reel-kf-raster', 'END', 'INTERJECTION', 'SYNTHESIS'],
    contentPolicySafePrompt: prompt,
    narrativeRole: 'INTERJECTION_SYNTHESIS',
  };
}

export function compileAllEntry002ReelKeyframePrompts(): ReelKeyframePromptBundle[] {
  return (['START', 'MID', 'END'] as ReelKeyframeRole[]).map(compileEntry002ReelKeyframePrompt);
}
