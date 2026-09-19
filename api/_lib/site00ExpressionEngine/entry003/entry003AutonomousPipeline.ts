/**
 * C1.2 — Entry 003 autonomous creative director pipeline.
 */

import type { CulturalRead } from '../../../../shared/site00-expression-engine/creative-director/types.js';
import {
  ENTRY_003_GATE_ID,
  ENTRY_003_ID,
  ENTRY_003_RECORD_IDS,
  type Entry003AutonomousPackage,
  type Entry003BootstrapResult,
  type Entry003ExtendedCulturalRead,
  type Entry003ArtifactRecord,
  type Entry003WorldRecord,
} from '../../../../shared/site00-expression-engine/entry-003/types.js';
import { runAutonomousCreativeDirector } from '../creativeDirector/autonomousCreativeDirectorRuntime.js';
import { antiOverfitCheck } from '../creativeDirector/creativeDirectorSelfCritique.js';
import {
  generateEntry003SubjectCandidates,
  evaluateEntry003Subjects,
  selectEntry003Subject,
  subjectsAreDivergent,
  buildEntry003BriefFromSelection,
} from './entry003SubjectDiscovery.js';
import { buildEntry003EvidenceResearchPlan } from './entry003EvidenceResearchPlan.js';
import { deriveEntry003FormatImplications } from './entry003FormatIntelligence.js';
import { saveEntry003Package } from './entry003Store.js';

function buildExtendedCulturalRead(culturalRead: CulturalRead, thesis: string): Entry003ExtendedCulturalRead {
  return {
    surfaceRead: culturalRead.surfaceTopic,
    obviousCulturalTake: culturalRead.obviousTake,
    deeperTension: culturalRead.underlyingTension,
    culturalHypocrisy: culturalRead.culturalHypocrisy,
    whatPeopleSayNow: `Culture performs "${thesis.split('WHEN ')[1]?.slice(0, 60) ?? 'effortless'}" in public language.`,
    whatReceiptsMayShow: culturalRead.uncomfortableTruth,
    whyPositionsCannotBothSurvive: culturalRead.socialContradiction,
    whatThisIsReallyAbout: culturalRead.uncomfortableTruth,
    whyItMatters: culturalRead.whyItMattersNow,
  };
}

function buildWorldRecord(winner: { name: string; world: string; worldFunction: string; coreIdea: string }): Entry003WorldRecord {
  return {
    worldName: winner.world,
    worldDescription: winner.coreIdea,
    worldFunction: winner.worldFunction,
    whyNecessary: 'World quantifies hidden labor — argument cannot live in talking-head space alone.',
    whatWorldPhysicallyDoes: winner.worldFunction,
    whatWorldDoesNotDo: 'Does not decorate — no generic bathroom b-roll without receipt function.',
  };
}

function buildArtifactRecord(winner: {
  artifact: string;
  artifactFunction: string;
}): Entry003ArtifactRecord {
  if (!winner.artifact || winner.artifact === 'NONE') {
    return {
      artifact: null,
      artifactFunction: null,
      whyThisObject: null,
      howItChangesStory: null,
      noPrimaryArtifact: true,
    };
  }
  return {
    artifact: winner.artifact,
    artifactFunction: winner.artifactFunction,
    whyThisObject: 'Receipt must be countable — steps, SKUs, or timestamps.',
    howItChangesStory: winner.artifactFunction,
    noPrimaryArtifact: false,
  };
}

export async function bootstrapC12Entry003AutonomousCreativeDirector(): Promise<Entry003BootstrapResult> {
  const now = new Date().toISOString();

  const subjectCandidates = generateEntry003SubjectCandidates();
  if (!subjectsAreDivergent(subjectCandidates)) {
    throw new Error('Entry 003 subject discovery failed divergence requirement');
  }

  const subjectEvaluations = evaluateEntry003Subjects(subjectCandidates);
  const subjectSelection = selectEntry003Subject(subjectCandidates, subjectEvaluations);
  const brief = buildEntry003BriefFromSelection(subjectSelection);

  const run = await runAutonomousCreativeDirector(brief, { skipBlindTestGuard: true });
  const winner = run.territories.find((t) => t.territoryId === run.winningDirection.territoryId)!;
  antiOverfitCheck(winner);

  const priorEntryDifferentiation = antiOverfitCheck(winner);
  const narrative = run.narrativeSynthesis;
  const shufflePassed = run.selfCritique.questions.WOULD_STORY_WORK_IF_SHUFFLED === false;
  const causalPass = Boolean(run.selfCritique.questions.IS_THE_STORY_EARNED);
  const connectiveTissueTest = {
    passed: !run.selfCritique.founderWouldConnectDots,
    founderWouldInventMiddle: run.selfCritique.founderWouldConnectDots,
  };

  const status =
    run.founderInterventionDependency === 'HIGH'
      ? 'NEEDS_FOUNDER_DIRECTION'
      : 'CREATIVE_DIRECTION_AWAITING_FOUNDER_REVIEW';

  const pkg: Entry003AutonomousPackage = {
    packageId: `NDX-E003-PKG-${Date.now()}`,
    entryId: ENTRY_003_ID,
    sprint: 'C1.2_ENTRY_003_AUTONOMOUS_CREATIVE_DIRECTOR',
    status,
    subjectCandidates,
    subjectEvaluations,
    subjectSelection,
    extendedCulturalRead: buildExtendedCulturalRead(run.culturalRead, subjectSelection.thesis),
    creativeDirectorRun: run,
    evidenceResearchPlan: buildEntry003EvidenceResearchPlan(subjectSelection),
    formatImplications: deriveEntry003FormatImplications(winner, subjectSelection.thesis),
    worldRecord: buildWorldRecord(winner),
    artifactRecord: buildArtifactRecord(winner),
    audienceJourney: narrative?.audienceJourney.map(
      (j, i) => j.knownFacts[j.knownFacts.length - 1] ?? `Beat ${i + 1}: ${j.beatId}`,
    ) ?? [
      'Recognition of effortless claim',
      'Questioning via first receipt',
      'Pattern destabilizes trust',
      'Contradiction becomes explicit',
      'Interjection names it',
      'Aftershock — next trend loading',
    ],
    emotionalArcSummary: narrative?.emotionalArc.progression.join(' → ') ?? 'CURIOSITY → RECOGNITION → DISBELIEF → COMPLICITY',
    shuffleQa: {
      passed: shufflePassed,
      orderDependency: shufflePassed ? 'STRONG' : 'WEAK',
    },
    connectiveTissueTest,
    priorEntryDifferentiation,
    records: {
      creativeDirectionId: ENTRY_003_RECORD_IDS.creativeDirection,
      narrativeSynthesisId: ENTRY_003_RECORD_IDS.narrativeSynthesis,
      directorialConceptionId: ENTRY_003_RECORD_IDS.directorialConception,
      visualAuthorityPlanId: ENTRY_003_RECORD_IDS.visualAuthorityPlan,
      entryStatus: status,
      canon: false,
      productionReady: false,
      storyboardReady: false,
    },
    gateId: ENTRY_003_GATE_ID,
    founderJudgment: 'UNREVIEWED',
    founderFeedbackType: null,
    creativeMaturity: run.creativeMaturity,
    founderInterventionDependency: run.founderInterventionDependency,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    falDispatchCount: 0,
    narrativeSynthesis: narrative,
    createdAt: now,
    updatedAt: now,
  };

  saveEntry003Package(pkg);

  return {
    sprint: 'C1.2_ENTRY_003_AUTONOMOUS_CREATIVE_DIRECTOR',
    architectureLayer:
      'SUBJECT DISCOVERY → CULTURAL READ → CREATIVE THINKING → NARRATIVE SYNTHESIS → SELF-CRITIQUE → FOUNDER REVIEW GATE',
    providerDispatchCount: 0,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    falDispatchCount: 0,
    entry003Package: pkg,
    nextAction: 'FOUNDER REVIEWS ENTRY 003 AS STUDIO WORLD CREATED IT',
  };
}
