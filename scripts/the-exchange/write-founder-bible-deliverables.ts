import fs from 'node:fs';
import path from 'node:path';
import { ingestFounderBiblePackageFromDirectory } from '../../api/_lib/site00FictionCanon/founderPackage/ingestFounderPackage.js';
import { buildFounderCanonReviewPack } from '../../api/_lib/site00FictionCanon/founderPackage/founderCanonReview.js';
import { buildOpusDryRunPreview, assessPersistenceLayer } from '../../api/_lib/site00FictionCanon/opusDryRunPreview.js';
import { listFictionDocuments } from '../../api/_lib/site00FictionCanon/fictionCanonStore.js';
import { buildIngestionReadinessReport } from '../../api/_lib/site00FictionCanon/readinessReport.js';
import { resetFictionCanonMemoryStoreForTests } from '../../shared/site00-fiction-canon/memoryStore.js';

async function main(): Promise<void> {
  resetFictionCanonMemoryStoreForTests();

  const pkgRoot = path.join(process.cwd(), 'THE_EXCHANGE/FOUNDER_SOURCE/THE_EXCHANGE_MASTER_BIBLE_V1');
  const outDir = path.join(process.cwd(), 'docs/site00/the-exchange/founder-bible-ingest-v1');
  fs.mkdirSync(outDir, { recursive: true });

  const result = await ingestFounderBiblePackageFromDirectory(pkgRoot);
  const active = (await listFictionDocuments(result.propertyId)).filter(
    (d) => d.canonStatus !== 'SUPERSEDED' && d.canonStatus !== 'REJECTED',
  );
  const review = buildFounderCanonReviewPack(active);
  const preview = await buildOpusDryRunPreview('the-exchange');
  const persistence = await assessPersistenceLayer();
  const readiness = await buildIngestionReadinessReport('the-exchange');

  const write = (name: string, data: unknown) => {
    fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(data, null, 2)}\n`);
  };

  write('01_ARCHIVE_VALIDATION_REPORT.json', result.validation);
  write(
    '02_FOUNDER_SOURCE_INGESTION_MANIFEST.json',
    JSON.parse(fs.readFileSync(path.join(pkgRoot, 'ingestion_manifest.json'), 'utf8')),
  );
  write('03_NORMALIZED_RECORD_SUMMARY.json', {
    traceability: result.traceability,
    ingestOk: result.ingest.ok,
    visualIngestOk: result.visualIngest.ok,
    documentCount: active.length,
  });
  write('04_SOURCE_TO_RECORD_TRACEABILITY.json', result.traceability);
  write(
    '05_CANON_CLASSIFICATION_REPORT.json',
    active.map((d) => ({
      stableIdentifier: d.stableIdentifier,
      documentType: d.documentType,
      canonStatus: d.canonStatus,
      approvalStatus: d.approvalStatus,
      knowledgeLayer: d.knowledgeLayer,
    })),
  );
  write('06_UNRESOLVED_MYSTERY_REPORT.json', review.unresolvedMysteries);
  write('07_EPISODE_THIRTY_PART_VALIDATION.json', result.validation.episodeSlate);
  write(
    '08_SLOANE_VISUAL_REFERENCE_REGISTRATION.json',
    active.filter((d) => d.documentType === 'VISUAL_IDENTITY_REFERENCE'),
  );
  write('09_PERSISTENCE_AND_ISOLATION.json', persistence);
  write('10_OPUS_DRY_RUN_PREVIEW.json', preview);
  write('11_BLOCKERS_AND_MISSING.json', {
    readiness,
    missingSourceWarnings: preview?.missingSourceWarnings ?? [],
  });
  write('12_FOUNDER_CANON_APPROVAL_PACK.json', review);
  write('13_OPUS_READINESS_VERDICT.json', {
    verdict: preview?.opusReadinessVerdict,
    readiness: readiness.overallStatus,
    paidOpusAuthorized: false,
  });
  write('14_EXECUTIVE_SUMMARY.json', {
    sprint: 'P0.THE-EXCHANGE.FOUNDER-BIBLE-INGEST-CANON-VALIDATION-AND-OPUS-READINESS1',
    archiveValid: result.validation.ok,
    episodes: result.validation.episodeSlate?.episodeCount,
    parts: result.validation.episodeSlate?.partCount,
    supersededOrientationSeed: result.supersededOrientationCount,
    opusReadiness: preview?.opusReadinessVerdict,
    persistence,
  });

  console.log(`Deliverables written to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
