/**
 * P0.VR.UPGRADE.2 — Live code = function authority snapshot for twin builds.
 */

import type { PageFunctionContract } from './types.js';

export function buildPageFunctionContract(input: {
  route: string;
  isRootPage?: boolean;
  pagePurpose?: string;
}): PageFunctionContract {
  const rootExtras = input.isRootPage
    ? ['Root navigation', 'Project switching', 'Founder/client mode', 'Project status', 'Entry links']
    : [];
  return {
    route: input.route,
    auth: ['Session required', 'Founder or client role'],
    permissions: ['Route-scoped project access'],
    dataQueries: ['Project operating state', 'Overview signals', 'Module visibility'],
    mutations: input.isRootPage ? ['Mode toggle (non-destructive in twin)'] : ['Form submit (sandboxed in twin)'],
    forms: ['Existing page forms preserved'],
    links: ['Internal navigation', 'Module links', 'Campaign links'],
    navigation: ['Bottom nav', 'Module subnav', ...rootExtras],
    state: ['View mode', 'Active module', 'Project context'],
    featureFlags: ['Twin preview gate'],
    actions: ['Primary CTAs', 'Secondary actions'],
    businessRules: [
      'Routing resolves to canonical module path',
      'Data loads from live project APIs',
      'No destructive writes in READ_ONLY twin mode',
    ],
  };
}

export function functionContractPreserved(
  contract: PageFunctionContract,
  checks: Partial<Record<keyof PageFunctionContract, boolean>>,
): boolean {
  const required: (keyof PageFunctionContract)[] = ['route', 'auth', 'permissions', 'dataQueries', 'navigation'];
  return required.every((k) => checks[k] !== false && contract[k].length > 0);
}
