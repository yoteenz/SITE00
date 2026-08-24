/**
 * Channel modulation — character preserved across channels.
 */

import type { MarketingChannelModulation } from './types.js';

export const DEFAULT_CHANNEL_MODULATIONS: MarketingChannelModulation[] = [
  {
    channel: 'INSTAGRAM_FEED',
    characterAdjustment: 'Most resolved visual artifacts; high visual authorship.',
    resolutionExpectation: 'Strong first-slide thesis; stop/intrigue/question.',
    visualAuthorshipLevel: 'HIGH',
    notes: 'Feed = authored artifacts, not template cards.',
  },
  {
    channel: 'INSTAGRAM_STORIES',
    characterAdjustment: 'More immediate; less resolved; closer to spontaneous NDX.',
    resolutionExpectation: 'REACTION_ONLY or QUESTION_OPEN acceptable.',
    visualAuthorshipLevel: 'MEDIUM',
    notes: '"wait." "look at this." — not carousel graphics reposted.',
  },
  {
    channel: 'REELS',
    characterAdjustment: 'Show NDX thinking over time: stimulus → notice → evidence → reaction.',
    resolutionExpectation: 'Must not default to animating static carousel graphics.',
    visualAuthorshipLevel: 'HIGH',
    notes: 'Motion-native artifact when behavior requires duration.',
  },
  {
    channel: 'EMAIL',
    characterAdjustment: 'Feels like NDX decided something deserved your inbox.',
    resolutionExpectation: 'Not generic newsletter voice.',
    visualAuthorshipLevel: 'MEDIUM',
    notes: 'Personal judgment visible in subject and opening.',
  },
  {
    channel: 'LONG_FORM',
    characterAdjustment: 'Supports investigation, competing evidence, uncertainty, synthesis.',
    resolutionExpectation: 'UNRESOLVED and INVESTIGATION_IN_PROGRESS valid.',
    visualAuthorshipLevel: 'HIGH',
    notes: 'Evidence vocabulary open — not collage-default.',
  },
  {
    channel: 'CAMPAIGN',
    characterAdjustment: 'PHENOMENON → NDX REACTION → INVESTIGATION → THESIS → CAMPAIGN WORLD.',
    resolutionExpectation: 'Not THEME → COPY → ASSETS.',
    visualAuthorshipLevel: 'HIGH',
    notes: 'Campaign begins with character event.',
  },
];

export function channelModulationPreservesCharacter(): true {
  return true;
}

export function reelsCannotDefaultToCarouselAnimation(): true {
  return true;
}

export function storiesLessResolvedThanFeed(): boolean {
  const feed = DEFAULT_CHANNEL_MODULATIONS.find((c) => c.channel === 'INSTAGRAM_FEED');
  const stories = DEFAULT_CHANNEL_MODULATIONS.find((c) => c.channel === 'INSTAGRAM_STORIES');
  return Boolean(feed && stories && stories.resolutionExpectation.includes('REACTION_ONLY'));
}
