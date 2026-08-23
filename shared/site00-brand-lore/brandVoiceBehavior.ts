/**
 * BrandVoiceBehavior — derived from Brand Personality, not new canon.
 */

import type { BrandPersonalityProfile } from './personalityTypes.js';
import type { FormatNativeExpressionProfile } from './formatNativeExpression.js';
import { applyCreativeDisplayCase } from './brandIdentity.js';

export type BrandVoiceBehavior = {
  headlineVoice: string;
  bodyVoice: string;
  microcopyVoice: string;
  annotationVoice: string;
  ctaVoice: string;
  socialReplyVoice: string;
  errorVoice: string;
  campaignVoice: string;
  evidenceVoice: string;
  correctionVoice: string;
  feedHeadlineVoice: string;
  carouselProgressionVoice: string;
  storyVoice: string;
  reelHookVoice: string;
  tiktokVoice: string;
  commentReplyVoice: string;
};

function fieldText(field: { value: unknown } | undefined, fallback: string): string {
  const v = field?.value;
  if (v === null || v === undefined) return fallback;
  if (Array.isArray(v)) return v.join(', ') || fallback;
  const s = String(v).trim();
  return s || fallback;
}

export function deriveBrandVoiceBehavior(params: {
  personality: BrandPersonalityProfile | null | undefined;
  formatProfile?: FormatNativeExpressionProfile | null;
  brandSlug?: string | null;
}): BrandVoiceBehavior | null {
  if (!params.personality) return null;
  const p = params.personality;
  const displayCase = params.brandSlug === 'ndxbook' ? 'UPPERCASE' : 'INHERIT';

  const wit = fieldText(p.witBehavior, 'direct');
  const confidence = fieldText(p.confidenceBehavior, 'decisive');
  const disagreement = fieldText(p.disagreementBehavior, 'corrective');
  const correction = fieldText(p.selfCorrectionBehavior, 'public correction');
  const observation = fieldText(p.observationalBehavior, 'specific');

  const base = {
    headlineVoice: `${confidence} headline — ${observation}`,
    bodyVoice: fieldText(p.humanityBehavior, 'human, useful'),
    microcopyVoice: 'system/metadata voice — precise labels',
    annotationVoice: `${disagreement} margin voice`,
    ctaVoice: confidence,
    socialReplyVoice: 'designed artifact uppercase; normal conversation inherits source case',
    errorVoice: `${correction} when wrong`,
    campaignVoice: wit,
    evidenceVoice: 'receipts and proof devices',
    correctionVoice: correction,
    feedHeadlineVoice: `decisive feed claim — ${confidence}`,
    carouselProgressionVoice: `${wit} across slides — statement → strike → replacement → evidence`,
    storyVoice: 'fast sequence / reaction / poll / evidence frames',
    reelHookVoice: `hook → editorial intervention → payoff (${wit})`,
    tiktokVoice: 'native vertical pacing with editorial interruption',
    commentReplyVoice: 'designed branded reply artifacts only — not forced uppercase on chat',
  };

  if (displayCase !== 'UPPERCASE') return base;

  return Object.fromEntries(
    Object.entries(base).map(([k, v]) => [k, applyCreativeDisplayCase(v, 'UPPERCASE')]),
  ) as BrandVoiceBehavior;
}

export function summarizeBrandVoiceBehavior(voice: BrandVoiceBehavior | null): string | null {
  if (!voice) return null;
  return [
    `headline: ${voice.headlineVoice}`,
    `feed: ${voice.feedHeadlineVoice}`,
    `carousel: ${voice.carouselProgressionVoice}`,
    `story: ${voice.storyVoice}`,
    `reel: ${voice.reelHookVoice}`,
    `correction: ${voice.correctionVoice}`,
  ].join('\n');
}
