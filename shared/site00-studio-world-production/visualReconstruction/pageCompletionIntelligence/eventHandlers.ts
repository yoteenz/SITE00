/**
 * PAGE_CREATED / PAGE_UPDATED event handlers → PageCompletionIntelligenceEngine
 */

import { runPageCompletionIntelligence, runRecursivePageCompletion } from './pageCompletionEngine.js';
import { handlePageSyncEvent } from '../p0vr8/syncOrchestrator.js';
import type { PageExperienceInput, PageExperienceImplementationJob } from './types.js';
import type { PageSyncEventType } from '../p0vr8/types.js';

const completionJobs = new Map<string, PageExperienceImplementationJob>();

function jobKey(projectId: string, pageId: string): string {
  return `${projectId}:${pageId}`;
}

export function onPageCreated(input: PageExperienceInput): PageExperienceImplementationJob {
  const job = runRecursivePageCompletion(input)[0]!;
  completionJobs.set(jobKey(input.projectId, input.pageId), job);

  handlePageSyncEvent({
    type: 'PAGE_CREATED',
    projectId: input.projectId,
    pageId: input.pageId,
    route: input.primaryRoute,
  });

  for (const child of job.childSurfacePlans) {
    if (child.route) {
      handlePageSyncEvent({
        type: 'ROUTE_ADDED',
        projectId: input.projectId,
        pageId: child.childSurfaceId,
        route: child.route,
      });
    }
  }

  return job;
}

export function onPageUpdated(input: PageExperienceInput): PageExperienceImplementationJob {
  const prev = completionJobs.get(jobKey(input.projectId, input.pageId));
  const job = runPageCompletionIntelligence(input);
  completionJobs.set(jobKey(input.projectId, input.pageId), job);

  handlePageSyncEvent({
    type: 'PAGE_UPDATED',
    projectId: input.projectId,
    pageId: input.pageId,
    route: input.primaryRoute,
  });

  if (prev) {
    const prevIds = new Set(prev.completionPlan.interactionContracts.map((c) => c.interactionId));
    const newContracts = job.completionPlan.interactionContracts.filter((c) => !prevIds.has(c.interactionId));
    if (newContracts.length > 0) {
      job.implementationStatus = 'CHILD_SURFACES_REQUIRED';
    }
  }

  return job;
}

export function onInteractionRemoved(input: PageExperienceInput, removedInteractionId: string): PageExperienceImplementationJob {
  const job = runPageCompletionIntelligence(input);
  const reconciled = job.completionPlan.interactionContracts.filter((c) => c.interactionId !== removedInteractionId);
  job.completionPlan.interactionContracts = reconciled;
  job.completionPlan.requiredChildSurfaces = job.completionPlan.requiredChildSurfaces.map((c) =>
    c.parentInteractionId === removedInteractionId
      ? { ...c, implementationStatus: 'MISSING' as const }
      : c,
  );
  completionJobs.set(jobKey(input.projectId, input.pageId), job);
  return job;
}

export function getStoredPageCompletionJob(projectId: string, pageId: string): PageExperienceImplementationJob | null {
  return completionJobs.get(jobKey(projectId, pageId)) ?? null;
}

export function clearPageCompletionJobsForTest(): void {
  completionJobs.clear();
}

export function pageSyncEventTriggersCompletion(type: PageSyncEventType): boolean {
  return type === 'PAGE_CREATED' || type === 'PAGE_UPDATED';
}
