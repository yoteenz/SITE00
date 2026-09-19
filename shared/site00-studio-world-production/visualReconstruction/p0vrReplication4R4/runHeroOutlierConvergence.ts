import type { HeroAuthorityGeometryFull, HeroRenderedGeometryFull } from '../p0vrReplication4R3/types.js';
import { computeHeroGeometryDeltas } from '../p0vrReplication4R3/measureHeroGeometry.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';
import type { HeroMeasurementSource } from '../p0vrReplication4R3R1/types.js';
import { MAX_OUTLIER_CONVERGENCE_PASSES } from './constants.js';
import { buildHeroConvergenceBaseline } from './buildHeroConvergenceBaseline.js';
import { rankHeroOutliers } from './rankHeroOutliers.js';
import { buildHeroOutlierCorrection } from './buildHeroOutlierCorrections.js';
import { applySimulatedHeroNudge } from './applySimulatedHeroNudge.js';
import { HERO_OUTLIER_PASS_FOCUS, passAllowsObject } from './heroOutlierPassFocus.js';
import type {
  HeroConvergencePassResult,
  HeroConvergenceReceipt,
  HeroOutlierConvergenceReport,
} from './types.js';
import { P0_VR_REPLICATION_4R4_BUILD } from './constants.js';
import { buildHeroCssPatchFromLayout } from '../p0vrReplication4R3/heroLayoutSpec.js';

function outlierIdsFromDeltas(deltas: ReturnType<typeof computeHeroGeometryDeltas>): HeroObjectId[] {
  return deltas
    .filter((d) => d.objectId !== 'H07' && d.status === 'OUT_OF_TOLERANCE')
    .map((d) => d.objectId as HeroObjectId);
}

function mergePatch(base: Record<string, string>, delta: Record<string, string>): Record<string, string> {
  return { ...base, ...delta };
}

function buildReceipt(input: {
  baselineOutliers: HeroObjectId[];
  passOutliers: HeroObjectId[][];
  finalOutliers: HeroObjectId[];
  baseline: ReturnType<typeof buildHeroConvergenceBaseline>;
  finalBaseline: ReturnType<typeof buildHeroConvergenceBaseline>;
  objectsChanged: HeroObjectId[];
}): HeroConvergenceReceipt {
  const allIds = [
    'H01',
    'H02',
    'H03',
    'H04',
    'H05',
    'H06',
    'H07',
    'H08',
    'H09',
    'H10',
    'H11',
    'H12',
    'H13',
    'H14',
  ] as HeroObjectId[];
  const untouched = allIds.filter((id) => id !== 'H07' && !input.objectsChanged.includes(id));

  let status: HeroConvergenceReceipt['status'] = 'FAIL';
  if (input.finalOutliers.length === 0) status = 'GEOMETRY_CONVERGED';
  else if (input.finalOutliers.length < input.baselineOutliers.length) status = 'PARTIAL';

  return {
    baselineOutliers: input.baselineOutliers,
    pass1Outliers: input.passOutliers[0] ?? [],
    pass2Outliers: input.passOutliers[1] ?? [],
    pass3Outliers: input.passOutliers[2] ?? [],
    finalOutliers: input.finalOutliers,
    baselineMaxError: Math.max(input.baseline.maxPositionError, input.baseline.maxSizeError),
    finalMaxError: Math.max(input.finalBaseline.maxPositionError, input.finalBaseline.maxSizeError),
    baselineMeanError: (input.baseline.meanPositionError + input.baseline.meanSizeError) / 2,
    finalMeanError: (input.finalBaseline.meanPositionError + input.finalBaseline.meanSizeError) / 2,
    objectsChanged: input.objectsChanged,
    objectsUntouched: untouched,
    status,
  };
}

export function runHeroOutlierConvergence(input: {
  sessionId: string;
  twinId: string;
  authorityId: string;
  measurementSource: HeroMeasurementSource;
  authority: HeroAuthorityGeometryFull[];
  rendered: HeroRenderedGeometryFull[];
  baseCssPatch?: Record<string, string>;
}): HeroOutlierConvergenceReport {
  let cssPatch = mergePatch(buildHeroCssPatchFromLayout(), input.baseCssPatch ?? {});
  let simulatedRendered = [...input.rendered];
  let deltas = computeHeroGeometryDeltas(input.authority, simulatedRendered);
  const baseline = buildHeroConvergenceBaseline({
    twinId: input.twinId,
    authorityId: input.authorityId,
    measurementSource: input.measurementSource,
    authority: input.authority,
    deltas,
  });
  const baselineOutliers = baseline.outliers;
  const ranking = rankHeroOutliers(deltas);
  const passes: HeroConvergencePassResult[] = [];
  const passOutlierSnapshots: HeroObjectId[][] = [];
  const objectsChanged = new Set<HeroObjectId>();

  for (let passIndex = 1; passIndex <= MAX_OUTLIER_CONVERGENCE_PASSES; passIndex += 1) {
    const focus = HERO_OUTLIER_PASS_FOCUS[passIndex]!;
    const outliersThisPass = outlierIdsFromDeltas(deltas);
    passOutlierSnapshots.push([...outliersThisPass]);

    if (outliersThisPass.length === 0 && passIndex > 1) break;
    if (outliersThisPass.length === 0 && passIndex === 1) break;

    const corrections: HeroConvergencePassResult['corrections'] = [];
    const ranked = rankHeroOutliers(deltas);

    for (const entry of ranked) {
      if (!passAllowsObject(passIndex, entry.objectId)) continue;
      if (passIndex === 1 && outliersThisPass.includes('H14') && entry.objectId !== 'H14') continue;
      const { correction, patchDelta } = buildHeroOutlierCorrection({
        objectId: entry.objectId,
        delta: entry.delta,
        existingPatch: cssPatch,
        rootCause: `Live DOM ${focus} pass — measured outlier`,
      });
      if (correction.status === 'APPLIED') {
        cssPatch = mergePatch(cssPatch, patchDelta);
        objectsChanged.add(entry.objectId);
        corrections.push(correction);
      }
    }

    simulatedRendered = applySimulatedHeroNudge(simulatedRendered, cssPatch);
    deltas = computeHeroGeometryDeltas(input.authority, simulatedRendered);

    passes.push({
      passIndex,
      focus,
      outlierIds: outliersThisPass,
      corrections,
    });

    if (outlierIdsFromDeltas(deltas).length === 0) break;
  }

  const finalOutliers = outlierIdsFromDeltas(deltas);
  const finalBaseline = buildHeroConvergenceBaseline({
    twinId: input.twinId,
    authorityId: input.authorityId,
    measurementSource: input.measurementSource,
    authority: input.authority,
    deltas,
  });

  const receipt = buildReceipt({
    baselineOutliers,
    passOutliers: passOutlierSnapshots,
    finalOutliers,
    baseline,
    finalBaseline,
    objectsChanged: [...objectsChanged],
  });

  let status: HeroOutlierConvergenceReport['status'] = receipt.status;
  if (input.measurementSource !== 'LIVE_BROWSER_DOM' && input.measurementSource !== 'PLAYWRIGHT_DOM') {
    status = 'PENDING_LIVE_CONVERGENCE';
  }

  return {
    buildRef: P0_VR_REPLICATION_4R4_BUILD,
    sessionId: input.sessionId,
    baseline,
    ranking,
    passes,
    receipt,
    cssPatch,
    measurementSource: input.measurementSource,
    status,
  };
}
