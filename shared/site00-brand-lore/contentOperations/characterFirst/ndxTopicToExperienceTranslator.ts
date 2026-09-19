/**
 * P0.5E.7A — Translate topic metadata into character-led creative situation.
 */

import type { NDXContentSeed } from './types.js';
import { seedCharacterFirstContentSeeds } from './ndxContentSeed.js';

export type TopicToExperienceInput = {
  topicMetadata: string[];
  legacySubject: string;
  contentSeed?: NDXContentSeed | null;
};

export type TopicToExperienceOutput = {
  spokenPremise: string;
  firstReaction: string;
  investigationQuestion: string;
  translatedFromTopic: string;
};

const TRANSLATION_EXAMPLES: Record<string, TopicToExperienceOutput> = {
  'credit utilization': {
    spokenPremise: 'I PAID IT DOWN. WHY DID MY SCORE DROP?',
    firstReaction: 'THAT CANNOT BE RIGHT.',
    investigationQuestion: 'WHY DID PAYING IT DOWN NOT PRODUCE THE RESULT I EXPECTED?',
    translatedFromTopic: 'credit utilization',
  },
  'corporate layoff memo language': {
    spokenPremise: 'WHY DO ALL THESE LAYOFF EMAILS SOUND LIKE THEY WERE WRITTEN BY THE SAME PERSON?',
    firstReaction: 'BE SERIOUS.',
    investigationQuestion: 'WHY DOES THE LANGUAGE FEEL COPY-PASTED ACROSS INDUSTRIES?',
    translatedFromTopic: 'corporate layoff memo language',
  },
  'corporate memo euphemism': {
    spokenPremise: 'WHY DO ALL THESE LAYOFF EMAILS SOUND LIKE THEY WERE WRITTEN BY THE SAME PERSON?',
    firstReaction: 'BE SERIOUS.',
    investigationQuestion: 'WHY DOES THE LANGUAGE FEEL COPY-PASTED ACROSS INDUSTRIES?',
    translatedFromTopic: 'corporate memo euphemism',
  },
  'airline loyalty devaluation': {
    spokenPremise: "I KNOW I DIDN'T IMAGINE THESE POINTS BEING WORTH MORE.",
    firstReaction: "I KNOW I DIDN'T MAKE THAT UP.",
    investigationQuestion: 'WHEN DID THE VALUE QUIETLY CHANGE?',
    translatedFromTopic: 'airline loyalty devaluation',
  },
  'subscription creep': {
    spokenPremise: 'WHY DOES EVERYTHING HAVE A SUBSCRIPTION NOW?',
    firstReaction: 'WAIT.',
    investigationQuestion: 'WHEN DID ONE-TIME PURCHASE BECOME THE EXCEPTION?',
    translatedFromTopic: 'subscription creep',
  },
  'subscription normalization': {
    spokenPremise: 'WHY DOES EVERYTHING HAVE A SUBSCRIPTION NOW?',
    firstReaction: 'WAIT.',
    investigationQuestion: 'WHEN DID ONE-TIME PURCHASE BECOME THE EXCEPTION?',
    translatedFromTopic: 'subscription normalization',
  },
};

function normalizeSubject(subject: string): string {
  return subject.trim().toLowerCase();
}

export function translateTopicToExperience(input: TopicToExperienceInput): TopicToExperienceOutput {
  if (input.contentSeed) {
    return {
      spokenPremise: input.contentSeed.premise.spokenPremise.toUpperCase(),
      firstReaction: input.contentSeed.firstReaction.toUpperCase(),
      investigationQuestion: input.contentSeed.question.toUpperCase(),
      translatedFromTopic: input.legacySubject,
    };
  }

  const key = normalizeSubject(input.legacySubject);
  const direct = TRANSLATION_EXAMPLES[key];
  if (direct) return direct;

  const seeds = seedCharacterFirstContentSeeds('ndxbook');
  const match = seeds.find((s) => normalizeSubject(s.legacyTopicSubject ?? '') === key);
  if (match) {
    return {
      spokenPremise: match.premise.spokenPremise.toUpperCase(),
      firstReaction: match.firstReaction.toUpperCase(),
      investigationQuestion: match.question.toUpperCase(),
      translatedFromTopic: input.legacySubject,
    };
  }

  const topicLabel = input.topicMetadata[0] ?? input.legacySubject;
  return {
    spokenPremise: `I HAVE A QUESTION ABOUT ${topicLabel.toUpperCase()}.`,
    firstReaction: 'WAIT.',
    investigationQuestion: `WHAT IS ACTUALLY GOING ON WITH ${topicLabel.toUpperCase()}?`,
    translatedFromTopic: input.legacySubject,
  };
}

export function topicTranslationOccursBeforeVisualGeneration(): true {
  return true;
}
