import type { DesignScreenDefinition, SharedComponentImpactReport } from './types.js';

const SHARED_COMPONENT_USAGE: Record<string, string[]> = {
  'src/site00/components/founderWorkspace/MobileFounderWorkspaceChrome.tsx': [
    '/projects/ndxbook',
    '/projects/ndxbook/content-operations',
    '/projects/ndxbook/content-operations/campaign-board',
  ],
  'src/site00/components/founderWorkspace/FounderWorkspaceHeaderChrome.tsx': [
    '/projects/ndxbook',
  ],
  'src/site00/icons/ndx/NDXIcon.tsx': ['*'],
};

export function detectSharedComponentImpact(
  screen: DesignScreenDefinition,
  route: string,
): SharedComponentImpactReport[] {
  const reports: SharedComponentImpactReport[] = [];
  for (const componentPath of screen.sharedComponentPaths ?? []) {
    const affected = SHARED_COMPONENT_USAGE[componentPath] ?? [];
    const globalImpact = affected.includes('*') || affected.length > 1;
    if (!globalImpact) continue;
    reports.push({
      componentPath,
      affectedRoutes: affected.filter((r) => r !== '*'),
      recommendation: affected.includes('*') ? 'SCOPED_VARIANT' : 'PATCH_GLOBALLY',
      message: `Shared component ${componentPath} affects multiple routes.`,
    });
  }
  if (reports.length === 0) return [];
  const hitsRoute = reports.some((r) => r.affectedRoutes.includes(route) || r.affectedRoutes.length === 0);
  return hitsRoute ? reports : [];
}

export function sharedImpactRequiresFounderDecision(reports: SharedComponentImpactReport[]): boolean {
  return reports.some((r) => r.recommendation === 'SCOPED_VARIANT' || r.recommendation === 'BLOCK');
}
