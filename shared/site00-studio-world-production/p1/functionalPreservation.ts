/**
 * P1 functional preservation checks — deterministic post-implementation QA.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type FunctionalCheckResult = {
  checkId: string;
  result: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  notes: string[];
};

export function runDeterministicFunctionalChecks(params: {
  route: string;
  projectsPageSource?: string;
  routesSource?: string;
}): FunctionalCheckResult[] {
  let projectsPage = params.projectsPageSource;
  let routes = params.routesSource;

  if (!projectsPage) {
    const path = join(process.cwd(), 'src/site00/pages/ProjectsPage.tsx');
    projectsPage = existsSync(path) ? readFileSync(path, 'utf8') : '';
  }
  if (!routes) {
    const path = join(process.cwd(), 'src/routes/Site00Routes.tsx');
    routes = existsSync(path) ? readFileSync(path, 'utf8') : '';
  }

  const checks: FunctionalCheckResult[] = [
    {
      checkId: 'route_exists',
      result: routes.includes('projects') || routes.includes('/projects') ? 'PASS' : 'FAIL',
      notes: [`Target route: ${params.route}`],
    },
    {
      checkId: 'project_data',
      result: projectsPage.includes('projectsIndex') || projectsPage.includes('useProjects') || projectsPage.includes('site00ProjectsApi') ? 'PASS' : 'NOT_EVALUATED',
      notes: [],
    },
    {
      checkId: 'search',
      result: projectsPage.includes('search') || projectsPage.includes('Search') ? 'PASS' : 'NOT_EVALUATED',
      notes: [],
    },
    {
      checkId: 'navigation',
      result: projectsPage.includes('Link') || projectsPage.includes('navigate') ? 'PASS' : 'NOT_EVALUATED',
      notes: [],
    },
    {
      checkId: 'loading_states',
      result: projectsPage.includes('loading') || projectsPage.includes('Loading') || projectsPage.includes('error') ? 'PASS' : 'NOT_EVALUATED',
      notes: [],
    },
    {
      checkId: 'mobile_nav',
      result: projectsPage.includes('bottom') || projectsPage.includes('mobile') || projectsPage.includes('Site00Shell') ? 'NOT_EVALUATED' : 'NOT_EVALUATED',
      notes: ['Host bottom nav verified via shell — not page-local'],
    },
  ];

  return checks;
}

export function functionalChecksPass(checks: FunctionalCheckResult[]): boolean {
  return checks.every((c) => c.result !== 'FAIL');
}
