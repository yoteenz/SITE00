/**
 * Format-native expression contracts — production behavior, not dimensions.
 */

import type { EntryFormat, FormatExpression } from './types.js';

const BASE_QA = [
  'FORMAT_NATIVE_QA must pass before production-ready',
  'Resize-only adaptation fails when native behavior required',
];

export const FORMAT_NATIVE_CONTRACTS: Record<EntryFormat, Omit<FormatExpression, 'status'>> = {
  REEL: {
    format: 'REEL',
    role: 'Cinematic narrative hook',
    behavior: 'Observational cinematic sequence with native hook pacing — NOT moving carousel',
    narrativePurpose: 'Establish thesis through lived-in scene progression and broadcast interruption',
    assetRequirements: ['9:16 video', 'character continuity', 'environment plates', 'title card'],
    motionRequirements: ['camera observes before subject performs', 'channel-surf montage', 'TV shutoff transition'],
    audioRequirements: ['ambience', 'foley', 'broadcast VO', 'glitch transitions', 'title-card sting'],
    textDensity: 'LOW',
    continuityRequirements: ['CHARACTER', 'ENVIRONMENT', 'NARRATIVE_STATE', 'PALETTE'],
    qaRules: [...BASE_QA, 'REEL ≠ MOVING CAROUSEL', 'Must include native hook frame distinct from carousel cover'],
    audioRequired: true,
  },
  CAROUSEL: {
    format: 'CAROUSEL',
    role: 'Expanded visual argument',
    behavior: 'Progressive slide argument with compositional variety — not resize of reel frame',
    narrativePurpose: 'Extend WHO IS WE thesis through archival/cultural graphics sequence',
    assetRequirements: ['slide sequence', 'typography specimens', 'cultural reference graphics'],
    motionRequirements: ['static or micro-motion per slide', 'no reel repost as slides'],
    audioRequirements: [],
    textDensity: 'HIGH',
    continuityRequirements: ['TYPOGRAPHY', 'PALETTE', 'WORLD_GRAMMAR', 'NARRATIVE_STATE'],
    qaRules: [...BASE_QA, 'Sequence cohesion without sameness', 'No slide cloning'],
    audioRequired: false,
  },
  STORY: {
    format: 'STORY',
    role: 'Margin commentary',
    behavior: 'Vertical ephemeral frames with annotation energy — NOT resized feed tile',
    narrativePurpose: 'Margin notes and cultural asides supporting entry thesis',
    assetRequirements: ['9:16 frames', 'handwritten/annotation layer', 'poll-ready CTA variant separate'],
    motionRequirements: ['tap-forward pacing', 'annotation reveals'],
    audioRequirements: [],
    textDensity: 'MEDIUM',
    continuityRequirements: ['TYPOGRAPHY', 'PALETTE', 'NARRATIVE_STATE'],
    qaRules: [...BASE_QA, 'STORY ≠ RESIZED FEED TILE'],
    audioRequired: false,
  },
  CTA_STORY: {
    format: 'CTA_STORY',
    role: 'Poll/share/response',
    behavior: 'Interactive story frame designed for audience response — distinct from margin story',
    narrativePurpose: 'Pose WHO IS WE question to audience with poll/share mechanics',
    assetRequirements: ['poll sticker layout', 'question typography', 'response hook'],
    motionRequirements: ['static or minimal motion'],
    audioRequirements: [],
    textDensity: 'MEDIUM',
    continuityRequirements: ['TYPOGRAPHY', 'NARRATIVE_STATE'],
    qaRules: [...BASE_QA, 'Must not be duplicate of STORY frame without CTA behavior'],
    audioRequired: false,
  },
  COVER: {
    format: 'COVER',
    role: 'Entry filing hero',
    behavior: 'Symbolic entry artifact as hero — entry-specific, not brand template',
    narrativePurpose: 'Vintage television as media/spectatorship symbol for ENTRY 001',
    assetRequirements: ['hero artifact render', 'editorial cover layout', 'lime accent restraint'],
    motionRequirements: ['optional subtle artifact motion for reel cover variant'],
    audioRequirements: [],
    textDensity: 'LOW',
    continuityRequirements: ['OBJECT_ARTIFACT', 'PALETTE', 'TYPOGRAPHY'],
    qaRules: [...BASE_QA, 'Artifact must be entry-specific — not generic NDXBOOK TV template'],
    audioRequired: false,
  },
  HIGHLIGHT: {
    format: 'HIGHLIGHT',
    role: 'Entry filing identity',
    behavior: 'Highlight cover + title for Instagram filing under ENTRY 001',
    narrativePurpose: 'Persistent entry identity in profile highlights rail',
    assetRequirements: ['highlight icon/cover', 'entry number', 'title legibility at small scale'],
    motionRequirements: [],
    audioRequirements: [],
    textDensity: 'LOW',
    continuityRequirements: ['OBJECT_ARTIFACT', 'TYPOGRAPHY'],
    qaRules: [...BASE_QA, 'Must match entry filing identity not generic brand mark'],
    audioRequired: false,
  },
  TIKTOK: {
    format: 'TIKTOK',
    role: 'Discovery/performance translation',
    behavior: 'Faster hook, native pacing, reaction/cultural moment — NOT automatic reel repost',
    narrativePurpose: 'TikTok-native discovery behavior preserving thesis with faster hook',
    assetRequirements: ['9:16 native edit', 'comment-response potential', 'cultural moment framing'],
    motionRequirements: ['faster hook', 'native TikTok pacing', 'reaction beat'],
    audioRequirements: ['native sound design or trending-adjacent original audio'],
    textDensity: 'LOW',
    continuityRequirements: ['NARRATIVE_STATE', 'CHARACTER', 'PALETTE'],
    qaRules: [...BASE_QA, 'TIKTOK ≠ AUTOMATIC REEL REPOST'],
    audioRequired: true,
  },
  X: {
    format: 'X',
    role: 'Live-margin thread translation',
    behavior: 'DROP → JOKE → RECEIPT → QUESTION → SYNTHESIS → BREADCRUMB — NOT caption copy-paste',
    narrativePurpose: 'Thread-native cultural argument with receipt behavior',
    assetRequirements: ['thread copy blocks', 'receipt/evidence frames', 'breadcrumb to entry'],
    motionRequirements: [],
    audioRequirements: [],
    textDensity: 'HIGH',
    continuityRequirements: ['NARRATIVE_STATE', 'WORLD_GRAMMAR'],
    qaRules: [...BASE_QA, 'X ≠ CAPTION COPY-PASTE from Instagram'],
    audioRequired: false,
  },
};

export function compileFormatExpression(format: EntryFormat): FormatExpression {
  const contract = FORMAT_NATIVE_CONTRACTS[format];
  return { ...contract, status: 'PLANNED' };
}

export function compileAllFormatExpressions(): FormatExpression[] {
  return (Object.keys(FORMAT_NATIVE_CONTRACTS) as EntryFormat[]).map(compileFormatExpression);
}
