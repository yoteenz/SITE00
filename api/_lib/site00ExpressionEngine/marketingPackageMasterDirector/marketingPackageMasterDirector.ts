/**
 * C1.3 — Marketing Package Master Director (generalized chapter continuity).
 */

import type { MarketingPackageMasterDirectorOutput } from '../../../../shared/site00-expression-engine/campaign-narrative/types.js';
import { CAMPAIGN_NARRATIVE_VERSION } from '../../../../shared/site00-expression-engine/campaign-narrative/types.js';
import { NDXBOOK_PROOF_BRAND_ID } from '../../../../shared/site00-expression-engine/constants.js';
import {
  buildCampaignNarrativeArc,
  buildCampaignContentSequence,
  buildGenericEscalationPlan,
  buildEmptyMotifSystem,
} from '../campaignNarrative/campaignNarrativeArcBuilder.js';
import { runCampaignNarrativeCohesionQA } from '../campaignNarrative/campaignCohesionQA.js';
import {
  buildNdxbookChapter01CampaignUnits,
  buildNdxbookChapter01Escalation,
  buildNdxbookChapter01MotifSystem,
  buildNdxbookEntry001SequenceRole,
  buildNdxbookEntry002SequenceRole,
  entryHandoffToCampaignHandoff,
  entrySequenceRoleToCampaignUnitRole,
  buildNdxbookEntry002To003HandoffOptions,
  selectEntry002To003Handoff,
  getNdxbookCampaignGrammar,
} from '../campaignNarrative/ndxbookCampaignNarrativeAdapter.js';
import { runCinematicContinuityDirector } from '../cinematicContinuity/cinematicContinuityDirector.js';

export function runMarketingPackageMasterDirector(args?: {
  brandId?: string;
  campaignId?: string;
}): MarketingPackageMasterDirectorOutput {
  const brandId = args?.brandId ?? NDXBOOK_PROOF_BRAND_ID;
  const campaignId = args?.campaignId ?? 'ndxbook-chapter-01';
  const grammar = getNdxbookCampaignGrammar();
  const continuity = runCinematicContinuityDirector();
  const winning = continuity.masterFilmDirectorPass.concepts.find(
    (c) => c.conceptName === continuity.masterFilmDirectorPass.winningConceptId,
  )!;

  const e1Role = buildNdxbookEntry001SequenceRole();
  const e2Role = buildNdxbookEntry002SequenceRole();
  const units = [
    ...buildNdxbookChapter01CampaignUnits(),
    {
      unitId: 'entry-003',
      sequenceNumber: 3,
      title: 'EMPLOYEES ONLY',
      subject: 'CLEAN GIRL / EFFORTLESS BEAUTY',
      unitFunction: 'ESCALATION' as const,
      coreQuestion: continuity.entry003Responsibility.whatEntryMustAdd,
      contradiction: continuity.masterFilmDirectorPass.deeperContradiction,
      world: winning.world,
      artifact: winning.artifact,
      endingLogic: winning.endingImage,
      nonCanon: true,
    },
  ];

  const unitRoles = [
    entrySequenceRoleToCampaignUnitRole(e1Role),
    entrySequenceRoleToCampaignUnitRole(e2Role),
  ];

  const sequence = buildCampaignContentSequence({ campaignId, units, unitRoles });
  const handoffs = [entryHandoffToCampaignHandoff(selectEntry002To003Handoff(buildNdxbookEntry002To003HandoffOptions()))];
  const escalation = buildNdxbookChapter01Escalation();
  const motifSystem = buildNdxbookChapter01MotifSystem();

  sequence.handoffs = handoffs;
  sequence.teaseSeeds = [
    {
      seedType: 'NOTIFICATION',
      seedObject: 'Wellness app reminder',
      seedQuestion: 'If healing language is everywhere, why do behavior receipts contradict it?',
      seedVisual: 'Calendar block over conflicting thumbnail',
      seedLine: 'YOU SCHEDULED PEACE. THE RECEIPTS DIDN\'T GET THE INVITE.',
      whyItExtendsCampaign: 'Extends invisible labor theme to emotional labor / therapy-speak',
      constraints: ['nonCanon=true'],
      nonCanon: true,
      targetUnitId: 'entry-004',
    },
  ];

  const arc = buildCampaignNarrativeArc({
    arcId: `ARC-${campaignId}`,
    campaignId,
    brandId,
    campaignThesis: 'Culture performs one story while receipts show another — stakes escalate from THEY to YOU.',
    audienceJourney: [
      'Recognition of collective complicity',
      'Proof that labels change without objects',
      'Implication in invisible maintenance labor',
      'Open question: healing language vs behavior',
    ],
    sequence,
    escalation,
    motifSystem,
  });

  arc.artifactLineage = {
    entries: [
      { unitId: 'entry-001', artifact: 'vintage television', action: 'DISAPPEAR', bridgesToNext: true, primaryArtifactOfUnit: true, rationale: 'TV shutoff bridges to phone era' },
      { unitId: 'entry-002', artifact: 'phone', action: 'HAND_OFF', bridgesToNext: true, primaryArtifactOfUnit: false, rationale: 'Phone bridges via notification — not Entry 003 primary artifact' },
      { unitId: 'entry-003', artifact: 'staff shift receipt', action: 'BE_REPLACED', bridgesToNext: true, primaryArtifactOfUnit: true, rationale: 'Shift receipt hands to wellness calendar seed' },
    ],
    bridgeRule: 'ARTIFACT_BRIDGE ≠ ARTIFACT_REUSE',
    notes: artifactBridgeLogicFromContinuity(continuity.artifactBridgeLogic),
  };

  const cohesionQA = runCampaignNarrativeCohesionQA({
    campaignId,
    sequence,
    handoffs,
    escalation,
    motifSystem,
  });

  return {
    directorId: `MPMD-${campaignId}-${Date.now()}`,
    campaignThesis: arc.campaignThesis,
    audienceJourney: arc.audienceJourney,
    contentSequence: sequence,
    unitRoles,
    heroMoments: ['WHO TF IS WE?', 'OH, NOW IT WAS FUN?', 'EMPLOYEES ONLY'],
    handoffs,
    callbacks: ['receipt grammar', 'screen/device lineage', 'contradiction interjection'],
    escalation,
    motifs: motifSystem,
    artifactLineage: arc.artifactLineage,
    formatPlan: 'Story units locked before Reel/Carousel/Story translation — format does not drive story.',
    payoff: winning.climaxImage,
    campaignEnding: 'Chapter 01 open — Entry 004 seeded non-canon',
    cohesionQA,
    version: CAMPAIGN_NARRATIVE_VERSION,
  };
}

function artifactBridgeLogicFromContinuity(logic: string): string {
  return logic;
}

export function runGenericCampaignSequenceIntelligence(): {
  openingPiece: string;
  secondPieceRole: string;
  thirdPieceEscalation: string;
  heroUnit: string;
  proofUnit: string;
  emotionalUnit: string;
  conversionUnit: string;
  teaseUnit: string;
  linkingMotif: string;
} {
  return {
    openingPiece: 'Unit 1 — establish contradiction grammar and campaign thesis',
    secondPieceRole: 'Unit 2 — deepen with new evidence domain; bridge forward',
    thirdPieceEscalation: 'Unit 3 — escalate stakes (personal complicity); do not repeat proof type',
    heroUnit: 'entry-001 — chapter provocation',
    proofUnit: 'entry-002 — receipt collision on same object',
    emotionalUnit: 'entry-003 — viewer implicated via invisible labor reveal',
    conversionUnit: 'TBD at format translation — not story stage',
    teaseUnit: 'entry-003 ending → entry-004 seed',
    linkingMotif: 'screen → device → notification → infrastructure receipt',
  };
}
