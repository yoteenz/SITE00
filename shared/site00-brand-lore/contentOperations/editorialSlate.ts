/**
 * Editorial slate + content selection.
 */

import { createHash, randomUUID } from 'node:crypto';
import type {
  ContentOpportunity,
  ContentSelectionStatus,
  EditorialSlate,
  SlateCandidate,
} from './types.js';
import { selectChannelForOpportunity, selectFormatForOpportunity } from './channelFormatSelection.js';
import { determineResearchDepth } from './researchEvidence.js';

export function selectContentOpportunity(params: {
  opp: ContentOpportunity;
  fit: ContentOpportunity['characterFit'];
}): ContentSelectionStatus {
  if (params.fit === 'NOT_NDX' || params.fit === 'TOO_OFF_BRAND') return 'REJECT';
  if (params.fit === 'TOO_REPETITIVE') return 'CALLBACK_TO_EXISTING';
  if (params.fit === 'TOO_RISKY') return 'FOUNDER_DECISION_REQUIRED';
  if (params.fit === 'NEEDS_RESEARCH') return 'RESEARCH_FIRST';
  if (params.fit === 'TOO_THIN') return 'WATCH';
  if (params.fit === 'TOO_TREND_DEPENDENT') return 'SAVE_FOR_LATER';
  if (params.fit === 'STRONG_OPPORTUNITY') return 'SELECT_NOW';
  return 'QUEUE';
}

export function buildWeeklyEditorialSlate(params: {
  projectId: string;
  opportunities: ContentOpportunity[];
  maxCandidates?: number;
}): EditorialSlate {
  const selected = params.opportunities
    .filter((o) => o.characterFit === 'STRONG_OPPORTUNITY' || o.characterFit === 'PROMISING')
    .sort((a, b) => (b.rank?.compositeScore ?? 0) - (a.rank?.compositeScore ?? 0))
    .slice(0, params.maxCandidates ?? 5);

  const candidates: SlateCandidate[] = selected.map((opp) => {
    const channel = selectChannelForOpportunity(opp);
    const format = selectFormatForOpportunity(opp, channel);
    return {
      opportunityId: opp.id,
      characterEventId: null,
      contentThesisId: null,
      channel: channel.channel,
      format: format.format,
      behavioralModeId: null,
      researchDepth: determineResearchDepth(opp),
      estimatedCost: format.format === 'CAROUSEL' ? 0.24 : 0.08,
    };
  });

  const behavioralBalance: Record<string, number> = {};
  const topicBalance: Record<string, number> = {};
  for (const opp of selected) {
    for (const d of opp.domains) topicBalance[d] = (topicBalance[d] ?? 0) + 1;
  }

  const slate: EditorialSlate = {
    slateId: `slate-${randomUUID().slice(0, 8)}`,
    projectId: params.projectId,
    windowType: 'WEEKLY',
    dateRange: {
      start: new Date().toISOString(),
      end: new Date(Date.now() + 7 * 86400000).toISOString(),
    },
    status: 'PROPOSED',
    contentCandidates: candidates,
    channelDistribution: countBy(candidates, (c) => c.channel),
    behavioralBalance,
    topicBalance,
    temperatureBalance: {},
    formatBalance: countBy(candidates, (c) => c.format),
    productionCostEstimate: candidates.reduce((s, c) => s + c.estimatedCost, 0),
    riskSummary: 'Pilot slate — founder approval required before production',
    founderJudgment: null,
    fingerprint: '',
  };
  slate.fingerprint = createHash('sha256').update(JSON.stringify(slate)).digest('hex').slice(0, 16);
  return slate;
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export function selectionMaySaveOrWatch(status: ContentSelectionStatus): boolean {
  return status === 'SAVE_FOR_LATER' || status === 'WATCH' || status === 'QUEUE';
}

export function weeklySlateSupportsBehavioralBalance(slate: EditorialSlate): boolean {
  return slate.contentCandidates.length >= 3;
}
