/**
 * Revision separation — distinct layers for character, behavior, thesis, visual, channel.
 */

export type MarketingRevisionLayer =
  | 'CHARACTER_REVISION'
  | 'MARKETING_BEHAVIOR_REVISION'
  | 'CONTENT_THESIS_REVISION'
  | 'VISUAL_REVISION'
  | 'CHANNEL_REVISION';

export type MarketingArtifactRevision = {
  id: string;
  artifactId: string;
  layer: MarketingRevisionLayer;
  note: string;
  createdAt: string;
};

export function classifyRevisionLayer(note: string): MarketingRevisionLayer {
  const lower = note.toLowerCase();
  if (/more suspicious|behavior|react/i.test(lower)) return 'MARKETING_BEHAVIOR_REVISION';
  if (/conclusion|thesis|supported|evidence is right but claim/i.test(lower)) return 'CONTENT_THESIS_REVISION';
  if (/composition|visual|boring|designed|layout/i.test(lower)) return 'VISUAL_REVISION';
  if (/instagram|email|channel|stories|reels/i.test(lower)) return 'CHANNEL_REVISION';
  return 'CHARACTER_REVISION';
}

export function characterAndVisualRevisionsRemainSeparate(
  a: MarketingRevisionLayer,
  b: MarketingRevisionLayer,
): boolean {
  return a !== b;
}
