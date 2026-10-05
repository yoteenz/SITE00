/**
 * NavigationChainQA — verify parent → child → grandchild chains.
 */

import type { LinkageFailureCode, NavigationChainQAResult, ParentChildLinkageContract } from './types.js';

export function verifyNavigationChain(input: {
  chainId: string;
  contracts: ParentChildLinkageContract[];
  clickThrough?: Record<string, { loads: boolean; renders: boolean; backWorks: boolean }>;
}): NavigationChainQAResult {
  const hops = input.contracts.map((c) => c.targetChildRoute);
  const failures: LinkageFailureCode[] = [];

  const first = input.contracts[0];
  if (!first) {
    return {
      chainId: input.chainId,
      hops: [],
      sourceElementExists: false,
      sourceInteractionActive: false,
      targetResolves: false,
      targetLoads: false,
      expectedSurfaceRenders: false,
      backPathWorks: false,
      statePreserved: true,
      passed: false,
      failureCodes: ['DEAD_PARENT_ACTION'],
    };
  }

  const sourceElementExists = Boolean(first.sourceElementId);
  const sourceInteractionActive = first.status !== 'BROKEN' && !first.errors.includes('HANDLER_MISSING');
  const targetResolves = input.contracts.every((c) => c.status === 'WIRED' || c.status === 'PARTIAL' || c.status === 'PERMISSION_GATED');

  if (!sourceElementExists) failures.push('DEAD_PARENT_ACTION');
  if (!sourceInteractionActive) failures.push('DEAD_PARENT_ACTION');
  if (!targetResolves) failures.push('TARGET_MISSING');

  const last = input.contracts[input.contracts.length - 1];
  const click = input.clickThrough?.[last?.sourceElementId ?? ''];
  const targetLoads = click ? click.loads : targetResolves;
  const expectedSurfaceRenders = click ? click.renders : targetResolves;
  const backPathWorks = last?.backTarget ? (click ? click.backWorks : Boolean(last.backTarget)) : false;

  if (!backPathWorks) failures.push('CHILD_RETURN_PATH_MISSING');
  if (input.contracts.some((c) => c.errors.includes('CHILD_RETURN_PATH_MISSING'))) {
    failures.push('CHILD_RETURN_PATH_MISSING');
  }

  return {
    chainId: input.chainId,
    hops,
    sourceElementExists,
    sourceInteractionActive,
    targetResolves,
    targetLoads,
    expectedSurfaceRenders,
    backPathWorks,
    statePreserved: Boolean(first.navigationOrigin.preserveState?.length),
    passed: failures.length === 0 && targetLoads && expectedSurfaceRenders && backPathWorks,
    failureCodes: [...new Set(failures)],
  };
}

export function buildGrandchildChains(contracts: ParentChildLinkageContract[]): ParentChildLinkageContract[][] {
  const byParentRoute = new Map<string, ParentChildLinkageContract[]>();
  for (const c of contracts) {
    const list = byParentRoute.get(c.sourceParentRoute) ?? [];
    list.push(c);
    byParentRoute.set(c.sourceParentRoute, list);
  }

  const chains: ParentChildLinkageContract[][] = [];
  const directChildren = contracts.filter((c) => c.expectedRelationship === 'DIRECT_CHILD' || c.expectedRelationship === 'TAB_CHILD');

  for (const child of directChildren) {
    const grandchildren = contracts.filter(
      (c) =>
        c.expectedRelationship === 'GRANDCHILD' ||
        (c.expectedRelationship === 'WORKFLOW_CHILD' &&
          normalizeParent(c.sourceParentRoute) === normalizeParent(child.targetChildRoute)),
    );
    if (grandchildren.length) {
      chains.push([child, ...grandchildren]);
    } else {
      chains.push([child]);
    }
  }

  return chains;
}

function normalizeParent(route: string): string {
  return route.split('?')[0].replace(/\/$/, '');
}
