/**
 * Screen shell: environment + content column. `data-runtime-bounds` marks blocks for the host BOUNDS overlay.
 * `data-jrn-composition` is the composition mode contract (layout/compositionMode.ts): a screen that carries the
 * product nav is CENTER_STAGE unless route authority overrides it with a documented reason.
 */

import type { CSSProperties, ReactNode } from 'react';
import { JurnlEnvironment, type JurnlScene } from '../components/Environment';
import { F02_PLATES, type F02PlateId } from '../../data/f02/plates';
import { resolveCompositionMode, type JurnlCompositionMode } from '../layout/compositionMode';

export type FamilyPlate = {
  family: string;
  scene: string;
  src: string;
  assetId: string;
  width?: number;
  height?: number;
  /** Wider crops of the same scene. Mobile keeps `src`. */
  tabletSrc?: string;
  desktopSrc?: string;
};

export function JurnlScreen({
  screenId,
  scene,
  plate,
  familyPlate,
  field,
  layout = 'hero',
  family = false,
  review = false,
  frame = false,
  productNav = false,
  composition,
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
  /** Finite mobile composition frame (content rect + composition edge + nav reserve). No body scroll. */
  frame?: boolean;
  /** The screen renders the 5-item product nav → CENTER_STAGE by default. */
  productNav?: boolean;
  /** Route-authority override of the composition mode (must be documented in COMPOSITION_OVERRIDES). */
  composition?: JurnlCompositionMode;
  children: ReactNode;
}) {
  const f02 = plate ? F02_PLATES[plate] : null;
  const familyId = f02 ? 'F02' : familyPlate?.family;
  const mode = resolveCompositionMode({ screenId, hasProductNav: productNav, override: composition });
  // CENTER_STAGE: design at the perimeter, function in the centre. A calm, soft-focus copy of the same plate sits over
  // the functional safe zone and feathers out, so the corners and outer edges keep the photograph's detail.
  const calm = mode === 'CENTER_STAGE' && !f02 && familyPlate ? <span className="jrn-env__calm" aria-hidden data-jrn-calm={familyPlate.family} style={{ ['--jrn-calm-src' as string]: `url("${familyPlate.src}")` } as CSSProperties} /> : null;
  return (
    <section className="jrn-screen" data-transition={family ? 'family' : 'push'} data-jrn-screen={screenId} data-jrn-family={familyId} data-jrn-plate={f02 ? plate : undefined} data-jrn-field={field} data-jrn-review={review ? 'parent' : undefined} data-jrn-frame={frame ? 'family' : undefined} data-jrn-composition={mode}>
      {f02 ?
        <div className="jrn-env" data-scene={plate} data-asset-id={f02.assetId} aria-hidden data-testid="jurnl-environment">
          <img className="jrn-plate" src={f02.src} alt="" width={2016} height={3584} data-asset-id={f02.assetId} draggable={false} />
        </div>
      : familyPlate ?
        <div className="jrn-env" data-scene={familyPlate.scene} data-asset-id={familyPlate.assetId} aria-hidden data-testid="jurnl-environment">
          <picture>
            {familyPlate.desktopSrc ? <source media="(min-width: 1100px)" srcSet={familyPlate.desktopSrc} /> : null}
            {familyPlate.tabletSrc ? <source media="(min-width: 600px)" srcSet={familyPlate.tabletSrc} /> : null}
            <img className="jrn-plate" src={familyPlate.src} alt="" width={familyPlate.width ?? 2016} height={familyPlate.height ?? 3584} data-asset-id={familyPlate.assetId} draggable={false} />
          </picture>
          {calm}
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
