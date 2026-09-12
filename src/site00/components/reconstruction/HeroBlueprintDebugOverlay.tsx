/**
 * P0.VR.REPLICATION.4R2/4R3 — Hero-only blueprint debug (?blueprintDebug=hero).
 */

import { useSearchParams } from 'react-router-dom';
import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import type { HeroInspectionLayerFlags } from './HeroInspectionToolbar.js';
import '../../styles/site00-hero-blueprint-debug.css';

type Props = {
  session: ReconstructionTwinSession;
  layers: HeroInspectionLayerFlags;
};

function deltaClass(severity: string | undefined): string {
  if (severity === 'GREEN') return 'site00-hero-debug__delta--green';
  if (severity === 'YELLOW') return 'site00-hero-debug__delta--yellow';
  return 'site00-hero-debug__delta--red';
}

export function HeroBlueprintDebugOverlay({ session, layers }: Props) {
  const [params] = useSearchParams();
  if (params.get('blueprintDebug') !== 'hero') return null;

  const convergence = session.heroGeometryConvergenceReport;
  const contracts = session.heroSurgicalLockReport?.contracts ?? [];
  const authority =
    convergence?.authorityGeometry ??
    contracts.map((c) => ({
      objectId: c.objectId,
      targetX: c.authorityBounds.x,
      targetY: c.authorityBounds.y,
      targetWidth: c.authorityBounds.width,
      targetHeight: c.authorityBounds.height,
    }));
  const rendered = convergence?.renderedGeometry ?? [];
  const deltas = convergence?.geometryDeltas ?? [];

  return (
    <div className="site00-hero-debug" aria-hidden="true">
      {layers.labels ? (
        <p className="site00-hero-debug__label">
          HERO DEBUG · {authority.length} authority · {rendered.length} rendered
        </p>
      ) : null}
      {layers.authorityBoxes
        ? authority.map((a) => (
            <div
              key={`auth-${a.objectId}`}
              className="site00-hero-debug__box site00-hero-debug__box--authority"
              style={{
                left: a.targetX,
                top: a.targetY,
                width: a.targetWidth,
                height: a.targetHeight,
              }}
              title={`${a.objectId} authority`}
            >
              {layers.labels ? <span>{a.objectId}</span> : null}
            </div>
          ))
        : null}
      {layers.renderedBoxes
        ? rendered.map((r) => {
            if (r.actualWidth <= 0 && r.objectId === 'H07') return null;
            return (
              <div
                key={`rend-${r.objectId}`}
                className="site00-hero-debug__box site00-hero-debug__box--rendered"
                style={{
                  left: r.actualX,
                  top: r.actualY,
                  width: r.actualWidth,
                  height: r.actualHeight,
                }}
                title={`${r.objectId} rendered`}
              >
                {layers.labels ? <span>{r.objectId}</span> : null}
              </div>
            );
          })
        : null}
      {layers.deltas
        ? deltas.map((d) => {
            if (d.objectId === 'H07') return null;
            const auth = authority.find((a) => a.objectId === d.objectId);
            if (!auth) return null;
            return (
              <span
                key={`d-${d.objectId}`}
                className={`site00-hero-debug__delta ${deltaClass(d.severity)}`}
                style={{ left: auth.targetX, top: Math.max(0, auth.targetY - 10) }}
              >
                {d.objectId} Δx{d.deltaX >= 0 ? '+' : ''}
                {Math.round(d.deltaX)} Δy{d.deltaY >= 0 ? '+' : ''}
                {Math.round(d.deltaY)}
              </span>
            );
          })
        : null}
      {layers.collisions
        ? session.heroSurgicalLockReport?.collisionAudit.collisions.map((col, i) => (
            <span key={i} className="site00-hero-debug__collision">
              {col.objectA}×{col.objectB}
            </span>
          ))
        : null}
    </div>
  );
}
