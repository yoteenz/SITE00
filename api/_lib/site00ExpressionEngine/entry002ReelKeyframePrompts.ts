/**
 * Sprint B4.1 — locked first-pass REEL keyframe prompt compiler.
 */

import type { ReelKeyframeRole } from '../../../shared/site00-expression-engine/entry002ReelTypes.js';

const SHARED_NEGATIVE = [
  'software timeline UI',
  'Adobe or Final Cut interface',
  'comment feed wall',
  'social media mockup demo',
  'floating quote text',
  'infographic arrows',
  'dashboard panels',
  'television screen dominant',
  'broadcast room',
  'news imagery',
  'TV static',
  'Y2K fashion',
  'clean girl aesthetic',
  'modern influencer look',
  'generic clubwear',
  'costume parody nostalgia',
  'decorative collage',
  'graphic flyer layout',
  'multiple competing text blocks',
].join(', ');

export type ReelKeyframePromptBundle = {
  role: ReelKeyframeRole;
  prompt: string;
  negativePrompt: string;
  promptLineage: string[];
  contentPolicySafePrompt: string;
};

export function compileEntry002ReelKeyframePrompt(role: ReelKeyframeRole): ReelKeyframePromptBundle {
  const baseLineage = ['sprint-b4.1-entry-002-reel-keyframe-raster', role];

  if (role === 'START') {
    const prompt = [
      'Cinematic vertical 9:16 film still. Pure or near-pure black field.',
      'A dark tactile smartphone is the primary object — subtle wear, realistic physical body, cinematic object lighting, lime green edge glow.',
      'Phone screen shows ONE controlled present-day nostalgia receipt such as "2016 WAS ICONIC." or "TAKE ME BACK." — only one primary receipt, not a comment wall.',
      'Screen also shows a clear 2016 Instagram baddie fashion archive cue: mid-2010s woman in black choker, bodycon silhouette, bomber jacket, overlined nude lips — not every motif required.',
      'Reads as 2016 IG BADDIE FASHION before it reads as an edit suite. No room establishing shot. Phone as cultural evidence device and archive portal.',
      'NDXBOOK cinematic world — surreal physical, tactile, sparse text, high contrast black and lime accent.',
    ].join(' ');
    return {
      role,
      prompt,
      negativePrompt: SHARED_NEGATIVE,
      promptLineage: [...baseLineage, 'CLAIM', 'ARCHIVE_ENTRY', 'phone-primary'],
      contentPolicySafePrompt: prompt,
    };
  }

  if (role === 'MID') {
    const prompt = [
      'Cinematic vertical 9:16 film still. The Nostalgia Edit Suite — physical surreal cinematic editing room with depth.',
      'Core visual: THE SAME 2016 Instagram baddie fashion image on a physical timeline strip. One old cultural label (TACKY or BASIC or OVERDONE) is being physically cut or removed.',
      'One new label (ICONIC or AN ERA or TAKE ME BACK) is being spliced into its place. Same image, label changes — cultural re-edit.',
      'Physical strip, cream date tape, lime edit marker, razor or edit blade at splice seam, light table, cinematic room depth.',
      'NOT software UI, NOT comment feed, NOT floating quotes. Cultural memory as real physical editing process.',
      'Mid-2010s fashion legibility on the strip image — choker, bodycon, or bomber cues as needed.',
    ].join(' ');
    return {
      role,
      prompt,
      negativePrompt: SHARED_NEGATIVE,
      promptLineage: [...baseLineage, 'CONTRADICTION', 'CULTURAL_REEDIT', 'label-splice'],
      contentPolicySafePrompt: prompt,
    };
  }

  const prompt = [
    'Cinematic vertical 9:16 film still. Entry 002 synthesis end card inside the Nostalgia Edit Suite.',
    'Dominant synthesis line: "THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND." — sparse, narratively required typography only.',
    'Entry identity: ENTRY 002 — 2016 IG BADDIE FASHION. Filing-card resolved narrative state.',
    'May retain phone, physical timeline, edit suite depth, lime cut markers — but NOT a copy of the approved cover.',
    'Feels like the reel has arrived somewhere — resolved, cinematic, tactile, physical surreal edit world.',
    'No random floating text, no quote walls, no TV or broadcast staging.',
  ].join(' ');
  return {
    role,
    prompt,
    negativePrompt: SHARED_NEGATIVE,
    promptLineage: [...baseLineage, 'INTERJECTION', 'SYNTHESIS', 'filing-card'],
    contentPolicySafePrompt: prompt,
  };
}

export function compileAllEntry002ReelKeyframePrompts(): ReelKeyframePromptBundle[] {
  return (['START', 'MID', 'END'] as ReelKeyframeRole[]).map(compileEntry002ReelKeyframePrompt);
}
