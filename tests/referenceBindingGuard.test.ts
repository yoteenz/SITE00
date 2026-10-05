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
        visualId: 'F04.ENV',
        projectId: 'JURNL',
        familyId: 'F04',
        providerProjectId: 'KUfyzoatdwpaYBkq2Mf8',
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

  it('a family with no expression brief cannot start paid generation', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F17.00',
        projectId: 'JURNL',
        familyId: 'F17',
        generationClass: 'SCREEN_PARENT',
        generationIntent: 'NEW_AUTHORITY_REQUIRED',
        generationMode: 'TEXT_TO_IMAGE_NET_NEW',
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('FAMILY_EXPRESSION_BRIEF_REQUIRED');
    expect(pre.creditsSpent).toBe(0);
    expect(pre.dispatchAllowed).toBe(false);
  });

  it('JURNL text-to-image is forbidden once the parent brief exists', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F05.00',
        projectId: 'JURNL',
        familyId: 'F05',
        providerProjectId: 'ga30cJVwkccjlXta8io5',
        generationClass: 'SCREEN_PARENT',
        generationIntent: 'NEW_AUTHORITY_REQUIRED',
        generationMode: 'TEXT_TO_IMAGE_NET_NEW',
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('INVALID_GENERATION_MODE');
    expect(pre.creditsSpent).toBe(0);
    expect(pre.dispatchAllowed).toBe(false);
  });

  it('expression brief is required before a new family can reach the project gate', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F17.00',
        projectId: 'JURNL',
        familyId: 'F17',
        generationClass: 'NET_NEW_AUTHORITY',
        generationIntent: 'NEW_AUTHORITY_REQUIRED',
        generationMode: 'TEXT_TO_IMAGE_NET_NEW',
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('FAMILY_EXPRESSION_BRIEF_REQUIRED');
    expect(pre.dispatchAllowed).toBe(false);
  });

  it('classifies today and activity below the family', () => {
    const today = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'JURNL/F03_TODAY/MANIFEST/F03_EXPRESSION_TREE.json'), 'utf8'));
    const activity = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'JURNL/F04_ACTIVITY/MANIFEST/F04_EXPRESSION_TREE.json'), 'utf8'));
    const byId = (tree: { nodes: { node_id: string; expression_class: string; expression_concept?: string; environment_policy: string }[] }, id: string) =>
      tree.nodes.find((node) => node.node_id === id);
    expect(byId(today, 'F03.00')?.expression_concept).toMatch(/salon/i);
    expect(byId(today, 'F03.SEE_WHY')?.expression_class).toBe('MODULATED_INHERITANCE');
    expect(byId(today, 'F03.SEE_WHY')?.environment_policy).not.toBe('NEW_PLATE_WITHIN_FAMILY');
    expect(byId(today, 'F03.UPCOMING_DETAIL')?.expression_class).toBe('MODULATED_INHERITANCE');
    expect(byId(activity, 'F04.SEARCH')?.expression_class).toBe('MODULATED_INHERITANCE');
    expect(byId(activity, 'F04.DETAIL')?.expression_class).toBe('DISTINCT_SUB_EXPRESSION');
    expect(byId(activity, 'F04.DETAIL')?.environment_policy).toBe('NO_PLATE_REQUIRED');
    expect(byId(activity, 'F04.ST.NO_RESULTS')?.expression_concept).toMatch(/archive/i);
    expect(today.repetition_audit.status).toBe('PASS');
  });

  it('a ready brief without an expression tree cannot generate', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'expr-tree-'));
    const briefRel = 'JURNL/F99_TMP/MANIFEST/F99_FAMILY_EXPRESSION_BRIEF.json';
    const brief = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'JURNL/F04_ACTIVITY/MANIFEST/F04_FAMILY_EXPRESSION_BRIEF.json'), 'utf8'));
    brief.family_id = 'F99';
    fs.mkdirSync(path.join(tmp, 'JURNL/F99_TMP/MANIFEST'), { recursive: true });
    fs.mkdirSync(path.join(tmp, 'JURNL/MANIFEST'), { recursive: true });
    fs.writeFileSync(path.join(tmp, briefRel), JSON.stringify(brief));
    fs.writeFileSync(path.join(tmp, briefRel.replace(/\.json$/, '.md')), '# F99\n');
    fs.writeFileSync(
      path.join(tmp, 'JURNL/MANIFEST/JURNL_FAMILY_EXPRESSION_MATRIX.json'),
      JSON.stringify({ families: { F99: { brief_json: briefRel } } }),
    );
    fs.writeFileSync(path.join(tmp, 'JURNL/MANIFEST/JURNL_EXPRESSION_MATRIX.json'), JSON.stringify({ families: {} }));
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F99.00',
        projectId: 'JURNL',
        familyId: 'F99',
        generationClass: 'SCREEN_PARENT',
        generationIntent: 'NEW_AUTHORITY_REQUIRED',
        generationMode: 'TEXT_TO_IMAGE_NET_NEW',
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: { repoRoot: tmp } },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('HIERARCHICAL_EXPRESSION_REQUIRED');
    expect(pre.creditsSpent).toBe(0);
    expect(pre.dispatchAllowed).toBe(false);
  });

  it('a JURNL environment plate without a full page source is blocked', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F03.ENV',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        screenId: 'F03.00',
        generationClass: 'ENVIRONMENT_PLATE',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        referenceAuthorityIdHint: 'F03.00_TODAY_PARENT',
        referenceInputAttached: true,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('AUTHORITY_FIRST_REQUIRED');
    expect(pre.creditsSpent).toBe(0);
  });

  it('a plate derived from the arrival-copy F03 page is blocked', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F03.ENV',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        screenId: 'F03.00',
        generationClass: 'ENVIRONMENT_PLATE',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        derivationSourceType: 'FULL_PAGE',
        referenceAuthorityIdHint: 'F03.00_TODAY_PARENT',
        referenceInputAttached: true,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.blockedReason).toBe('AUTHORITY_FIRST_REQUIRED');
    expect(pre.creditsSpent).toBe(0);
  });

  it('a plate derived from the passing F03 full page is allowed', () => {
    const pre = precheckGenerationDispatch(
      {
        visualId: 'F03.ENV',
        projectId: 'JURNL',
        familyId: 'F03',
        providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
        screenId: 'F03.00',
        generationClass: 'ENVIRONMENT_PLATE',
        generationIntent: 'DERIVED',
        generationMode: 'REFERENCE_GUIDED',
        derivationSourceType: 'FULL_PAGE',
        referenceAuthorityIdHint: 'F03.00_TODAY_AUTHORITY_FIRST',
        referenceInputAttached: true,
        provider: 'OpenArt',
        model: 'gpt-image-2-5-sunburst',
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('PASS');
    expect(pre.generationMode).toBe('REFERENCE_GUIDED');
    expect(pre.referenceAttached).toBe(true);
    expect(pre.creditsSpent).toBe(0);
  });
});
