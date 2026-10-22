/**
 * P0 THE EXCHANGE — founder bible V1 package ingest and Opus readiness.
 */
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetFictionCanonMemoryStoreForTests } from '../shared/site00-fiction-canon/memoryStore.js';
import { validateFounderPackageArchive } from '../api/_lib/site00FictionCanon/founderPackage/validateArchive.js';
import { hasProjectCapability } from '../shared/site00-projects/capabilities.js';

const TEST_PROPERTY_ID = '00000000-0000-4000-8000-000000000002';
const PACKAGE_ROOT = path.join(
  process.cwd(),
  'THE_EXCHANGE/FOUNDER_SOURCE/THE_EXCHANGE_MASTER_BIBLE_V1',
);

vi.mock('../api/_lib/site00Projects/founderProjectDbId.js', () => ({
  ensureFounderProjectDbId: vi.fn(async () => TEST_PROPERTY_ID),
  resolveFounderProjectDbId: vi.fn(async () => TEST_PROPERTY_ID),
  isFounderProjectSlug: (slug: string) => slug === 'the-exchange',
  isUuid: (v: string) => /^[0-9a-f-]{36}$/i.test(v),
}));

describe('THE EXCHANGE founder bible V1', () => {
  beforeEach(() => {
    resetFictionCanonMemoryStoreForTests();
  });

  it('validates archive file count, episodes, and parts', () => {
    const report = validateFounderPackageArchive(PACKAGE_ROOT);
    expect(report.fileCount).toBe(15);
    expect(report.expectedFileCount).toBe(15);
    expect(report.missingFiles).toHaveLength(0);
    expect(report.episodeSlate?.episodeCount).toBe(10);
    expect(report.episodeSlate?.partCount).toBe(30);
    expect(report.ok).toBe(true);
    expect(report.visualAssets?.every((v) => v.readable)).toBe(true);
  });

  it('ingests founder package and supersedes orientation seed', async () => {
    const { ingestFounderBiblePackageFromDirectory } = await import(
      '../api/_lib/site00FictionCanon/founderPackage/ingestFounderPackage.js'
    );
    const result = await ingestFounderBiblePackageFromDirectory(PACKAGE_ROOT);
    expect(result.validation.ok).toBe(true);
    expect(result.ingest.ok).toBe(true);
    expect(result.visualIngest.ok).toBe(true);
    expect(result.supersededOrientationCount).toBeGreaterThan(0);

    const { listFictionDocuments } = await import('../api/_lib/site00FictionCanon/fictionCanonStore.js');
    const docs = await listFictionDocuments(result.propertyId);
    const active = docs.filter((d) => d.canonStatus !== 'SUPERSEDED');
    expect(active.some((d) => d.sourceProvenance.sourceId.startsWith('founder-bible-v1'))).toBe(true);
    expect(active.some((d) => d.canonStatus === 'APPROVED_CANON')).toBe(false);
    expect(active.some((d) => d.documentType === 'OPEN_QUESTIONS')).toBe(true);
    expect(active.some((d) => d.documentType === 'COMMERCIAL_STRATEGY')).toBe(true);
    expect(active.filter((d) => d.documentType === 'VISUAL_IDENTITY_REFERENCE')).toHaveLength(2);
  });

  it('preserves unresolved mysteries without inventing canon', async () => {
    const { ingestFounderBiblePackageFromDirectory } = await import(
      '../api/_lib/site00FictionCanon/founderPackage/ingestFounderPackage.js'
    );
    const { buildFounderCanonReviewPack } = await import(
      '../api/_lib/site00FictionCanon/founderPackage/founderCanonReview.js'
    );
    const { listFictionDocuments } = await import('../api/_lib/site00FictionCanon/fictionCanonStore.js');

    const result = await ingestFounderBiblePackageFromDirectory(PACKAGE_ROOT);
    const active = (await listFictionDocuments(result.propertyId)).filter(
      (d) => d.canonStatus !== 'SUPERSEDED',
    );
    const review = buildFounderCanonReviewPack(active);
    expect(review.unresolvedMysteries.some((m) => /UNRESOLVED|final exchange/i.test(m))).toBe(true);
    expect(review.establishedFounderDecisions.some((d) => d.includes('Sloane Lockwood'))).toBe(true);
  });

  it('builds Opus dry-run preview with founder package coverage', async () => {
    const { ingestFounderBiblePackageFromDirectory } = await import(
      '../api/_lib/site00FictionCanon/founderPackage/ingestFounderPackage.js'
    );
    const { buildOpusDryRunPreview } = await import('../api/_lib/site00FictionCanon/opusDryRunPreview.js');
    await ingestFounderBiblePackageFromDirectory(PACKAGE_ROOT);
    const preview = await buildOpusDryRunPreview('the-exchange');
    expect(preview).not.toBeNull();
    expect(preview!.coverageSummary.founderPackageDetected).toBe(true);
    expect(preview!.contextPartition.documentCount).toBeGreaterThan(10);
    expect(preview!.execution.paidImplementationStatus).toBe('NOT_IMPLEMENTED_THIS_SPRINT');
    expect(preview!.opusReadinessVerdict).toBe('READY_FOR_DRY_RUN');
  });

  it('supports idempotent re-ingest via duplicate hash skip', async () => {
    const { ingestFounderBiblePackageFromDirectory } = await import(
      '../api/_lib/site00FictionCanon/founderPackage/ingestFounderPackage.js'
    );
    const first = await ingestFounderBiblePackageFromDirectory(PACKAGE_ROOT);
    const second = await ingestFounderBiblePackageFromDirectory(PACKAGE_ROOT);
    expect(first.ingest.ok).toBe(true);
    expect(second.ingest.ok).toBe(true);
    if (second.ingest.ok) {
      expect(second.ingest.skipped.length).toBeGreaterThan(0);
    }
  });

  it('does not grant NDXBOOK capabilities to the-exchange', () => {
    expect(hasProjectCapability('the-exchange', 'FICTION_CANON')).toBe(true);
    expect(hasProjectCapability('ndxbook', 'FICTION_CANON')).toBe(false);
    expect(hasProjectCapability('the-exchange', 'PERSONALITY_REPLAY')).toBe(false);
  });
});
