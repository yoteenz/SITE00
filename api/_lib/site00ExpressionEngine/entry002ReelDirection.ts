/**
 * Sprint B4 — Entry 002 REEL direction helpers (phone, fashion, edit suite).
 */

import type {
  ReelEditSuiteBehavior,
  ReelFashionDirection,
  ReelPhoneRole,
} from '../../../shared/site00-expression-engine/entry002ReelTypes.js';

export function buildEntry002ReelPhoneRole(): ReelPhoneRole {
  return {
    role: 'CULTURAL_EVIDENCE_DEVICE',
    notAllowed: [
      'THE ENTIRE WORLD',
      'A GIANT COMMENT FEED',
      'A SOCIAL MEDIA MOCKUP DEMO',
    ],
    evidenceBehavior: [
      'then-language receipts',
      'now-language receipts',
      'archived fashion imagery',
      'date cues',
      'controlled nostalgia claims',
    ],
  };
}

export function buildEntry002ReelFashionDirection(): ReelFashionDirection {
  return {
    subject: '2016 IG BADDIE FASHION',
    motifsUsed: ['CHOKERS', 'BODYCON SILHOUETTE', 'THIGH-HIGH BOOTS', 'BOMBER JACKET', 'OVERLINED LIPS'],
    stylingNotes: [
      'mid-2010s Instagram glam',
      'heavy contour',
      'overlined nude lip',
      'full brows',
      'long straight / wavy hair',
      'fitted going-out looks',
    ],
    notAllowed: ['Y2K', '2020s clean girl', 'current clubwear', 'generic influencer fashion', 'costume parody'],
  };
}

export function buildEntry002ReelEditSuiteBehavior(): ReelEditSuiteBehavior {
  return {
    worldBehavior: [
      'physical cinematic surreal edit suite',
      'cultural memory cut reframed and re-exported',
      'NOT software UI clone',
    ],
    artifactBehavior: [
      'razor / edit blade symbolic not violent',
      'timeline strip manipulation',
      'label splice and color-grade reframe',
    ],
    allowedElements: [
      'physical timeline strips',
      'razor / edit blade',
      'splice tape',
      'date labels',
      'light table',
      'film frames',
      'waveform sculpture',
      'cut markers',
      'cream paper tags',
      'selective lime edit points',
    ],
    forbiddenElements: [
      'Adobe UI clone',
      'Final Cut UI clone',
      'dashboard interface',
      'random floating quotes',
      'generic VHS nostalgia',
      'decorative collage',
    ],
  };
}
