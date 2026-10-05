/**
 * P0.VR.REPLICATION.3C-R1 — Proof hero slice with real <img> binding + decode visibility.
 */

import { useEffect, useRef, useState } from 'react';
import { HERO_MATERIALIZATION_PROOF_SLOT_ID } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3cR1/constants.js';

type Props = {
  slotId: string;
  src: string;
  className?: string;
  objectPosition?: string;
};

export function HeroMaterializedSliceImage({ slotId, src, className, objectPosition }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div
      className={`site00-vlt__image-slice site00-vlt__image-slice--materialized${loaded ? ' site00-vlt__image-slice--decoded' : ''}${className ? ` ${className}` : ''}`}
      data-asset-slot={slotId}
      data-proof-slot={slotId === HERO_MATERIALIZATION_PROOF_SLOT_ID ? 'true' : undefined}
    >
      <img
        ref={imgRef}
        className="site00-vlt__image-slice__photo"
        src={src}
        alt=""
        decoding="async"
        draggable={false}
        style={{ objectPosition: objectPosition ?? 'center' }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      />
    </div>
  );
}
