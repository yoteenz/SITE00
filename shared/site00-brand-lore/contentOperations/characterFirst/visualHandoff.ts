/**
 * P0.5E.7 — Book-native visual handoff (P0.5C.7 authority).
 */

import type { BookNativeVisualHandoff, NDXContentSeed, PageNarrativeRole } from './types.js';
import { CREDIT_UTILIZATION_PAGE_ROLES } from './ndxContentSeed.js';

export function buildBookNativeVisualHandoff(seed: NDXContentSeed): BookNativeVisualHandoff {
  const pageRoles = seed.isGoldenPilot
    ? CREDIT_UTILIZATION_PAGE_ROLES.map((slide) => ({
        slideNumber: slide.slideNumber,
        role: slide.role,
        thoughtBeat: slide.copy.split('\n')[0] ?? slide.role,
      }))
    : defaultPageRolesForSeed(seed);

  return {
    pageRoles,
    evidenceRole: seed.evidenceFound.length ? 'VERIFIED_EVIDENCE' : 'EVIDENCE_NEEDED',
    photoNeed: seed.candidateSurface === 'PAGE' || seed.bookTrace === 'NEW_PAGE',
    bookArtifactNeed: seed.bookTrace.replace(/_/g, ' '),
    annotationOpportunity: seed.firstReaction,
    sourceMaterial: seed.premise.internalTopic,
    constructionIntent: 'BOOK_NATIVE_PAGE_NOT_GENERIC_EDUCATION',
    grammarAuthority: 'V2.3+P0.5C.7',
  };
}

function defaultPageRolesForSeed(seed: NDXContentSeed): BookNativeVisualHandoff['pageRoles'] {
  const roles: PageNarrativeRole[] = [
    'HOOK',
    'INITIAL_ASSUMPTION',
    'EVIDENCE',
    'WHAT_I_THINK_NOW',
    'BOOKMARK_CLOSING_TRACE',
  ];
  return roles.map((role, index) => ({
    slideNumber: index + 1,
    role,
    thoughtBeat:
      role === 'HOOK'
        ? seed.premise.spokenPremise
        : role === 'INITIAL_ASSUMPTION'
          ? seed.initialBelief
          : role === 'WHAT_I_THINK_NOW'
            ? seed.currentView
            : role,
  }));
}
