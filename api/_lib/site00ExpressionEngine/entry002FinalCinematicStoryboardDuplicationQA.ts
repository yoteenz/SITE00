/**
 * Sprint B4.9R — Duplication QA for storyboard panels.
 */

import type {
  FinalCinematicStoryboardPanelManifestEntry,
  StoryboardDuplicationQAResult,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';

export function runStoryboardDuplicationQA(
  manifest: FinalCinematicStoryboardPanelManifestEntry[],
): StoryboardDuplicationQAResult {
  const rendered = manifest.filter((p) => p.generationStatus === 'RENDERED');
  const assetIdCounts = new Map<string, number>();
  const hashCounts = new Map<string, number>();

  for (const panel of rendered) {
    assetIdCounts.set(panel.assetId, (assetIdCounts.get(panel.assetId) ?? 0) + 1);
    if (panel.contentHash) {
      hashCounts.set(panel.contentHash, (hashCounts.get(panel.contentHash) ?? 0) + 1);
    }
  }

  const duplicateAssetIds = [...assetIdCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id);
  const duplicateContentHashes = [...hashCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([hash]) => hash);

  const blockers: string[] = [];
  if (duplicateAssetIds.length) blockers.push('duplicate panel asset IDs detected');
  if (duplicateContentHashes.length) blockers.push('duplicate panel content hashes detected');

  return {
    passed: blockers.length === 0,
    result: blockers.length === 0 ? 'PASS' : 'FAIL',
    duplicateAssetIds,
    duplicateContentHashes,
    blockers,
  };
}
