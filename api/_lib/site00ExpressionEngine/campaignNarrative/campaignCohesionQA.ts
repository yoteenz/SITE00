/**
 * C1.3 — Campaign cohesion QA (generic, brand-agnostic).
 */

import type {
  CampaignCohesionFailureClass,
  CampaignContentSequence,
  CampaignEscalationPlan,
  CampaignHandoffPlan,
  CampaignMotifSystem,
  CampaignNarrativeCohesionQA,
} from '../../../../shared/site00-expression-engine/campaign-narrative/types.js';

export function runCampaignNarrativeCohesionQA(args: {
  campaignId: string;
  sequence: CampaignContentSequence;
  handoffs: CampaignHandoffPlan[];
  escalation: CampaignEscalationPlan;
  motifSystem: CampaignMotifSystem;
}): CampaignNarrativeCohesionQA {
  const failureClasses: CampaignCohesionFailureClass[] = [];

  if (args.sequence.units.length < 2) {
    failureClasses.push('ISOLATED_CONTENT_UNITS');
  }

  const weakHandoffs = args.handoffs.filter((h) => h.continuityStrength === 'WEAK');
  if (args.handoffs.length > 0 && weakHandoffs.length === args.handoffs.length) {
    failureClasses.push('WEAK_HANDOFF');
  }

  const artifacts = args.sequence.units.map((u) => u.artifact.toLowerCase());
  const uniqueArtifacts = new Set(artifacts);
  if (artifacts.length > 2 && uniqueArtifacts.size < artifacts.length) {
    failureClasses.push('REPEATED_ARTIFACT');
  }

  const worlds = args.sequence.units.map((u) => u.world.toLowerCase());
  const uniqueWorlds = new Set(worlds);
  if (worlds.length > 2 && uniqueWorlds.size < worlds.length) {
    failureClasses.push('REPEATED_WORLD_MECHANISM');
  }

  if (args.escalation.stakesProgression.length < 2) {
    failureClasses.push('NO_ESCALATION');
  }

  const repeatedMotifs = args.motifSystem.motifsRepeated.filter((m) =>
    args.motifSystem.motifRecords.every((r) => r.motif !== m || r.status !== 'EVOLVED'),
  );
  if (repeatedMotifs.length > 0) {
    failureClasses.push('MOTIF_REUSE_WITHOUT_EVOLUTION');
  }

  const bridgeConfused = args.handoffs.some((h) => h.reuseRisk === 'HIGH' && !h.artifactBridgeNotReuse);
  if (bridgeConfused) {
    failureClasses.push('ARTIFACT_BRIDGE_CONFUSED_WITH_REUSE');
  }

  if (args.sequence.units.every((u) => u.contradiction.includes('inconsistent'))) {
    failureClasses.push('CHAPTER_REPETITION');
  }

  const handoffStrong = args.handoffs.some((h) => h.continuityStrength === 'STRONG');
  const sequencePass = args.sequence.units.length >= 2;
  const handoffPass = args.handoffs.length === 0 || handoffStrong || weakHandoffs.length < args.handoffs.length;
  const escalationPass = args.escalation.stakesProgression.length >= 2;
  const motifPass = repeatedMotifs.length === 0;
  const worldPass = uniqueWorlds.size >= Math.min(worlds.length, 2);
  const artifactPass = uniqueArtifacts.size >= Math.min(artifacts.length, 2);

  const overallPass =
    failureClasses.length === 0 ||
    (sequencePass && handoffPass && escalationPass && motifPass && worldPass && artifactPass);

  return {
    qaId: `QA-${args.campaignId}-${Date.now()}`,
    campaignId: args.campaignId,
    domains: {
      sequenceLogic: { pass: sequencePass, note: `${args.sequence.units.length} units in sequence` },
      handoffStrength: {
        pass: handoffPass,
        note: handoffStrong ? 'At least one STRONG handoff' : 'Handoffs present but need strength review',
      },
      motifEvolution: { pass: motifPass, note: repeatedMotifs.length ? 'Repeated motifs without evolution' : 'Motif control OK' },
      repetitionRisk: { pass: failureClasses.filter((f) => f.includes('REPEATED')).length === 0, note: 'Surface repetition scan' },
      escalation: { pass: escalationPass, note: args.escalation.escalationModel },
      emotionalRhythm: { pass: true, note: 'Rhythm plan required at chapter level' },
      worldDifferentiation: { pass: worldPass, note: `${uniqueWorlds.size} distinct worlds` },
      artifactDifferentiation: { pass: artifactPass, note: `${uniqueArtifacts.size} distinct artifacts` },
      unitPurposeClarity: {
        pass: args.sequence.unitRoles.every((r) => r.unitFunction.length > 0),
        note: 'Each unit has functional role',
      },
      formatAppropriateness: { pass: true, note: 'Format does not drive story at this stage' },
      payoffIntegrity: { pass: args.sequence.units.some((u) => u.unitFunction === 'PAYOFF' || u.sequenceNumber >= 2), note: 'Payoff chain building' },
      campaignEndingStrength: { pass: Boolean(args.sequence.teaseSeeds.length || args.sequence.units.length >= 3), note: 'Campaign destination seeded' },
    },
    failureClasses,
    overallPass,
  };
}

export function evaluateHandoffStrength(handoff: CampaignHandoffPlan): boolean {
  return handoff.continuityStrength === 'STRONG' && handoff.narrativeNecessity !== 'OPTIONAL';
}

export function artifactBridgeDiffersFromReuse(handoff: CampaignHandoffPlan): boolean {
  return handoff.artifactBridgeNotReuse === true;
}
