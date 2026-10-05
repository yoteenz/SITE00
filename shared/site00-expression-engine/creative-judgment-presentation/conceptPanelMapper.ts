/**
 * P0.CJ.2 — Map engine outputs → digestible ConceptPanel summaries.
 */

import type { CreativeJudgmentResult, TerritoryCandidate } from '../creative-judgment-intelligence/types.js';
import type { ConceptCaseType, ConceptGroundingMode, ConceptPanel, ConceptPanelDiagnostics } from './types.js';

function groundingLabel(mode: ConceptGroundingMode): string {
  if (mode === 'live_grounded') return 'LIVE-GROUNDED';
  if (mode === 'asset_grounded') return 'ASSET-GROUNDED';
  return 'PROFILE-GROUNDED';
}

function buildDiagnostics(
  judgment: CreativeJudgmentResult,
  territory: TerritoryCandidate,
): ConceptPanelDiagnostics {
  const proof = judgment.conceptProof;
  return {
    fullReasoning: [
      proof.tension,
      proof.humanTruth,
      proof.contradiction,
      proof.mechanism,
      proof.obviousAnswer,
      proof.nonObviousAnswer,
      proof.brandSpecificityReason,
      proof.evidenceLogic,
    ]
      .filter(Boolean)
      .join(' · '),
    selectionRationale: territory.argument,
    rejectionNotes: judgment.weaknesses,
    channelTranslationNotes: judgment.channelRoleMap?.entries.map((e) => `${e.channelId}: ${e.role}`) ?? [],
    brandFidelityAnalysis: `Brand fidelity ${judgment.brandFidelityScore}/100 · ${judgment.brandSwapTest?.rationale ?? 'No swap test'}`,
    leakAnalysis: judgment.crossBrandLeak?.leaked
      ? `LEAK: ${judgment.crossBrandLeak.leakTypes.join(', ')} — ${judgment.crossBrandLeak.evidence.join('; ')}`
      : 'No cross-brand leak detected',
    risks: judgment.failureClasses,
    suggestedRefinements: judgment.revisionDirectives,
    engineJudgment: judgment,
  };
}

function channelsFromTerritory(territory: TerritoryCandidate): string[] {
  return territory.channelTreatmentHash.split('|').filter(Boolean);
}

export function mapJudgmentToConceptPanel(input: {
  judgment: CreativeJudgmentResult;
  territory: TerritoryCandidate;
  brandName: string;
  caseType: ConceptCaseType;
  groundingMode: ConceptGroundingMode;
  conceptTitle?: string;
  oneLinePremise?: string;
  interjection?: string | null;
  artifact?: string | null;
  reveal?: string | null;
  payoff?: string | null;
  heroMove?: string | null;
  expressionContext?: string;
  isDemoCase?: boolean;
  isRealBrandDemo?: boolean;
  heroSymbol?: string;
}): ConceptPanel {
  const proof = input.judgment.conceptProof;
  const heroId = `hero-${input.judgment.territoryId}`;
  return {
    id: input.judgment.territoryId,
    brandName: input.brandName,
    caseType: input.caseType,
    groundingMode: input.groundingMode,
    groundingLabel: groundingLabel(input.groundingMode),
    conceptTitle: input.conceptTitle ?? input.territory.conceptName,
    territoryName: input.territory.visualWorld,
    oneLinePremise: input.oneLinePremise ?? input.territory.oneSentenceIdea,
    centralTension: proof.tension,
    mechanism: proof.mechanism || input.territory.mechanism,
    world: input.territory.visualWorld,
    artifact: input.artifact ?? proof.conceptCompression,
    reveal: input.reveal ?? proof.nonObviousAnswer,
    payoff: input.payoff ?? proof.humanTruth,
    heroMove: input.heroMove ?? input.territory.argument,
    interjection: input.interjection ?? proof.contradiction,
    expressionContext: input.expressionContext ?? input.judgment.campaignId,
    primaryChannels: channelsFromTerritory(input.territory),
    decision: input.judgment.decision,
    score: input.judgment.overallScore,
    failureClass: input.judgment.failureClasses[0] ?? null,
    brandFidelityStatus: input.judgment.brandFidelityScore >= 80 ? 'STRONG' : input.judgment.brandFidelityScore >= 60 ? 'WATCH' : 'WEAK',
    ndxLeakStatus: input.judgment.crossBrandLeak?.leaked ? 'LEAK RISK' : 'CLEAR',
    strengths: input.judgment.strengths,
    weaknesses: input.judgment.weaknesses,
    nextPush: input.judgment.revisionDirectives[0] ?? null,
    founderJudgment: null,
    founderNotes: {
      whyIFeelThis: null,
      whatsMissing: null,
      whatToPreserve: null,
      whatToPush: null,
    },
    assets: [
      {
        assetId: heroId,
        kind: 'symbol',
        label: 'Concept hero',
        url: null,
        symbolicTreatment: input.heroSymbol ?? input.territory.conceptName,
      },
    ],
    heroVisualAssetId: heroId,
    status: input.judgment.decision === 'ADVANCE' ? 'READY_FOR_REVIEW' : 'REVISE',
    isDemoCase: input.isDemoCase ?? false,
    isRealBrandDemo: input.isRealBrandDemo ?? false,
    diagnostics: buildDiagnostics(input.judgment, input.territory),
  };
}

export function applyFounderJudgmentToPanel(
  panel: ConceptPanel,
  judgment: ConceptPanel['founderJudgment'],
  notes: Partial<ConceptPanel['founderNotes']>,
): ConceptPanel {
  let status = panel.status;
  if (judgment === 'APPROVED_FOR_NEXT_STAGE' || judgment === 'LOVE_IT') status = 'APPROVED_FOR_NEXT_STAGE';
  else if (judgment === 'HOLD') status = 'ON_HOLD';
  else if (judgment === 'REVISE') status = 'REVISE';
  else if (judgment) status = 'FOUNDER_REVIEWED';

  return {
    ...panel,
    founderJudgment: judgment,
    founderNotes: { ...panel.founderNotes, ...notes },
    status,
  };
}
