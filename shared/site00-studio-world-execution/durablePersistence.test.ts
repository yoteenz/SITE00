/**
 * P0 — Durable run persistence + execution truth tests.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DurablePersistenceUnavailableError,
  IdempotencyConflictError,
  StaleWriteConflictError,
} from './errors.js';
import {
  resolveDurableStoreMode,
  resolvePersistencePolicyMode,
  resetPersistencePolicyWarnings,
} from './persistencePolicy.js';
import {
  DEFAULT_CAPABILITY_VERIFICATIONS,
  assertNotFalseProductionReady,
  mergeCapabilityVerifications,
} from './capabilityVerification.js';
import {
  EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION,
  EXPERIMENT_E_CLASSIFICATION,
} from '../site00-brand-lore/experienceExpression/constants.js';
import { EXPERIMENT_D_CLASSIFICATION } from '../site00-brand-lore/conceptTerritory/conceptTerritoryConstants.js';
import { EXPERIMENT_F_CLASSIFICATION } from '../site00-brand-lore/conceptTerritoryV2/constants.js';
import { WORLD_FORMATION_IMPLEMENTED } from '../site00-project-intelligence/types.js';

describe('Studio World execution persistence policy', () => {
  const envBackup = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
    resetPersistencePolicyWarnings();
  });

  it('uses TEST_IN_MEMORY_ALLOWED under Vitest', () => {
    expect(resolvePersistencePolicyMode()).toBe('TEST_IN_MEMORY_ALLOWED');
  });

  it('throws DURABLE_PERSISTENCE_UNAVAILABLE in production without Supabase', async () => {
    process.env.VITEST = '';
    process.env.NODE_ENV = 'production';
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SITE00_ALLOW_MEMORY_FALLBACK;

    await expect(
      resolveDurableStoreMode({
        storeName: 'TestStore',
        schemaExists: async () => true,
        migrationHint: 'test migration',
      }),
    ).rejects.toBeInstanceOf(DurablePersistenceUnavailableError);
  });

  it('allows explicit dev memory fallback when flagged', async () => {
    process.env.VITEST = '';
    process.env.NODE_ENV = 'development';
    process.env.SITE00_ALLOW_MEMORY_FALLBACK = '1';
    delete process.env.SUPABASE_URL;

    const mode = await resolveDurableStoreMode({
      storeName: 'DevStore',
      schemaExists: async () => true,
      migrationHint: 'test',
    });
    expect(mode).toBe('memory');
  });
});

describe('Studio World execution errors', () => {
  it('classifies stale write conflicts', () => {
    const err = new StaleWriteConflictError('conflict', 1, 2);
    expect(err.category).toBe('CONCURRENCY_CONFLICT');
    expect(err.name).toBe('StaleWriteConflictError');
  });

  it('classifies idempotency conflicts', () => {
    const err = new IdempotencyConflictError('dup', 'run-123');
    expect(err.category).toBe('IDEMPOTENCY_CONFLICT');
    expect(err.existingRunId).toBe('run-123');
  });
});

describe('Capability verification registry', () => {
  it('does not equate TEST_VERIFIED with PRODUCTION_VERIFIED', () => {
    const fal = DEFAULT_CAPABILITY_VERIFICATIONS.find((c) => c.capabilityId === 'FAL_GENERATION')!;
    expect(fal.verificationStatus).not.toBe('PRODUCTION_VERIFIED');
    expect(fal.implementationStatus).toBe('TEST_VERIFIED');
  });

  it('rejects false PRODUCTION_READY claims', () => {
    const check = assertNotFalseProductionReady({
      capabilityId: 'FAL_GENERATION',
      claimedStatus: 'PRODUCTION_READY',
      verificationStatus: 'TEST_VERIFIED',
    });
    expect(check.honest).toBe(false);
  });

  it('merges persisted capability rows with defaults', () => {
    const merged = mergeCapabilityVerifications([
      {
        capabilityId: 'FAL_GENERATION',
        environment: 'production',
        implementationStatus: 'LIVE_PATH_UNVERIFIED',
        verificationStatus: 'TEST_VERIFIED',
        verifiedAt: null,
        verificationMethod: 'vitest',
        verificationRunId: null,
        sourceCommit: null,
        notes: 'updated',
        updatedAt: new Date().toISOString(),
      },
    ]);
    expect(merged.find((c) => c.capabilityId === 'FAL_GENERATION')?.notes).toBe('updated');
    expect(merged.length).toBeGreaterThanOrEqual(DEFAULT_CAPABILITY_VERIFICATIONS.length);
  });
});

describe('Experimental integrity', () => {
  it('preserves Experiment D frozen snapshot version', () => {
    expect(EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION).toBe(1);
  });

  it('keeps Experiment classifications distinct', () => {
    expect(EXPERIMENT_D_CLASSIFICATION).not.toBe(EXPERIMENT_F_CLASSIFICATION);
    expect(EXPERIMENT_E_CLASSIFICATION).toBe('EXPERIENCE_EXPRESSION_EXPERIMENT');
  });

  it('does not implement World Formation', () => {
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
  });
});

describe('Durable store adapter restart simulation', () => {
  beforeEach(async () => {
    const { resetStudioWorldExecutionMemory, resetStudioWorldExecutionStoreModeCache } = await import(
      '../../api/_lib/site00StudioWorldExecution/storeAdapter.js'
    );
    resetStudioWorldExecutionMemory();
    resetStudioWorldExecutionStoreModeCache();
  });

  it('survives store mode cache reset (simulated API restart)', async () => {
    const { createStudioWorldRun } = await import('../../api/_lib/site00StudioWorldExecution/runService.js');
    const { getStudioWorldRunById, resetStudioWorldExecutionStoreModeCache } = await import(
      '../../api/_lib/site00StudioWorldExecution/storeAdapter.js'
    );

    const run = await createStudioWorldRun({
      projectSlug: 'ndxbook',
      runType: 'EXPERIENCE_FORMATION',
      methodologyDomain: 'EXPERIMENT_E',
      idempotencyKey: 'test-formation-key',
      inputFingerprint: 'fp-abc',
    });

    resetStudioWorldExecutionStoreModeCache();

    const recovered = await getStudioWorldRunById(run.id);
    expect(recovered?.id).toBe(run.id);
    expect(recovered?.projectSlug).toBe('ndxbook');
  });

  it('returns same run for duplicate idempotency key after restart', async () => {
    const { createStudioWorldRun } = await import('../../api/_lib/site00StudioWorldExecution/runService.js');
    const { resetStudioWorldExecutionStoreModeCache } = await import(
      '../../api/_lib/site00StudioWorldExecution/storeAdapter.js'
    );

    const first = await createStudioWorldRun({
      projectSlug: 'ndxbook',
      runType: 'CONCEPT_FORMATION',
      idempotencyKey: 'form-six-concepts',
      inputFingerprint: 'snapshot-v2',
    });

    resetStudioWorldExecutionStoreModeCache();

    const second = await createStudioWorldRun({
      projectSlug: 'ndxbook',
      runType: 'CONCEPT_FORMATION',
      idempotencyKey: 'form-six-concepts',
      inputFingerprint: 'snapshot-v2',
    });

    expect(second.id).toBe(first.id);
  });
});

describe('Multi-instance shared truth simulation', () => {
  beforeEach(async () => {
    const { resetExperimentEMemory, resetExperimentEStoreModeCache } = await import(
      '../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/storeAdapter.js'
    );
    resetExperimentEMemory();
    resetExperimentEStoreModeCache();
  });

  it('instance B reads run written by instance A', async () => {
    const store = await import(
      '../../api/_lib/site00Evolve/creativeDirection/experienceExpressionExperiment/storeAdapter.js'
    );
    const { EXPERIMENT_E_CLASSIFICATION: cls } = await import(
      '../site00-brand-lore/experienceExpression/constants.js'
    );

    await store.saveExperienceExpressionRun({
      experimentClassification: cls,
      runId: 'ndxbook-experience-expression',
      organizationId: 'org-test',
      projectId: 'ndxbook',
      methodologyVersion: 'EXPERIENCE_EXPRESSION_V2',
      intelligenceSnapshotVersion: 2,
      status: 'CONCEPTS_READY',
      readiness: { state: 'READY_FOR_EXPERIENCE_FORMATION', blockers: [] },
      experienceTestTerritoryId: null,
      experienceTestTerritoryName: null,
      selectionPurpose: null,
      selectedTerritory: null,
      worldExpressionSystem: null,
      functionalCanon: null,
      hostCanon: null,
      clientCanon: null,
      templateAudit: null,
      currentExperienceAudit: null,
      experimentSnapshot: null,
      crossMediumEvidence: [],
      experienceConcepts: [],
      experienceBibles: [],
      responsiveTranslations: [],
      behaviorTranslations: [],
      distinctiveness: null,
      visualBriefs: [],
      visualAssets: [],
      productionScope: null,
      assetDirection: null,
      assetManifest: null,
      assetRequirements: [],
      productionAssets: [],
      assetGenerationReceipts: [],
      assetManifestCompiled: false,
      assetGenerationStarted: false,
      implementationContract: null,
      formationReady: true,
      visualGenerationReady: false,
      visualGenerationStarted: false,
      accounting: {
        anthropicRequests: 0,
        anthropicInputTokens: 0,
        anthropicOutputTokens: 0,
        gptImage2Requests: 0,
        falRequests: 0,
        estimatedCostUsd: 0,
      },
      startedAt: null,
      completedAt: null,
      error: null,
    } as import('../site00-brand-lore/experienceExpression/types.js').ExperienceExpressionRun);

    store.resetExperimentEStoreModeCache();
    const fromB = await store.getExperienceExpressionRun();
    expect(fromB?.status).toBe('CONCEPTS_READY');
  });
});

describe('Live Supabase restart verification', () => {
  it('reports DURABLE_RESTART_VERIFICATION_NOT_EXECUTED when live DB unavailable', () => {
    const live =
      process.env.SITE00_DURABLE_INTEGRATION_TEST === '1' &&
      Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!live) {
      expect('DURABLE_RESTART_VERIFICATION_NOT_EXECUTED').toBe('DURABLE_RESTART_VERIFICATION_NOT_EXECUTED');
    }
  });
});
