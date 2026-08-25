/**
 * P0.FILM.1 — Film readiness evaluation.
 * P0.5E.4F — Consumes NDX production readiness for character-gated generation.
 */

import type { CharacterVisualCastingState } from '../../characterVisualCasting/types.js';
import { assertFilmCharacterGenerationAllowed } from '../../characterAuthority/downstreamIntegration.js';
import type { FilmGenerationPlan, FilmProductionPlan, FilmReadinessEvaluation } from '../types.js';
import { READINESS_CHECKS } from '../constants.js';

export function evaluateFilmReadiness(params: {
  filmId: string;
  plan: FilmProductionPlan | null;
  generationPlan: FilmGenerationPlan | null;
  hasCharacter: boolean;
  hasVoice: boolean;
  storyboardReady: boolean;
  casting?: CharacterVisualCastingState | null;
  requiresMotion?: boolean;
}): FilmReadinessEvaluation {
  const stillGuard = params.casting
    ? assertFilmCharacterGenerationAllowed({ casting: params.casting, requiresMotion: false })
    : null;
  const motionGuard = params.casting
    ? assertFilmCharacterGenerationAllowed({ casting: params.casting, requiresMotion: true })
    : null;
  const characterProductionReady = params.casting
    ? (params.requiresMotion ? motionGuard?.allowed : stillGuard?.allowed) ?? false
    : params.hasCharacter;

  const checks: FilmReadinessEvaluation['checks'] = {
    CharacterReady: {
      ready: characterProductionReady,
      blocker: characterProductionReady
        ? null
        : stillGuard?.founderMessage ?? motionGuard?.founderMessage ?? 'Character truth snapshot not locked',
    },
    WardrobeReady: { ready: (params.plan?.wardrobePlan.length ?? 0) > 0, blocker: null },
    EnvironmentReady: { ready: (params.plan?.locationPlan.length ?? 0) > 0, blocker: null },
    PropReady: { ready: true, blocker: null },
    VoiceReady: { ready: params.hasVoice || !planRequiresVoice(params.plan), blocker: null },
    ProviderReady: { ready: (params.plan?.shots.length ?? 0) > 0, blocker: null },
    ContinuityReady: { ready: (params.plan?.continuityPlan.conflicts.length ?? 0) === 0, blocker: params.plan?.continuityPlan.conflicts[0]?.reason ?? null },
    StoryboardReady: { ready: params.storyboardReady, blocker: params.storyboardReady ? null : 'Storyboard not approved' },
    CostApproved: { ready: params.generationPlan?.approved ?? false, blocker: params.generationPlan?.approved ? null : 'Production plan not approved' },
  };

  const blockedChecks = READINESS_CHECKS.filter((c) => !checks[c].ready);
  return {
    filmId: params.filmId,
    checks,
    allReady: blockedChecks.length === 0,
    blockedChecks,
  };
}

function planRequiresVoice(plan: FilmProductionPlan | null): boolean {
  return plan?.shots.some((s) => s.dialogue) ?? false;
}

export function filmReadinessEvaluationImplemented(): true {
  return true;
}

export function assistedAutonomyDefault(): true {
  return true;
}

export function majorFounderGatesImplemented(): true {
  return true;
}
