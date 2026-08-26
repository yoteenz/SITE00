/**
 * P0.VR.3H — Missing page completion mode classifier.
 */

import { getExperiencePageDefinition } from '../p0vr3g/experiencePageRegistry.js';
import type { MissingPageCompletionMode } from './types.js';

export type ClassifierInput = {
  projectId: 'SITE00' | 'NDXBOOK';
  screenId: string;
  route: string;
  recordKind?: string;
  parentFlowId?: string;
  existingImplementationPath?: string;
};

const SITE00_COMPLEX_SCREEN_IDS = new Set(['missing-blueprints', 'missing-account-profile', 'missing-brand-page']);

const NDXBOOK_CREATIVE_ROUTE_KEYWORDS = [
  'character',
  'campaign',
  'cultural-intelligence',
  'content-operations',
  'experiment',
  'film-production',
  'realism-lab',
  'marketing-expression',
  'embodied-character',
];

export function classifyMissingPageCompletionMode(input: ClassifierInput): MissingPageCompletionMode {
  if (input.existingImplementationPath) {
    return 'BLOCKED_EXISTING_IMPLEMENTATION';
  }

  if (input.projectId === 'NDXBOOK') {
    const routeLower = input.route.toLowerCase();
    if (NDXBOOK_CREATIVE_ROUTE_KEYWORDS.some((kw) => routeLower.includes(kw))) {
      return 'CREATIVE_COMPLEX';
    }
    if (routeLower.includes('/projects/')) {
      return 'STRUCTURAL_COMPLEX';
    }
    return 'UNKNOWN_REVIEW_REQUIRED';
  }

  const pageId = input.screenId.replace(/^missing-/, '');
  const experience = getExperiencePageDefinition(pageId);

  if (SITE00_COMPLEX_SCREEN_IDS.has(input.screenId)) {
    if (input.screenId === 'missing-account-profile') return 'FUNCTIONAL_COMPLEX';
    if (input.screenId === 'missing-brand-page') return 'CREATIVE_COMPLEX';
    return 'STRUCTURAL_COMPLEX';
  }

  if (experience?.family === 'INFORMATION') {
    return 'FAMILY_DERIVED_SIMPLE';
  }

  if (experience?.family === 'AUTH') {
    return 'FAMILY_DERIVED_SIMPLE';
  }

  if (input.parentFlowId === 'account') {
    return 'FAMILY_DERIVED_SIMPLE';
  }

  if (input.parentFlowId === 'information') {
    return 'FAMILY_DERIVED_SIMPLE';
  }

  return 'UNKNOWN_REVIEW_REQUIRED';
}

export function isSimpleCompletionMode(mode: MissingPageCompletionMode): boolean {
  return mode === 'FAMILY_DERIVED_SIMPLE';
}

export function isComplexCompletionMode(mode: MissingPageCompletionMode): boolean {
  return (
    mode === 'STRUCTURAL_COMPLEX' ||
    mode === 'CREATIVE_COMPLEX' ||
    mode === 'FUNCTIONAL_COMPLEX' ||
    mode === 'UNKNOWN_REVIEW_REQUIRED'
  );
}

export function requiresIndividualReview(mode: MissingPageCompletionMode): boolean {
  return isComplexCompletionMode(mode);
}

export function allowsBatchApproval(mode: MissingPageCompletionMode): boolean {
  return mode === 'FAMILY_DERIVED_SIMPLE';
}
