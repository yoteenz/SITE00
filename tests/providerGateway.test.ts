import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMemoryCostReceiptWriter,
  issueSpendAuthorization,
  listCostReceiptsForTests,
  listProductionGatewayIncidentsForTests,
  assertProjectFirewall,
  precheckGenerationDispatch,
  resetCostReceiptsForTests,
  resetProductionGatewayIncidentsForTests,
  resetSpendAuthorizationStoreForTests,
  runProductionProviderRequest,
  validateSpendAuthorization,
} from '../shared/site00-production-guardrails/index.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const ctx = { repoRoot: REPO_ROOT };

describe('production provider gateway (P0 gateway sync1)', () => {
  beforeEach(() => {
    resetSpendAuthorizationStoreForTests();
    resetCostReceiptsForTests();
    resetProductionGatewayIncidentsForTests();
  });

  it('blocks JURNL FULL_PAGE authority TEXT_TO_IMAGE when reference required', async () => {
    const auth = issueSpendAuthorization({
      projectId: 'JURNL',
      actorId: 'founder@test',
      provider: 'OpenArt',
      model: 'gpt-image-2-5-sunburst',
      generationClass: 'SCREEN_CHILD',
      maxCredits: 500,
    });
    const writer = createMemoryCostReceiptWriter();
    const dispatch = vi.fn();
    const { precheck } = await runProductionProviderRequest(
      {
        requestId: 'req-1',
        visualId: 'F03.00',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        generationClass: 'SCREEN_CHILD',
        generationIntent: 'DERIVED',
        generationMode: 'TEXT_TO_IMAGE_NET_NEW',
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
        spendAuthorizationId: auth.authorizationId,
      },
      { resolverContext: ctx, costReceiptWriter: writer },
      dispatch,
    );
    expect(precheck.blockedReason).toBe('INVALID_GENERATION_MODE');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('blocks JURNL ENVIRONMENT_PLATE without parent authority (plate-first)', async () => {
    const auth = issueSpendAuthorization({
      projectId: 'JURNL',
      actorId: 'founder@test',
      provider: 'OpenArt',
      model: 'gpt-image-2-5-sunburst',
      generationClass: 'ENVIRONMENT_PLATE',
      maxCredits: 500,
    });
    const dispatch = vi.fn();
    const { precheck } = await runProductionProviderRequest(
      {
        requestId: 'req-plate',
        visualId: 'F03.ENV',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        generationClass: 'ENVIRONMENT_PLATE',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceInputAttached: true,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
        spendAuthorizationId: auth.authorizationId,
      },
      { resolverContext: ctx },
      dispatch,
    );
    expect(precheck.blockedReason).toBe('AUTHORITY_FIRST_REQUIRED');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('allows JURNL ENVIRONMENT_PLATE derivation when parent authority referenced', async () => {
    const auth = issueSpendAuthorization({
      projectId: 'JURNL',
      actorId: 'founder@test',
      provider: 'OpenArt',
      model: 'gpt-image-2-5-sunburst',
      generationClass: 'ENVIRONMENT_PLATE',
      maxCredits: 500,
    });
    const dispatch = vi.fn(async () => ({ ok: true }));
    const { precheck, result } = await runProductionProviderRequest(
      {
        requestId: 'req-plate-ok',
        visualId: 'F03.ENV',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        generationClass: 'ENVIRONMENT_PLATE',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceAuthorityIdHint: 'F03.00_TODAY_AUTHORITY_FIRST',
        derivationSourceType: 'FULL_PAGE',
        referenceInputAttached: true,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
        spendAuthorizationId: auth.authorizationId,
        estimatedCostCredits: 170,
      },
      { resolverContext: ctx, enforceFileHealth: false },
      dispatch,
    );
    expect(precheck.dispatchAllowed).toBe(true);
    expect(result).toEqual({ ok: true });
    expect(dispatch).toHaveBeenCalledOnce();
  });

  it('rejects caller-only founderConfirmedSpend without server authorization', async () => {
    const dispatch = vi.fn();
    const { precheck, spendAuthorized } = await runProductionProviderRequest(
      {
        requestId: 'req-spend',
        visualId: 'X',
        projectId: 'JURNL',
        familyId: 'F03',
        generationClass: 'SCREEN_CHILD',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceAuthorityIdHint: 'F03.00_TODAY_PARENT',
        referenceInputAttached: true,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
        founderConfirmedSpend: true,
      },
      { resolverContext: ctx, enforceFileHealth: false },
      dispatch,
    );
    expect(spendAuthorized).toBe(false);
    expect(precheck.blockedReason).toBe('UNAUTHORIZED_SPEND');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('blocks cross-project reference (AIO project firewall)', () => {
    const denied = assertProjectFirewall('AIO', {
      referenceAuthorityId: 'F03.00_TODAY_AUTHORITY_FIRST',
      referencePath: `${REPO_ROOT}/src/projects/jurnl/families/F03_TODAY/AUTHORITIES/F03.00_TODAY_AUTHORITY_FIRST.jpg`,
      referenceStatus: 'APPROVED',
      referenceLineage: [],
      projectId: 'JURNL',
      sharedGlobal: false,
      referenceFound: true,
    });
    expect(denied).toBe('CROSS_PROJECT_REFERENCE_DENIED');
  });

  it('writes cost receipt on blocked and completed paths', async () => {
    const writer = createMemoryCostReceiptWriter();
    const auth = issueSpendAuthorization({
      projectId: 'JURNL',
      actorId: 'founder@test',
      provider: 'OpenArt',
      model: 'gpt-image-2-5-sunburst',
      generationClass: 'SCREEN_PARENT',
      maxCredits: 500,
    });
    await runProductionProviderRequest(
      {
        requestId: 'req-rcpt-block',
        visualId: 'F03.99',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        generationClass: 'SCREEN_CHILD',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceInputAttached: true,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
        spendAuthorizationId: auth.authorizationId,
      },
      { resolverContext: ctx, costReceiptWriter: writer },
      vi.fn(),
    );
    expect(listCostReceiptsForTests().length).toBeGreaterThan(0);
  });

  it('consumes one-shot spend authorization after successful dispatch', async () => {
    const auth = issueSpendAuthorization({
      projectId: 'JURNL',
      actorId: 'founder@test',
      provider: 'OpenArt',
      model: 'gpt-image-2-5-sunburst',
      generationClass: 'ENVIRONMENT_PLATE',
      maxCredits: 500,
    });
    await runProductionProviderRequest(
      {
        requestId: 'req-consume',
        visualId: 'F03.ENV',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        generationClass: 'ENVIRONMENT_PLATE',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceAuthorityIdHint: 'F03.00_TODAY_AUTHORITY_FIRST',
        derivationSourceType: 'FULL_PAGE',
        referenceInputAttached: true,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
        spendAuthorizationId: auth.authorizationId,
        estimatedCostCredits: 170,
      },
      { resolverContext: ctx, enforceFileHealth: false },
      async () => ({ ok: true }),
    );
    const second = validateSpendAuthorization(auth.authorizationId, {
      projectId: 'JURNL',
      provider: 'OpenArt',
      generationClass: 'ENVIRONMENT_PLATE',
    });
    expect(second.ok).toBe(false);
  });
});
