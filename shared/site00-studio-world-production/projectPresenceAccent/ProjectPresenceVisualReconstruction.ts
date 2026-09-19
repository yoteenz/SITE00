/**
 * Visual reconstruction awareness — project-presence diamond is not host mutation.
 */

import type { ProjectPresenceAccent, ProjectPresenceDiamondEvaluation, VisualAuthorityClass } from './types.js';
import { SITE00_HOST_ACCENT } from './constants.js';

function normalizeHex(hex: string): string {
  return hex.trim().toLowerCase();
}

export function evaluateProjectPresenceDiamond(params: {
  diamondColor: string;
  presence: ProjectPresenceAccent;
  inProjectContext: boolean;
}): ProjectPresenceDiamondEvaluation {
  const failures: string[] = [];
  let classification: VisualAuthorityClass = 'HOST_CANONICAL';

  if (params.inProjectContext && params.presence.projectId && !params.presence.fallbackUsed) {
    classification = 'PROJECT_PRESENCE';
    const matches =
      normalizeHex(params.diamondColor) === normalizeHex(params.presence.resolvedColor);
    if (!matches) {
      failures.push('FAIL_PROJECT_PRESENCE_DIAMOND_MISMATCH');
    }
    return {
      valid: failures.length === 0,
      classification,
      failures,
      matchesResolvedAccent: matches,
    };
  }

  classification = 'HOST_CANONICAL';
  const hostMatch = normalizeHex(params.diamondColor) === normalizeHex(SITE00_HOST_ACCENT);
  if (!hostMatch && !params.inProjectContext) {
    failures.push('FAIL_HOST_DIAMOND_DRIFT');
  }

  return {
    valid: failures.length === 0,
    classification,
    failures,
    matchesResolvedAccent: hostMatch,
  };
}

export function adaptiveDiamondIsNotHostMutation(params: {
  diamondEvaluation: ProjectPresenceDiamondEvaluation;
  hostClientFailures: string[];
}): { passed: boolean; filteredFailures: string[] } {
  if (params.diamondEvaluation.classification === 'PROJECT_PRESENCE') {
    const filtered = params.hostClientFailures.filter(
      (f) => f !== 'FAIL_CLIENT_ACCENT_MUTATES_HOST' && f !== 'FAIL_HOST_ACCENT_LEAKAGE',
    );
    return { passed: filtered.length === 0, filteredFailures: filtered };
  }
  return { passed: params.hostClientFailures.length === 0, filteredFailures: params.hostClientFailures };
}
