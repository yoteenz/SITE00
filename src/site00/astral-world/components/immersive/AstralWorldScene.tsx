import type { ReactNode } from 'react';
import type { AstralSceneId } from '../../../../../shared/site00-astral-world/scenes/types.js';
import { getSceneContract } from '../../../../../shared/site00-astral-world/scenes/sceneContracts.js';
import { AstralScene } from './AstralScene';

type AstralWorldSceneProps = {
  sceneId: AstralSceneId;
  className?: string;
  /** Layer 1 — world objects / destinations */
  objects?: ReactNode;
  /** Layer 2 — live presence / activity */
  presence?: ReactNode;
  /** Layer 3 — contextual interaction (hotspots, CTAs) */
  interaction?: ReactNode;
  /** Layer 4 — persistent HUD chips */
  hud?: ReactNode;
  /** Safe-region overlay content (welcome text, titles) */
  overlay?: ReactNode;
  /** Full viewport on mobile (default true) */
  viewport?: boolean;
  children?: ReactNode;
};

/**
 * Scene-first full-bleed shell: ROUTE → SCENE → ENVIRONMENT → INTERACTION.
 * Layer 0 = cinematic environment; upper layers stack without document scroll.
 */
export function AstralWorldScene({
  sceneId,
  className = '',
  objects,
  presence,
  interaction,
  hud,
  overlay,
  viewport = true,
  children,
}: AstralWorldSceneProps) {
  const contract = getSceneContract(sceneId);

  return (
    <div
      className={`aw-world-scene${viewport ? ' aw-world-scene--viewport' : ''} ${className}`.trim()}
      data-scene-id={sceneId}
      data-asset-slot={contract.assetSlotKeyMobile}
      data-screen-master="AW_M_01_WORLD_ENTRY"
    >
      <div className="aw-world-scene__layer aw-world-scene__layer--environment" aria-hidden={false}>
        <AstralScene
          crop={contract.backgroundCrop}
          cropMobile={contract.backgroundCropMobile}
          sceneId={sceneId}
          className="aw-world-scene__environment aw-scene"
          minHeight="100%"
          overlay
          responsive
        />
      </div>

      {objects ? (
        <div className="aw-world-scene__layer aw-world-scene__layer--objects">{objects}</div>
      ) : null}

      {presence ? (
        <div className="aw-world-scene__layer aw-world-scene__layer--presence">{presence}</div>
      ) : null}

      {interaction ? (
        <div className="aw-world-scene__layer aw-world-scene__layer--interaction">{interaction}</div>
      ) : null}

      {overlay ? (
        <div
          className="aw-world-scene__overlay"
          style={{
            left: `${contract.contentSafeRegion.xPercent}%`,
            top: `${contract.contentSafeRegion.yPercent}%`,
            width: `${contract.contentSafeRegion.widthPercent}%`,
            minHeight: `${contract.contentSafeRegion.heightPercent}%`,
          }}
        >
          {overlay}
        </div>
      ) : null}

      {hud ? <div className="aw-world-scene__layer aw-world-scene__layer--hud">{hud}</div> : null}

      {children}
    </div>
  );
}
