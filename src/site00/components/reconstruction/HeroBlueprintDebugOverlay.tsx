/**
 * P0.VR.REPLICATION.4R2 — Hero-only blueprint debug (?blueprintDebug=hero).
 */

import { useSearchParams } from 'react-router-dom';
import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import '../../styles/site00-hero-blueprint-debug.css';

type Props = {
  session: ReconstructionTwinSession;
};

export function HeroBlueprintDebugOverlay({ session }: Props) {
  const [params] = useSearchParams();
  if (params.get('blueprintDebug') !== 'hero') return null;

  const contracts = session.heroSurgicalLockReport?.contracts ?? [];

  return (
    <div className="site00-hero-debug" aria-hidden="true">
      <p className="site00-hero-debug__label">HERO DEBUG · {contracts.length} objects</p>
      {contracts.map((c) => {
        const b = c.authorityBounds;
        return (
          <div
            key={c.objectId}
            className="site00-hero-debug__box"
            style={{
              left: b.x,
              top: b.y,
              width: b.width,
              height: b.height,
            }}
            title={`${c.objectId} · ${c.role}`}
          >
            <span>{c.objectId}</span>
          </div>
        );
      })}
      {session.heroSurgicalLockReport?.collisionAudit.collisions.map((col, i) => (
        <span key={i} className="site00-hero-debug__collision">
          {col.objectA}×{col.objectB}
        </span>
      ))}
    </div>
  );
}
