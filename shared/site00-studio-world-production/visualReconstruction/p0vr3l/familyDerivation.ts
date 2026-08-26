/**
 * P0.VR.3L — Family derivation engine.
 */

import { registerProjectDesignScreens, findDesignScreen, listDesignScreensForProject } from '../p0vr2/designScreenRegistry.js';
import { registerNdxbookDesignPilot } from '../p0vr2/ndxPilotRegistration.js';
import type { DesignScreenDefinition } from '../p0vr2/types.js';
import {
  COMPOSER_DERIVED_DRAFT_LABEL,
  FAMILY_SOURCE_SNAPSHOT_LABEL,
  P0_VR_3L_LINEAGE,
} from './constants.js';
import {
  appendFamilyDerivationReceipt,
  storeFamilyDerivedRecord,
  getFamilyDerivedRecord,
  listFamilyDerivationReceipts,
  clearFamilyDerivationForTest,
} from './derivationStore.js';
import { getMissingTarget } from './targetClassifier.js';
import { resolveShellForTarget } from './sharedShellRegistry.js';
import { selectBestSibling, sharedCodeExistsBeforeRebuild, evaluateSiblingCaptureNeed } from './siblingSelection.js';
import { captureDerivedTargetDraft, captureSiblingIfNeeded } from './onDemandSiblingCapture.js';
import type {
  DeriveMissingTargetResult,
  FamilyDerivedMissingTargetRecord,
  FamilyDerivationReceipt,
  MissingDesignTargetRecord,
} from './types.js';

export { getFamilyDerivedRecord, listFamilyDerivationReceipts, clearFamilyDerivationForTest };

function allowedDifferencesFor(target: MissingDesignTargetRecord): string[] {
  if (target.targetType === 'TAB_STATE') {
    return ['active tab', 'tab-specific content', 'tab-specific controls', 'tab-specific states'];
  }
  if (target.targetType === 'FAMILY_DERIVED_PAGE') {
    return ['title', 'primary content', 'CTA', 'form fields'];
  }
  return ['target-specific content'];
}

function preservedPropertiesFor(shellId: string): string[] {
  if (shellId === 'ndx-character-lab-shell') {
    return [
      'NDXBOOK workspace shell',
      'Character Lab page architecture',
      'tabs',
      'header',
      'spacing',
      'panels',
      'responsive behavior',
      'project typography/color usage',
    ];
  }
  if (shellId === 'site00-information-shell') {
    return ['SITE 00 public shell', 'information family typography', 'navigation frame', 'responsive behavior'];
  }
  return ['shared shell layout', 'responsive behavior'];
}

export async function deriveMissingTargetFromFamily(
  targetId: string,
  options?: { baseUrl?: string; skipCapture?: boolean },
): Promise<DeriveMissingTargetResult | null> {
  const target = getMissingTarget(targetId);
  if (!target) return null;

  if (target.queueStatus === 'TRUE_MISSING_ROUTE') {
    return null;
  }

  if (target.queueStatus === 'EXISTING_UNREGISTERED') {
    const { reconcileNdxbookDesignPilotGaps } = await import('../p0vr3j/ndxbookDesignPilotReconciliation.js');
    reconcileNdxbookDesignPilotGaps();
    return null;
  }

  const sibling = selectBestSibling(target);
  if (!sibling) return null;

  const shell = resolveShellForTarget({
    projectId: target.projectId,
    experiencePageId: target.experiencePageId,
    materialScreenId: target.materialScreenId,
  });
  if (!shell) return null;

  if (!sharedCodeExistsBeforeRebuild(sibling.componentPaths)) {
    return null;
  }

  let sourceSnapshotId: string | null = null;
  if (!options?.skipCapture) {
    const capture = await captureSiblingIfNeeded({
      projectId: target.projectId,
      sibling,
      baseUrl: options?.baseUrl,
    });
    sourceSnapshotId = capture.snapshots[0]?.snapshotId ?? null;
    if (capture.reused) {
      const decision = evaluateSiblingCaptureNeed(target.projectId, sibling);
      sourceSnapshotId = decision.existingSnapshotId ?? sibling.siblingId;
    }
  }

  const record: FamilyDerivedMissingTargetRecord = {
    targetId: target.targetId,
    projectId: target.projectId,
    targetType: target.targetType,
    experiencePageId: target.experiencePageId,
    materialScreenId: target.materialScreenId,
    visualStateId: target.visualStateId,
    sourceFamilyId: shell.consumerFamilyIds[0] ?? shell.shellId,
    sourceSiblingId: sibling.siblingId,
    sourceRoute: sibling.route,
    sourceSnapshotId,
    sourceComponents: sibling.componentPaths,
    sharedShellId: shell.shellId,
    preservedProperties: preservedPropertiesFor(shell.shellId),
    allowedDifferences: allowedDifferencesFor(target),
    confidence: target.targetType === 'TAB_STATE' ? 'HIGH' : 'MEDIUM',
    createdBy: 'COMPOSER',
    reviewStatus: 'UNREVIEWED',
    publishStatus: 'PREVIEW_ONLY',
    createdBySprint: P0_VR_3L_LINEAGE,
    derivedAt: new Date().toISOString(),
    authorType: 'COMPOSER',
  };

  storeFamilyDerivedRecord(targetId, record);

  const receipt: FamilyDerivationReceipt = {
    receiptId: `derivation:${targetId}:${Date.now()}`,
    targetId,
    projectId: target.projectId,
    sourceSiblingId: sibling.siblingId,
    sharedShellId: shell.shellId,
    sourceSnapshotLabel: FAMILY_SOURCE_SNAPSHOT_LABEL,
    targetSnapshotLabel: COMPOSER_DERIVED_DRAFT_LABEL,
    createdAt: new Date().toISOString(),
    lineage: P0_VR_3L_LINEAGE,
  };
  appendFamilyDerivationReceipt(receipt);

  registerDerivedMaterialScreen(target, record);

  if (!options?.skipCapture && target.visualStateId) {
    await captureDerivedTargetDraft({
      projectId: target.projectId,
      screenId: `${target.experiencePageId}-${target.materialScreenId}`,
      route: `${target.route}?preview=1&designPreview=1&designState=${target.visualStateId}`,
      baseUrl: options?.baseUrl,
    });
  }

  return {
    record,
    receipt,
    queueStatus: 'DERIVED_DRAFT',
    newRouteCreated: false,
    registrationOnly: target.targetType === 'TAB_STATE' || target.targetType === 'MATERIAL_SCREEN',
  };
}

function registerDerivedMaterialScreen(
  target: MissingDesignTargetRecord,
  record: FamilyDerivedMissingTargetRecord,
): void {
  if (!target.experiencePageId || !target.materialScreenId) return;
  if (target.projectId !== 'NDXBOOK') return;

  registerNdxbookDesignPilot();
  const existing = listDesignScreensForProject('ndxbook', true);
  const materialScreenId = `${target.experiencePageId}-${target.materialScreenId}`;

  if (findDesignScreen('ndxbook', materialScreenId)) return;

  const addition: DesignScreenDefinition = {
    screenId: materialScreenId,
    displayName: target.displayName,
    routePattern: target.route?.replace('/projects/ndxbook', '/projects/:projectSlug') ?? '/projects/:projectSlug/character/discovery',
    scopeTargetId: `${target.materialScreenId}Tab`,
    parentScreenId: 'character-lab',
    sharedComponentPaths: record.sourceComponents,
    showInDefaultSelector: false,
    dependencyClosure: 'IMPLEMENTED_DRAFT',
    routeFamily: 'OTHER',
    classification: 'FOUNDER_WORKSPACE',
    recordKind: 'INTERACTION_STATE',
    sourceEvidence: [P0_VR_3L_LINEAGE, ...target.sourceEvidence],
  };

  registerProjectDesignScreens('ndxbook', [...existing, addition]);
}
