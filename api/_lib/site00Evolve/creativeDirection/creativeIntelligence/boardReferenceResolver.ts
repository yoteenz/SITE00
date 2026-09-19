/**
 * Resolve actual reference image files for THE MARKED-UP COPY board production.
 * Uses governed Supabase assets — never invents URLs.
 */

import { loadGeneratedAssetManifest } from '../assetGeneration.js';
import { loadCreativeDirectionBoardManifest } from './boardStore.js';
import type { ResolvedBoardReference } from './creativeDirectionBoardTypes.js';
import { MARKED_UP_COPY_BOARD_PLAN_VERSION } from './creativeDirectionBoardTypes.js';

/** Logical reference ID → manifest key in ndxbook.assets.json */
const REFERENCE_MANIFEST_MAP: Record<
  string,
  { manifestKey: string; role: string; founderNote: string }
> = {
  'ref-editorial-spread-modern': {
    manifestKey: 'editorial_utility:feature_article_opener',
    role: 'COMPOSITION_RHYTHM',
    founderNote:
      'Contemporary independent magazine editorial spread — asymmetric image/type, annotation-safe quiet zones.',
  },
  'ref-live-revision-behavior': {
    manifestKey: 'index_signal:feed_index_tile',
    role: 'ANNOTATION_BEHAVIOR',
    founderNote:
      'Dense margin annotation and underline on notebook page — live revision evidence, not passive history.',
  },
  'ref-material-paper': {
    manifestKey: 'editorial_utility:page_001_editorial',
    role: 'MATERIAL_TREATMENT',
    founderNote: 'Editorial still-life material language — warm neutral paper field, commissioned-magazine tactility.',
  },
};

export type ReferenceResolutionResult = {
  resolved: ResolvedBoardReference[];
  missing: string[];
  unavailableNote?: string;
};

export async function resolveMarkedUpCopyBoardReferences(params: {
  referenceIds: string[];
  orgSlug?: string;
}): Promise<ReferenceResolutionResult> {
  const orgSlug = params.orgSlug ?? 'ndxbook';
  const manifest = loadGeneratedAssetManifest(orgSlug);
  const resolved: ResolvedBoardReference[] = [];
  const missing: string[] = [];

  for (const referenceId of params.referenceIds) {
    const mapping = REFERENCE_MANIFEST_MAP[referenceId];
    if (!mapping) {
      missing.push(referenceId);
      continue;
    }
    const asset = manifest[mapping.manifestKey];
    if (!asset?.url || !asset.storagePath) {
      missing.push(referenceId);
      continue;
    }
    resolved.push({
      referenceId,
      assetId: mapping.manifestKey,
      source: 'SUPABASE_MANIFEST',
      storagePath: asset.storagePath,
      publicUrl: asset.url,
      mimeType: 'image/webp',
      width: 0,
      height: 0,
      founderNote: mapping.founderNote,
      referenceRole: mapping.role,
    });
  }

  if (missing.includes('ref-live-revision-behavior')) {
    const v1Boards = loadCreativeDirectionBoardManifest();
    const v1 = v1Boards.find((b) => b.boardPlanVersion === MARKED_UP_COPY_BOARD_PLAN_VERSION);
    const paperAsset = v1?.assetRecords.find((a) => a.manifestId === 'MU02');
    if (paperAsset?.url && paperAsset.storagePath) {
      resolved.push({
        referenceId: 'ref-live-revision-behavior',
        assetId: 'MU02-v1-pilot',
        source: 'BOARD_V1_ASSET',
        storagePath: paperAsset.storagePath,
        publicUrl: paperAsset.url,
        mimeType: 'image/webp',
        width: 0,
        height: 0,
        founderNote: 'V1 pilot paper substrate — physical revision surface.',
        referenceRole: 'ANNOTATION_BEHAVIOR',
      });
      missing.splice(missing.indexOf('ref-live-revision-behavior'), 1);
    }
  }

  return {
    resolved,
    missing,
    unavailableNote:
      missing.length > 0
        ? `Unresolved reference IDs (no Supabase asset): ${missing.join(', ')}`
        : undefined,
  };
}

export function referenceIdsForMarkedUpCopyPilot(): string[] {
  return Object.keys(REFERENCE_MANIFEST_MAP);
}
