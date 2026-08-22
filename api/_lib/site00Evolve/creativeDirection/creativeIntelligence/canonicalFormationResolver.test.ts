import { describe, expect, it, beforeEach, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  resolveCanonicalCoreDirectionFormation,
  syncEngagementFormationVersionFromCanonical,
} from './canonicalFormationResolver.js';
import { resetFormationMemoryStore, saveFormationRecord } from './formationStore/storeAdapter.js';
import type { CoreDirectionFormationRecord } from './types.js';

function makeRecord(partial: Partial<CoreDirectionFormationRecord>): CoreDirectionFormationRecord {
  const now = new Date().toISOString();
  return {
    formationId: partial.formationId ?? randomUUID(),
    organizationId: partial.organizationId ?? 'org-1',
    projectId: partial.projectId ?? null,
    engagementId: null,
    brandLoreProfileId: 'profile-1',
    brandLoreProfileVersion: 24,
    brandLoreFingerprint: partial.brandLoreFingerprint ?? '5e71f429',
    formationVersion: partial.formationVersion ?? 1,
    providerId: 'anthropic',
    modelId: 'claude-sonnet-4-6',
    promptVersion: 'core-direction-formation-v1',
    status: partial.status ?? 'NEEDS_HUMAN_REVIEW',
    idempotencyKey: partial.idempotencyKey ?? `org-1:none:${partial.brandLoreFingerprint ?? '5e71f429'}:${partial.formationVersion ?? 1}:core-direction-formation-v1`,
    formationInput: null,
    candidateDirections: [],
    criticResult: null,
    revisionRounds: 0,
    finalDirections: partial.finalDirections ?? [],
    visualProofPlans: partial.visualProofPlans ?? [],
    legacyStaticPreview: 'PRESERVED',
    proposedFormationLabel: 'PROPOSED_FORMATION',
    providerAccounting: {
      providerId: 'anthropic',
      modelId: 'claude-sonnet-4-6',
      requestCount: 1,
      revisionCount: 0,
      formationRequests: 1,
      critiqueRequests: 0,
      reviseRequests: 0,
      tokenUsage: {},
    },
    error: partial.error ?? null,
    errorCode: partial.errorCode ?? null,
    createdAt: partial.createdAt ?? now,
    startedAt: partial.startedAt ?? now,
    completedAt: partial.completedAt ?? null,
    failedAt: partial.failedAt ?? null,
    updatedAt: partial.updatedAt ?? now,
  };
}

describe('resolveCanonicalCoreDirectionFormation', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    resetFormationMemoryStore();
  });

  it('prefers READY_FOR_VISUAL_PRODUCTION v2 over NEEDS_HUMAN_REVIEW v1 for same fingerprint', async () => {
    const orgId = '7681ab75-bddc-43e5-b594-79fcf8168205';
    await saveFormationRecord(
      makeRecord({
        formationId: '5db1b245-fe69-4287-acf7-e78417815fdf',
        organizationId: orgId,
        formationVersion: 1,
        status: 'NEEDS_HUMAN_REVIEW',
        finalDirections: [{ directionName: 'THE MARKED-UP COPY' } as never],
        createdAt: '2026-08-22T14:53:53.359Z',
        updatedAt: '2026-08-22T14:54:50.743Z',
      }),
    );
    await saveFormationRecord(
      makeRecord({
        formationId: '39a27725-cf73-4371-b7c9-81c5d67bac8a',
        organizationId: orgId,
        formationVersion: 2,
        status: 'READY_FOR_VISUAL_PRODUCTION',
        finalDirections: [{ directionName: 'THE ANNOTATED COPY' } as never],
        completedAt: '2026-08-22T15:09:26.637Z',
        createdAt: '2026-08-22T14:55:07.106Z',
        updatedAt: '2026-08-22T15:09:26.637Z',
      }),
    );

    const result = await resolveCanonicalCoreDirectionFormation({
      organizationId: orgId,
      currentBrandLoreFingerprint: '5e71f429',
    });

    expect(result.record?.formationId).toBe('39a27725-cf73-4371-b7c9-81c5d67bac8a');
    expect(result.record?.formationVersion).toBe(2);
    expect(result.record?.status).toBe('READY_FOR_VISUAL_PRODUCTION');
    expect(result.candidatesConsidered).toBe(2);
  });

  it('rejects stale fingerprint records', async () => {
    const orgId = 'org-stale';
    await saveFormationRecord(
      makeRecord({
        organizationId: orgId,
        brandLoreFingerprint: 'oldfp',
        formationVersion: 9,
        status: 'READY_FOR_VISUAL_PRODUCTION',
      }),
    );

    const result = await resolveCanonicalCoreDirectionFormation({
      organizationId: orgId,
      currentBrandLoreFingerprint: '5e71f429',
    });

    expect(result.record).toBeNull();
    expect(result.selectionReason).toBe('no_formation_records_for_scope');
  });

  it('syncEngagementFormationVersionFromCanonical bumps engagement version', () => {
    expect(
      syncEngagementFormationVersionFromCanonical(1, makeRecord({ formationVersion: 2 })),
    ).toBe(2);
    expect(syncEngagementFormationVersionFromCanonical(3, makeRecord({ formationVersion: 2 }))).toBe(3);
  });
});
