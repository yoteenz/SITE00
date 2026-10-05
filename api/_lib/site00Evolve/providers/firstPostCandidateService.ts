/** First-post candidate — draft + approval without publishing */

import { randomUUID } from 'node:crypto';
import { orgIdFromSlug } from '../orgRegistry.js';
import { createDistributionJob } from './pilotService.js';
import { requestApproval } from '../evolveService.js';
import { isGlobalPublishingEnabled, publishingFenceState } from './publishingFence.js';
import { ensurePilotConfig, listSafeConnections } from './connectionService.js';
import { isAccountConfirmed } from './accountConfirmation.js';
import { runPublicationDryRun } from './dryRunService.js';

export type FirstPostCandidate = {
  id: string;
  caption: string;
  assetRefs: string[];
  channel: string;
  connectionId: string | null;
  targetAccount: string | null;
  campaignId: string | null;
  objectiveLabel: string | null;
  approvalState: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED';
  distributionJobId: string | null;
};

const memCandidates = new Map<string, FirstPostCandidate>();

export function resetFirstPostMemory(): void {
  memCandidates.clear();
}

export async function saveFirstPostDraft(orgSlug: string, data: Partial<FirstPostCandidate>): Promise<FirstPostCandidate> {
  const orgId = orgIdFromSlug(orgSlug)!;
  const social = (await listSafeConnections(orgSlug)).find((c) => c.providerCategory === 'SOCIAL');
  const id = data.id ?? randomUUID();
  const candidate: FirstPostCandidate = {
    id,
    caption: data.caption ?? '',
    assetRefs: data.assetRefs ?? [],
    channel: 'INSTAGRAM',
    connectionId: social?.id ?? null,
    targetAccount: social?.externalAccountName ?? null,
    campaignId: data.campaignId ?? null,
    objectiveLabel: data.objectiveLabel ?? null,
    approvalState: 'DRAFT',
    distributionJobId: data.distributionJobId ?? null,
  };

  if (!candidate.distributionJobId) {
    const job = await createDistributionJob(orgSlug, {
      channel: 'INSTAGRAM',
      state: 'DRAFT',
      metadata: { candidate_id: id, caption: candidate.caption, asset_refs: candidate.assetRefs },
    });
    candidate.distributionJobId = String(job.id);
  }

  memCandidates.set(`${orgId}:${id}`, candidate);
  return candidate;
}

export async function sendFirstPostForApproval(orgSlug: string, candidateId: string, requestedBy: string) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const candidate = memCandidates.get(`${orgId}:${candidateId}`);
  if (!candidate) throw new Error('Candidate not found');

  candidate.approvalState = 'READY_FOR_REVIEW';
  const approval = await requestApproval(orgSlug, 'distribution_job', candidate.distributionJobId!, 'CONTENT', requestedBy);
  return { candidate, approval };
}

export async function getFirstPostCandidateView(orgSlug: string, candidateId?: string) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const pilot = await ensurePilotConfig(orgSlug);
  const globalFence = isGlobalPublishingEnabled();
  const orgFence = publishingFenceState(String(pilot.publishing_status) as 'DISABLED');
  const social = (await listSafeConnections(orgSlug)).find((c) => c.providerCategory === 'SOCIAL');

  const candidate =
    candidateId && memCandidates.get(`${orgId}:${candidateId}`)
      ? memCandidates.get(`${orgId}:${candidateId}`)!
      : (memCandidates.get(`${orgId}:default`) ?? null);

  return {
    candidate,
    connectionState: social?.status ?? 'NOT_CONNECTED',
    accountConfirmed: social
      ? isAccountConfirmed({ account_confirmed_at: social.accountConfirmedAt, metadata: {} })
      : false,
    fenceState: {
      global: globalFence ? 'ENABLED' : 'DISABLED',
      organization: orgFence.orgEnabled ? 'ENABLED' : 'DISABLED',
      publishActionAvailable: false,
    },
    publishingCapability: social?.capabilityMap?.PUBLISH_CONTENT ?? 'UNAVAILABLE',
  };
}

export async function runFirstPostDryRun(orgSlug: string, candidateId: string, approvalState = 'APPROVED') {
  const orgId = orgIdFromSlug(orgSlug)!;
  const candidate = memCandidates.get(`${orgId}:${candidateId}`);
  if (!candidate?.connectionId) throw new Error('No connection for dry run');
  return runPublicationDryRun(orgSlug, {
    connectionId: candidate.connectionId,
    caption: candidate.caption,
    assetRefs: candidate.assetRefs,
    approvalState,
    campaignId: candidate.campaignId ?? undefined,
  });
}
