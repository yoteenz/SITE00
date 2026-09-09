/**
 * CampaignSequenceIntelligence — package role sequence.
 */

import type {
  CampaignSequenceIntelligence,
  ChannelRoleMap,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

const EXPECTED_STAGES = ['ENTRY', 'ESCALATION', 'EVIDENCE', 'PARTICIPATION', 'PERSUASION', 'CONVERSION'] as const;

export function evaluateCampaignSequence(map: ChannelRoleMap): CampaignSequenceIntelligence {
  const formatToStage: Record<string, string[]> = {
    REEL: ['ENTRY', 'ESCALATION'],
    CAROUSEL: ['EVIDENCE'],
    STORY: ['PARTICIPATION'],
    EMAIL: ['PERSUASION', 'CONVERSION'],
    LANDING: ['CONVERSION'],
    SAVEABLE: ['EVIDENCE'],
  };

  const stages = EXPECTED_STAGES.map((stage) => {
    const channelIds = map.entries
      .filter((e) => (formatToStage[e.format] ?? []).includes(stage))
      .map((e) => e.channelId);
    return { stage, present: channelIds.length > 0, channelIds };
  });

  const missingStages = stages.filter((s) => !s.present).map((s) => s.stage);
  const hasEntry = stages.find((s) => s.stage === 'ENTRY')?.present ?? false;
  const hasPayoff = stages.find((s) => s.stage === 'CONVERSION')?.present ?? false;
  const coherentSequence = hasEntry && hasPayoff && missingStages.length <= 3;

  return {
    campaignId: map.campaignId,
    stages,
    coherentSequence,
    missingStages,
  };
}
