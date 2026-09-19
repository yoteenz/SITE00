/**
 * P0.VR.CONVERGE.1 — Apply measured-spec CSS variables on twin preview only.
 */

import { useMemo, type CSSProperties } from 'react';
import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import { buildTwinCssPatch } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrConverge1/twinCssPatchEngine.js';

export function ReconstructionTwinStyleLayer({ session }: { session: ReconstructionTwinSession }) {
  const patch = useMemo(
    () =>
      session.twinCssPatch ??
      buildTwinCssPatch({
        plan: session.reconstructionPlan,
        regionDecisions: session.regionExecutionDecisions,
      }),
    [session],
  );

  const style = useMemo(
    () =>
      ({
        ...patch.cssVariables,
      }) as CSSProperties,
    [patch.cssVariables],
  );

  if (!Object.keys(patch.cssVariables).length && !patch.inlineRules.length) return null;

  return (
    <>
      <div className="site00-reconstruction-twin-style-layer" style={style} aria-hidden />
      {patch.inlineRules.length ? <style>{patch.inlineRules.join('\n')}</style> : null}
    </>
  );
}
