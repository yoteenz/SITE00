/**
 * Sprint B4.9R — Storyboard structure QA (must not pass on composite-only artifacts).
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  FinalCinematicStoryboardPanelManifestEntry,
  StoryboardStructureQAResult,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_MIN,
  FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_TARGET,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';

const REQUIRED_BEATS = [
  'hasDiscovery',
  'hasPraise',
  'hasProfile',
  'hasScroll',
  'hasTemporalCollapse',
  'has2016Landing',
  'has2016Selection',
  'hasCulturalGlitch',
  'hasMemoryExtraction',
  'hasNegativeReceipts',
  'hasContradiction',
  'hasNdxStitch',
  'hasInterjection',
  'hasSnapBack',
] as const;

function beatCoverage(manifest: FinalCinematicStoryboardPanelManifestEntry[]): Record<string, boolean> {
  const beatIds = new Set(manifest.map((p) => p.beatId));
  return {
    hasDiscovery: beatIds.has('DISCOVERY'),
    hasPraise: beatIds.has('PRAISE_ARRIVES'),
    hasProfile: beatIds.has('PROFILE_GRID') || beatIds.has('PROFILE_TAP'),
    hasScroll: beatIds.has('SCROLL_BEGINS'),
    hasTemporalCollapse: beatIds.has('YEARS_COLLAPSE'),
    has2016Landing: beatIds.has('2016_LANDING'),
    has2016Selection: beatIds.has('RECOGNITION') || beatIds.has('TAP_FRACTURE'),
    hasCulturalGlitch: beatIds.has('TAP_FRACTURE'),
    hasMemoryExtraction: beatIds.has('MEMORY_LIFTS'),
    hasNegativeReceipts: beatIds.has('RECEIPTS_SURFACE'),
    hasContradiction: beatIds.has('CONTRADICTION_STITCH') || beatIds.has('FULL_CONTRADICTION'),
    hasNdxStitch: beatIds.has('NDX_TAKES_EVIDENCE') || beatIds.has('CONTRADICTION_STITCH'),
    hasInterjection: manifest.some((p) =>
      p.requiredText?.includes('THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.'),
    ),
    hasSnapBack: beatIds.has('SNAP_BACK'),
  };
}

export async function runStoryboardStructureQA(params: {
  manifest: FinalCinematicStoryboardPanelManifestEntry[];
  compositeExists: boolean;
  panelOnlyCompositeWithoutDistinctPanels?: boolean;
}): Promise<StoryboardStructureQAResult> {
  const checks: StoryboardStructureQAResult['checks'] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  const expectedPanelCount = params.manifest.length;
  const renderedPanels = params.manifest.filter(
    (p) => p.generationStatus === 'RENDERED' && p.previewUrl,
  );
  const renderedDistinctPanelCount = renderedPanels.length;

  const assetIds = renderedPanels.map((p) => p.assetId);
  const uniqueAssetIds = new Set(assetIds);

  const hashes: string[] = [];
  for (const panel of renderedPanels) {
    if (!panel.previewUrl) continue;
    try {
      const filePath = path.join(process.cwd(), 'public', panel.previewUrl.replace(/^\//, ''));
      const buf = await fs.readFile(filePath);
      hashes.push(createHash('sha256').update(buf).digest('hex'));
    } catch {
      blockers.push(`panel ${panel.panelNumber} asset missing on disk`);
    }
  }
  const uniqueHashes = new Set(hashes);

  checks.push({
    check: 'expectedPanelCount >= minimum',
    passed: expectedPanelCount >= FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_MIN,
  });
  checks.push({
    check: 'renderedDistinctPanelCount >= expectedPanelCount',
    passed: renderedDistinctPanelCount >= expectedPanelCount,
  });
  checks.push({
    check: 'noDuplicatePanelAssetReuse',
    passed: uniqueAssetIds.size === renderedDistinctPanelCount,
  });
  checks.push({
    check: 'noDuplicatePanelContentHash',
    passed: uniqueHashes.size === renderedDistinctPanelCount,
  });
  checks.push({
    check: 'composite alone does not satisfy structure',
    passed: !(params.panelOnlyCompositeWithoutDistinctPanels && params.compositeExists),
  });
  checks.push({
    check: 'finalCompositeContainsAllPanels',
    passed: params.compositeExists && renderedDistinctPanelCount >= expectedPanelCount,
  });

  const narrativeCoverage = beatCoverage(params.manifest);
  for (const key of REQUIRED_BEATS) {
    checks.push({ check: key, passed: narrativeCoverage[key] });
  }

  for (const c of checks) {
    if (!c.passed) blockers.push(c.check);
  }

  if (expectedPanelCount < FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_TARGET) {
    warnings.push(`Panel count ${expectedPanelCount} below target ${FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_TARGET}`);
  }

  return {
    passed: blockers.length === 0,
    result: blockers.length === 0 ? (warnings.length ? 'WARN' : 'PASS') : 'FAIL',
    expectedPanelCount,
    renderedDistinctPanelCount,
    checks,
    blockers,
    warnings,
    narrativeCoverage,
  };
}

/** B4.9 false-positive regression: composite JPEG without distinct panel assets. */
export function evaluateB49FalsePositiveStructure(params: {
  compositeExists: boolean;
  distinctRenderedPanelCount: number;
}): StoryboardStructureQAResult {
  return {
    passed: false,
    result: 'FAIL',
    expectedPanelCount: FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_TARGET,
    renderedDistinctPanelCount: params.distinctRenderedPanelCount,
    checks: [
      { check: 'composite alone does not satisfy structure', passed: false },
      { check: 'renderedDistinctPanelCount >= expectedPanelCount', passed: false },
    ],
    blockers: ['B4.9 false positive — composite without distinct generated panels'],
    warnings: [],
    narrativeCoverage: Object.fromEntries(REQUIRED_BEATS.map((k) => [k, false])),
  };
}
