/**
 * C1.7 — NDXBOOK copy voice adapter (extends generic voice, does not replace director).
 */

import type { CampaignVoiceProfile } from '../../../shared/site00-expression-engine/campaign-copy/types.js';

export function buildNdxbookVoiceOverlay(base: CampaignVoiceProfile): CampaignVoiceProfile {
  return {
    ...base,
    brandVoice: 'sharp editorial — cultural receipt language',
    campaignVoice: 'interjection grammar + wit + provocation with restraint',
    witLevel: 'high',
    provocationLevel: 'high',
    preferredRhetoricalDevices: [
      ...base.preferredRhetoricalDevices,
      'interjection',
      'cultural receipt',
      'chapter continuity',
    ],
    forbiddenLanguage: [
      ...base.forbiddenLanguage,
      'wellness fluff',
      'generic empowerment',
    ],
  };
}

export function ndxbookCaptionShouldNotRepeatInterjection(onAssetInterjection: string, caption: string): boolean {
  if (!onAssetInterjection.trim()) return true;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return norm(caption).includes(norm(onAssetInterjection)) === false;
}
