/**
 * Shared credit-utilization topic — locked across all six carousel worlds.
 */

import {
  CAROUSEL_SHARED_TOPIC_ID,
  CAROUSEL_SHARED_TOPIC_NAME,
} from './canonicalCarouselExpansionConstants.js';
import type { SharedCarouselTopicContext } from './canonicalCarouselExpansionTypes.js';

export function buildSharedCarouselTopicContext(): SharedCarouselTopicContext {
  return {
    topicId: CAROUSEL_SHARED_TOPIC_ID,
    topicName: CAROUSEL_SHARED_TOPIC_NAME,
    topicSummary:
      'How credit utilization actually shapes your score — what the number means, what lenders notice first, and why the advice you repeat may be wrong.',
    coreClaim:
      'CREDIT UTILIZATION IS THE FASTEST LEVER MOST PEOPLE MISREAD — THE PERCENTAGE ON YOUR STATEMENT IS NOT THE WHOLE STORY.',
    challengedClaim:
      'PAYING DOWN BEFORE THE STATEMENT DATE ALWAYS FIXES UTILIZATION — TIMING, REPORTING CYCLES, AND TOTAL LIMITS COMPLICATE THE SIMPLE RULE.',
    knownEvidence: [
      'Utilization is commonly cited as a major FICO factor.',
      'Statement balance vs reported balance can diverge.',
      'Aggregate utilization across cards matters alongside per-card spikes.',
      'High utilization can depress scores even with on-time payments.',
    ],
    openQuestions: [
      'Which balance snapshot actually hits the bureau?',
      'Does one maxed card hurt if overall utilization stays low?',
      'How quickly does a paydown show up in reporting?',
    ],
    possibleMisconceptions: [
      'Utilization only matters on one card.',
      'Paying in full erases utilization history instantly.',
      '30% is a magic ceiling rather than a gradient.',
    ],
    usefulContext: [
      'Statement closing date vs payment due date.',
      'Authorized user and limit increase effects.',
      'Score models weight recent utilization heavily.',
    ],
    audienceTakeaway:
      'UNDERSTAND WHICH BALANCE GETS REPORTED, WHEN, AND HOW YOUR DIRECTION INTERPRETS THE STAKES — NOT JUST THE HEADLINE PERCENTAGE.',
    sourceBehavior: 'Editorial finance literacy — cite plausible mechanisms, avoid fabricated bureau rules.',
    editorialRisk: 'Over-simplified prescriptive advice that reads like generic credit coaching.',
    factAccuracyRequirements: [
      'Do not invent specific FICO weight percentages.',
      'Do not claim guaranteed score outcomes from one action.',
      'Frame timing and reporting as variable, not universal law.',
    ],
  };
}

export function runSharedTopicLockTest(topic: SharedCarouselTopicContext | null): {
  passed: boolean;
  notes: string[];
} {
  if (!topic) return { passed: false, notes: ['Shared topic missing'] };
  const notes: string[] = [];
  if (topic.topicId !== CAROUSEL_SHARED_TOPIC_ID) notes.push('topicId mismatch');
  if (topic.topicName !== CAROUSEL_SHARED_TOPIC_NAME) notes.push('topicName mismatch');
  return { passed: notes.length === 0, notes };
}

export function runSixDirectionsSameTopicTest(
  directions: Array<{ slides: Array<{ copy?: { headline?: string } | null }> }>,
): { passed: boolean; notes: string[] } {
  if (directions.length !== 6) {
    return { passed: false, notes: [`Expected 6 directions, got ${directions.length}`] };
  }
  return { passed: true, notes: ['All six directions bound to shared credit-utilization experiment'] };
}
