/**
 * ParentChildExperienceInheritanceEngine — system-level parent → child experience convergence.
 */

import { classifyChildSurfaces } from './childSurfaceClassifier.js';
import { applyConvergencePlans } from './convergenceApplier.js';
import { buildConvergencePlansForBranch } from './convergencePlanBuilder.js';
import { resolveInheritanceMode } from './inheritanceModes.js';
import { evaluateInheritanceBranchQA } from './inheritanceQA.js';
import { storeInheritanceRun } from './inheritanceStore.js';
import { extractParentExperienceAuthority } from './parentAuthorityExtractor.js';
import { resolveAllExperienceParents } from './parentAuthorityResolver.js';
import { discoverParentChildRouteGraph, listChildNodes } from './routeGraphDiscovery.js';
import type {
  ChildSurfaceDescriptor,
  InheritanceMode,
  ParentChildInheritanceEngineInput,
  ParentChildInheritanceRunResult,
} from './types.js';

export function runParentChildExperienceInheritance(
  input: ParentChildInheritanceEngineInput,
): ParentChildInheritanceRunResult {
  const { registry } = input;
  const viewport = input.viewport ?? registry.parentSignals?.viewport ?? 'UNIVERSAL';

  const routeGraph = discoverParentChildRouteGraph(registry);

  const parentSignals = registry.parentSignals ?? {
    route: registry.rootRoute,
    surfaceId: `surface-${registry.rootRoute.replace(/^\//, '')}`,
    viewport,
    heroPresent: true,
    cardGridPresent: true,
    controlRoomIndicators: registry.rootRoute.includes('more') || registry.rootRoute.includes('design'),
  };

  const existingAuthority = registry.existingAuthorities?.find(
    (a) => a.parentRoute.replace(/\/$/, '') === registry.rootRoute.replace(/\/$/, ''),
  );

  const parentAuthority = extractParentExperienceAuthority({
    projectId: registry.projectId,
    signals: { ...parentSignals, viewport },
    existingAuthority,
  });

  const childNodes = listChildNodes(routeGraph);
  const descriptorByRoute = new Map(
    (registry.childDescriptors ?? []).map((d) => [d.route, d]),
  );

  const archetypes = classifyChildSurfaces({
    nodes: childNodes,
    descriptors: registry.childDescriptors,
  });

  const inheritanceModes = new Map<string, InheritanceMode>();
  for (const node of childNodes) {
    const descriptor = descriptorByRoute.get(node.route);
    inheritanceModes.set(
      node.nodeId,
      resolveInheritanceMode({
        archetype: archetypes.get(node.nodeId) ?? 'OTHER',
        isHostShell: Boolean(node.metadata?.isHostShell ?? descriptor?.isHostShell),
        exemptReason: descriptor?.exemptReason ?? registry.declaredSurfaces?.find((s) => s.route === node.route)?.exemptReason,
      }),
    );
  }

  const resolvedParents = resolveAllExperienceParents({
    graph: routeGraph,
    authorities: registry.existingAuthorities,
  });

  const nodeIdByRoute = new Map(childNodes.map((n) => [n.nodeId, n.route]));

  const convergencePlans = buildConvergencePlansForBranch({
    parentAuthority,
    resolvedParents,
    archetypes,
    inheritanceModes,
    descriptors: registry.childDescriptors,
    nodeIdByRoute,
  });

  const migrationManifest =
    input.applyMigration !== false
      ? applyConvergencePlans({
          projectId: registry.projectId,
          parentAuthorityId: parentAuthority.authorityId,
          plans: convergencePlans,
          dryRun: input.dryRun ?? true,
        })
      : null;

  const qaReport = evaluateInheritanceBranchQA({
    projectId: registry.projectId,
    parentRoute: registry.rootRoute,
    parentAuthority,
    plans: convergencePlans,
    exceptions: registry.exceptions,
  });

  const status = qaReport.passed
    ? input.dryRun === false && migrationManifest
      ? 'APPLIED'
      : 'QA_PASSED'
    : 'QA_FAILED';

  const result: ParentChildInheritanceRunResult = {
    runId: `pci-run-${registry.projectId}-${Date.now()}`,
    projectId: registry.projectId,
    parentRoute: registry.rootRoute,
    routeGraph,
    parentAuthority,
    convergencePlans,
    migrationManifest,
    qaReport,
    exceptions: registry.exceptions ?? [],
    status: convergencePlans.length === 0 ? 'BLOCKED' : status,
    createdAt: new Date().toISOString(),
  };

  storeInheritanceRun(result);
  return result;
}

export function buildChildDescriptorFromLegacyPanel(input: {
  route: string;
  parentRoute: string;
  label: string;
  domClassHints?: string[];
}): ChildSurfaceDescriptor {
  return {
    surfaceId: `surface-${input.route.replace(/^\//, '').replace(/[/:?&=]/g, '-')}`,
    route: input.route,
    label: input.label,
    relationshipType: 'DIRECT_CHILD',
    parentRoute: input.parentRoute,
    viewport: 'UNIVERSAL',
    domClassHints: input.domClassHints ?? ['site00-pos-panel', 'site00-pos-empty'],
    hasGenericAdminFallback: true,
    interactionDensity: 'LOW',
  };
}
