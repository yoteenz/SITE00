/**
 * C1.1 — Bridge winning creative direction → Narrative Synthesis input + spine.
 */

import type { NarrativeSynthesisInput } from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';
import type {
  CreativeDirectorRun,
  CreativeTerritoryCandidate,
  MinimalCreativeBrief,
  RoleSynthesis,
  WinningCreativeDirection,
} from '../../../../shared/site00-expression-engine/creative-director/types.js';
import { compileNarrativeSpineFromInput } from '../narrativeSynthesis/narrativeSynthesisCompiler.js';
import { buildCausalityGraph, runNarrativeShuffleTest } from '../narrativeSynthesis/narrativeCausalityGraph.js';
import { runNarrativeSelfRevisionLoop } from '../narrativeSynthesis/narrativeSelfRevision.js';

export function buildNarrativeSynthesisInputFromCreativeDirector(ctx: {
  brief: MinimalCreativeBrief;
  winner: CreativeTerritoryCandidate;
  direction: WinningCreativeDirection;
  roles: RoleSynthesis;
  interjection: string;
  contradiction: CreativeDirectorRun['contradiction'];
}): NarrativeSynthesisInput {
  const { brief, winner, roles, interjection, contradiction } = ctx;
  return {
    entryId: brief.entryId,
    entryNumber: 99,
    chapterId: brief.chapterId,
    brandId: brief.brandId,
    subject: brief.subject,
    topic: brief.topic,
    thesis: brief.thesis,
    lockedPremise: contradiction.whyBothCannotSurvive,
    lockedContradiction: `${contradiction.positionA} vs ${contradiction.positionB}`,
    chapterArgumentGrammar: brief.chapterArgumentGrammar,
    creativeTerritories: [
      {
        territoryId: winner.territoryId,
        label: winner.name,
        narrativePotential: winner.narrativeMechanism,
      },
    ],
    selectedTerritoryId: winner.territoryId,
    worldCandidates: [
      {
        worldId: winner.territoryId,
        label: winner.world,
        narrativeFunction: winner.worldFunction.toLowerCase().includes('edit') ? 'EDIT' : 'REVEAL',
      },
    ],
    artifactCandidates: [
      {
        artifactId: `artifact-${winner.territoryId}`,
        label: winner.artifact,
        narrativeRole: 'EVIDENCE',
      },
    ],
    visualMechanisms: [winner.visualMechanism],
    interjectionCandidates: [interjection],
    brandLore: [brief.brandTruth],
    brandPersonality: [brief.brandPersonality],
    founderCreativeAppetite: {
      risk: brief.founderCreativeAppetite === 'BOLD' ? 'HIGH' : 'MEDIUM',
      abstraction: 'MEDIUM',
      wit: 'HIGH',
      polarization: 'MEDIUM',
      rawness: 'MEDIUM',
      density: 'MEDIUM',
      surprise: 'MEDIUM',
      directorLatitude: brief.founderCreativeAppetite === 'BOLD' ? 'HIGH' : 'MEDIUM',
      boundaries: 'Receipt-first — no generic wellness optimism',
    },
    priorEntryLineage: brief.priorEntryLineage.map((e) => ({
      entryId: e.entryId,
      worldId: null,
      artifactId: null,
      argumentShape: ['CLAIM', 'RECEIPT', 'CONTRADICTION'],
      interjectionDevice: e.interjectionDevice,
    })),
    continuityConstraints: [
      `NDX role: ${roles.ndxRole}`,
      `Subject role: ${roles.subjectRole}`,
      'World performs argument — not decorative',
      'Artifact holds receipt proof',
    ],
    formatContext: [brief.formatTarget ?? 'REEL primary'],
    platformContext: ['INSTAGRAM-native', 'X/Twitter derivative potential'],
    creativeBoundaries: brief.priorEntryLineage.flatMap((e) => e.surfaceMechanismsToAvoid),
  };
}

export function compileAutonomousNarrativeSpine(input: NarrativeSynthesisInput) {
  return compileNarrativeSpineFromInput(input);
}

export function runNarrativeSynthesisFromCreativeDirector(input: NarrativeSynthesisInput) {
  const { synthesis, revisionPasses } = runNarrativeSelfRevisionLoop(input);
  const spine = compileNarrativeSpineFromInput(input);
  const graph = buildCausalityGraph(spine.beats);
  const shuffle = runNarrativeShuffleTest(spine.beats, graph.edges);
  return {
    synthesis,
    revisionPasses,
    beatCount: spine.beats.length,
    causalPass: graph.orderDependency !== 'WEAK' && graph.shuffleTestPassed,
    shufflePassed: shuffle.passed,
  };
}

export function buildTreatmentHandoffFromApprovedRun(run: CreativeDirectorRun) {
  if (!run.narrativeSynthesis?.narrativeAuthority) {
    return { ready: false, reason: 'Creative Director output not approved as narrative authority' };
  }
  return {
    ready: true,
    narrativeAuthorityId: run.narrativeSynthesis.synthesisId,
    approvedStory: run.narrativeSynthesis.narrativeSpine.beats.map((b) => b.whatHappens),
    roles: run.roleSynthesis,
    world: run.winningDirection.territoryName,
    artifact: run.visualAuthorityPlan.find((a) => a.authorityId.includes('artifact'))?.authorityName,
    turn: run.turningPoint,
    interjection: run.selectedInterjection,
    payoff: run.payoffAftershock,
    directorConcept: run.directorialConception,
    authorityRequirements: run.visualAuthorityPlan,
  };
}
