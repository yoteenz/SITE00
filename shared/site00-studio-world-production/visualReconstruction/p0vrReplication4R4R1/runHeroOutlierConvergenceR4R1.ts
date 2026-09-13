import type { HeroAuthorityGeometryFull, HeroGeometryDeltaFull, HeroRenderedGeometryFull } from '../p0vrReplication4R3/types.js';
import { computeHeroGeometryDeltas } from '../p0vrReplication4R3/measureHeroGeometry.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';
import type { HeroMeasurementSource } from '../p0vrReplication4R3R1/types.js';
import { rankHeroOutliers } from '../p0vrReplication4R4/rankHeroOutliers.js';
import { applySimulatedHeroNudge } from '../p0vrReplication4R4/applySimulatedHeroNudge.js';
import { buildHeroCssPatchFromLayout } from '../p0vrReplication4R3/heroLayoutSpec.js';
import {
  HERO_OUTLIER_PASS1_MAX,
  HERO_OUTLIER_PASS2_MAX,
  HERO_PLATEAU_STREAK,
  P0_VR_REPLICATION_4R4R1_BUILD,
} from './constants.js';
import { buildHeroOutlierSnapshot } from './buildHeroOutlierSnapshot.js';
import { buildFactualHeroPatch } from './buildFactualHeroPatch.js';
import type { HeroConvergencePlateau, HeroOutlierConvergenceRunReport, HeroOutlierPatch } from './types.js';
import { classifyHeroLimit } from './classifyHeroLimit.js';
import { buildHeroLockGuard } from './heroLockGuard.js';

const PARENT_FIRST: HeroObjectId[] = ['H14', 'H09', 'H06'];

function outlierIds(deltas: HeroGeometryDeltaFull[]): HeroObjectId[] {
  return deltas
    .filter((d) => d.objectId !== 'H07' && d.status === 'OUT_OF_TOLERANCE')
    .map((d) => d.objectId as HeroObjectId);
}

function errorStats(deltas: HeroGeometryDeltaFull[]) {
  const measured = deltas.filter((d) => d.objectId !== 'H07');
  const pos = measured.map((d) => Math.max(Math.abs(d.deltaX), Math.abs(d.deltaY)));
  const size = measured.map((d) => Math.max(Math.abs(d.deltaWidth), Math.abs(d.deltaHeight)));
  const combined = measured.map((d) =>
    Math.max(Math.abs(d.deltaX), Math.abs(d.deltaY), Math.abs(d.deltaWidth), Math.abs(d.deltaHeight)),
  );
  return {
    outlierCount: outlierIds(deltas).length,
    maxError: combined.length ? Math.max(...combined) : 0,
    meanError: combined.length ? combined.reduce((a, b) => a + b, 0) / combined.length : 0,
    maxPos: pos.length ? Math.max(...pos) : 0,
    maxSize: size.length ? Math.max(...size) : 0,
  };
}

function pickPassOutliers(ranked: ReturnType<typeof rankHeroOutliers>, max: number, deltas: HeroGeometryDeltaFull[]): HeroObjectId[] {
  const ids = outlierIds(deltas);
  const ordered: HeroObjectId[] = [];
  for (const parent of PARENT_FIRST) {
    if (ids.includes(parent)) ordered.push(parent);
  }
  for (const entry of ranked) {
    if (ordered.length >= max) break;
    if (!ids.includes(entry.objectId)) continue;
    if (ordered.includes(entry.objectId)) continue;
    ordered.push(entry.objectId);
  }
  return ordered.slice(0, max);
}

function mergePatch(base: Record<string, string>, delta: Record<string, string>): Record<string, string> {
  return { ...base, ...delta };
}

function applyPass(input: {
  cssPatch: Record<string, string>;
  rendered: HeroRenderedGeometryFull[];
  authority: HeroAuthorityGeometryFull[];
  maxObjects: number;
}): { cssPatch: Record<string, string>; rendered: HeroRenderedGeometryFull[]; patches: HeroOutlierPatch[] } {
  let { cssPatch, rendered, authority } = input;
  const deltas = computeHeroGeometryDeltas(authority, rendered);
  const ranked = rankHeroOutliers(deltas);
  const targets = pickPassOutliers(ranked, input.maxObjects, deltas);
  const patches: HeroOutlierPatch[] = [];

  for (const objectId of targets) {
    const delta = deltas.find((d) => d.objectId === objectId);
    if (!delta) continue;
    const { patch, outlierPatch } = buildFactualHeroPatch({ objectId, delta, cssPatch });
    if (outlierPatch.status === 'APPLIED') {
      cssPatch = mergePatch(cssPatch, patch);
      patches.push(outlierPatch);
    }
  }

  rendered = applySimulatedHeroNudge(rendered, cssPatch);
  return { cssPatch, rendered, patches };
}

export function runHeroOutlierConvergenceR4R1(input: {
  sessionId: string;
  twinId: string;
  measurementSource: HeroMeasurementSource;
  authority: HeroAuthorityGeometryFull[];
  rendered: HeroRenderedGeometryFull[];
  baseCssPatch?: Record<string, string>;
}): HeroOutlierConvergenceRunReport {
  if (input.rendered.length < 14) {
    return {
      buildRef: P0_VR_REPLICATION_4R4R1_BUILD,
      sessionId: input.sessionId,
      initialSnapshot: buildHeroOutlierSnapshot({
        twinId: input.twinId,
        measurementSource: input.measurementSource,
        measuredCount: 0,
        renderedCount: input.rendered.length,
        deltas: [],
      }),
      pass1Patches: [],
      pass1OutlierCount: 0,
      pass2Patches: [],
      pass2OutlierCount: 0,
      pass3Patches: [],
      finalOutlierIds: [],
      finalDeltas: [],
      plateau: { detected: false, consecutivePassesWithoutImprovement: 0, status: 'NONE', lastOutlierCount: 0, lastMaxError: 0, lastMeanError: 0 },
      limitClassifications: {},
      regressions: [],
      heroLockGuard: buildHeroLockGuard('OPEN'),
      cssPatch: input.baseCssPatch ?? {},
      status: 'OUTLIER_SNAPSHOT_UNAVAILABLE',
    };
  }

  let cssPatch = mergePatch(buildHeroCssPatchFromLayout(), input.baseCssPatch ?? {});
  let rendered = [...input.rendered];
  let deltas = computeHeroGeometryDeltas(input.authority, rendered);

  const initialSnapshot = buildHeroOutlierSnapshot({
    twinId: input.twinId,
    measurementSource: input.measurementSource,
    measuredCount: deltas.length,
    renderedCount: rendered.length,
    deltas,
  });

  if (initialSnapshot.outlierCount === 0) {
    return {
      buildRef: P0_VR_REPLICATION_4R4R1_BUILD,
      sessionId: input.sessionId,
      initialSnapshot,
      pass1Patches: [],
      pass1OutlierCount: 0,
      pass2Patches: [],
      pass2OutlierCount: 0,
      pass3Patches: [],
      finalOutlierIds: [],
      finalDeltas: deltas,
      plateau: { detected: false, consecutivePassesWithoutImprovement: 0, status: 'NONE', lastOutlierCount: 0, lastMaxError: 0, lastMeanError: 0 },
      limitClassifications: {},
      regressions: [],
      heroLockGuard: buildHeroLockGuard('LOCKED'),
      cssPatch,
      status: 'GEOMETRY_CONVERGED',
    };
  }

  let plateauStreak = 0;
  let plateau: HeroConvergencePlateau = {
    detected: false,
    consecutivePassesWithoutImprovement: 0,
    status: 'NONE',
    lastOutlierCount: initialSnapshot.outlierCount,
    lastMaxError: errorStats(deltas).maxError,
    lastMeanError: errorStats(deltas).meanError,
  };

  const pass1Before = errorStats(deltas);
  const pass1 = applyPass({ cssPatch, rendered, authority: input.authority, maxObjects: HERO_OUTLIER_PASS1_MAX });
  cssPatch = pass1.cssPatch;
  rendered = pass1.rendered;
  deltas = computeHeroGeometryDeltas(input.authority, rendered);
  const pass1After = errorStats(deltas);
  const pass1OutlierCount = pass1After.outlierCount;

  if (
    pass1After.outlierCount >= pass1Before.outlierCount &&
    pass1After.maxError >= pass1Before.maxError &&
    pass1After.meanError >= pass1Before.meanError
  ) {
    plateauStreak += 1;
  } else {
    plateauStreak = 0;
  }

  if (pass1OutlierCount === 0) {
    return finalizeReport(input.sessionId, initialSnapshot, pass1.patches, [], [], deltas, cssPatch, plateau, []);
  }

  const pass2Before = pass1After;
  const pass2 = applyPass({ cssPatch, rendered, authority: input.authority, maxObjects: HERO_OUTLIER_PASS2_MAX });
  cssPatch = pass2.cssPatch;
  rendered = pass2.rendered;
  deltas = computeHeroGeometryDeltas(input.authority, rendered);
  const pass2After = errorStats(deltas);
  const pass2OutlierCount = pass2After.outlierCount;

  if (
    pass2After.outlierCount >= pass2Before.outlierCount &&
    pass2After.maxError >= pass2Before.maxError &&
    pass2After.meanError >= pass2Before.meanError
  ) {
    plateauStreak += 1;
  } else {
    plateauStreak = 0;
  }

  if (pass2OutlierCount === 0) {
    return finalizeReport(input.sessionId, initialSnapshot, pass1.patches, pass2.patches, [], deltas, cssPatch, plateau, []);
  }

  const pass3Before = pass2After;
  const remaining = outlierIds(deltas).length;
  const pass3 = applyPass({ cssPatch, rendered, authority: input.authority, maxObjects: remaining });
  cssPatch = pass3.cssPatch;
  rendered = pass3.rendered;
  deltas = computeHeroGeometryDeltas(input.authority, rendered);
  const pass3After = errorStats(deltas);

  if (
    pass3After.outlierCount >= pass3Before.outlierCount &&
    pass3After.maxError >= pass3Before.maxError &&
    pass3After.meanError >= pass3Before.meanError
  ) {
    plateauStreak += 1;
  }

  if (plateauStreak >= HERO_PLATEAU_STREAK) {
    plateau = {
      detected: true,
      consecutivePassesWithoutImprovement: plateauStreak,
      status: 'CONVERGENCE_PLATEAU',
      lastOutlierCount: pass3After.outlierCount,
      lastMaxError: pass3After.maxError,
      lastMeanError: pass3After.meanError,
    };
  }

  const limitClassifications: HeroOutlierConvergenceRunReport['limitClassifications'] = {};
  for (const id of outlierIds(deltas)) {
    const d = deltas.find((x) => x.objectId === id)!;
    limitClassifications[id] = classifyHeroLimit(id, d);
  }

  return finalizeReport(
    input.sessionId,
    initialSnapshot,
    pass1.patches,
    pass2.patches,
    pass3.patches,
    deltas,
    cssPatch,
    plateau,
    [],
    limitClassifications,
  );
}

function finalizeReport(
  sessionId: string,
  initialSnapshot: ReturnType<typeof buildHeroOutlierSnapshot>,
  pass1Patches: HeroOutlierPatch[],
  pass2Patches: HeroOutlierPatch[],
  pass3Patches: HeroOutlierPatch[],
  finalDeltas: HeroGeometryDeltaFull[],
  cssPatch: Record<string, string>,
  plateau: HeroConvergencePlateau,
  regressions: HeroObjectId[],
  limitClassifications: HeroOutlierConvergenceRunReport['limitClassifications'] = {},
): HeroOutlierConvergenceRunReport {
  const finalOutlierIds = outlierIds(finalDeltas);
  const converged = finalOutlierIds.length === 0;
  let status: HeroOutlierConvergenceRunReport['status'] = converged ? 'GEOMETRY_CONVERGED' : 'PARTIAL';
  if (plateau.detected && !converged) status = 'CONVERGENCE_PLATEAU';

  return {
    buildRef: P0_VR_REPLICATION_4R4R1_BUILD,
    sessionId,
    initialSnapshot,
    pass1Patches,
    pass1OutlierCount: initialSnapshot.outlierCount,
    pass2Patches,
    pass2OutlierCount: pass2Patches.length ? outlierIds(finalDeltas).length : 0,
    pass3Patches,
    finalOutlierIds,
    finalDeltas,
    plateau,
    limitClassifications,
    regressions,
    heroLockGuard: buildHeroLockGuard(converged ? 'LOCKED' : 'OPEN'),
    cssPatch,
    status,
  };
}
