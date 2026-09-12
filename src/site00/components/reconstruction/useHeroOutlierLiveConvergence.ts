/**
 * P0.VR.REPLICATION.4R4 — Live browser outlier-only convergence (max 3 passes).
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import type { HeroOutlierConvergenceReport } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4/types.js';
import { rankHeroOutliers } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4/rankHeroOutliers.js';
import { buildHeroConvergenceBaseline } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4/buildHeroConvergenceBaseline.js';
import {
  MAX_OUTLIER_CONVERGENCE_PASSES,
  P0_VR_REPLICATION_4R4_BUILD,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4/constants.js';
import { HERO_OUTLIER_PASS_FOCUS, passAllowsObject } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4/heroOutlierPassFocus.js';
import { buildHeroOutlierCorrection } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R4/buildHeroOutlierCorrections.js';
import type { HeroObjectId } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R2/types.js';
import {
  captureHeroLiveDomGeometry,
  waitForHeroRenderStabilization,
} from './captureHeroLiveDomGeometry.js';
import type { HeroLiveDomCaptureResult } from './captureHeroLiveDomGeometry.js';

export type HeroOutlierLiveConvergenceState = {
  liveCapture: HeroLiveDomCaptureResult | null;
  outlierCssPatch: Record<string, string>;
  report: HeroOutlierConvergenceReport | null;
};

function mergePatch(base: Record<string, string>, delta: Record<string, string>): Record<string, string> {
  return { ...base, ...delta };
}

export function useHeroOutlierLiveConvergence(session: ReconstructionTwinSession): HeroOutlierLiveConvergenceState {
  const [params] = useSearchParams();
  const active = params.get('blueprintDebug') === 'hero';
  const [state, setState] = useState<HeroOutlierLiveConvergenceState>({
    liveCapture: null,
    outlierCssPatch: {},
    report: null,
  });

  useEffect(() => {
    if (!active) {
      setState({ liveCapture: null, outlierCssPatch: {}, report: null });
      return;
    }

    let cancelled = false;
    const authority = session.heroGeometryConvergenceReport?.authorityGeometry ?? [];
    const baseCss = (session.twinForensicCssPatch ?? {}) as Record<string, string>;

    (async () => {
      await waitForHeroRenderStabilization();
      if (cancelled || authority.length < 14) return;

      let cssPatch = { ...baseCss };
      let liveCapture = captureHeroLiveDomGeometry(authority);
      const sessionId = session.sessionId;
      const twinId = sessionId;
      const authorityId = session.designAuthorityAssetRef ?? sessionId;

      const baseline = buildHeroConvergenceBaseline({
        twinId,
        authorityId,
        measurementSource: 'LIVE_BROWSER_DOM',
        authority,
        deltas: liveCapture.geometryDeltas,
      });

      const passes: HeroOutlierConvergenceReport['passes'] = [];
      const objectsChanged = new Set<string>();
      const passOutlierSnapshots: string[][] = [];

      for (let passIndex = 1; passIndex <= MAX_OUTLIER_CONVERGENCE_PASSES; passIndex += 1) {
        const deltas = liveCapture.geometryDeltas;
        const outliers = deltas.filter((d) => d.objectId !== 'H07' && d.status === 'OUT_OF_TOLERANCE');
        passOutlierSnapshots.push(outliers.map((d) => d.objectId));

        if (outliers.length === 0) break;

        const focus = HERO_OUTLIER_PASS_FOCUS[passIndex]!;
        const corrections: HeroOutlierConvergenceReport['passes'][0]['corrections'] = [];
        const ranked = rankHeroOutliers(deltas);
        const hasH14 = outliers.some((d) => d.objectId === 'H14');

        for (const entry of ranked) {
          if (!passAllowsObject(passIndex, entry.objectId)) continue;
          if (hasH14 && passIndex === 1 && entry.objectId !== 'H14' && !['H06', 'H09'].includes(entry.objectId)) {
            continue;
          }
          const { correction, patchDelta } = buildHeroOutlierCorrection({
            objectId: entry.objectId,
            delta: entry.delta,
            existingPatch: cssPatch,
            rootCause: `Live DOM ${focus}`,
          });
          if (correction.status === 'APPLIED') {
            cssPatch = mergePatch(cssPatch, patchDelta);
            objectsChanged.add(entry.objectId);
            corrections.push(correction);
          }
        }

        passes.push({
          passIndex,
          focus,
          outlierIds: outliers.map((d) => d.objectId),
          corrections,
        });

        if (corrections.length === 0) break;

        const root = document.querySelector('.site00-fb') as HTMLElement | null;
        if (root) {
          for (const [k, v] of Object.entries(cssPatch)) {
            root.style.setProperty(k, v);
          }
        }

        await waitForHeroRenderStabilization();
        if (cancelled) return;
        liveCapture = captureHeroLiveDomGeometry(authority);

        if (liveCapture.geometryDeltas.filter((d) => d.status === 'OUT_OF_TOLERANCE' && d.objectId !== 'H07').length === 0) {
          break;
        }
      }

      const finalDeltas = liveCapture.geometryDeltas;
      const finalBaseline = buildHeroConvergenceBaseline({
        twinId,
        authorityId,
        measurementSource: 'LIVE_BROWSER_DOM',
        authority,
        deltas: finalDeltas,
      });
      const finalOutliers = finalBaseline.outliers;

      const receipt: HeroOutlierConvergenceReport['receipt'] = {
        baselineOutliers: baseline.outliers,
        pass1Outliers: (passOutlierSnapshots[0] ?? []) as HeroOutlierConvergenceReport['receipt']['baselineOutliers'],
        pass2Outliers: (passOutlierSnapshots[1] ?? []) as HeroOutlierConvergenceReport['receipt']['pass2Outliers'],
        pass3Outliers: (passOutlierSnapshots[2] ?? []) as HeroOutlierConvergenceReport['receipt']['pass3Outliers'],
        finalOutliers,
        baselineMaxError: Math.max(baseline.maxPositionError, baseline.maxSizeError),
        finalMaxError: Math.max(finalBaseline.maxPositionError, finalBaseline.maxSizeError),
        baselineMeanError: (baseline.meanPositionError + baseline.meanSizeError) / 2,
        finalMeanError: (finalBaseline.meanPositionError + finalBaseline.meanSizeError) / 2,
        objectsChanged: [...objectsChanged] as HeroOutlierConvergenceReport['receipt']['objectsChanged'],
        objectsUntouched: (['H01', 'H02', 'H03', 'H04', 'H05', 'H06', 'H08', 'H09', 'H10', 'H11', 'H12', 'H13', 'H14'] as HeroObjectId[]).filter(
          (id) => !objectsChanged.has(id),
        ),
        status: finalOutliers.length === 0 ? 'GEOMETRY_CONVERGED' : 'PARTIAL',
      };

      const report: HeroOutlierConvergenceReport = {
        buildRef: P0_VR_REPLICATION_4R4_BUILD,
        sessionId,
        baseline,
        ranking: rankHeroOutliers(liveCapture.geometryDeltas),
        passes,
        receipt,
        cssPatch,
        measurementSource: 'LIVE_BROWSER_DOM',
        status: finalOutliers.length === 0 ? 'GEOMETRY_CONVERGED' : 'PARTIAL',
      };

      if (!cancelled) {
        setState({
          liveCapture,
          outlierCssPatch: cssPatch,
          report,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    active,
    session.sessionId,
    session.heroSafeRegionCropUrls?.H06,
    session.heroSafeRegionCropUrls?.H12,
    session.heroGeometryConvergenceReport?.authorityGeometry,
    session.twinForensicCssPatch,
    session.designAuthorityAssetRef,
  ]);

  return active ? state : { liveCapture: null, outlierCssPatch: {}, report: null };
}
