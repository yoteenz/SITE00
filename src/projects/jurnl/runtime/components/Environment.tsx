/**
 * JURNL F01 environment — canonical photographic plates.
 * Live type, forms, and controls stay in the column above this layer.
 * The plate is aria-hidden and does not receive pointer events.
 */

import type { CSSProperties } from 'react';
import { F01_ENVIRONMENT_PLATES, F01_SCENE_ENVIRONMENT, type JurnlScene } from '../../data/f01/environmentPlates';

export type { JurnlScene };

export function JurnlEnvironment({ scene }: { scene: JurnlScene }) {
  const binding = F01_SCENE_ENVIRONMENT[scene];
  const plate = F01_ENVIRONMENT_PLATES[binding.plate];
  const focal = plate[binding.focal];
  return (
    <div
      className="jrn-env"
      data-scene={scene}
      data-env={binding.env}
      data-asset-id={plate.assetId}
      aria-hidden
      data-testid="jurnl-environment"
      style={
        {
          '--jrn-plate-mobile': focal.mobile,
          '--jrn-plate-tablet': focal.tablet,
          '--jrn-plate-desktop': focal.desktop,
        } as CSSProperties
      }
    >
      <img className="jrn-plate" src={plate.filePath} alt="" width={plate.nativeWidth} height={plate.nativeHeight} data-asset-id={plate.assetId} draggable={false} />
    </div>
  );
}
