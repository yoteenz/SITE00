/**
 * Casting intelligence — recommend reuse before create; repetition guard; creative search.
 */

import type { NarrativeMomentumPlan } from '../../site00-expression-engine/narrative-momentum/types.js';
import { findActorById, getStudioWorldActorCatalogue } from './seedCatalogue.js';
import type {
  CastingRecommendation,
  CastingRequirement,
  HomogeneityGuardResult,
  StudioWorldActor,
  StudioWorldActorCatalogue,
} from './types.js';

export type RecommendActorsInput = {
  requirement: CastingRequirement;
  brand: string;
  project: string;
  creativeTerritory: string;
  narrativePlan: NarrativeMomentumPlan | null;
  previousActorUsage: readonly { actorId: string; entryId: string; recordedAt: string }[];
  founderCreativeAppetite?: { risk: string; surprise: string; wit: string };
  catalogue?: StudioWorldActorCatalogue;
};

export function recommendActorsForCharacter(input: RecommendActorsInput): CastingRecommendation[] {
  const catalogue = input.catalogue ?? getStudioWorldActorCatalogue();
  const candidates = catalogue.actors.filter((a) => a.status === 'ACTIVE');
  const scored = candidates
    .map((actor) => ({
      actor,
      score: matchScore(actor, input.requirement),
      repetitionRisk: repetitionRiskForActor(actor, input),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (scored.length === 0) {
    return [];
  }

  return scored.map(({ actor, score, repetitionRisk }) => ({
    actor,
    rationale: buildRationale(actor, input.requirement, score),
    reuseSuggested: score >= 3,
    recentUsageNote: recentUsageNote(actor, input.previousActorUsage),
    repetitionRisk,
  }));
}

export function shouldSearchCatalogueBeforeNewActor(
  requirement: CastingRequirement,
  recommendations: readonly CastingRecommendation[],
): { action: 'REUSE_EXISTING' | 'CREATE_NEW_ACTOR'; reason: string } {
  const strong = recommendations.find((r) => r.reuseSuggested);
  if (strong) {
    return {
      action: 'REUSE_EXISTING',
      reason: `Catalogue match ${strong.actor.catalogueNumber} — ${strong.rationale}`,
    };
  }
  return {
    action: 'CREATE_NEW_ACTOR',
    reason: `No suitable catalogue fit for ${requirement.narrativeRole}; founder may approve new Actor brief`,
  };
}

export function castingCreativeSearch(
  query: string,
  catalogue: StudioWorldActorCatalogue = getStudioWorldActorCatalogue(),
): StudioWorldActor[] {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  return catalogue.actors.filter((actor) => {
    const hay = [
      actor.stageName,
      actor.presentation,
      actor.ageRange,
      actor.skinToneDescription,
      actor.hairBaseline,
      ...actor.performanceProfile,
      ...actor.roleArchetypes,
      ...actor.nationalityOrCulturalCastingTags,
    ]
      .join(' ')
      .toLowerCase();
    return tokens.every((t) => hay.includes(t) || fuzzyTokenMatch(t, hay));
  });
}

function fuzzyTokenMatch(token: string, hay: string): boolean {
  if (token === 'woman' || token === 'female') return hay.includes('woman');
  if (token === 'man' || token === 'male') return hay.includes('man');
  if (token === '40s' || token === 'forties') return hay.includes('42') || hay.includes('40');
  if (token === 'mother') return hay.includes('mother');
  if (token === 'baddie') return hay.includes('2016') || hay.includes('influencer');
  if (token === 'archivist' || token === 'academic') return hay.includes('archivist') || hay.includes('researcher');
  return false;
}

export function evaluateCastingHomogeneityGuard(
  castActorIds: readonly string[],
  requirementCount: number,
): HomogeneityGuardResult {
  if (castActorIds.length < 2 || requirementCount < 3) {
    return { flagged: false, advisory: null, dimensions: [] };
  }
  const actors = castActorIds.map((id) => findActorById(id)).filter(Boolean) as StudioWorldActor[];
  const presentations = new Set(actors.map((a) => a.presentation));
  const skinFamilies = new Set(actors.map((a) => a.skinToneDescription.split(',')[0]?.trim()));
  if (presentations.size === 1 && actors.length >= 3) {
    const dimensions = ['presentation'];
    if (skinFamilies.size <= 1) dimensions.push('skinToneFamily');
    return {
      flagged: true,
      advisory:
        'Ensemble reads visually homogeneous — consider varying age, presentation, or cultural casting tags for narrative realism.',
      dimensions,
    };
  }
  return { flagged: false, advisory: null, dimensions: [] };
}

function matchScore(actor: StudioWorldActor, req: CastingRequirement): number {
  let score = 0;
  if (req.suggestedPresentation && actor.presentation === req.suggestedPresentation) score += 2;
  if (req.suggestedRoleArchetypes?.some((r) => actor.roleArchetypes.includes(r))) score += 2;
  if (req.screenImportance === 'HERO' && actor.cinematicPresence.some((p) => p.toLowerCase().includes('lead'))) {
    score += 1;
  }
  if (req.era.includes('2016') && actor.periodAdaptability.includes('2016')) score += 1;
  if (req.performanceEnergy.toLowerCase().includes('expressive') && actor.performanceProfile.includes('EXPRESSIVE')) {
    score += 1;
  }
  if (req.narrativeRole.toUpperCase().includes('ARCHIVIST') && actor.roleArchetypes.includes('ARCHIVIST')) {
    score += 3;
  }
  if (req.narrativeRole.toUpperCase().includes('COMMENTER') && actor.roleArchetypes.includes('COMMENTER')) {
    score += 2;
  }
  if (req.narrativeRole.toUpperCase().includes('SUBJECT') && actor.roleArchetypes.includes('SUBJECT')) {
    score += 3;
  }
  return score;
}

function buildRationale(actor: StudioWorldActor, req: CastingRequirement, score: number): string {
  const perf = actor.performanceProfile.slice(0, 3).join(', ');
  const roles = actor.roleArchetypes.slice(0, 3).join(', ');
  return `${actor.catalogueNumber} ${actor.stageName} for ${req.narrativeRole}: role fit (${roles}); performance (${perf}); match strength ${score}.`;
}

function repetitionRiskForActor(
  actor: StudioWorldActor,
  input: RecommendActorsInput,
): CastingRecommendation['repetitionRisk'] {
  const recent = input.previousActorUsage.filter((u) => u.actorId === actor.actorId);
  const brandRecent = recent.filter((u) => u.entryId.startsWith(input.project));
  if (actor.availabilityState === 'RESTING_RECENTLY_USED' || brandRecent.length >= 2) return 'ELEVATED';
  if (recent.length >= 1) return 'ADVISORY';
  return 'NONE';
}

function recentUsageNote(
  actor: StudioWorldActor,
  usage: readonly { actorId: string; entryId: string; recordedAt: string }[],
): string | null {
  const mine = usage.filter((u) => u.actorId === actor.actorId);
  if (mine.length === 0) return null;
  return `Last seen ${mine[mine.length - 1].entryId} (${mine[mine.length - 1].recordedAt})`;
}
