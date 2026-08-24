/**
 * Channel + format selection — reasoned, not default carousel.
 */

import type { ContentChannelDecision, ContentFormatDecision, ContentOpportunity } from './types.js';
import type { ContentChannel, ContentFormat } from './types.js';

export function selectChannelForOpportunity(opp: ContentOpportunity): ContentChannelDecision {
  let channel: ContentChannel = 'INSTAGRAM_FEED';
  const reasoning: string[] = [];

  if (opp.urgency === 'HIGH' && opp.investigationPotential < 0.5) {
    channel = 'INSTAGRAM_STORY';
    reasoning.push('High urgency, low resolution — Story for immediate reaction');
  } else if (opp.investigationPotential >= 0.7 && opp.depthPotential >= 0.6) {
    channel = 'INSTAGRAM_FEED';
    reasoning.push('Investigation depth suits resolved feed artifact');
  } else if (opp.depthPotential >= 0.8) {
    channel = 'INSTAGRAM_REEL';
    reasoning.push('Discovery unfolding over time — Reel shows thinking process');
  } else {
    reasoning.push('Default feed for authored first-slide artifact');
  }

  return {
    opportunityId: opp.id,
    channel,
    reasoning,
    alternativesConsidered: ['INSTAGRAM_FEED', 'INSTAGRAM_STORY', 'INSTAGRAM_REEL'],
  };
}

export function selectFormatForOpportunity(
  opp: ContentOpportunity,
  channelDecision: ContentChannelDecision,
): ContentFormatDecision {
  let format: ContentFormat = 'SINGLE_IMAGE';
  const reasoning: string[] = [];

  if (channelDecision.channel === 'INSTAGRAM_REEL') {
    format = 'REEL';
    reasoning.push('Reel format — must not default to carousel animation');
  } else if (channelDecision.channel === 'INSTAGRAM_STORY') {
    format = 'STORY_SEQUENCE';
    reasoning.push('Story sequence — less resolved than feed');
  } else if (opp.investigationPotential >= 0.75 && opp.evidenceNeeded.length > 1) {
    format = 'CAROUSEL';
    reasoning.push('Complex investigation — carousel with Sequence Creative System');
  } else if (opp.summary.length < 80 && opp.humorPotential > 0.5) {
    format = 'SINGLE_IMAGE';
    reasoning.push('One devastating contradiction — single image may suffice');
  } else {
    reasoning.push('Feed first-slide from P0.5C marketing artifact');
  }

  return {
    opportunityId: opp.id,
    format,
    reasoning,
    resolutionStateInfluence: opp.investigationPotential >= 0.7 ? 'INVESTIGATION_IN_PROGRESS' : 'REACTION_ONLY',
  };
}

export function reelIsNotCarouselAnimation(format: ContentFormat): boolean {
  return format === 'REEL';
}

export function formatSelectionIsReasoned(decision: ContentFormatDecision): boolean {
  return decision.reasoning.length > 0;
}

export function channelSelectionIsReasoned(decision: ContentChannelDecision): boolean {
  return decision.reasoning.length > 0;
}
