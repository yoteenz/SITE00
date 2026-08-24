/**
 * Resolve active project presence accent from canonical brand state.
 */

import { SITE00_HOST_ACCENT } from './constants.js';
import { validateProjectPresenceColor } from './ProjectPresenceColorValidation.js';
import type {
  ProjectBrandPresenceEntry,
  ProjectPresenceAccent,
  ProjectPresenceAccentSource,
  ProjectPresenceAccentStatus,
} from './types.js';

export type ResolveProjectPresenceInput = {
  projectId: string | null | undefined;
  projectName?: string | null;
  registryEntry?: ProjectBrandPresenceEntry | null;
  resolving?: boolean;
  previousProjectId?: string | null;
};

function pickColor(entry: ProjectBrandPresenceEntry | null | undefined): {
  color: string | null;
  source: ProjectPresenceAccentSource;
  isCanonical: boolean;
} {
  if (!entry || entry.brandPrimaryStatus === 'UNRESOLVED') {
    return { color: null, source: 'HOST_FALLBACK', isCanonical: false };
  }
  if (entry.canonicalPrimary) {
    return { color: entry.canonicalPrimary, source: 'CANONICAL_PRIMARY', isCanonical: true };
  }
  if (entry.approvedPrimary) {
    return { color: entry.approvedPrimary, source: 'APPROVED_PRIMARY', isCanonical: false };
  }
  if (entry.approvedAccent) {
    return { color: entry.approvedAccent, source: 'APPROVED_ACCENT', isCanonical: false };
  }
  return { color: null, source: 'HOST_FALLBACK', isCanonical: false };
}

export function resolveProjectPresenceAccent(input: ResolveProjectPresenceInput): ProjectPresenceAccent {
  if (input.resolving) {
    return {
      projectId: input.projectId ?? null,
      projectName: input.projectName ?? null,
      resolvedColor: SITE00_HOST_ACCENT,
      source: 'HOST_FALLBACK',
      status: 'RESOLVING',
      isCanonical: false,
      fallbackUsed: true,
    };
  }

  if (!input.projectId) {
    return {
      projectId: null,
      projectName: null,
      resolvedColor: SITE00_HOST_ACCENT,
      source: 'HOST_FALLBACK',
      status: 'UNRESOLVED',
      isCanonical: false,
      fallbackUsed: true,
    };
  }

  const entry = input.registryEntry;
  const picked = pickColor(entry);
  let status: ProjectPresenceAccentStatus = picked.color ? 'RESOLVED' : 'UNRESOLVED';
  let source = picked.source;
  let fallbackUsed = !picked.color;

  const validation = validateProjectPresenceColor(picked.color);
  if (!validation.valid) {
    status = 'UNRESOLVED';
    source = 'HOST_FALLBACK';
    fallbackUsed = true;
  }

  let resolvedColor = validation.valid && validation.normalized ? validation.normalized : SITE00_HOST_ACCENT;

  if (!validation.valid) {
    resolvedColor = SITE00_HOST_ACCENT;
    fallbackUsed = true;
    source = 'HOST_FALLBACK';
    status = 'UNRESOLVED';
  }

  return {
    projectId: input.projectId,
    projectName: entry?.projectName ?? input.projectName ?? input.projectId,
    resolvedColor,
    source,
    status,
    isCanonical: picked.isCanonical && !fallbackUsed,
    fallbackUsed,
  };
}

export function extractProjectSlugFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match?.[1] ?? null;
}

export function projectPresenceCssVars(accent: ProjectPresenceAccent): Record<string, string> {
  if (!accent.projectId || accent.fallbackUsed) {
    return {
      '--site00-host-accent': SITE00_HOST_ACCENT,
      '--site00-project-presence-accent': SITE00_HOST_ACCENT,
    };
  }
  return {
    '--site00-host-accent': SITE00_HOST_ACCENT,
    '--site00-project-presence-accent': accent.resolvedColor,
  };
}
