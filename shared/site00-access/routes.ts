/** Canonical client vs admin route helpers — single source for project surfaces */

export function site00ProjectDetailRoute(slug: string): string {
  return `/projects/${slug}`;
}

export function site00ProjectOriginRoute(slug: string): string {
  return `/projects/${slug}/origin`;
}

export function site00ProjectIdentityRoute(slug: string): string {
  return `/projects/${slug}/identity`;
}

export function site00ProjectEvolveRoute(slug: string): string {
  return `/projects/${slug}/evolve`;
}

export function site00ProjectCreativeDirectionRoute(slug: string): string {
  return `/projects/${slug}/creative-direction`;
}

export function site00ProjectConnectionsRoute(slug: string): string {
  return `/projects/${slug}/connections`;
}

/** Public EVOLVE commercial catalog (plans, Foundation, project services, paid media) — same surface for all orgs. */
export function site00ProjectCommercialRoute(_slug?: string): string {
  return '/evolve/plans';
}

export function site00AdminDashboardRoute(): string {
  return '/admin/site00';
}

export function site00AdminOrchestrationRoute(slug: string): string {
  return `/admin/site00/orchestration/${slug}`;
}

export function site00AdminEvolveRoute(slug: string, section?: string): string {
  const base = `/admin/site00/orchestration/${slug}/evolve`;
  return section ? `${base}/${section}` : base;
}

export function inferExperienceContextFromPath(pathname: string): 'CLIENT' | 'ADMIN' {
  if (pathname.startsWith('/admin/site00')) return 'ADMIN';
  return 'CLIENT';
}

export function isClientProjectPath(pathname: string): boolean {
  return pathname.startsWith('/projects/') || pathname === '/projects' || pathname.startsWith('/control') || pathname.startsWith('/studio/');
}
