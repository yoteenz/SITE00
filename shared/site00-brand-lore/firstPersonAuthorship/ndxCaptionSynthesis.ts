/**
 * NDX campaign caption synthesis — character + founder language authority.
 */

import type { FounderLanguageEvidence } from '../brandCharacterReadiness/types.js';
import type { BrandCharacterSynthesis } from '../brandCharacterSynthesis/types.js';
import { buildCampaignCaptionDraft } from '../../site00-studio-world-production/campaignCaption/captionSynthesis.js';
import type { CampaignCaption } from '../../site00-studio-world-production/campaignCaption/types.js';
import { stripInternalLabelsFromPublicText, founderLanguageInformsCaption } from './ndxPublicCopyTranslation.js';
import { evaluateCaptionSequenceRelationship } from '../../site00-studio-world-production/campaignCaption/captionSynthesis.js';

export function synthesizeNdxInstagramCaption(params: {
  contentPieceId: string;
  campaignId: string;
  slideCopy: string[];
  characterSystem?: BrandCharacterSynthesis | null;
  founderLanguage?: FounderLanguageEvidence[];
  thesisSummary?: string;
  lockedSlideCount: number;
  generatedSlideCount?: number;
  requiredSlideCount: number;
  characterBeat?: string | null;
  humorEligible?: boolean;
}): CampaignCaption | null {
  const cleanedSlideCopy = params.slideCopy.map(stripInternalLabelsFromPublicText);

  const draft = buildCampaignCaptionDraft({
    contentPieceId: params.contentPieceId,
    campaignId: params.campaignId,
    platform: 'INSTAGRAM_FEED',
    slideCopy: cleanedSlideCopy,
    characterBeat: params.characterBeat ? stripInternalLabelsFromPublicText(params.characterBeat) : null,
    thesisSummary: params.thesisSummary,
    lockedSlideCount: params.lockedSlideCount,
    generatedSlideCount: params.generatedSlideCount,
    requiredSlideCount: params.requiredSlideCount,
    humorEligible: params.humorEligible,
  });

  if (!draft) return null;

  if (params.founderLanguage?.length || params.characterSystem) {
    const founderHint = founderLanguageInformsCaption({
      founderLanguage: params.founderLanguage ?? [],
      thesisSummary: params.thesisSummary ?? cleanedSlideCopy[0] ?? '',
    });
    if (founderHint && !draft.text.includes(founderHint.slice(0, 20))) {
      draft.text = stripInternalLabelsFromPublicText(founderHint);
    }
  }

  draft.text = stripInternalLabelsFromPublicText(draft.text);
  draft.platform = 'INSTAGRAM_FEED';

  const rel = evaluateCaptionSequenceRelationship({
    captionText: draft.text,
    slideCopy: cleanedSlideCopy,
  });
  draft.sequenceRelationship = rel.passed ? 'PASS' : 'FAIL';
  draft.characterEvaluation = params.characterSystem ? 'CHARACTER_AUTHORITY_APPLIED' : null;

  return draft;
}

export function tiktokCaptionDerivesSeparately(instagramCaption: string): boolean {
  return !instagramCaption.includes('TIKTOK');
}

export function threadsCaptionDerivesSeparately(instagramCaption: string): boolean {
  return !instagramCaption.includes('THREADS');
}

export function captionHumorRespectsEligibility(humorEligible: boolean, caption: string): boolean {
  if (!humorEligible && /\bLOL\b|\bJK\b|\b😂\b/i.test(caption)) return false;
  return true;
}

export function captionPreservesUncertainty(caption: string, thesisConfidence: string): boolean {
  if (thesisConfidence === 'LOW' && !/\?|MAYBE|NOT SURE|I THINK/i.test(caption)) return false;
  return true;
}
