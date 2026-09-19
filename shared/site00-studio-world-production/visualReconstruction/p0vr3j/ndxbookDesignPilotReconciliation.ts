/**
 * P0.VR.3J — NDXBOOK design-pilot registration gap reconciliation.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  findDesignScreen,
  listDesignScreensForProject,
  registerProjectDesignScreens,
} from '../p0vr2/designScreenRegistry.js';
import { NDX_DESIGN_SCREENS, registerNdxbookDesignPilot } from '../p0vr2/ndxPilotRegistration.js';
import type { DesignScreenDefinition } from '../p0vr2/types.js';
import { getLatestImplementationSnapshot } from '../p0vr3e/implementationSnapshotRegistry.js';
import { buildNdxbookMissingRoutes } from '../p0vr3h/ndxbookMissingRoutes.js';
import { P0_VR_3J_LINEAGE } from './constants.js';
import type {
  DesignPilotGapResolutionStatus,
  DesignPilotGapType,
  DesignPilotRegistrationGapRecord,
  DesignPilotRegistrationReceipt,
  NdxbookReconciliationDashboard,
} from './types.js';

const NDXBOOK_SLUG = 'ndxbook';
const REPO_ROOT = join(import.meta.dirname, '../../../..');

function componentExists(relativePath?: string): boolean {
  if (!relativePath) return false;
  return existsSync(join(REPO_ROOT, relativePath));
}

function screenIdFromRouteId(routeId: string): string {
  return routeId;
}

function classifyGapType(input: {
  implementationExists: boolean;
  registrationExists: boolean;
  referenceBindingExists: boolean;
  snapshotBindingExists: boolean;
  duplicateCandidate: boolean;
}): DesignPilotGapType {
  if (!input.implementationExists) return 'TRUE_IMPLEMENTATION_MISSING';
  if (input.duplicateCandidate) return 'DUPLICATE_REGISTRATION';
  if (!input.registrationExists) return 'EXISTING_ROUTE_UNREGISTERED';
  if (!input.referenceBindingExists) return 'REFERENCE_BINDING_MISSING';
  if (!input.snapshotBindingExists) return 'SNAPSHOT_BINDING_MISSING';
  return 'UNKNOWN_REVIEW_REQUIRED';
}

function buildDesignScreenFromGap(gap: ReturnType<typeof buildNdxbookMissingRoutes>[number]): DesignScreenDefinition {
  const routeId = gap.screenId.replace(/^ndxbook-gap-/, '');
  return {
    screenId: screenIdFromRouteId(routeId),
    displayName: gap.displayName,
    routePattern: gap.route.replace(`/projects/${NDXBOOK_SLUG}`, '/projects/:projectSlug'),
    scopeTargetId: `${routeId}Screen`,
    sharedComponentPaths: ['src/site00/components/founderWorkspace/FounderWorkspaceShell.tsx'],
    showInDefaultSelector: false,
    dependencyClosure: 'COMPLETE',
    routeFamily: 'OTHER',
    classification: 'FOUNDER_WORKSPACE',
    recordKind: 'ROUTE',
    priority: 'SECONDARY',
    sourceEvidence: gap.sourceEvidence,
  };
}

export function auditNdxbookDesignPilotGaps(): DesignPilotRegistrationGapRecord[] {
  registerNdxbookDesignPilot();
  const missing = buildNdxbookMissingRoutes();

  return missing.map((entry) => {
    const routeId = entry.screenId.replace(/^ndxbook-gap-/, '');
    const candidateScreen = screenIdFromRouteId(routeId);
    const implementationExists = componentExists(entry.existingImplementationPath);
    const existingScreen = findDesignScreen('ndxbook', candidateScreen);
    const registrationExists = Boolean(existingScreen);
    const referenceBindingExists = false;
    const snapshotBindingExists = Boolean(
      getLatestImplementationSnapshot('ndxbook', candidateScreen, 'mobile') ??
        getLatestImplementationSnapshot('ndxbook', candidateScreen, 'desktop'),
    );

    const duplicateCandidate = listDesignScreensForProject('ndxbook', true).some(
      (s) => s.routePattern.replace(':projectSlug', NDXBOOK_SLUG) === entry.route && s.screenId !== candidateScreen,
    );

    const gapType = classifyGapType({
      implementationExists,
      registrationExists,
      referenceBindingExists,
      snapshotBindingExists,
      duplicateCandidate,
    });

    let resolutionStatus: DesignPilotGapResolutionStatus = 'UNRESOLVED';
    if (registrationExists) resolutionStatus = 'ALREADY_REGISTERED';
    else if (!implementationExists) resolutionStatus = 'TRUE_MISSING';
    else if (duplicateCandidate) resolutionStatus = 'DUPLICATE_PREVENTED';

    return {
      gapId: entry.screenId,
      projectId: 'NDXBOOK',
      expectedDesignTarget: entry.displayName,
      candidateRoute: entry.route,
      candidateScreen,
      candidateFamily: entry.family,
      implementationExists,
      registrationExists,
      referenceBindingExists,
      snapshotBindingExists,
      gapType,
      confidence: implementationExists ? 'HIGH' : 'LOW',
      resolutionStatus,
      existingImplementationPath: entry.existingImplementationPath,
      blockedReason: entry.blockedReason,
    };
  });
}

function mergeNdxbookScreens(existing: DesignScreenDefinition[], additions: DesignScreenDefinition[]): DesignScreenDefinition[] {
  const byId = new Map<string, DesignScreenDefinition>();
  for (const screen of existing) byId.set(screen.screenId, screen);
  for (const screen of additions) {
    if (!byId.has(screen.screenId)) byId.set(screen.screenId, screen);
  }
  return [...byId.values()];
}

export function reconcileNdxbookDesignPilotGaps(): {
  dashboard: NdxbookReconciliationDashboard;
  newFunctionalRoutesCreated: number;
} {
  registerNdxbookDesignPilot();
  const gaps = auditNdxbookDesignPilotGaps();
  const receipts: DesignPilotRegistrationReceipt[] = [];
  const additions: DesignScreenDefinition[] = [];

  for (const gap of gaps) {
    if (gap.registrationExists) {
      gap.resolutionStatus = 'ALREADY_REGISTERED';
      receipts.push(buildRegistrationReceipt(gap, 'ALREADY_REGISTERED'));
      continue;
    }

    if (!gap.implementationExists) {
      gap.resolutionStatus = 'TRUE_MISSING';
      continue;
    }

    if (gap.gapType === 'DUPLICATE_REGISTRATION') {
      gap.resolutionStatus = 'DUPLICATE_PREVENTED';
      receipts.push(buildRegistrationReceipt(gap, 'DUPLICATE_PREVENTED'));
      continue;
    }

    const source = buildNdxbookMissingRoutes().find((e) => e.screenId === gap.gapId);
    if (!source) continue;

    additions.push(buildDesignScreenFromGap(source));
    gap.resolutionStatus = gap.referenceBindingExists ? 'READY_FOR_CAPTURE' : 'REGISTERED';
    receipts.push(buildRegistrationReceipt(gap, gap.resolutionStatus));
  }

  if (additions.length > 0) {
    const merged = mergeNdxbookScreens(NDX_DESIGN_SCREENS, additions);
    registerProjectDesignScreens('ndxbook', merged);
  }

  const dashboard: NdxbookReconciliationDashboard = {
    total: gaps.length,
    resolved: gaps.filter((g) =>
      ['REGISTERED', 'ALREADY_REGISTERED', 'REMAPPED', 'READY_FOR_CAPTURE'].includes(g.resolutionStatus),
    ).length,
    trueMissing: gaps.filter((g) => g.resolutionStatus === 'TRUE_MISSING').length,
    duplicates: gaps.filter((g) => g.resolutionStatus === 'DUPLICATE_PREVENTED').length,
    unknown: gaps.filter((g) => g.resolutionStatus === 'UNRESOLVED' || g.gapType === 'UNKNOWN_REVIEW_REQUIRED').length,
    readyForCapture: gaps.filter((g) => g.resolutionStatus === 'READY_FOR_CAPTURE').length,
    gaps,
    receipts,
  };

  return { dashboard, newFunctionalRoutesCreated: 0 };
}

function buildRegistrationReceipt(
  gap: DesignPilotRegistrationGapRecord,
  resolution: DesignPilotGapResolutionStatus,
): DesignPilotRegistrationReceipt {
  return {
    receiptId: `ndx-reg:${gap.gapId}:${Date.now()}`,
    gapId: gap.gapId,
    route: gap.candidateRoute,
    screen: gap.candidateScreen,
    experiencePage: gap.candidateScreen,
    family: gap.candidateFamily,
    resolution,
    existingImplementationPreserved: gap.implementationExists,
    newRouteCreated: false,
    sourceEvidence: [
      'shared/site00-studio-world-production/founderWorkspace/cohesion/routeInventory.ts',
      'shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.ts',
    ],
    resolvedAt: new Date().toISOString(),
    lineage: P0_VR_3J_LINEAGE,
  };
}

export function ensureNdxbookDesignPilotReconciled(): NdxbookReconciliationDashboard {
  return reconcileNdxbookDesignPilotGaps().dashboard;
}
