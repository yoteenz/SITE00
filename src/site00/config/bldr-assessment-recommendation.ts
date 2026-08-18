/**
 * NOT SURE? recommendation scoring — maps discovery answers to build class.
 */

import type { BldrAssessmentStateId } from './bldr-assessment';

export type BldrRecommendationResult = {
  recommended: BldrAssessmentStateId;
  scores: Record<BldrAssessmentStateId, number>;
  reasons: string[];
};

const CLASS_IDS: BldrAssessmentStateId[] = ['site', 'world', 'enterprise'];

function scoreFromAnswer(stepId: string, answerId: string): Partial<Record<BldrAssessmentStateId, number>> {
  switch (stepId) {
    case 'q1':
      if (answerId === 'scratch') return { site: 2 };
      if (answerId === 'pieces') return { site: 2, world: 1 };
      if (answerId === 'scale') return { world: 2, enterprise: 1 };
      if (answerId === 'exploring') return { site: 1, world: 1 };
      return { site: 1 };
    case 'q2':
      if (answerId === 'website') return { site: 4 };
      if (answerId === 'application') return { world: 3, site: 1 };
      if (answerId === 'immersive') return { world: 4 };
      if (answerId === 'internal') return { enterprise: 3, world: 1 };
      if (answerId === 'complex') return { enterprise: 4 };
      return { site: 1, world: 1, enterprise: 1 };
    case 'q3':
      if (answerId === 'browse') return { site: 3 };
      if (answerId === 'purchase') return { site: 2, world: 1 };
      if (answerId === 'accounts') return { world: 2, site: 1 };
      if (answerId === 'configure') return { world: 3 };
      if (answerId === 'collaborate') return { world: 2, enterprise: 1 };
      if (answerId === 'workflows') return { enterprise: 3, world: 1 };
      return {};
    case 'q4':
      if (answerId === 'simple') return { site: 3 };
      if (answerId === 'forms-payments') return { site: 2, world: 1 };
      if (answerId === 'custom-logic') return { world: 2, site: 1 };
      if (answerId === 'multi-role') return { world: 2, enterprise: 1 };
      if (answerId === 'integrations') return { world: 2, enterprise: 2 };
      if (answerId === 'enterprise-infra') return { enterprise: 4 };
      return {};
    case 'q5':
      if (answerId === 'personal') return { site: 3 };
      if (answerId === 'growing') return { site: 2, world: 1 };
      if (answerId === 'community') return { world: 3 };
      if (answerId === 'team') return { enterprise: 2, world: 1 };
      if (answerId === 'large-org') return { enterprise: 4 };
      return { site: 1, world: 1, enterprise: 1 };
    default:
      return {};
  }
}

const REASON_MAP: Record<string, Record<string, string>> = {
  q3: {
    configure: 'CUSTOM INTERACTION AND CONFIGURATION',
    workflows: 'COMPLEX WORKFLOWS AND PERMISSIONS',
    collaborate: 'MULTI-USER COLLABORATION',
  },
  q4: {
    integrations: 'SYSTEM INTEGRATIONS AND DATA',
    'enterprise-infra': 'ENTERPRISE-GRADE INFRASTRUCTURE',
    'multi-role': 'MULTIPLE USER ROLES',
  },
  q5: {
    'large-org': 'LARGE-ORGANIZATION SCALE',
    community: 'COMMUNITY / PLATFORM SCALE',
  },
};

export function computeBldrRecommendation(
  answers: Record<string, string | string[]>,
): BldrRecommendationResult {
  const scores: Record<BldrAssessmentStateId, number> = { site: 0, world: 0, enterprise: 0, 'not-sure': 0 };

  for (const [stepId, value] of Object.entries(answers)) {
    const id = Array.isArray(value) ? value[0] : value;
    if (!id) continue;
    const partial = scoreFromAnswer(stepId, id);
    for (const cls of CLASS_IDS) {
      scores[cls] += partial[cls] ?? 0;
    }
  }

  let recommended: BldrAssessmentStateId = 'site';
  let top = -1;
  for (const cls of CLASS_IDS) {
    if (scores[cls] > top) {
      top = scores[cls];
      recommended = cls;
    }
  }

  const reasons: string[] = [];
  for (const [stepId, map] of Object.entries(REASON_MAP)) {
    const val = answers[stepId];
    const id = Array.isArray(val) ? val[0] : val;
    if (id && map[id]) reasons.push(map[id]);
  }
  if (reasons.length === 0) {
    reasons.push('YOUR ANSWERS POINT TO THIS BUILD CLASS');
  }

  return { recommended, scores, reasons };
}
