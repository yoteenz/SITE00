import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  aggregateLedgerMetrics,
  assertProjectFirewall,
  precheckGenerationDispatch,
  runPrecheckedProviderDispatch,
  validateGenerationReferenceBinding,
} from '../shared/site00-production-guardrails/index.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const F03_PARENT = 'src/projects/jurnl/families/F03_TODAY/AUTHORITIES/F03.00_TODAY_PARENT.jpg';

const ctx = { repoRoot: REPO_ROOT };

describe('reference binding guard (P0 reference-binding-cost-guard1)', () => {
  it('REFERENCE REQUIRED + FOUND + ATTACHED → PASS', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F03.00',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        screenId: 'F03.00',
        generationClass: 'SCREEN_PARENT',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceAuthorityIdHint: 'F03.00_TODAY_PARENT',
        referenceInputAttached: true,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('PASS');
    expect(pre.dispatchAllowed).toBe(true);
    expect(pre.referenceRequired).toBe(true);
    expect(pre.referenceFound).toBe(true);
    expect(pre.referenceAttached).toBe(true);
  });

  it('REFERENCE REQUIRED + MISSING → BLOCK', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F03.99',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        screenId: 'F03.99',
        generationClass: 'SCREEN_CHILD',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceInputAttached: true,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('REFERENCE_MISSING');
    expect(pre.creditsSpent).toBe(0);
  });

  it('REFERENCE REQUIRED + FOUND BUT NOT ATTACHED → BLOCK', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F03.00',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        generationClass: 'ENVIRONMENT_PLATE',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceAuthorityIdHint: 'F03.00_TODAY_PARENT',
        referenceInputAttached: false,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('REFERENCE_BINDING_FAILURE_PREVENTED');
  });

  it('REFERENCE REQUIRED + TEXT_TO_IMAGE_NET_NEW → BLOCK', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F03.00',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        generationClass: 'SCREEN_CHILD',
        generationIntent: 'DERIVED',
        generationMode: 'TEXT_TO_IMAGE_NET_NEW',
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('INVALID_GENERATION_MODE');
  });

  it('NO REFERENCE + NEW_AUTHORITY + TEXT_TO_IMAGE on empty project → PASS', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'AIO.00',
        projectId: 'AIO',
        familyId: 'F01',
        generationClass: 'NET_NEW_AUTHORITY',
        generationIntent: 'NEW_AUTHORITY_REQUIRED',
        generationMode: 'TEXT_TO_IMAGE_NET_NEW',
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('PASS');
    expect(pre.referenceRequired).toBe(false);
  });

  it('CROSS-PROJECT REFERENCE → BLOCK (firewall)', () => {
    const denied = assertProjectFirewall('JURNL', {
      referenceAuthorityId: 'AIO.HERO',
      referencePath: '/tmp/x.jpg',
      referenceStatus: 'APPROVED',
      referenceLineage: [],
      projectId: 'AIO',
      sharedGlobal: false,
      referenceFound: true,
    });
    expect(denied).toBe('CROSS_PROJECT_REFERENCE_DENIED');
  });

  it('BROKEN REFERENCE FILE → BLOCK', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ref-bind-'));
    const empty = path.join(tmp, 'empty.jpg');
    fs.writeFileSync(empty, '');
    const validation = validateGenerationReferenceBinding(
      {
        visualId: 'tmp',
        projectId: 'TESTPROJ',
        familyId: 'F01',
        generationClass: 'SCREEN_PARENT',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceInputAttached: true,
        referenceAuthorityIdHint: 'TEST.BROKEN_REF',
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      {
        resolverContext: {
          repoRoot: tmp,
          extraRegistry: [
            {
              authorityId: 'TEST.BROKEN_REF',
              projectId: 'TESTPROJ',
              status: 'CANONICAL',
              paths: [empty],
            },
          ],
        },
        enforceFileHealth: true,
      },
    );
    expect(validation.status).toBe('BLOCKED');
    expect(validation.blockedReason).toBe('REFERENCE_FILE_CORRUPT');
  });

  it('PROVIDER REFERENCE UNSUPPORTED → BLOCK', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F03.00',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        generationClass: 'SCREEN_PARENT',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceAuthorityIdHint: 'F03.00_TODAY_PARENT',
        referenceInputAttached: true,
        provider: 'UnknownVendor',
        model: 'text-only-model',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('PROVIDER_REFERENCE_UNSUPPORTED');
  });

  it('NO SILENT FALLBACK — dispatch wrapper skips provider on BLOCK', async () => {
    let dispatched = false;
    const { precheck, result } = await runPrecheckedProviderDispatch(
      {
        visualId: 'F03.00',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        generationClass: 'SCREEN_CHILD',
        generationIntent: 'DERIVED',
        generationMode: 'TEXT_TO_IMAGE_NET_NEW',
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
      async () => {
        dispatched = true;
        return 'would-spend-credits';
      },
    );
    expect(precheck.dispatchAllowed).toBe(false);
    expect(dispatched).toBe(false);
    expect(result).toBeUndefined();
  });

  it('SUPERSEDED not preferred when canonical F03 parent exists on disk', () => {
    expect(fs.existsSync(path.join(REPO_ROOT, F03_PARENT))).toBe(true);
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F03.00',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        generationClass: 'SCREEN_PARENT',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceAuthorityIdHint: 'F03.00_TODAY_PARENT',
        referenceInputAttached: true,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.referenceAuthorityId).toBe('F03.00_TODAY_PARENT');
    expect(pre.referenceStatus).not.toBe('SUPERSEDED');
  });

  it('ledger metrics classify F03 postmortem text2image rows', () => {
    const metrics = aggregateLedgerMetrics([
      {
        mode: 'text2image',
        credits_spent: 315,
        reference_required: true,
        qa_status: 'SUPERSEDED',
        dispatch_status: 'INVALID_GENERATION_POSTMORTEM',
        failure_class: 'REFERENCE_BINDING_FAILURE',
      },
      {
        mode: 'image2image',
        credits_spent: 317,
        reference_required: true,
        reference_found: true,
        reference_input_attached: true,
        dispatch_status: 'DISPATCHED',
      },
    ]);
    expect(metrics.invalidGenerationsPostmortem).toBe(1);
    expect(metrics.referenceGuidedGenerations).toBe(1);
    expect(metrics.invalidGenerationCredits).toBe(315);
  });

  it('F03 job aimed at the F02 project → BLOCK', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F03.00',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'rVShOWFblztGdIxRYHmL',
        generationClass: 'SCREEN_PARENT',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceInputAttached: true,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('FAMILY_PROJECT_MISMATCH');
    expect(pre.creditsSpent).toBe(0);
  });

  it('cross-family environment plate without a reason → BLOCK', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F05.ENV',
        projectId: 'JURNL',
        familyId: 'F05',
        providerProjectId: 'not-a-real-project',
        generationClass: 'ENVIRONMENT_PLATE',
        generationIntent: 'NEW_ASSET_REQUIRED',
        generationMode: 'REFERENCE_GUIDED',
        referenceInputAttached: true,
        sourcePlateFamilyId: 'F03',
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('CROSS_FAMILY_PLATE_REUSE_UNJUSTIFIED');
    expect(pre.creditsSpent).toBe(0);
    expect(pre.dispatchAllowed).toBe(false);
  });

  it('cross-family environment plate with a written reason is not blocked for reuse', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F05.ENV',
        projectId: 'JURNL',
        familyId: 'F05_MONEY',
        generationClass: 'ENVIRONMENT_PLATE',
        generationIntent: 'NEW_ASSET_REQUIRED',
        generationMode: 'TEXT_TO_IMAGE_NET_NEW',
        sourcePlateFamilyId: 'F03',
        crossFamilyReuseJustification: 'Budget constraint. The families stay distinguishable.',
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.blockedReason).not.toBe('CROSS_FAMILY_PLATE_REUSE_UNJUSTIFIED');
    expect(pre.blockedReason).toBe('FAMILY_PROJECT_REQUIRED');
    expect(pre.creditsSpent).toBe(0);
  });

  it('new JURNL family with no project yet → BLOCK', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F05.00',
        projectId: 'JURNL',
        familyId: 'F05',
        generationClass: 'NET_NEW_AUTHORITY',
        generationIntent: 'NEW_AUTHORITY_REQUIRED',
        generationMode: 'TEXT_TO_IMAGE_NET_NEW',
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('FAMILY_PROJECT_REQUIRED');
    expect(pre.dispatchAllowed).toBe(false);
  });
});
