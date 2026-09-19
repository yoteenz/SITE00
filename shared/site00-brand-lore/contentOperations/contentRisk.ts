/**
 * Content risk evaluation.
 */

import type { ContentOpportunity, ContentRiskEvaluation, RiskLevel } from './types.js';

export function evaluateContentRisk(params: {
  contentId: string;
  opp: ContentOpportunity;
}): ContentRiskEvaluation {
  let overall: RiskLevel = 'LOW';
  let financialAdviceRisk: RiskLevel = 'LOW';
  let namedPersonRisk: RiskLevel = 'LOW';

  if (params.opp.domains.some((d) => /finance|money|credit|invest/i.test(d))) {
    financialAdviceRisk = 'MODERATE';
    overall = 'MODERATE';
  }
  if (params.opp.entities.some((e) => /person|celebrity/i.test(e))) {
    namedPersonRisk = 'MODERATE';
  }
  if (params.opp.risk === 'HIGH' || params.opp.risk === 'BLOCKED') {
    overall = params.opp.risk === 'BLOCKED' ? 'BLOCKED' : 'HIGH';
  }

  return {
    evaluationId: `risk-${params.contentId}`,
    contentId: params.contentId,
    factualRisk: overall,
    legalRisk: 'LOW',
    reputationalRisk: overall,
    culturalSensitivity: 'LOW',
    namedPersonRisk,
    financialAdviceRisk,
    copyrightRisk: 'LOW',
    overallRisk: overall,
    notes: ['Higher-risk content requires stronger evidence and founder review'],
    evaluatedAt: new Date().toISOString(),
  };
}

export function highRiskRequiresStrongerReview(risk: ContentRiskEvaluation): boolean {
  return risk.overallRisk === 'HIGH' || risk.overallRisk === 'BLOCKED';
}

export function contentRiskEvaluationWorks(risk: ContentRiskEvaluation): boolean {
  return Boolean(risk.evaluationId && risk.overallRisk);
}
