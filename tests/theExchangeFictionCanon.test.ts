/**
 * P0 THE EXCHANGE — fiction canon registration, ingestion, Opus adapter (dry-run).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetFictionCanonMemoryStoreForTests } from '../shared/site00-fiction-canon/memoryStore.js';
import {
  getCapabilitiesForSlug,
  hasProjectCapability,
  THE_EXCHANGE_CAPABILITIES,
} from '../shared/site00-projects/capabilities.js';
import { isFictionOpusExecutionAuthorized } from '../shared/site00-fiction-canon/opusModel.js';
import { FICTION_EVALUATION_OUTPUT_SECTIONS } from '../shared/site00-fiction-canon/types.js';

const TEST_PROPERTY_ID = '00000000-0000-4000-8000-000000000001';

vi.mock('../api/_lib/site00Projects/founderProjectDbId.js', () => ({
  ensureFounderProjectDbId: vi.fn(async () => TEST_PROPERTY_ID),
  resolveFounderProjectDbId: vi.fn(async () => TEST_PROPERTY_ID),
  isFounderProjectSlug: (slug: string) => slug === 'the-exchange',
  isUuid: (v: string) => /^[0-9a-f-]{36}$/i.test(v),
}));

describe('THE EXCHANGE fiction canon', () => {
  beforeEach(() => {
    resetFictionCanonMemoryStoreForTests();
    delete process.env.SITE00_FICTION_OPUS_EXECUTION_AUTHORIZED;
  });

  it('registers isolated project capabilities without NDXBOOK methodology', () => {
    const caps = getCapabilitiesForSlug('the-exchange');
    expect(caps).toEqual(expect.arrayContaining([...THE_EXCHANGE_CAPABILITIES]));
    expect(hasProjectCapability('the-exchange', 'FICTION_CANON')).toBe(true);
    expect(hasProjectCapability('the-exchange', 'FICTION_OPUS_EVALUATION')).toBe(true);
    expect(hasProjectCapability('the-exchange', 'PERSONALITY_REPLAY')).toBe(false);
    expect(hasProjectCapability('ndxbook', 'FICTION_CANON')).toBe(false);
  });

  it('registers property and orientation seed without inventing approved canon', async () => {
    const { registerTheExchangeProperty } = await import('../api/_lib/site00FictionCanon/propertyService.js');
    const property = await registerTheExchangeProperty({ importOrientationSeed: true });
    expect(property.slug).toBe('the-exchange');
    expect(property.displayName).toBe('THE EXCHANGE');
    expect(property.metadata).toMatchObject({
      isolatedFrom: expect.arrayContaining(['ndxbook', 'expression-entry-002']),
    });

    const { listFictionDocuments } = await import('../api/_lib/site00FictionCanon/fictionCanonStore.js');
    const docs = await listFictionDocuments(property.id);
    expect(docs.length).toBeGreaterThan(0);
    expect(docs.some((d) => d.canonStatus === 'APPROVED_CANON')).toBe(false);
    expect(docs.some((d) => d.documentType === 'VISUAL_IDENTITY_REFERENCE' && d.visualReferenceStatus === 'AWAITING_FOUNDER_ASSET')).toBe(
      true,
    );
  });

  it('isolates documents by property id', async () => {
    const { memorySaveProperty, memorySaveDocument } = await import('../shared/site00-fiction-canon/memoryStore.js');
    const { listFictionDocuments } = await import('../api/_lib/site00FictionCanon/fictionCanonStore.js');
    const now = new Date().toISOString();

    memorySaveProperty({
      id: 'prop-a',
      slug: 'the-exchange',
      displayName: 'THE EXCHANGE',
      propertyType: 'SERIALIZED_FICTION',
      ownership: 'FOUNDER_CONTROLLED',
      productionIntegration: 'FUTURE_NDXBOOK_REUSE',
      registeredAt: now,
      metadata: {},
    });
    memorySaveProperty({
      id: 'prop-b',
      slug: 'other-fiction',
      displayName: 'Other',
      propertyType: 'SERIALIZED_FICTION',
      ownership: 'FOUNDER_CONTROLLED',
      productionIntegration: 'FUTURE_NDXBOOK_REUSE',
      registeredAt: now,
      metadata: {},
    });

    memorySaveDocument({
      schemaVersion: '1.0.0',
      id: 'doc_a',
      propertyId: 'prop-a',
      propertySlug: 'the-exchange',
      documentType: 'SERIES_BIBLE',
      stableIdentifier: 'series-a',
      version: 1,
      title: 'A',
      content: { x: 1 },
      sourceProvenance: { sourceId: 't', sourceKind: 'FOUNDER_JSON', importedAt: now },
      canonStatus: 'WORKING_CONCEPT',
      approvalStatus: 'PENDING_REVIEW',
      supersededByDocumentId: null,
      supersedesDocumentId: null,
      characterReferences: [],
      worldReferences: [],
      sourceTextOriginal: null,
      contentHash: 'hash-a',
      knowledgeLayer: 'UNSPECIFIED',
      createdAt: now,
      updatedAt: now,
    });

    const exchangeDocs = await listFictionDocuments('prop-a');
    const otherDocs = await listFictionDocuments('prop-b');
    expect(exchangeDocs).toHaveLength(1);
    expect(otherDocs).toHaveLength(0);
  });

  it('blocks silent overwrite of approved canon', async () => {
    const { registerTheExchangeProperty } = await import('../api/_lib/site00FictionCanon/propertyService.js');
    const { ingestFictionCanonBatch } = await import('../api/_lib/site00FictionCanon/ingestService.js');
    const property = await registerTheExchangeProperty({ importOrientationSeed: false });

    const approved = await ingestFictionCanonBatch({
      propertySlug: 'the-exchange',
      imports: [
        {
          sourceId: 'founder-json-1',
          documentType: 'SERIES_BIBLE',
          stableIdentifier: 'series-the-exchange-core',
          format: 'json',
          payload: { title: 'Approved series bible' },
          canonStatus: 'APPROVED_CANON',
          approvalStatus: 'FOUNDER_APPROVED',
        },
      ],
    });
    expect(approved.ok).toBe(true);

    const blocked = await ingestFictionCanonBatch({
      propertySlug: 'the-exchange',
      imports: [
        {
          sourceId: 'founder-json-2',
          documentType: 'SERIES_BIBLE',
          stableIdentifier: 'series-the-exchange-core',
          format: 'json',
          payload: { title: 'Attempted overwrite' },
          canonStatus: 'WORKING_CONCEPT',
          approvalStatus: 'PENDING_REVIEW',
        },
      ],
    });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.blockedReason).toBe('APPROVED_CANON_PROTECTED');
  });

  it('skips duplicate hash imports', async () => {
    const { registerTheExchangeProperty } = await import('../api/_lib/site00FictionCanon/propertyService.js');
    const { ingestFictionCanonBatch } = await import('../api/_lib/site00FictionCanon/ingestService.js');
    await registerTheExchangeProperty({ importOrientationSeed: false });

    const item = {
      sourceId: 'dup',
      documentType: 'WORLD_BIBLE' as const,
      stableIdentifier: 'world-dup',
      format: 'markdown' as const,
      payload: '# World\nSame text.',
      canonStatus: 'WORKING_CONCEPT' as const,
      approvalStatus: 'PENDING_REVIEW' as const,
    };

    const first = await ingestFictionCanonBatch({ propertySlug: 'the-exchange', imports: [item] });
    const second = await ingestFictionCanonBatch({ propertySlug: 'the-exchange', imports: [item] });
    expect(first.ok).toBe(true);
    if (first.ok) expect(first.skipped).toHaveLength(0);
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.skipped.some((s) => s.includes('duplicate_hash'))).toBe(true);
  });

  it('reports ingestion awaiting founder source for seed-only package', async () => {
    const { registerTheExchangeProperty } = await import('../api/_lib/site00FictionCanon/propertyService.js');
    const { buildIngestionReadinessReport } = await import('../api/_lib/site00FictionCanon/readinessReport.js');
    await registerTheExchangeProperty({ importOrientationSeed: true });
    const report = await buildIngestionReadinessReport('the-exchange');
    expect(report.seedOnly).toBe(true);
    expect(report.overallStatus).toBe('AWAITING_FOUNDER_SOURCE');
    expect(report.documentsMissing).toContain('EPISODE_CONCEPT');
    expect(report.documentsMissing).toContain('CONTINUITY_LEDGER');
  });

  it('assembles Opus context after seed and dry-run evaluation without paid execution', async () => {
    const { registerTheExchangeProperty } = await import('../api/_lib/site00FictionCanon/propertyService.js');
    const { evaluateFictionPremise, validateEvaluationOutputStructure } = await import(
      '../api/_lib/site00FictionCanon/opusEvaluationAdapter.js'
    );

    await registerTheExchangeProperty({ importOrientationSeed: true });
    const evaluation = await evaluateFictionPremise({ propertySlug: 'the-exchange', execute: false });
    expect(evaluation.dryRun).toBe(true);
    expect(evaluation.executed).toBe(false);
    expect(evaluation.status).toBe('BLOCKED_UNAUTHORIZED');
    expect(evaluation.contextAssembly.missingRequiredTypes).toEqual([]);
    expect(evaluation.contextAssembly.incompleteContext).toBe(true);

    const structure = validateEvaluationOutputStructure(evaluation.output);
    expect(structure.ok).toBe(true);
    expect(FICTION_EVALUATION_OUTPUT_SECTIONS.every((s) => evaluation.output?.[s] !== undefined)).toBe(true);
  });

  it('rejects paid Opus execution even when env flag set (sprint gate)', async () => {
    process.env.SITE00_FICTION_OPUS_EXECUTION_AUTHORIZED = '1';
    process.env.ANTHROPIC_API_KEY = 'test-key-not-used';
    expect(isFictionOpusExecutionAuthorized()).toBe(true);

    const { registerTheExchangeProperty } = await import('../api/_lib/site00FictionCanon/propertyService.js');
    const { evaluateFictionPremise } = await import('../api/_lib/site00FictionCanon/opusEvaluationAdapter.js');
    await registerTheExchangeProperty({ importOrientationSeed: true });

    await expect(
      evaluateFictionPremise({ propertySlug: 'the-exchange', execute: true }),
    ).rejects.toThrow(/PAID_OPUS_EXECUTION_NOT_IMPLEMENTED_IN_SPRINT/);
  });

  it('preserves founder approval boundary on recommendations', async () => {
    const { reviewFictionEvaluationRecommendation } = await import(
      '../api/_lib/site00FictionCanon/opusEvaluationAdapter.js'
    );
    const { memorySaveEvaluation } = await import('../shared/site00-fiction-canon/memoryStore.js');

    const evaluationId = 'feval_test';
    memorySaveEvaluation({
      evaluationId,
      propertyId: TEST_PROPERTY_ID,
      propertySlug: 'the-exchange',
      approvedBibleVersionFingerprint: 'abc',
      modelRequested: 'claude-opus',
      modelResolved: 'claude-opus',
      dryRun: true,
      executed: false,
      status: 'DRY_RUN_PLAN',
      contextAssembly: {
        documentCount: 0,
        missingRequiredTypes: [],
        retrievalOmissions: [],
        incompleteContext: true,
      },
      output: null,
      recommendations: [
        {
          recommendationId: 'rec_1',
          section: 'PROPOSED_IMPROVEMENTS',
          existingApprovedFact: null,
          evidenceFromBible: 'seed',
          problemIdentified: 'gap',
          proposedImprovement: 'idea',
          expectedBenefit: 'better',
          tradeoffs: 'time',
          founderApprovalRequired: true,
          reviewDecision: 'PENDING',
        },
      ],
      createdAt: new Date().toISOString(),
    });

    const updated = await reviewFictionEvaluationRecommendation({
      evaluationId,
      recommendationId: 'rec_1',
      decision: 'DEFER',
    });
    expect(updated?.reviewDecision).toBe('DEFER');
  });
});
