/**
 * P0.5E.2 — Platform motion differentiation.
 */

import { NDX_PLATFORM_MOTION_BEHAVIORS } from '../ndxBookCulturalLanguage/constants.js';
import type { NdxPlatformMotionBehavior } from '../ndxBookCulturalLanguage/types.js';

export const PLATFORM_MOTION_DESCRIPTIONS: Record<keyof typeof NDX_PLATFORM_MOTION_BEHAVIORS, string> = {
  INSTAGRAM_REEL: 'Scrappy, beautifully directed miniature documentary — art-directed process documentation',
  TIKTOK: 'NDX grabbed the phone because she has to tell you what she just noticed — conversational discovery',
  STORY: 'The margins — immediate, conversational, interactive, lower production burden',
  FEED: 'The pages — most resolved/art-directed editorial expression',
};

export function getNdxPlatformMotionBehaviors(): Record<string, NdxPlatformMotionBehavior> {
  return { ...NDX_PLATFORM_MOTION_BEHAVIORS };
}

export function instagramReelBehavior(): NdxPlatformMotionBehavior {
  return NDX_PLATFORM_MOTION_BEHAVIORS.INSTAGRAM_REEL;
}

export function tiktokBehavior(): NdxPlatformMotionBehavior {
  return NDX_PLATFORM_MOTION_BEHAVIORS.TIKTOK;
}

export function storyMarginBehavior(): NdxPlatformMotionBehavior {
  return NDX_PLATFORM_MOTION_BEHAVIORS.STORY;
}

export function feedPagesBehavior(): NdxPlatformMotionBehavior {
  return NDX_PLATFORM_MOTION_BEHAVIORS.FEED;
}

export function reelsAndTikTokDistinct(): boolean {
  return String(NDX_PLATFORM_MOTION_BEHAVIORS.INSTAGRAM_REEL) !== String(NDX_PLATFORM_MOTION_BEHAVIORS.TIKTOK);
}

export function tiktokMayPrecedeFinalPage(): true {
  return true;
}

export function storiesNotMiniFeedPosts(): true {
  return true;
}
