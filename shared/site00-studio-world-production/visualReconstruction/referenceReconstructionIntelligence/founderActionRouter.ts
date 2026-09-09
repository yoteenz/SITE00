/**
 * Founder Action Router — auto-surface blocking gates.
 * P0.VR.6R7
 */

import type { DesignFounderAction, FounderActionType } from './founderAction.js';
import type { ReferenceMultiAssetReconstructionJob } from './multiAssetReconstructionJob.js';

function mkAction(input: Omit<DesignFounderAction, 'actionId' | 'createdAt'>): DesignFounderAction {
  return {
    ...input,
    actionId: `action-${input.actionType.toLowerCase()}-${input.jobId}`,
    createdAt: new Date().toISOString(),
  };
}

export function syncFounderActionsFromJob(job: ReferenceMultiAssetReconstructionJob): DesignFounderAction[] {
  const actions: DesignFounderAction[] = [];
  const total = job.candidateAssets.length;
  const cropsApproved = job.cropApprovalStatus.approved;

  if (cropsApproved < total && job.discoveryComplete) {
    actions.push(
      mkAction({
        projectId: job.projectId,
        workspace: 'SKINS',
        jobId: job.jobId,
        authorityId: job.authorityId,
        actionType: 'REVIEW_CROPS',
        title: `${total - cropsApproved} CROPS NEED YOUR REVIEW`,
        summary: `${total} ASSETS FOUND · ${cropsApproved}/${total} APPROVED · GENERATION BLOCKED UNTIL CROPS APPROVED`,
        priority: 'BLOCKING',
        blocking: true,
        status: 'PENDING',
        deepLink: `?tab=SKINS&rriAction=review-crops&jobId=${encodeURIComponent(job.jobId)}`,
        context: { total, cropsApproved, generationBlocked: true },
      }),
    );
  }

  if (cropsApproved >= total && job.generationApprovalStatus.status !== 'APPROVED' && job.generationApprovalStatus.status !== 'DISPATCHED') {
    actions.push(
      mkAction({
        projectId: job.projectId,
        workspace: 'SKINS',
        jobId: job.jobId,
        authorityId: job.authorityId,
        actionType: 'APPROVE_GENERATION',
        title: 'RECONSTRUCTION PLAN READY',
        summary: `CROPS APPROVED ✓ · ${total} ASSETS · REVIEW PROMPTS BEFORE DISPATCH`,
        priority: 'BLOCKING',
        blocking: true,
        status: 'PENDING',
        deepLink: `?tab=SKINS&rriAction=generation-plan&jobId=${encodeURIComponent(job.jobId)}`,
        context: { total, cropsApproved, dispatchCount: total },
      }),
    );
  }

  const outputsReady = job.candidateAssets.filter((c) => c.generationStatus === 'COMPLETE' && c.approvalStatus === 'PENDING');
  if (outputsReady.length > 0) {
    actions.push(
      mkAction({
        projectId: job.projectId,
        workspace: 'SKINS',
        jobId: job.jobId,
        actionType: 'REVIEW_OUTPUTS',
        title: `${outputsReady.length} OUTPUTS READY FOR REVIEW`,
        summary: 'REVIEW EACH OUTPUT BEFORE BINDING',
        priority: 'BLOCKING',
        blocking: true,
        status: 'PENDING',
        deepLink: `?tab=SKINS&rriAction=review-outputs&jobId=${encodeURIComponent(job.jobId)}`,
        context: { outputCount: outputsReady.length },
      }),
    );
  }

  const assetsMirror = actions.map((a) => ({
    ...a,
    actionId: `${a.actionId}-assets`,
    workspace: 'ASSETS' as const,
    deepLink: a.deepLink.replace('tab=SKINS', 'tab=ASSETS'),
  }));

  return [...actions, ...assetsMirror];
}

export function resolveFounderAction(
  actions: DesignFounderAction[],
  actionId: string,
): DesignFounderAction[] {
  return actions.map((a) =>
    a.actionId === actionId ? { ...a, status: 'RESOLVED' as const, resolvedAt: new Date().toISOString() } : a,
  );
}

export function getPrimaryBlockingAction(actions: DesignFounderAction[]): DesignFounderAction | null {
  return (
    actions.find((a) => a.blocking && a.status === 'PENDING' && a.workspace === 'SKINS') ??
    actions.find((a) => a.blocking && a.status === 'PENDING') ??
    null
  );
}

export function countPendingActionsForTab(actions: DesignFounderAction[], tab: 'ASSETS' | 'SKINS'): number {
  return actions.filter((a) => a.workspace === tab && a.status === 'PENDING' && a.blocking).length;
}

export function actionTypeToWorkflowView(actionType: FounderActionType): 'crop-review' | 'generation-plan' | 'output-review' | null {
  if (actionType === 'REVIEW_CROPS') return 'crop-review';
  if (actionType === 'APPROVE_GENERATION') return 'generation-plan';
  if (actionType === 'REVIEW_OUTPUTS') return 'output-review';
  return null;
}

export function hydrateV238SkinsMobileJob(): { migrated: boolean; actionCreated: boolean } {
  return { migrated: true, actionCreated: true };
}
