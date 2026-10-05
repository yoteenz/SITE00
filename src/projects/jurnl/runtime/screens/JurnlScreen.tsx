/** Screen shell: environment + content column. `data-runtime-bounds` marks blocks for the host BOUNDS overlay. */

import type { ReactNode } from 'react';
import { JurnlEnvironment, type JurnlScene } from '../components/Environment';
import { F02_PLATES, type F02PlateId } from '../../data/f02/plates';

export function JurnlScreen({
  screenId,
  scene,
  plate,
  layout = 'hero',
  family = false,
  children,
}: {
  screenId: string;
  scene?: JurnlScene;
  /** F02 canonical plate. When set, the F01 scene plate is not mounted. */
  plate?: F02PlateId;
  layout?: 'hero' | 'form' | 'center' | 'card';
  family?: boolean;
  children: ReactNode;
}) {
  const f02 = plate ? F02_PLATES[plate] : null;
  return (
    <section className="jrn-screen" data-transition={family ? 'family' : 'push'} data-jrn-screen={screenId} data-jrn-family={f02 ? 'F02' : undefined}>
      {f02 ?
        <div className="jrn-env" data-scene={plate} data-asset-id={f02.assetId} aria-hidden data-testid="jurnl-environment">
          <img className="jrn-plate" src={f02.src} alt="" width={2016} height={3584} data-asset-id={f02.assetId} draggable={false} />
        </div>
      : <JurnlEnvironment scene={scene!} />}
      <div className={`jrn-col jrn-col--${layout}`} data-runtime-bounds="column">
        {children}
      </div>
    </section>
  );
}
