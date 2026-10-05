/**
 * Host-side project profile (P0.JURNL.SITE00-INGEST-F01): what SITE 00 chrome needs to show and switch projects.
 * Reads the managed registry (+ ingested records). Never imports a project's runtime or styles.
 */

import { hubAssetUrl } from '../../../shared/site00-production-hub/assets.js';
import { getSite00ManagedProject, listDesignEnabledManagedProjects } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import { getIngestedProject } from '../../projects/registry';
import { hasProjectRuntime } from './projectRuntimeRegistry';

export type HostProjectOption = {
  slug: string;
  name: string;
  /** PERSONAL / CLIENT / MANAGED BRAND / INFRASTRUCTURE — host label. */
  kind: string;
  cover: string | null;
  runtime: boolean;
};

export function projectCoverUrl(slug: string): string | null {
  return hubAssetUrl(`project.${slug}.cover`) ?? getIngestedProject(slug)?.brand.coverFile ?? null;
}

function kindLabel(slug: string): string {
  const ingested = getIngestedProject(slug);
  if (ingested) return `${ingested.projectType} / ${ingested.ownership}`;
  const m = getSite00ManagedProject(slug);
  if (!m) return 'PROJECT';
  if (m.relationship) return m.relationship.replace(/_/g, ' ');
  return m.platformRole === 'INFRASTRUCTURE' ? 'INFRASTRUCTURE' : 'MANAGED BRAND';
}

/** Production project switcher list: every design-enabled managed project except the host itself. */
export function listHostProductionProjects(): HostProjectOption[] {
  return listDesignEnabledManagedProjects()
    .filter((p) => p.projectId !== 'site00')
    .map((p) => ({ slug: p.projectId, name: p.displayName, kind: kindLabel(p.projectId), cover: projectCoverUrl(p.projectId), runtime: hasProjectRuntime(p.projectId) }));
}

export function hostProjectName(slug: string): string {
  return getSite00ManagedProject(slug)?.displayName ?? slug.replace(/-/g, ' ').toUpperCase();
}

/**
 * Where a project switch lands: same workspace (+ design mode) under the new project. Query state that belongs
 * to the previous project (screen / state / inspect / entry / campaign) is dropped so nothing stale carries over.
 */
export function projectSwitchPath(pathname: string, search: string, toSlug: string): string {
  const m = /^\/production\/([^/]+)\/(design|experience|expression)(?:\/|$)/.exec(pathname);
  const workspace = m?.[2] ?? 'design';
  const params = new URLSearchParams(search);
  const keep = new URLSearchParams();
  const mode = params.get('mode');
  if (workspace === 'design' && mode) keep.set('mode', mode);
  const qs = keep.toString();
  return `/production/${toSlug}/${workspace}${qs ? `?${qs}` : ''}`;
}
