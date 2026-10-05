/** Screen shell: environment + content column. `data-runtime-bounds` marks blocks for the host BOUNDS overlay. */

import type { ReactNode } from 'react';
import { JurnlEnvironment, type JurnlScene } from '../components/Environment';
import { F02_PLATES, type F02PlateId } from '../../data/f02/plates';

export type FamilyPlate = { family: string; scene: string; src: string; assetId: string };

export function JurnlScreen({
  screenId,
  scene,
  plate,
  familyPlate,
  field,
  layout = 'hero',
  family = false,
  review = false,
  children,
}: {
  screenId: string;
  scene?: JurnlScene;
  /** F02 canonical plate. When set, the F01 scene plate is not mounted. */
  plate?: F02PlateId;
  /** Environment plate. Authorities are never passed here. */
  familyPlate?: FamilyPlate;
  /** Solid bone field when a family has no photographic plate. */
  field?: 'bone';
  layout?: 'hero' | 'form' | 'center' | 'card';
  family?: boolean;
  /** Parent review mount. The rail stays inside the quiet half of the plate. */
  review?: boolean;
  children: ReactNode;
}) {
  const f02 = plate ? F02_PLATES[plate] : null;
  const familyId = f02 ? 'F02' : familyPlate?.family;
  return (
    <section className="jrn-screen" data-transition={family ? 'family' : 'push'} data-jrn-screen={screenId} data-jrn-family={familyId} data-jrn-field={field} data-jrn-review={review ? 'parent' : undefined}>
      {f02 ?
        <div className="jrn-env" data-scene={plate} data-asset-id={f02.assetId} aria-hidden data-testid="jurnl-environment">
          <img className="jrn-plate" src={f02.src} alt="" width={2016} height={3584} data-asset-id={f02.assetId} draggable={false} />
        </div>
      : familyPlate ?
        <div className="jrn-env" data-scene={familyPlate.scene} data-asset-id={familyPlate.assetId} aria-hidden data-testid="jurnl-environment">
          <img className="jrn-plate" src={familyPlate.src} alt="" width={2016} height={3584} data-asset-id={familyPlate.assetId} draggable={false} />
        </div>
      : field === 'bone' ?
        <div className="jrn-env jrn-env--bone" data-scene="BONE" aria-hidden data-testid="jurnl-environment" />
      : <JurnlEnvironment scene={scene!} />}
      <div className={`jrn-col jrn-col--${layout}`} data-runtime-bounds="column">
        {children}
      </div>
    </section>
  );
}
