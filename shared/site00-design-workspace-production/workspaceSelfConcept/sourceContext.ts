/**
 * Source project/page for WORKSPACE_SELF captures (configurable, not hardcoded in UI).
 */

export type WorkspaceSelfSourceContext = {
  projectSlug: string;
  pageScreenId: string;
  pageId: string;
};

export const DEFAULT_WORKSPACE_SELF_SOURCE: WorkspaceSelfSourceContext = {
  projectSlug: 'ndxbook',
  pageScreenId: 'overview',
  pageId: 'ndxbook:overview',
};

/** Canonical live DESIGN module route (projects-first binding). */
export function resolveWorkspaceSelfDesignRoute(ctx: WorkspaceSelfSourceContext): string {
  return `/projects/design/${ctx.projectSlug.toLowerCase()}`;
}

export function resolveWorkspaceSelfCaptureUrl(
  ctx: WorkspaceSelfSourceContext,
  baseUrl: string,
  engineeringBypass: boolean,
): string {
  const path = resolveWorkspaceSelfDesignRoute(ctx);
  const url = new URL(path, baseUrl.replace(/\/$/, '') + '/');
  if (engineeringBypass) {
    url.searchParams.set('goldenDiffCapture', '1');
  }
  return url.toString();
}
