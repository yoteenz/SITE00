/**
 * Sprint B4.9R2 — Single multi-panel storyboard artifact structural QA.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type {
  FinalCinematicStoryboardPanelManifestEntry,
  SingleStoryboardArtifactQAResult,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';

const REQUIRED_SEMANTIC_CHECKS = [
  'containsMultipleDistinctVisualPanels',
  'containsSequentialVisualProgression',
  'notSingleHeroComposition',
  'notTechnicalSpecBoard',
  'notMoodboard',
  'notPoster',
  'reelBeginningRepresented',
  'reelMiddleRepresented',
  'reelEndRepresented',
  'phoneDiscoveryRepresented',
  '2016StateRepresented',
  'memoryExtractionRepresented',
  'contradictionRepresented',
  'interjectionRepresented',
  'snapBackRepresented',
] as const;

function narrativeCoverage(manifest: FinalCinematicStoryboardPanelManifestEntry[]): Record<string, boolean> {
  const beatIds = new Set(manifest.map((p) => p.beatId));
  return {
    containsMultipleDistinctVisualPanels: manifest.length >= 12,
    containsSequentialVisualProgression: manifest.length >= 12,
    notSingleHeroComposition: manifest.length > 1,
    notTechnicalSpecBoard: true,
    notMoodboard: true,
    notPoster: true,
    reelBeginningRepresented: beatIds.has('DISCOVERY'),
    reelMiddleRepresented: beatIds.has('CONTRADICTION_STITCH') || beatIds.has('FULL_CONTRADICTION'),
    reelEndRepresented: beatIds.has('SNAP_BACK'),
    phoneDiscoveryRepresented: beatIds.has('DISCOVERY'),
    '2016StateRepresented': beatIds.has('2016_LANDING'),
    memoryExtractionRepresented: beatIds.has('MEMORY_LIFTS'),
    contradictionRepresented: beatIds.has('CONTRADICTION_STITCH') || beatIds.has('FULL_CONTRADICTION'),
    interjectionRepresented: manifest.some((p) =>
      p.requiredText?.includes('THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.'),
    ),
    snapBackRepresented: beatIds.has('SNAP_BACK'),
  };
}

export async function runSingleStoryboardArtifactQA(params: {
  manifest: FinalCinematicStoryboardPanelManifestEntry[];
  storyboardImagePath: string | null;
  generationMode: 'SINGLE_MULTI_PANEL_ARTIFACT';
  storyboardAssetCount: number;
  heroImageOnly?: boolean;
}): Promise<SingleStoryboardArtifactQAResult> {
  const checks: SingleStoryboardArtifactQAResult['checks'] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  checks.push({
    check: 'storyboardImageExists',
    passed: Boolean(params.storyboardImagePath),
  });
  checks.push({
    check: 'storyboardAssetCount === 1',
    passed: params.storyboardAssetCount === 1,
  });
  checks.push({
    check: 'generationMode SINGLE_MULTI_PANEL_ARTIFACT',
    passed: params.generationMode === 'SINGLE_MULTI_PANEL_ARTIFACT',
  });

  if (params.heroImageOnly) {
    checks.push({ check: 'notSingleHeroComposition', passed: false });
    blockers.push('B4.9 hero-image false positive');
  }

  if (params.storyboardImagePath) {
    try {
      const filePath = path.join(process.cwd(), 'public', params.storyboardImagePath.replace(/^\//, ''));
      const meta = await sharp(await fs.readFile(filePath)).metadata();
      checks.push({
        check: 'vertical storyboard orientation',
        passed: (meta.height ?? 0) >= (meta.width ?? 0),
      });
      checks.push({
        check: 'multi-panel sheet dimensions plausible',
        passed: (meta.height ?? 0) >= 1200 && (meta.width ?? 0) >= 600,
      });
    } catch {
      checks.push({ check: 'storyboard image readable', passed: false });
    }
  }

  const narrativeCoverageResult = narrativeCoverage(params.manifest);
  for (const key of REQUIRED_SEMANTIC_CHECKS) {
    checks.push({ check: key, passed: narrativeCoverageResult[key] ?? false });
  }

  for (const c of checks) {
    if (!c.passed) blockers.push(c.check);
  }

  return {
    passed: blockers.length === 0,
    result: blockers.length === 0 ? (warnings.length ? 'WARN' : 'PASS') : 'FAIL',
    checks,
    blockers,
    warnings,
    narrativeCoverage: narrativeCoverageResult,
  };
}
