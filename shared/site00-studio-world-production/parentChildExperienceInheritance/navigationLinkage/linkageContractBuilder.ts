/**
 * Build ParentChildLinkageContract from resolved navigation intents.
 */

import type {
  DeclaredParentAction,
  LinkageRelationship,
  NavigationOrigin,
  ParentChildLinkageContract,
  RouteLinkageStatus,
} from './types.js';
import type { ResolvedNavigationIntent } from './parentNavigationIntentResolver.js';
import { normalizeRouteKey } from './routeManifestReconciliation.js';

const PCI_LINKAGE_VERSION = 'p0.pci.2';

export function buildLinkageContract(input: {
  projectId: string;
  parentRoute: string;
  parentSurfaceId: string;
  action: DeclaredParentAction;
  resolved: ResolvedNavigationIntent;
  existingRoutes: string[];
  existingSurfaces: string[];
  returnPattern: string;
}): ParentChildLinkageContract {
  const targetRoute = resolvedClaimedTarget(input.resolved, input.action);
  const targetSurfaceId = `surface-${normalizeRouteKey(targetRoute).replace(/[^a-z0-9-]/g, '-')}`;
  const relationship = input.action.relationship ?? inferRelationship(input.action);

  const navigationOrigin: NavigationOrigin = {
    parentRoute: input.parentRoute,
    parentSurfaceId: input.parentSurfaceId,
    originElementId: input.action.elementId,
    originElementLabel: input.action.label,
    originInteraction: input.action.sourceType ?? 'onClick',
    expectedReturnTarget: input.action.returnTarget ?? input.parentRoute,
    preserveState: input.action.preserveState ?? ['selectedProject', 'viewport', 'activeTab'],
  };

  const errors: string[] = [];
  let status = evaluateLinkageStatus({
    action: input.action,
    targetRoute,
    targetSurfaceId,
    existingRoutes: input.existingRoutes,
    existingSurfaces: input.existingSurfaces,
    resolved: input.resolved,
    errors,
  });

  return {
    linkageId: `link-${input.projectId}-${input.action.elementId}`,
    projectId: input.projectId,
    version: PCI_LINKAGE_VERSION,
    sourceParentRoute: input.parentRoute,
    sourceSurfaceId: input.parentSurfaceId,
    sourceElementId: input.action.elementId,
    sourceElementType: input.action.elementType,
    sourceLabel: input.action.label,
    sourceIntent: input.resolved.intent,
    expectedRelationship: relationship,
    targetChildRoute: targetRoute,
    targetSurfaceId,
    resolvedRuntimePath: targetRoute,
    resolvedNavigationAction: input.resolved.handlerRef ?? `${input.resolved.sourceType}→${targetRoute}`,
    navigationMode: input.resolved.navigationMode,
    backTarget: input.action.returnTarget ?? input.parentRoute,
    returnBehavior: input.returnPattern,
    navigationOrigin,
    status,
    errors,
    confidence: input.resolved.confidence,
  };
}

function resolvedClaimedTarget(resolved: ResolvedNavigationIntent, action: DeclaredParentAction): string {
  if (action.targetRoute) return action.targetRoute;
  return resolved.claimedTarget;
}

function inferRelationship(action: DeclaredParentAction): LinkageRelationship {
  if (action.relationship) return action.relationship;
  if (action.targetStep && action.targetStep.includes('/')) return 'GRANDCHILD';
  if (action.navigationMode === 'WORKFLOW_STEP') return 'WORKFLOW_CHILD';
  if (action.targetCategory) return 'TAB_CHILD';
  return 'DIRECT_CHILD';
}

function evaluateLinkageStatus(input: {
  action: DeclaredParentAction;
  targetRoute: string;
  targetSurfaceId: string;
  existingRoutes: string[];
  existingSurfaces: string[];
  resolved: ResolvedNavigationIntent;
  errors: string[];
}): RouteLinkageStatus {
  if (input.action.planned) {
    input.errors.push('PLANNED_DESTINATION');
    return 'PLANNED';
  }
  if (input.action.permissionGated) return 'PERMISSION_GATED';

  const routeKnown =
    input.existingRoutes.some((r) => routesMatch(r, input.targetRoute)) ||
    input.existingSurfaces.includes(input.targetSurfaceId);

  if (!input.resolved.handlerRef && !input.action.targetCategory && !input.action.targetStep) {
    input.errors.push('HANDLER_MISSING');
    return 'BROKEN';
  }

  if (!routeKnown && input.action.targetCategory) {
    input.errors.push('TARGET_SURFACE_NOT_REGISTERED');
    return 'UNIMPLEMENTED';
  }

  if (!routeKnown) {
    input.errors.push('TARGET_MISSING');
    return 'BROKEN';
  }

  if (!input.action.returnTarget && input.action.elementType !== 'TAB') {
    input.errors.push('CHILD_RETURN_PATH_MISSING');
    return 'PARTIAL';
  }

  return 'WIRED';
}

function routesMatch(a: string, b: string): boolean {
  return normalizeRouteKey(a) === normalizeRouteKey(b) || a.includes(b.split('?')[1] ?? '___') || b.includes(a.split('?')[1] ?? '___');
}

export function detectMiswiredAction(
  contract: ParentChildLinkageContract,
  expectedTargetByLabel: Record<string, string>,
): boolean {
  const expected = expectedTargetByLabel[contract.sourceLabel.toUpperCase()];
  if (!expected) return false;
  return !normalizeRouteKey(contract.targetChildRoute).includes(normalizeRouteKey(expected));
}

export function detectDeadParentAction(contract: ParentChildLinkageContract): boolean {
  return (
    contract.status === 'BROKEN' ||
    contract.errors.includes('HANDLER_MISSING') ||
    contract.errors.includes('TARGET_MISSING')
  );
}

export function detectOrphanChildRoute(input: {
  childRoute: string;
  childSurfaceId: string;
  contracts: ParentChildLinkageContract[];
}): boolean {
  const targeted = input.contracts.some(
    (c) =>
      routesMatch(c.targetChildRoute, input.childRoute) ||
      c.targetSurfaceId === input.childSurfaceId,
  );
  return !targeted;
}
