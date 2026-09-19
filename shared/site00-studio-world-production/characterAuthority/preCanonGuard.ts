/**
 * P0.5E.4F — Pre-canon character generation guard.
 */

import {
  CHARACTER_BLOCKER_HEADLINE,
  CHARACTER_BLOCKER_MESSAGE,
  CHARACTER_BLOCKER_SUBHEAD,
  CHARACTER_PLACEHOLDER_LABEL,
} from './constants.js';
import { evaluateNDXProductionReadiness, evaluateNDXVisualIdentityReadiness } from './readiness.js';
import type { CharacterVisualCastingState } from '../characterVisualCasting/types.js';
import type { CharacterAuthoritySurface, PreCanonGuardResult, ReferenceOnlySurface } from './types.js';

const REFERENCE_ONLY_SET = new Set<string>([
  'SCRIPT',
  'CAPTION',
  'STORYBOARD_STRUCTURE',
  'SHOT_LIST',
  'PAGE_COPY',
  'CONTENT_SEED',
  'PAGE_ROLE',
  'SEQUENCE_PLAN',
  'CAMPAIGN_SCHEDULE',
  'PLACEHOLDER_LAYOUT',
  'VISUAL_REFERENCE_DISCUSSION',
]);

export function isReferenceOnlySurface(surface: string): surface is ReferenceOnlySurface {
  return REFERENCE_ONLY_SET.has(surface);
}

export function evaluatePreCanonCharacterGenerationGuard(params: {
  casting: CharacterVisualCastingState | null | undefined;
  surface: CharacterAuthoritySurface | ReferenceOnlySurface;
  requiresCharacterPhotography: boolean;
  allowReferenceOnly?: boolean;
  allowPlaceholder?: boolean;
}): PreCanonGuardResult {
  if (!params.requiresCharacterPhotography) {
    return {
      allowed: true,
      mode: 'REFERENCE_ONLY',
      failureCode: null,
      founderMessage: null,
      founderHeadline: null,
      founderSubhead: null,
      allowedActions: ['CONTINUE_WITHOUT_CHARACTER'],
    };
  }

  if (isReferenceOnlySurface(params.surface)) {
    return {
      allowed: true,
      mode: 'REFERENCE_ONLY',
      failureCode: null,
      founderMessage: null,
      founderHeadline: null,
      founderSubhead: null,
      allowedActions: ['CONTINUE_WITHOUT_CHARACTER', 'USE_REFERENCE_ONLY_PLACEHOLDER'],
    };
  }

  const visual = evaluateNDXVisualIdentityReadiness(params.casting);
  if (visual.ready) {
    return {
      allowed: true,
      mode: 'PRODUCTION',
      failureCode: null,
      founderMessage: null,
      founderHeadline: null,
      founderSubhead: null,
      allowedActions: [],
    };
  }

  if (params.allowReferenceOnly) {
    return {
      allowed: true,
      mode: 'REFERENCE_ONLY',
      failureCode: null,
      founderMessage: null,
      founderHeadline: null,
      founderSubhead: null,
      allowedActions: ['FINISH_CHARACTER', 'CONTINUE_WITHOUT_CHARACTER', 'USE_REFERENCE_ONLY_PLACEHOLDER'],
    };
  }

  if (params.allowPlaceholder) {
    return {
      allowed: true,
      mode: 'CHARACTER_PLACEHOLDER',
      failureCode: null,
      founderMessage: CHARACTER_PLACEHOLDER_LABEL,
      founderHeadline: CHARACTER_BLOCKER_HEADLINE,
      founderSubhead: CHARACTER_BLOCKER_SUBHEAD,
      allowedActions: ['FINISH_CHARACTER', 'CONTINUE_WITHOUT_CHARACTER', 'USE_REFERENCE_ONLY_PLACEHOLDER'],
    };
  }

  return {
    allowed: false,
    mode: 'BLOCKED',
    failureCode: 'FAIL_CHARACTER_VISUAL_IDENTITY_NOT_READY',
    founderMessage: CHARACTER_BLOCKER_MESSAGE,
    founderHeadline: CHARACTER_BLOCKER_HEADLINE,
    founderSubhead: CHARACTER_BLOCKER_SUBHEAD,
    allowedActions: ['FINISH_CHARACTER', 'CONTINUE_WITHOUT_CHARACTER', 'USE_REFERENCE_ONLY_PLACEHOLDER'],
  };
}

export function evaluateProductionCharacterGenerationGuard(params: {
  casting: CharacterVisualCastingState | null | undefined;
  requiresMotion?: boolean;
}): PreCanonGuardResult {
  const production = evaluateNDXProductionReadiness({ casting: params.casting });
  const ready = params.requiresMotion ? production.readyForMotionProduction : production.readyForStillProduction;

  if (ready) {
    return {
      allowed: true,
      mode: 'PRODUCTION',
      failureCode: null,
      founderMessage: null,
      founderHeadline: null,
      founderSubhead: null,
      allowedActions: [],
    };
  }

  const failureCode = params.requiresMotion
    ? 'FAIL_CHARACTER_PRODUCTION_NOT_READY'
    : production.blockers.includes('STILL_CONTINUITY_NOT_PASS')
      ? 'FAIL_CHARACTER_PRODUCTION_NOT_READY'
      : 'FAIL_CHARACTER_VISUAL_IDENTITY_NOT_READY';

  return {
    allowed: false,
    mode: 'BLOCKED',
    failureCode,
    founderMessage: CHARACTER_BLOCKER_MESSAGE,
    founderHeadline: CHARACTER_BLOCKER_HEADLINE,
    founderSubhead: CHARACTER_BLOCKER_SUBHEAD,
    allowedActions: ['FINISH_CHARACTER'],
  };
}

export function characterPlaceholderModeLabel(): string {
  return CHARACTER_PLACEHOLDER_LABEL;
}

export function placeholderCanEnterCharacterCanon(): false {
  return false;
}
