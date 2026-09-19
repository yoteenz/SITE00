import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import type { HeroLiveDomCaptureResult } from './captureHeroLiveDomGeometry.js';
import {
  captureHeroLiveDomGeometry,
  waitForHeroRenderStabilization,
} from './captureHeroLiveDomGeometry.js';

export function useHeroLiveDomCapture(session: ReconstructionTwinSession): HeroLiveDomCaptureResult | null {
  const [params] = useSearchParams();
  const [result, setResult] = useState<HeroLiveDomCaptureResult | null>(null);
  const active = params.get('blueprintDebug') === 'hero';

  useEffect(() => {
    if (!active) {
      setResult(null);
      return;
    }

    let cancelled = false;
    const authority = session.heroGeometryConvergenceReport?.authorityGeometry ?? [];

    (async () => {
      await waitForHeroRenderStabilization();
      if (cancelled || authority.length < 14) return;
      const captured = captureHeroLiveDomGeometry(authority);
      if (!cancelled) setResult(captured);
      await new Promise((r) => setTimeout(r, 120));
      if (cancelled) return;
      const again = captureHeroLiveDomGeometry(authority);
      if (!cancelled) setResult(again);
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
  ]);

  return active ? result : null;
}
