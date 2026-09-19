/**
 * Sprint B4.5 — Cinematic visual sequence prompts (reference-conditioned, delta-only).
 */

import type { CinematicVisualSequenceFrame } from '../../../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';

export function compileEntry002CinematicFramePrompt(
  frame: CinematicVisualSequenceFrame,
  characterCanon: ReturnType<typeof import('./entry002CinematicSequenceContinuityPack.js').buildEntry002CharacterVisualCanon>,
): { prompt: string; negativePrompt: string } {
  const prompt = [
    'Cinematic visual development frame for Entry 002 Instagram Reel — photorealistic high-concept film still.',
    'NOT a sketch. NOT a storyboard. NOT a comic panel. NOT a wireframe. NOT a moodboard fragment. NOT a graphic flyer.',
    'Vertical 9:16 cinematic composition.',
    `Frame ${frame.frameNumber} of 10 — ${frame.argumentBeat} beat.`,
    `THIS FRAME: ${frame.visualDescription}`,
    `Camera: ${frame.cameraBehavior}.`,
    `Character presence: ${frame.characterPresence}. NDX role: ${characterCanon.ndxRole}. Subject woman: ${characterCanon.subjectWomanRole}. ${characterCanon.subjectWomanIdentity}. NDX nails when hands visible: ${characterCanon.ndxNails}. NEVER collapse NDX and subject woman into one character.`,
    `Phone: ${frame.phoneRole}.`,
    `Fashion: ${frame.fashionEvidence.join(', ')}.`,
    `Edit suite: ${frame.editSuiteBehavior}. Surreal physical edit world — NEVER desktop Premiere/Final Cut/monitor editing UI.`,
    frame.textBehavior !== 'None' ? `Text only if required: ${frame.textBehavior}` : 'No large explanatory text.',
    'Palette: black, cream, dark neutrals, restrained lime accents (nails, phone edge, edit marks only — NOT entire room lime).',
    'Lighting: cinematic, low-key, photoreal, controlled.',
    'Describe what CHANGES in this frame — do not redesign character from scratch.',
  ]
    .filter(Boolean)
    .join(' ');

  const negativePrompt = [
    'sketch',
    'storyboard',
    'pencil drawing',
    'comic panel',
    'wireframe',
    'moodboard collage',
    'graphic flyer',
    'Premiere Pro',
    'Final Cut',
    'desktop monitor editing UI',
    'computer workstation',
    'comment feed wall',
    'long nails',
    'nude nails',
    'random manicure',
    'different woman each frame',
    'over-saturated lime room',
    'watermark',
  ].join(', ');

  return { prompt, negativePrompt };
}

export function compileEntry002CinematicContactSheetPrompt(
  frameCount: number,
): { prompt: string; negativePrompt: string } {
  const prompt = [
    `Production contact sheet — ${frameCount} cinematic visual development frames in sequence grid.`,
    'Photorealistic film stills — NOT sketches. Entry 002 REEL 2016 IG baddie fashion nostalgia edit suite.',
    'Same woman, same palette, same world across all frames. Black cream dark neutrals restrained lime.',
    'Production board layout — NOT NDXBOOK marketing art.',
  ].join(' ');

  const negativePrompt = 'sketch, storyboard, marketing poster, comic, wireframe, comment UI';
  return { prompt, negativePrompt };
}
