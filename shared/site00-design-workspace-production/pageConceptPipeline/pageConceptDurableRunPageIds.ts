/**
 * Extra Supabase `page_id` keys for durable run lookup (legacy overview-scoped writes).
 */

import { resolveDesignPageIdentity } from '../designPageIdentity.js';

/** Legacy keys like `ndxbook:overview:/projects/ndxbook` stored on durable runs. */
export function expandPageConceptDurableRunPageIdCandidates(input: {
  projectSlug: string;
  pageId: string;
  screenId?: string;
  route?: string | null;
}): readonly string[] {
  const identity = resolveDesignPageIdentity({
    projectSlug: input.projectSlug,
    pageId: input.pageId,
    screenId: input.screenId ?? '',
    route: input.route ?? null,
  });
  const slug = identity.projectSlug.trim().toLowerCase();
  const ids = new Set<string>();
  for (const id of [
    identity.registryPageId,
    identity.canonicalPageId,
    identity.screenId,
    `${slug}:${identity.registryPageId}`,
    `${slug}:${identity.canonicalPageId}`,
  ]) {
    if (id?.trim()) ids.add(id.trim());
  }
  const route = (identity.route || identity.canonicalRoute || '').trim();
  if (route) {
    const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
    ids.add(`${slug}:overview:${normalizedRoute}`);
    ids.add(`${slug}:overview:${normalizedRoute.replace(/\/+$/, '')}`);
  }
  return [...ids];
}
