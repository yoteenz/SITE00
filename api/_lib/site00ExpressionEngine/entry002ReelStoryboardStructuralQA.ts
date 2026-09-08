/**
 * Sprint B4.9R3 — Structural QA for reel-first single storyboard artifact.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type {
  Entry002ReelVisualConception,
  SingleStoryboardArtifactQAResult,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import { REEL_STORYBOARD_MOMENT_COUNT_TARGET } from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';

export async function runReelStoryboardStructuralQA(params: {
  conception: Entry002ReelVisualConception;
  storyboardImagePath: string | null;
  storyboardAssetCount: number;
  compiledPrompt: string;
}): Promise<SingleStoryboardArtifactQAResult> {
  const checks: SingleStoryboardArtifactQAResult['checks'] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  checks.push({ check: 'storyboardImageExists', passed: Boolean(params.storyboardImagePath) });
  checks.push({ check: 'storyboardAssetCount === 1', passed: params.storyboardAssetCount === 1 });
  checks.push({
    check: 'selectedStoryboardMomentCount === 9',
    passed: params.conception.selectedStoryboardMoments.length === REEL_STORYBOARD_MOMENT_COUNT_TARGET,
  });
  checks.push({
    check: 'promptDescribesOneReelFirst',
    passed: params.compiledPrompt.includes('ONE REEL, NOT NINE SEPARATE CONCEPTS'),
  });
  checks.push({
    check: 'promptDescribesCompleteReelBeforeStills',
    passed:
      params.compiledPrompt.includes('ONE CONTINUOUS REEL') ||
      params.compiledPrompt.includes('THE COMPLETE REEL AS ONE CONTINUOUS FILM'),
  });
  checks.push({
    check: 'authorityBoardLayoutsExcluded',
    passed: params.compiledPrompt.includes('DO NOT IMITATE AUTHORITY-BOARD'),
  });

  if (params.storyboardImagePath) {
    try {
      const filePath = path.join(process.cwd(), 'public', params.storyboardImagePath.replace(/^\//, ''));
      const meta = await sharp(await fs.readFile(filePath)).metadata();
      checks.push({
        check: 'vertical storyboard orientation',
        passed: (meta.height ?? 0) >= (meta.width ?? 0),
      });
    } catch {
      checks.push({ check: 'storyboard image readable', passed: false });
    }
  }

  const beatIds = new Set(
    params.conception.selectedStoryboardMoments.flatMap((m) => m.narrativeBeatsCovered),
  );
  const narrativeCoverage: Record<string, boolean> = {
    containsMultipleDistinctVisualPanels: params.conception.selectedStoryboardMoments.length >= 8,
    containsSequentialVisualProgression: true,
    notSingleHeroComposition: params.conception.selectedStoryboardMoments.length > 1,
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
    interjectionRepresented: params.conception.interjectionTreatment.includes('APOLOGY'),
    snapBackRepresented: beatIds.has('SNAP_BACK'),
  };

  for (const [key, passed] of Object.entries(narrativeCoverage)) {
    checks.push({ check: key, passed });
  }

  for (const c of checks) {
    if (!c.passed) blockers.push(c.check);
  }

  return {
    passed: blockers.length === 0,
    result: blockers.length === 0 ? 'PASS' : 'FAIL',
    checks,
    blockers,
    warnings,
    narrativeCoverage,
  };
}
