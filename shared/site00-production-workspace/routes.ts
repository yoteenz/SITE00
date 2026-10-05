import type { ProductionWorkspaceType } from './types.js';

export const PRODUCTION_WORKSPACE_ROOT = '/production' as const;

export function productionWorkspaceHubPath(): string {
  return PRODUCTION_WORKSPACE_ROOT;
}

export function productionProjectHubPath(projectSlug: string): string {
  return `${PRODUCTION_WORKSPACE_ROOT}/${projectSlug.toLowerCase()}`;
}

export function productionDesignPath(projectSlug: string, suffix = ''): string {
  const base = `${productionProjectHubPath(projectSlug)}/design`;
  return suffix ? `${base}/${suffix.replace(/^\//, '')}` : base;
}

export function productionExperiencePath(projectSlug: string, suffix = ''): string {
  const base = `${productionProjectHubPath(projectSlug)}/experience`;
  return suffix ? `${base}/${suffix.replace(/^\//, '')}` : base;
}

export function productionExpressionPath(projectSlug: string, suffix = ''): string {
  const base = `${productionProjectHubPath(projectSlug)}/expression`;
  return suffix ? `${base}/${suffix.replace(/^\//, '')}` : base;
}

export function productionWorkspacePath(
  projectSlug: string,
  workspace: ProductionWorkspaceType,
  suffix = '',
): string {
  switch (workspace) {
    case 'DESIGN':
      return productionDesignPath(projectSlug, suffix);
    case 'EXPERIENCE':
      return productionExperiencePath(projectSlug, suffix);
    case 'EXPRESSION':
      return productionExpressionPath(projectSlug, suffix);
    default:
      return productionProjectHubPath(projectSlug);
  }
}

export function productionAdminDeepLink(args: {
  projectSlug: string;
  workspace: ProductionWorkspaceType;
  subWorkspace?: string;
  campaignId?: string;
  entryId?: string;
}): string {
  const params = new URLSearchParams();
  if (args.campaignId) params.set('campaign', args.campaignId);
  if (args.entryId) params.set('entry', args.entryId);
  const qs = params.toString();
  const path = productionWorkspacePath(args.projectSlug, args.workspace, args.subWorkspace ?? '');
  return qs ? `${path}?${qs}` : path;
}

/** Legacy `/projects/design/:slug` → production design mount. */
export function legacyProjectsDesignRedirectTarget(projectSlug: string, restPath = '', search = ''): string {
  const base = productionDesignPath(projectSlug, restPath);
  return search ? `${base}${search.startsWith('?') ? search : `?${search}`}` : base;
}
