/**
 * Sprint B4.4 — Rough storyboard panel prompt compiler (directorial sketch — not polished keyframes).
 */

import type { ReelStoryboardPanel } from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';
import type { ReelStoryboardContinuityAuthority } from '../../../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';

export function compileEntry002ReelStoryboardPanelPrompt(
  panel: ReelStoryboardPanel,
  continuity: ReelStoryboardContinuityAuthority,
): { prompt: string; negativePrompt: string } {
  const prompt = [
    'Director storyboard panel — rough monochrome sketch-like storyboard frame, NOT polished final render.',
    'Black white and grey with lime accent markers only where specified.',
    'Vertical 9:16 composition for Instagram Reel storyboard.',
    `Panel ${panel.panelNumber} of 10 — ${panel.argumentBeat} beat.`,
    panel.visualDescription,
    `Character: ${panel.characterBehavior}. ${continuity.characterIdentity}.`,
    `Hair: ${continuity.hairSilhouette}. Nails: ${continuity.shortLimeNails}.`,
    `Phone: ${panel.phoneRole}. ${continuity.phoneArtifact}.`,
    `Fashion: ${panel.fashionEvidence.join(', ')}. ${continuity.fashionEvidence}.`,
    `Edit suite: ${panel.editSuiteBehavior}. ${continuity.nostalgiaEditSuite}.`,
    `Camera: ${panel.cameraBehavior}.`,
    panel.textBehavior !== 'None' && panel.textBehavior !== 'None or restrained caption fragment'
      ? `Text overlay sketch: ${panel.textBehavior}`
      : 'Minimal or no text.',
    'Low fidelity director sketch — emphasis on sequence, composition, story, pacing, character placement, prop logic.',
    'NOT beauty render. NOT photorealistic keyframe. Storyboard authority only.',
  ]
    .filter(Boolean)
    .join(' ');

  const negativePrompt = [
    'photorealistic',
    'polished beauty render',
    'final keyframe',
    'comment feed UI',
    'social media comment wall',
    'Entry 001 broadcast aesthetic',
    'full color glossy photo',
    'violent imagery',
    'watermark',
  ].join(', ');

  return { prompt, negativePrompt };
}

export function compileEntry002ReelStoryboardStripPrompt(
  panels: ReelStoryboardPanel[],
  continuity: ReelStoryboardContinuityAuthority,
): { prompt: string; negativePrompt: string } {
  const panelSummaries = panels
    .map((p) => `P${p.panelNumber}:${p.argumentBeat}-${p.shotPurpose.slice(0, 40)}`)
    .join(' | ');

  const prompt = [
    'Horizontal director storyboard strip — 10 rough monochrome sketch panels in sequence left to right.',
    'Each panel vertical 9:16 proportion within strip. Black white grey with lime accent edit markers.',
    'Entry 002 REEL — 2016 IG baddie fashion nostalgia edit suite narrative.',
    `Sequence: ${panelSummaries}.`,
    `Continuity: ${continuity.characterIdentity}. ${continuity.phoneArtifact}. ${continuity.nostalgiaEditSuite}.`,
    'Low fidelity sketch storyboard — NOT polished keyframes. Shows full reel rhythm claim through synthesis.',
  ].join(' ');

  const negativePrompt = [
    'photorealistic',
    'polished beauty render',
    'single image only',
    'comment feed UI',
    'full color glossy photo',
  ].join(', ');

  return { prompt, negativePrompt };
}
