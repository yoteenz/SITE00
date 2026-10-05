import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dispatchJurnlProductionRequest,
  registerJurnlManualProviderOutput,
  resetJurnlIdempotencyForTests,
} from '../shared/site00-jurnl-production/index.js';
import {
  issueSpendAuthorization,
  resetSpendAuthorizationStoreForTests,
} from '../shared/site00-production-guardrails/index.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const F03_STRUCTURE = path.join(
  REPO_ROOT,
  'src/projects/jurnl/families/F03_TODAY/REFERENCES/F03.00_LIVE_STRUCTURE.jpg',
);

function authFor(className: 'SCREEN_PARENT' | 'ENVIRONMENT_PLATE', max = 800) {
  return issueSpendAuthorization({
    projectId: 'JURNL',
    actorId: 'founder@test',
    provider: 'OpenArt',
    model: 'gpt-image-2-5-sunburst',
    generationClass: className,
    maxCredits: max,
  }).authorizationId;
}

describe('JURNL gateway live callsite migration', () => {
  beforeEach(() => {
    resetSpendAuthorizationStoreForTests();
    resetJurnlIdempotencyForTests();
  });

  it('F03 FULL_PAGE authority dry-run passes with reference + occupancy + spend', async () => {
    const dispatch = vi.fn();
    const result = await dispatchJurnlProductionRequest(REPO_ROOT, {
      requestId: 'f03-full-page-dry',
      familyId: 'F03',
      visualId: 'F03.00',
      screenId: 'F03.00',
      role: 'FULL_PAGE_AUTHORITY',
      generationIntent: 'DERIVED',
      generationMode: 'REFERENCE_GUIDED',
      referenceAuthorityIdHint: 'F03.00_LIVE_STRUCTURE',
      referenceAbsolutePath: F03_STRUCTURE,
      spendAuthorizationId: authFor('SCREEN_PARENT'),
      requestedBy: 'founder@test',
      purpose: 'F03_CORRECTION',
      estimatedCostCredits: 316,
      canonicalFinal: false,
      dryRun: true,
    });
    expect(result.precheck.dispatchAllowed).toBe(true);
    expect(result.result?.mode).toBe('DRY_RUN');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('F03 TEXT_TO_IMAGE with required reference is blocked', async () => {
    const result = await dispatchJurnlProductionRequest(REPO_ROOT, {
      requestId: 'f03-t2i-block',
      familyId: 'F03',
      visualId: 'F03.00',
      role: 'FULL_PAGE_AUTHORITY',
      generationIntent: 'DERIVED',
      generationMode: 'TEXT_TO_IMAGE_NET_NEW',
      referenceAuthorityIdHint: 'F03.00_LIVE_STRUCTURE',
      referenceAbsolutePath: F03_STRUCTURE,
      spendAuthorizationId: authFor('SCREEN_PARENT'),
      requestedBy: 'founder@test',
      dryRun: true,
    });
    expect(result.precheck.dispatchAllowed).toBe(false);
    expect(result.precheck.blockedReason).toBe('INVALID_GENERATION_MODE');
  });

  it('F03 ENVIRONMENT_PLATE without parent authority is blocked', async () => {
    const result = await dispatchJurnlProductionRequest(REPO_ROOT, {
      requestId: 'f03-plate-no-parent',
      familyId: 'F03',
      visualId: 'F03.ENV',
      role: 'ENVIRONMENT_PLATE_DERIVATION',
      generationIntent: 'DERIVED',
      generationMode: 'REFERENCE_GUIDED',
      spendAuthorizationId: authFor('ENVIRONMENT_PLATE'),
      requestedBy: 'founder@test',
      dryRun: true,
    });
    expect(result.precheck.dispatchAllowed).toBe(false);
    expect(result.precheck.blockedReason).toBe('AUTHORITY_FIRST_REQUIRED');
  });

  it('F03 ENVIRONMENT_PLATE with valid full-page authority precheck passes (dry-run)', async () => {
    const result = await dispatchJurnlProductionRequest(REPO_ROOT, {
      requestId: 'f03-plate-ok',
      familyId: 'F03',
      visualId: 'F03.ENV',
      role: 'ENVIRONMENT_PLATE_DERIVATION',
      generationIntent: 'DERIVED',
      generationMode: 'REFERENCE_GUIDED',
      referenceAuthorityIdHint: 'F03.00_TODAY_AUTHORITY_FIRST',
      referenceAbsolutePath: path.join(
        REPO_ROOT,
        'src/projects/jurnl/families/F03_TODAY/AUTHORITIES/F03.00_TODAY_AUTHORITY_FIRST.jpg',
      ),
      derivationSourceType: 'FULL_PAGE',
      spendAuthorizationId: authFor('ENVIRONMENT_PLATE'),
      requestedBy: 'founder@test',
      canonicalFinal: false,
      dryRun: true,
    });
    expect(result.precheck.dispatchAllowed).toBe(true);
  });

  it('F05 parent dry-run requires expression brief + tree (precheck pass, no provider)', async () => {
    const result = await dispatchJurnlProductionRequest(REPO_ROOT, {
      requestId: 'f05-parent-dry',
      familyId: 'F05',
      visualId: 'F05.00',
      screenId: 'F05.00',
      role: 'FULL_PAGE_AUTHORITY',
      generationIntent: 'NEW_AUTHORITY_REQUIRED',
      generationMode: 'REFERENCE_GUIDED',
      referenceAuthorityIdHint: 'F03.00_LIVE_STRUCTURE',
      referenceAbsolutePath: F03_STRUCTURE,
      spendAuthorizationId: authFor('SCREEN_PARENT', 400),
      requestedBy: 'founder@test',
      estimatedCostCredits: 315,
      dryRun: true,
    });
    expect(result.precheck.dispatchAllowed).toBe(true);
    expect(result.result?.openArtProjectId).toBeTruthy();
  });

  it('rejects caller-only spend (no authorization id)', async () => {
    const result = await dispatchJurnlProductionRequest(REPO_ROOT, {
      requestId: 'no-auth',
      familyId: 'F05',
      visualId: 'F05.00',
      role: 'FULL_PAGE_AUTHORITY',
      generationIntent: 'NEW_AUTHORITY_REQUIRED',
      generationMode: 'TEXT_TO_IMAGE_NET_NEW',
      spendAuthorizationId: '',
      requestedBy: 'founder@test',
      dryRun: true,
    });
    expect(result.precheck.dispatchAllowed).toBe(false);
  });

  it('idempotency prevents duplicate dispatch', async () => {
    const key = 'idem-f05-once';
    const base = {
      requestId: 'f05-idem-1',
      familyId: 'F05',
      visualId: 'F05.00',
      role: 'FULL_PAGE_AUTHORITY' as const,
      generationIntent: 'NEW_AUTHORITY_REQUIRED' as const,
      generationMode: 'TEXT_TO_IMAGE_NET_NEW' as const,
      spendAuthorizationId: authFor('SCREEN_PARENT'),
      requestedBy: 'founder@test',
      dryRun: true,
      idempotencyKey: key,
    };
    await dispatchJurnlProductionRequest(REPO_ROOT, base);
    const second = await dispatchJurnlProductionRequest(REPO_ROOT, { ...base, requestId: 'f05-idem-2' });
    expect(second.precheck.dispatchAllowed).toBe(false);
  });

  it('manual registration runs precheck — plate without authority blocked', async () => {
    const out = await registerJurnlManualProviderOutput(REPO_ROOT, {
      requestId: 'manual-plate',
      familyId: 'F03',
      visualId: 'F03.ENV',
      role: 'ENVIRONMENT_PLATE_DERIVATION',
      generationMode: 'REFERENCE_GUIDED',
      outputAbsolutePath: F03_STRUCTURE,
    });
    expect(out.status).toBe('BLOCKED');
  });
});
