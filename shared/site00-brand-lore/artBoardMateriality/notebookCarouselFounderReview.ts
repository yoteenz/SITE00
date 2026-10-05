/**
 * P0.5C.7 — Founder review labels + creative signal learning hooks.
 */

import { V23C_NOTEBOOK_FOUNDER_JUDGMENTS } from './constants.js';

export type NotebookFounderJudgment = (typeof V23C_NOTEBOOK_FOUNDER_JUDGMENTS)[number];

export const NOTEBOOK_APPROVAL_JUDGMENTS = [
  'THIS_FEELS_LIKE_THE_BOOK',
  'GOOD_PAGE_CONSTRUCTION',
  'YES_THIS_FEELS_LIKE_AN_OBJECT',
  'THATS_NDX',
] as const satisfies readonly NotebookFounderJudgment[];

export const NOTEBOOK_REVISION_JUDGMENTS = [
  'TOO_TEMPLATE',
  'TOO_CLEAN',
  'TOO_DIGITAL',
  'TOO_SCRAPBOOKY',
  'NOT_ENOUGH_ART_DIRECTION',
  'PHOTO_FEELS_DROPPED_IN',
  'TOO_MUCH_LIME',
  'WRONG_TYPE',
  'LOWERCASE_ERROR',
] as const satisfies readonly NotebookFounderJudgment[];

export type CreativeSignalLearningEntry = {
  judgment: NotebookFounderJudgment;
  signalCategory: 'PAGE_CONSTRUCTION' | 'MATERIALITY' | 'PHOTO' | 'TYPOGRAPHY' | 'LIME' | 'TEMPLATE' | 'APPROVAL';
  learningDimension: string;
};

export function isNotebookApprovalJudgment(judgment: string): boolean {
  return (NOTEBOOK_APPROVAL_JUDGMENTS as readonly string[]).includes(judgment);
}

export function isNotebookFounderJudgment(judgment: string): judgment is NotebookFounderJudgment {
  return (V23C_NOTEBOOK_FOUNDER_JUDGMENTS as readonly string[]).includes(judgment);
}

export const NOTEBOOK_PILOT_REGENERATION = {
  recommendedCarousel: 'subscription_receipt_topic_1',
  reason: 'Strongest concept, most template-driven historically — ideal P0.5C.7 compare',
  compareLabels: ['OLD V2.3', 'P0.5C.7'],
  evaluateDimensions: [
    'physicality',
    'authorship',
    'artistic_range',
    'photo_integration',
    'page_construction',
    'template_reduction',
    'uppercase_compliance',
    'lime_restraint',
  ],
  autoLock: false,
  founderReviewRequired: true,
  automaticProviderSpend: false,
} as const;

export function founderReviewRequiredForRegeneration(): true {
  return NOTEBOOK_PILOT_REGENERATION.founderReviewRequired;
}
