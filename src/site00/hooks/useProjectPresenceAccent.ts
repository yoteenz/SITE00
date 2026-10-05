import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { lookupProjectBrandPresence } from '../../../shared/site00-brand-lore/projectPresence/index.js';
import {
  extractProjectSlugFromPathname,
  resolveProjectPresenceAccent,
  projectPresenceCssVars,
  type ProjectPresenceAccent,
} from '../../../shared/site00-studio-world-production/projectPresenceAccent/index.js';

export function useActiveProjectSlug(): string | null {
  const { pathname } = useLocation();
  return useMemo(() => extractProjectSlugFromPathname(pathname), [pathname]);
}

export function useProjectPresenceAccent(options?: {
  projectSlug?: string | null;
  resolving?: boolean;
}): ProjectPresenceAccent {
  const routeSlug = useActiveProjectSlug();
  const projectId = options?.projectSlug !== undefined ? options.projectSlug : routeSlug;

  return useMemo(() => {
    const entry = lookupProjectBrandPresence(projectId);
    return resolveProjectPresenceAccent({
      projectId,
      registryEntry: entry,
      resolving: options?.resolving,
    });
  }, [projectId, options?.resolving]);
}

export function useProjectPresenceCssVars(options?: {
  projectSlug?: string | null;
  resolving?: boolean;
}): Record<string, string> {
  const accent = useProjectPresenceAccent(options);
  return useMemo(() => projectPresenceCssVars(accent), [accent]);
}
