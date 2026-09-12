/**
 * P0.VR.REPLICATION.4 — BLUEPRINT VS TWIN debug overlay (?blueprintDebug=1).
 */

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import '../../styles/site00-blueprint-vs-twin-overlay.css';

type Props = {
  session: ReconstructionTwinSession;
};

export function BlueprintVsTwinOverlay({ session }: Props) {
  const [params] = useSearchParams();
  const mode = params.get('blueprintDebug');
  const objects = session.forensicAuthorityBlueprint?.objects ?? [];

  const required = useMemo(
    () => objects.filter((o) => o.required && o.parentSection !== 'device-chrome'),
    [objects],
  );

  if (!mode || mode === '0') return null;

  return (
    <div className={`site00-bp-overlay site00-bp-overlay--${mode}`} aria-hidden="true">
      <p className="site00-bp-overlay__label">
        BLUEPRINT VS TWIN · {mode.toUpperCase()} · {required.length} objects
      </p>
      {required.map((obj) => {
        const left = (obj.x / 375) * 100;
        const top = (obj.y / 812) * 100;
        const width = (obj.width / 375) * 100;
        const height = (obj.height / 812) * 100;
        return (
          <div
            key={obj.objectId}
            className="site00-bp-overlay__box"
            style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
            title={`${obj.objectId} ${obj.label}`}
          />
        );
      })}
    </div>
  );
}
