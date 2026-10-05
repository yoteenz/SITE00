/**
 * P0.5E.7 — NDX opportunity formulator (character-first).
 */

import type { ContentMemoryIndex, ContentOpportunity } from '../types.js';
import { createContentOpportunity, evaluateNDXOpportunityFit, rankContentOpportunity } from '../opportunityEngine.js';
import type { SeedOpportunitySpec } from '../opportunityEngine.js';
import { buildBookNativeVisualHandoff } from './visualHandoff.js';
import { buildContentSeedFilmHandoff } from './filmHandoff.js';
import { evaluateHumorOpportunity } from './ndxFirstPersonCopyCompiler.js';
import { checkBookMemoryForSeed } from './bookMemory.js';
import type {
  CharacterTruthFormulationContext,
  NDXContentSeed,
  NDXOpportunityFormulation,
} from './types.js';

const DEFAULT_CHARACTER_TRUTH: CharacterTruthFormulationContext = {
  characterTruthSnapshotId: null,
  languageRegister: 'FIRST_PERSON_UPPERCASE',
  humorBehavior: 'contradiction + understatement + deadpan',
  bookBehavior: 'document + bookmark + dog-ear + errata',
  correctionBehavior: 'surface revision when evidence changes view',
  curiosityPatterns: ['notice contradiction', 'investigate system logic', 'connect across eras'],
  cameraBehavior: 'double-take → rabbit hole → book payoff',
};

export function formulateOpportunityFromContentSeed(params: {
  seed: NDXContentSeed;
  memory?: ContentMemoryIndex | null;
  characterTruth?: CharacterTruthFormulationContext;
}): { opportunity: ContentOpportunity; formulation: NDXOpportunityFormulation } {
  const truth = params.characterTruth ?? DEFAULT_CHARACTER_TRUTH;
  const bookMemory = checkBookMemoryForSeed(params.seed, params.memory ?? null);
  const humor = evaluateHumorOpportunity(params.seed);

  const spec: SeedOpportunitySpec = {
    sourceType: mapSeedSourceToOpportunitySource(params.seed.sourceType),
    subject: params.seed.premise.internalTopic,
    summary: params.seed.notice,
    whyInteresting: params.seed.whySheCares,
    domains: params.seed.categoryMetadata.length ? params.seed.categoryMetadata : params.seed.topicMetadata,
  };

  const opportunity = createContentOpportunity({
    projectId: params.seed.projectId,
    spec,
    memory: params.memory ?? null,
    liveLineage: params.seed.liveSignalIds.length
      ? {
          liveSignalIds: params.seed.liveSignalIds,
          currentIntelligencePackageId: null,
          brandSignalInterpretationId: null,
          whyNowEvaluationId: null,
          temporalRelevanceId: null,
          culturalMemoryMatchIds: bookMemory.callbackIds,
          forecastId: null,
          opportunityOrigin: 'LIVE_SIGNAL',
        }
      : null,
  });

  opportunity.subject = params.seed.premise.internalTopic;
  opportunity.summary = params.seed.notice;
  opportunity.whyPotentiallyInteresting = params.seed.whySheCares;

  const formulation: NDXOpportunityFormulation = {
    spokenPremise: params.seed.premise.spokenPremise,
    internalTopic: params.seed.premise.internalTopic,
    whyNow: params.seed.temporalRelevance,
    firstReaction: params.seed.firstReaction,
    investigationAngle: params.seed.investigationTrigger,
    bookTrace: params.seed.bookTrace,
    surfaceRecommendation: deriveSurfaces(params.seed),
    formatRecommendation: params.seed.candidateFormat,
    risk: 'LOW',
    evidenceReadiness: params.seed.evidenceFound.length ? 'READY' : 'NEEDS_RESEARCH',
    conversationPotential: params.seed.conversationPotential,
    savePotential: params.seed.saveability,
    thoughtArcSummary: `${params.seed.thoughtArc.beatsPresent.slice(0, 4).join(' → ')}`,
    characterBeat: params.seed.characterBeat,
    knowledgeState: params.seed.thoughtArc.knowledgeState,
    pageRoles: params.seed.isGoldenPilot
      ? ['HOOK', 'INITIAL_ASSUMPTION', 'WHAT_I_MISSED', 'EVIDENCE', 'EVIDENCE', 'WHAT_I_THINK_NOW', 'WHAT_I_AM_DOING_DIFFERENTLY', 'BOOKMARK_CLOSING_TRACE']
      : ['HOOK', 'INITIAL_ASSUMPTION', 'EVIDENCE', 'WHAT_I_THINK_NOW', 'BOOKMARK_CLOSING_TRACE'],
    visualHandoff: buildBookNativeVisualHandoff(params.seed),
    filmHandoff: buildContentSeedFilmHandoff(params.seed),
  };

  opportunity.characterFit = evaluateNDXOpportunityFit({
    ...opportunity,
    summary: `${params.seed.premise.spokenPremise} — ${params.seed.notice}`,
    investigationPotential: params.seed.conversationPotential === 'HIGH' ? 0.85 : 0.6,
    brandRelevance: 0.9,
  });
  opportunity.rank = rankContentOpportunity(opportunity);

  return {
    opportunity: {
      ...opportunity,
      characterFirst: {
        contentSeedId: params.seed.seedId,
        spokenPremise: formulation.spokenPremise,
        firstPersonPremise: params.seed.premise,
        thoughtArc: params.seed.thoughtArc,
        characterBeat: params.seed.characterBeat,
        knowledgeState: params.seed.thoughtArc.knowledgeState,
        beliefRevision: params.seed.thoughtArc.beliefRevision,
        formulation,
        humorEvaluation: humor,
        bookMemoryHits: bookMemory,
        characterTruthSnapshotId: truth.characterTruthSnapshotId,
        topicIsPrimaryPremise: false,
      },
    },
    formulation,
  };
}

function mapSeedSourceToOpportunitySource(
  source: NDXContentSeed['sourceType'],
): ContentOpportunity['sourceType'] {
  const map: Partial<Record<NDXContentSeed['sourceType'], ContentOpportunity['sourceType']>> = {
    LIVE_WORLD_SIGNAL: 'CULTURAL_SIGNAL',
    PERSONAL_EXPERIENCE: 'FOUNDER_SEED',
    AUDIENCE_SUBMISSION: 'AUDIENCE_QUESTION',
    AUDIENCE_QUESTION: 'AUDIENCE_QUESTION',
    CULTURAL_MOMENT: 'CULTURAL_SIGNAL',
    HISTORICAL_CALLBACK: 'HISTORICAL_CALLBACK',
    FOUNDER_PROVIDED: 'FOUNDER_SEED',
    RABBIT_HOLE: 'UNRESOLVED_PRIOR_INVESTIGATION',
    BOOKMARK_CALLBACK: 'ARCHIVE_REVISIT',
    DOG_EAR_FOLLOWUP: 'UNRESOLVED_PRIOR_INVESTIGATION',
    ERRATA: 'ARCHIVE_REVISIT',
  };
  return map[source] ?? 'EVERGREEN';
}

function deriveSurfaces(seed: NDXContentSeed): NDXOpportunityFormulation['surfaceRecommendation'] {
  const surfaces: NDXOpportunityFormulation['surfaceRecommendation'] = [seed.candidateSurface];
  if (seed.characterBeat === 'THAT_CANNOT_BE_RIGHT' || seed.characterBeat === 'WAIT') {
    surfaces.push('MARGIN');
  }
  if (seed.thoughtArc.knowledgeState === 'TESTING' || seed.thoughtArc.beliefRevision === 'UNRESOLVED') {
    surfaces.push('DOG_EAR');
  }
  if (seed.bookTrace === 'BOOKMARK') surfaces.push('PAGE');
  return [...new Set(surfaces)];
}

export function buildCharacterFirstOpportunities(params: {
  projectId: string;
  seeds: NDXContentSeed[];
  memory?: ContentMemoryIndex | null;
}): ContentOpportunity[] {
  return params.seeds.map((seed) => formulateOpportunityFromContentSeed({ seed, memory: params.memory }).opportunity);
}
