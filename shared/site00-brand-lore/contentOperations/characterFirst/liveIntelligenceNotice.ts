/**
 * P0.5E.7 — Live intelligence → NDX notice opportunities (not topic labels).
 */

import type { LiveIntelligenceNoticeOpportunity } from './types.js';

export function reformulateLiveSignalToNotice(
  rawSignal: string,
  oldTopicLabel: string,
): LiveIntelligenceNoticeOpportunity {
  const lower = rawSignal.toLowerCase();
  let ndxNoticePremise = oldTopicLabel.toUpperCase();

  if (lower.includes('subscription') || lower.includes('price increase')) {
    ndxNoticePremise = 'I SWEAR EVERYTHING USED TO JUST LET YOU BUY IT ONCE.';
  } else if (lower.includes('layoff') || lower.includes('memo')) {
    ndxNoticePremise = 'WHY DO ALL THESE LAYOFF EMAILS SOUND LIKE THEY WERE WRITTEN BY THE SAME PERSON?';
  } else if (lower.includes('credit') || lower.includes('debt')) {
    ndxNoticePremise = 'I PAID IT DOWN. WHY DID MY SCORE DROP?';
  } else if (lower.includes('points') || lower.includes('loyalty')) {
    ndxNoticePremise = 'I KNOW THESE POINTS USED TO BE WORTH MORE.';
  } else if (lower.includes('self-checkout') || lower.includes('checkout')) {
    ndxNoticePremise = 'WHEN DID I BECOME AN EMPLOYEE?';
  } else {
    ndxNoticePremise = `WAIT. ${rawSignal.slice(0, 60).toUpperCase()}?`;
  }

  return {
    rawSignal,
    oldTopicLabel,
    ndxNoticePremise,
    temporalRelevance: 'HIGH',
  };
}

export const SUBSCRIPTION_NORMALIZATION_NOTICE: LiveIntelligenceNoticeOpportunity = {
  rawSignal: 'Subscription prices increasing across streaming and software',
  oldTopicLabel: 'SUBSCRIPTION NORMALIZATION',
  ndxNoticePremise: 'I SWEAR EVERYTHING USED TO JUST LET YOU BUY IT ONCE.',
  temporalRelevance: 'HIGH',
};
