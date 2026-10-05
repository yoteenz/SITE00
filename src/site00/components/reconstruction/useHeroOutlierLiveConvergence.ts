/**
 * P0.VR.REPLICATION.4R4R1 — Live browser factual outlier convergence (3+3+remainder passes).
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import type { HeroOutlierConvergenceReport } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4/types.js';
import type { HeroOutlierConvergenceRunReport, HeroOutlierPatch } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4R1/types.js';
import { rankHeroOutliers } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4/rankHeroOutliers.js';
import { buildHeroConvergenceBaseline } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4/buildHeroConvergenceBaseline.js';
import { P0_VR_REPLICATION_4R4_BUILD } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4/constants.js';
import {
  HERO_OUTLIER_PASS1_MAX,
  HERO_OUTLIER_PASS2_MAX,
  P0_VR_REPLICATION_4R4R1_BUILD,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4R1/constants.js';
import { buildHeroOutlierSnapshot } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4R1/buildHeroOutlierSnapshot.js';
import { buildFactualHeroPatch } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4R1/buildFactualHeroPatch.js';
import type { HeroObjectId } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R2/types.js';
import type { HeroGeometryDeltaFull } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R3/types.js';
import {
  captureHeroLiveDomGeometry,
  waitForHeroRenderStabilization,
} from './captureHeroLiveDomGeometry.js';
import type { HeroLiveDomCaptureResult } from './captureHeroLiveDomGeometry.js';
import { useHeroLiveDomCapture } from './useHeroLiveDomCapture.js';

declare global {
  interface Window {
    __HERO_MEASURE_AUTHORITY__?: NonNullable<
      ReconstructionTwinSession['heroGeometryConvergenceReport']
    >['authorityGeometry'];
    __HERO_OUTLIER_SNAPSHOT__?: ReturnType<typeof buildHeroOutlierSnapshot>;
  }
}

export type HeroOutlierLiveConvergenceState = {
  liveCapture: HeroLiveDomCaptureResult | null;
  outlierCssPatch: Record<string, string>;
  report: HeroOutlierConvergenceReport | null;
  runReport: HeroOutlierConvergenceRunReport | null;
};

const PARENT_FIRST: HeroObjectId[] = ['H14', 'H09', 'H06'];

function mergePatch(base: Record<string, string>, delta: Record<string, string>): Record<string, string> {
  return { ...base, ...delta };
}

function outlierIds(deltas: HeroGeometryDeltaFull[]): HeroObjectId[] {
  return deltas
    .filter((d) => d.objectId !== 'H07' && d.status === 'OUT_OF_TOLERANCE')
    .map((d) => d.objectId as HeroObjectId);
}

function pickPassTargets(deltas: HeroGeometryDeltaFull[], max: number): HeroObjectId[] {
  const ids = outlierIds(deltas);
  const ranked = rankHeroOutliers(deltas);
  const ordered: HeroObjectId[] = [];
  for (const parent of PARENT_FIRST) {
    if (ids.includes(parent)) ordered.push(parent);
  }
  for (const entry of ranked) {
    if (ordered.length >= max) break;
    if (!ids.includes(entry.objectId) || ordered.includes(entry.objectId)) continue;
    ordered.push(entry.objectId);
  }
  return ordered.slice(0, max);
}

function applyCssPatchToRoot(cssPatch: Record<string, string>) {
  const root = document.querySelector('.site00-fb') as HTMLElement | null;
  if (!root) return;
  for (const [k, v] of Object.entries(cssPatch)) {
    root.style.setProperty(k, v);
  }
}

function runPass(deltas: HeroGeometryDeltaFull[], max: number, patchIn: Record<string, string>) {
  let cssPatchLocal = { ...patchIn };
  const patches: HeroOutlierPatch[] = [];
  for (const objectId of pickPassTargets(deltas, max)) {
    const delta = deltas.find((d) => d.objectId === objectId);
    if (!delta) continue;
    const { patch, outlierPatch } = buildFactualHeroPatch({ objectId, delta, cssPatch: cssPatchLocal });
    if (outlierPatch.status === 'APPLIED') {
      cssPatchLocal = mergePatch(cssPatchLocal, patch);
      patches.push(outlierPatch);
    }
  }
  return { cssPatch: cssPatchLocal, patches };
}

export function useHeroOutlierLiveConvergence(
  session: ReconstructionTwinSession,
  options?: { baselineMeasureOnly?: boolean },
): HeroOutlierLiveConvergenceState {
  const baselineOnly = options?.baselineMeasureOnly ?? false;
  const baselineCapture = useHeroLiveDomCapture(session);
  const [params] = useSearchParams();
  const active = params.get('blueprintDebug') === 'hero';
  const [state, setState] = useState<HeroOutlierLiveConvergenceState>({
    liveCapture: null,
    outlierCssPatch: {},
    report: null,
    runReport: null,
  });

  useEffect(() => {
    if (!baselineOnly || !active) return;
    const authority = session.heroGeometryConvergenceReport?.authorityGeometry ?? [];
    if (authority.length >= 14) window.__HERO_MEASURE_AUTHORITY__ = authority;
    if (!baselineCapture) return;
    window.__HERO_OUTLIER_SNAPSHOT__ = buildHeroOutlierSnapshot({
      twinId: session.sessionId,
      measurementSource: 'LIVE_BROWSER_DOM',
      measuredCount: baselineCapture.geometryReceiptV2?.measuredCount ?? 14,
      renderedCount: baselineCapture.captureReceipt.foundCount,
      deltas: baselineCapture.geometryDeltas,
    });
  }, [baselineOnly, active, session, baselineCapture]);

  useEffect(() => {
    if (baselineOnly || !active) {
      if (!baselineOnly) setState({ liveCapture: null, outlierCssPatch: {}, report: null, runReport: null });
      return;
    }

    let cancelled = false;
    const authority = session.heroGeometryConvergenceReport?.authorityGeometry ?? [];
    const baseCss = (session.twinForensicCssPatch ?? {}) as Record<string, string>;
    window.__HERO_MEASURE_AUTHORITY__ = authority;

    (async () => {
      await waitForHeroRenderStabilization();
      if (cancelled || authority.length < 14) return;

      let cssPatch = { ...baseCss };
      let liveCapture = captureHeroLiveDomGeometry(authority);
      const sessionId = session.sessionId;

      const initialSnapshot = buildHeroOutlierSnapshot({
        twinId: sessionId,
        measurementSource: 'LIVE_BROWSER_DOM',
        measuredCount: liveCapture.geometryReceiptV2?.measuredCount ?? 14,
        renderedCount: liveCapture.captureReceipt.foundCount,
        deltas: liveCapture.geometryDeltas,
      });
      window.__HERO_OUTLIER_SNAPSHOT__ = initialSnapshot;

      let pass1Patches: HeroOutlierPatch[] = [];
      let pass2Patches: HeroOutlierPatch[] = [];
      let pass3Patches: HeroOutlierPatch[] = [];

      if (initialSnapshot.outlierCount === 0) {
        publishState();
        return;
      }

      ({ cssPatch, patches: pass1Patches } = runPass(liveCapture.geometryDeltas, HERO_OUTLIER_PASS1_MAX, cssPatch));
      applyCssPatchToRoot(cssPatch);
      await waitForHeroRenderStabilization();
      liveCapture = captureHeroLiveDomGeometry(authority);
      if (outlierIds(liveCapture.geometryDeltas).length === 0) {
        publishState();
        return;
      }

      ({ cssPatch, patches: pass2Patches } = runPass(liveCapture.geometryDeltas, HERO_OUTLIER_PASS2_MAX, cssPatch));
      applyCssPatchToRoot(cssPatch);
      await waitForHeroRenderStabilization();
      liveCapture = captureHeroLiveDomGeometry(authority);
      if (outlierIds(liveCapture.geometryDeltas).length === 0) {
        publishState();
        return;
      }

      const remaining = outlierIds(liveCapture.geometryDeltas).length;
      ({ cssPatch, patches: pass3Patches } = runPass(liveCapture.geometryDeltas, remaining, cssPatch));
      applyCssPatchToRoot(cssPatch);
      await waitForHeroRenderStabilization();
      liveCapture = captureHeroLiveDomGeometry(authority);
      publishState();

      function publishState() {
        if (cancelled) return;
        const finalOutliers = outlierIds(liveCapture.geometryDeltas);
        const baseline = buildHeroConvergenceBaseline({
          twinId: sessionId,
          authorityId: session.designAuthorityAssetRef ?? sessionId,
          measurementSource: 'LIVE_BROWSER_DOM',
          authority,
          deltas: liveCapture.geometryDeltas,
        });
        setState({
          liveCapture,
          outlierCssPatch: cssPatch,
          report: {
            buildRef: P0_VR_REPLICATION_4R4_BUILD,
            sessionId,
            baseline,
            ranking: rankHeroOutliers(liveCapture.geometryDeltas),
            passes: [],
            receipt: {
              baselineOutliers: initialSnapshot.outliers.map((o) => o.objectId),
              pass1Outliers: [],
              pass2Outliers: [],
              pass3Outliers: [],
              finalOutliers,
              baselineMaxError: 0,
              finalMaxError: 0,
              baselineMeanError: 0,
              finalMeanError: 0,
              objectsChanged: [],
              objectsUntouched: [],
              status: finalOutliers.length === 0 ? 'GEOMETRY_CONVERGED' : 'PARTIAL',
            },
            cssPatch,
            measurementSource: 'LIVE_BROWSER_DOM',
            status: finalOutliers.length === 0 ? 'GEOMETRY_CONVERGED' : 'PARTIAL',
          },
          runReport: {
            buildRef: P0_VR_REPLICATION_4R4R1_BUILD,
            sessionId,
            initialSnapshot,
            pass1Patches,
            pass1OutlierCount: initialSnapshot.outlierCount,
            pass2Patches,
            pass2OutlierCount: pass2Patches.length ? outlierIds(liveCapture.geometryDeltas).length : 0,
            pass3Patches,
            finalOutlierIds: finalOutliers,
            finalDeltas: liveCapture.geometryDeltas,
            plateau: {
              detected: false,
              consecutivePassesWithoutImprovement: 0,
              status: 'NONE',
              lastOutlierCount: finalOutliers.length,
              lastMaxError: 0,
              lastMeanError: 0,
            },
            limitClassifications: {},
            regressions: [],
            heroLockGuard: {
              heroState: finalOutliers.length === 0 ? 'LOCKED' : 'OPEN',
              allowsHeroCssMutation: finalOutliers.length !== 0,
              allowsHeroAssetMutation: finalOutliers.length !== 0,
              allowsHeroLayoutMutation: finalOutliers.length !== 0,
            },
            cssPatch,
            status: finalOutliers.length === 0 ? 'GEOMETRY_CONVERGED' : 'PARTIAL',
          },
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    active,
    baselineOnly,
    session.sessionId,
    session.heroSafeRegionCropUrls?.H06,
    session.heroSafeRegionCropUrls?.H12,
    session.heroGeometryConvergenceReport?.authorityGeometry,
    session.twinForensicCssPatch,
    session.designAuthorityAssetRef,
  ]);

  if (baselineOnly && active) {
    return { liveCapture: baselineCapture, outlierCssPatch: {}, report: null, runReport: null };
  }

  return active ? state : { liveCapture: null, outlierCssPatch: {}, report: null, runReport: null };
}
