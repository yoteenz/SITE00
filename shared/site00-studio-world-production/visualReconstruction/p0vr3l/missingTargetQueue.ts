/**
 * P0.VR.3L — Missing target queue builder.
 */

import { getFamilyDerivedRecord, listFamilyDerivationReceipts } from './derivationStore.js';
import { discoverMissingDesignTargets } from './targetClassifier.js';
import { selectBestSibling } from './siblingSelection.js';
import { analyzeShellPropagationImpact } from './shellPropagation.js';
import type { MissingDesignTargetRecord, RepoOwnedProjectId } from './types.js';

export type MissingTargetQueueEntry = MissingDesignTargetRecord & {
  sourceSiblingId: string | null;
  sharedShellId: string | null;
  derived: boolean;
  propagationScopePreview: string | null;
};

export type MissingTargetQueueSummary = {
  total: number;
  readyForDerivation: number;
  needsSourceSibling: number;
  needsSourceCapture: number;
  derivedDraft: number;
  trueMissing: number;
  existingUnregistered: number;
};

export function buildMissingTargetQueue(projectId?: RepoOwnedProjectId): MissingTargetQueueEntry[] {
  return discoverMissingDesignTargets(projectId).map((target) => {
    const derived = getFamilyDerivedRecord(target.targetId);
    const sibling = selectBestSibling(target);

    return {
      ...target,
      queueStatus: derived ? 'DERIVED_DRAFT' : target.queueStatus,
      sourceSiblingId: derived?.sourceSiblingId ?? sibling?.siblingId ?? null,
      sharedShellId: derived?.sharedShellId ?? null,
      derived: Boolean(derived),
      propagationScopePreview: derived
        ? analyzeShellPropagationImpact({
            scope: 'DESIGN_FAMILY',
            projectId: target.projectId,
            shellId: derived.sharedShellId,
            familyId: derived.sourceFamilyId,
            targetId: target.targetId,
          }).blastRadiusSummary
        : null,
    };
  });
}

export function summarizeMissingTargetQueue(projectId?: RepoOwnedProjectId): MissingTargetQueueSummary {
  const queue = buildMissingTargetQueue(projectId);
  return {
    total: queue.length,
    readyForDerivation: queue.filter((q) => q.queueStatus === 'READY_FOR_DERIVATION').length,
    needsSourceSibling: queue.filter((q) => q.queueStatus === 'NEEDS_SOURCE_SIBLING').length,
    needsSourceCapture: queue.filter((q) => q.queueStatus === 'NEEDS_SOURCE_CAPTURE').length,
    derivedDraft: queue.filter((q) => q.queueStatus === 'DERIVED_DRAFT').length,
    trueMissing: queue.filter((q) => q.queueStatus === 'TRUE_MISSING_ROUTE').length,
    existingUnregistered: queue.filter((q) => q.queueStatus === 'EXISTING_UNREGISTERED').length,
  };
}

export function getCharacterLabVoiceLabEntry(): MissingTargetQueueEntry | null {
  return buildMissingTargetQueue('NDXBOOK').find((e) => e.targetId === 'ndxbook:character-lab:voice-lab-tab') ?? null;
}

export function listDerivationReceiptsForQueue() {
  return listFamilyDerivationReceipts();
}
