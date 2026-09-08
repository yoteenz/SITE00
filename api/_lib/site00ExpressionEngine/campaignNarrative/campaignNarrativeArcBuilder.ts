/**
 * C1.3 — Generic campaign narrative arc builder (brand-agnostic).
 */

import type {
  CampaignContentSequence,
  CampaignContentUnit,
  CampaignEscalationPlan,
  CampaignMotifSystem,
  CampaignNarrativeArc,
  CampaignUnitRole,
} from '../../../../shared/site00-expression-engine/campaign-narrative/types.js';
import { CAMPAIGN_NARRATIVE_VERSION } from '../../../../shared/site00-expression-engine/campaign-narrative/types.js';

export function buildCampaignContentSequence(args: {
  campaignId: string;
  units: CampaignContentUnit[];
  unitRoles: CampaignUnitRole[];
}): CampaignContentSequence {
  return {
    campaignId: args.campaignId,
    units: args.units,
    unitRoles: args.unitRoles,
    handoffs: [],
    teaseSeeds: [],
    version: CAMPAIGN_NARRATIVE_VERSION,
  };
}

export function buildGenericEscalationPlan(args: {
  escalationModel: string;
  unitIds: string[];
}): CampaignEscalationPlan {
  const progression = args.unitIds.map(
    (id, i) => `Unit ${i + 1} (${id}): raise stakes — ${args.escalationModel}`,
  );
  return {
    escalationModel: args.escalationModel,
    stakesProgression: progression,
    personalToSystemic: true,
    discomfortCurve: 'Recognition → complicity → self-implication',
    whatEachUnitMustAdd: Object.fromEntries(
      args.unitIds.map((id, i) => [
        id,
        i === 0 ? 'Establish contradiction grammar' : 'Advance stakes without repeating prior proof',
      ]),
    ),
    repetitionGuard: 'Contradiction grammar may repeat; stakes and complicity must evolve.',
  };
}

export function buildEmptyMotifSystem(): CampaignMotifSystem {
  return {
    motifsUsed: [],
    motifsRepeated: [],
    motifsRetired: [],
    motifsAvailable: ['screen', 'receipt', 'archive', 'annotation', 'reflection', 'glitch', 'broadcast'],
    motifRecords: [],
    repetitionRiskNotes: [],
  };
}

export function buildCampaignNarrativeArc(args: {
  arcId: string;
  campaignId: string;
  brandId: string;
  campaignThesis: string;
  audienceJourney: string[];
  sequence: CampaignContentSequence;
  escalation: CampaignEscalationPlan;
  motifSystem: CampaignMotifSystem;
}): CampaignNarrativeArc {
  return {
    arcId: args.arcId,
    campaignId: args.campaignId,
    brandId: args.brandId,
    campaignThesis: args.campaignThesis,
    audienceJourney: args.audienceJourney,
    heroMoments: args.sequence.units.filter((u) => u.unitFunction === 'HERO' || u.sequenceNumber === 1).map((u) => u.title),
    escalation: args.escalation,
    motifSystem: args.motifSystem,
    artifactLineage: { entries: [], bridgeRule: 'ARTIFACT_BRIDGE ≠ ARTIFACT_REUSE', notes: '' },
    rhythm: {
      tempoByUnit: {},
      densityByUnit: {},
      humorByUnit: {},
      darknessByUnit: {},
      visualScaleByUnit: {},
      intimacyByUnit: {},
      protagonistVisibilityByUnit: {},
      artifactScaleByUnit: {},
      endingTypeByUnit: {},
      rhythmDiagnosis: 'Pending unit population',
    },
    sequence: args.sequence,
    campaignEnding: 'TBD — requires final unit payoff',
    formatPlanNotes: 'Story units precede format translation — Reel/Carousel/Story derive after narrative lock.',
    version: CAMPAIGN_NARRATIVE_VERSION,
  };
}
