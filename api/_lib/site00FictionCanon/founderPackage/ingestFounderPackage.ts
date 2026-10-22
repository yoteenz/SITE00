import fs from 'node:fs';
import path from 'node:path';
import type { FictionIngestImportItem, FictionIngestResult } from '../../../../shared/site00-fiction-canon/types.js';
import {
  THE_EXCHANGE_SLOANE_CHARACTER_ID,
  THE_EXCHANGE_PROPERTY,
} from '../../../../shared/site00-fiction-canon/constants.js';
import { ingestFictionCanonBatch } from '../ingestService.js';
import { listFictionDocuments, saveFictionDocument } from '../fictionCanonStore.js';
import { registerTheExchangeProperty } from '../propertyService.js';
import { FOUNDER_BIBLE_V1_DOCUMENT_MAP } from './documentMap.js';
import { validateFounderPackageArchive, type ArchiveValidationReport } from './validateArchive.js';

const PACKAGE_VERSION = 'THE_EXCHANGE_MASTER_BIBLE_V1';
const SOURCE_PREFIX = 'founder-bible-v1';

export type FounderPackageIngestResult = {
  validation: ArchiveValidationReport;
  propertyId: string;
  ingest: FictionIngestResult;
  visualIngest: FictionIngestResult;
  supersededOrientationCount: number;
  traceability: Array<{ file: string; stableIdentifier: string; documentType: string }>;
};

function mapManifestStatusToCanon(status: string): FictionIngestImportItem['canonStatus'] {
  switch (status) {
    case 'APPROVED_CANON':
      return 'APPROVED_CANON';
    case 'UNRESOLVED':
      return 'UNRESOLVED';
    case 'ILLUSTRATIVE':
      return 'PROPOSED';
    default:
      return 'WORKING_CONCEPT';
  }
}

function buildMarkdownImports(
  packageRoot: string,
  manifestStatusByFile: Map<string, string>,
): FictionIngestImportItem[] {
  const imports: FictionIngestImportItem[] = [];

  for (const spec of FOUNDER_BIBLE_V1_DOCUMENT_MAP) {
    const fullPath = path.join(packageRoot, spec.file);
    if (!fs.existsSync(fullPath)) continue;

    const manifestStatus = manifestStatusByFile.get(spec.file) ?? 'WORKING_CONCEPT';
    const canonStatus = spec.canonStatusOverride ?? mapManifestStatusToCanon(manifestStatus);

    if (spec.file.endsWith('.json')) {
      const raw = fs.readFileSync(fullPath, 'utf8');
      imports.push({
        sourceId: `${SOURCE_PREFIX}:${spec.file}`,
        documentType: spec.documentType,
        stableIdentifier: spec.stableIdentifier,
        title: spec.title,
        format: 'json',
        payload: JSON.parse(raw) as Record<string, unknown>,
        canonStatus,
        approvalStatus: 'PENDING_REVIEW',
        knowledgeLayer: spec.knowledgeLayer,
        characterReferences:
          spec.documentType === 'CHARACTER_BIBLE' || spec.documentType === 'FAMILY_HISTORY'
            ? [THE_EXCHANGE_SLOANE_CHARACTER_ID]
            : undefined,
      });
      continue;
    }

    const markdown = fs.readFileSync(fullPath, 'utf8');
    imports.push({
      sourceId: `${SOURCE_PREFIX}:${spec.file}`,
      documentType: spec.documentType,
      stableIdentifier: spec.stableIdentifier,
      title: spec.title,
      format: 'markdown',
      payload: markdown,
      canonStatus,
      approvalStatus: 'PENDING_REVIEW',
      knowledgeLayer: spec.knowledgeLayer,
      characterReferences:
        spec.documentType === 'CHARACTER_BIBLE' || spec.documentType === 'FAMILY_HISTORY'
          ? [THE_EXCHANGE_SLOANE_CHARACTER_ID]
          : undefined,
    });
  }

  return imports;
}

function buildVisualReferenceImports(
  packageRoot: string,
  manifest: { visual_assets?: Array<{ file: string; sha256: string }> },
): FictionIngestImportItem[] {
  const assets = [
    {
      manifestFile: 'visual_refs/sloane_lockwood_facial_identity_sheet.jpg',
      publicPath: '/site00/projects/the-exchange/visual_refs/sloane_lockwood_facial_identity_sheet.jpg',
      stableIdentifier: 'visual-sloane-facial-identity-sheet-v1',
      title: 'Sloane Lockwood — facial identity sheet',
    },
    {
      manifestFile: 'visual_refs/sloane_lockwood_face_lock_editorial_board.jpg',
      publicPath: '/site00/projects/the-exchange/visual_refs/sloane_lockwood_face_lock_editorial_board.jpg',
      stableIdentifier: 'visual-sloane-face-lock-editorial-board-v1',
      title: 'Sloane Lockwood — face lock editorial board',
    },
  ];

  return assets.map((a) => {
    const full = path.join(packageRoot, a.manifestFile);
    const sha256 = manifest.visual_assets?.find((v) => v.file === a.manifestFile)?.sha256 ?? null;
    return {
      sourceId: `${SOURCE_PREFIX}:${a.manifestFile}`,
      documentType: 'VISUAL_IDENTITY_REFERENCE' as const,
      stableIdentifier: a.stableIdentifier,
      title: a.title,
      format: 'json' as const,
      payload: {
        characterId: THE_EXCHANGE_SLOANE_CHARACTER_ID,
        assetRole: 'FOUNDER_SELECTED_REFERENCE',
        repositoryPath: a.publicPath,
        packageFile: a.manifestFile,
        sha256,
        note: 'Same character — two founder-selected reference sheets; do not treat embedded AI board text as canon.',
      },
      canonStatus: 'WORKING_CONCEPT' as const,
      approvalStatus: 'PENDING_REVIEW' as const,
      knowledgeLayer: 'UNSPECIFIED' as const,
      characterReferences: [THE_EXCHANGE_SLOANE_CHARACTER_ID],
      visualReferenceStatus: 'FOUNDER_SELECTED_REFERENCE' as const,
    };
  });
}

async function supersedeOrientationSeed(propertyId: string): Promise<number> {
  const docs = await listFictionDocuments(propertyId);
  let count = 0;
  const now = new Date().toISOString();
  for (const doc of docs) {
    if (doc.sourceProvenance.sourceKind !== 'SEED_ORIENTATION') continue;
    if (doc.canonStatus === 'SUPERSEDED') continue;
    await saveFictionDocument({
      ...doc,
      canonStatus: 'SUPERSEDED',
      updatedAt: now,
    });
    count += 1;
  }
  return count;
}

export async function ingestFounderBiblePackageFromDirectory(
  packageRoot: string,
  options?: { skipRegistration?: boolean },
): Promise<FounderPackageIngestResult> {
  const validation = validateFounderPackageArchive(packageRoot);
  if (!validation.ok) {
    return {
      validation,
      propertyId: '',
      ingest: { ok: false, error: 'Archive validation failed', blockedReason: 'ARCHIVE_INVALID' },
      visualIngest: { ok: false, error: 'Skipped', blockedReason: 'ARCHIVE_INVALID' },
      supersededOrientationCount: 0,
      traceability: [],
    };
  }

  const manifest = JSON.parse(
    fs.readFileSync(path.join(packageRoot, 'ingestion_manifest.json'), 'utf8'),
  ) as { documents: Array<{ file: string; status: string }>; visual_assets?: Array<{ file: string; sha256: string }> };

  const statusByFile = new Map(manifest.documents.map((d) => [d.file, d.status]));

  const property = options?.skipRegistration
    ? await registerTheExchangeProperty({ importOrientationSeed: false })
    : await registerTheExchangeProperty({ importOrientationSeed: true });

  const imports = buildMarkdownImports(packageRoot, statusByFile);
  const ingest = await ingestFictionCanonBatch({
    propertySlug: THE_EXCHANGE_PROPERTY.slug,
    imports,
    idempotencyKey: `${SOURCE_PREFIX}-batch-${PACKAGE_VERSION}`,
  });

  const visualImports = buildVisualReferenceImports(packageRoot, manifest);
  const visualIngest = await ingestFictionCanonBatch({
    propertySlug: THE_EXCHANGE_PROPERTY.slug,
    imports: visualImports,
    idempotencyKey: `${SOURCE_PREFIX}-visual-${PACKAGE_VERSION}`,
  });

  const supersededOrientationCount = await supersedeOrientationSeed(property.id);

  const traceability = FOUNDER_BIBLE_V1_DOCUMENT_MAP.map((spec) => ({
    file: spec.file,
    stableIdentifier: spec.stableIdentifier,
    documentType: spec.documentType,
  }));

  return {
    validation,
    propertyId: property.id,
    ingest,
    visualIngest,
    supersededOrientationCount,
    traceability,
  };
}
