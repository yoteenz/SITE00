/**
 * P0.VR.1D.4 — Aligned live reconstruction report wrapper (extends P0.VR.1D.2).
 */

import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { runNdxProjectHubLiveReconstruction } from '../p0vr1d2/runNdxProjectHubLiveReconstruction.js';
import type { RunNdxProjectHubLiveReconstructionInput } from '../p0vr1d2/runNdxProjectHubLiveReconstruction.js';
import { buildReferenceDomRegionMap } from './referenceDomRegionMap.js';
import { buildMappedReferenceDomDelta, largestMappedDelta } from './buildMappedReferenceDomDelta.js';
import { compileActionableCodePatches } from './compileActionableCodePatches.js';
import { applyCodePatchInstructions } from './applyCodePatchInstructions.js';
import {
  buildFounderVisualBoardReferences,
  failFounderReferenceMissing,
  actualFounderBoardPersisted,
} from './founderVisualBoardReference.js';
import { updateRegionLocksFromMappedDomDelta } from './implementationRegionLockAligned.js';
import type { NdxProjectHubAlignedLiveReport } from './types.js';

export type RunNdxProjectHubAlignedLiveReconstructionInput = RunNdxProjectHubLiveReconstructionInput & {
  projectId?: string;
};

export async function runNdxProjectHubAlignedLiveReconstruction(
  input: RunNdxProjectHubAlignedLiveReconstructionInput = {},
): Promise<NdxProjectHubAlignedLiveReport> {
  const projectId = input.projectId ?? input.projectSlug ?? 'ndxbook';
  const outputDir = input.outputDir ?? join('/tmp', 'ndx-project-hub-aligned-vr', String(Date.now()));
  mkdirSync(outputDir, { recursive: true });

  const baseReport = await runNdxProjectHubLiveReconstruction({
    ...input,
    outputDir,
    requireFounderReference: input.requireFounderReference ?? !input.allowFixtureFallback,
    executePatches: input.executePatches ?? true,
  });

  const founderBoardReferences = buildFounderVisualBoardReferences({
    projectId,
    resolution: baseReport.founderBoards,
  });

  const regionMaps = [];
  const mappedDeltas = [];
  const actionablePatches = [];
  const appliedPatches = [];
  let invalidLocks: string[] = [];
  let unmappedLocked: string[] = [];

  for (const screen of [...baseReport.desktopScreens, ...baseReport.mobileScreens]) {
    if (!screen.domMeasurement || !screen.domDelta) continue;
    const regionMap = buildReferenceDomRegionMap({
      screenId: screen.screenId,
      route: screen.route,
      referenceRegionIds: screen.implementationSpec.regions.map((r) => r.regionId),
      domRegionIds: screen.domMeasurement.measurements.map((m) => m.regionId),
    });
    regionMaps.push(regionMap);

    const mapped: import('./types.js').MappedReferenceDomDelta =
      screen.domDelta && 'unmappedReferenceRegions' in screen.domDelta
        ? (screen.domDelta as import('./types.js').MappedReferenceDomDelta)
        : buildMappedReferenceDomDelta({
            screenId: screen.screenId,
            route: screen.route,
            geometryContract: screen.implementationSpec.regions.length
              ? {
                  contractId: screen.screenId,
                  referenceAssetId: screen.screenId,
                  viewportClass: screen.viewportClass,
                  entries: screen.implementationSpec.regions.map((r) => ({
                    regionId: r.regionId,
                    referenceX: r.xPx,
                    referenceY: r.yPx,
                    referenceWidth: r.widthPx,
                    referenceHeight: r.heightPx,
                    referenceAspectRatio: r.widthPx / Math.max(r.heightPx, 1),
                    positionTolerancePx: 3,
                    sizeTolerancePx: 3,
                    rotationToleranceDeg: 0,
                  })),
                }
              : { contractId: screen.screenId, referenceAssetId: screen.screenId, viewportClass: screen.viewportClass, entries: [] },
            domMeasurement: screen.domMeasurement,
            regionMap,
          });
    mappedDeltas.push(mapped);

    const patches = compileActionableCodePatches({
      mappedDelta: mapped,
      implementationSpec: screen.implementationSpec,
      lockedRegionIds: screen.lockedRegionIds,
    });
    actionablePatches.push(...patches);

    if (input.executePatches !== false && patches.length > 0) {
      appliedPatches.push(
        ...applyCodePatchInstructions({ patches, dryRun: false }),
      );
    }

    const lockResult = updateRegionLocksFromMappedDomDelta({
      locks: screen.implementationSpec.regions.map((r) => ({
        regionId: r.regionId,
        state: 'UNMEASURED' as const,
        lockedAt: null,
      })),
      mappedDelta: mapped,
      regionMap,
    });
    invalidLocks = [...invalidLocks, ...lockResult.invalidLocks];
    unmappedLocked = [...unmappedLocked, ...lockResult.unmappedLocked];
  }

  const report: NdxProjectHubAlignedLiveReport = {
    ...baseReport,
    reportId: randomUUID(),
    regionMaps,
    mappedDeltas,
    actionablePatches,
    appliedPatches,
    founderBoardReferences,
    failFounderReferenceMissing: failFounderReferenceMissing(baseReport.founderBoards),
    fixtureSubstitutionUsed: baseReport.founderBoards.fixtureSubstitution,
    actualFounderBoardsPersisted: actualFounderBoardPersisted(baseReport.founderBoards),
    largestDesktopDelta: Math.max(
      0,
      ...mappedDeltas
        .filter((_, i) => i < baseReport.desktopScreens.length)
        .map(largestMappedDelta),
    ),
    largestMobileDelta: Math.max(
      0,
      ...mappedDeltas
        .filter((_, i) => i >= baseReport.desktopScreens.length)
        .map(largestMappedDelta),
    ),
    invalidRegionLocks: invalidLocks,
    unmappedLockedRegions: unmappedLocked,
  };

  writeFileSync(join(outputDir, 'aligned-report.json'), JSON.stringify(report, null, 2));
  return report;
}
