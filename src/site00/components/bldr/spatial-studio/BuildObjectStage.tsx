import type { PlacePathId, FeelVibeId, WorkModuleId, BuildObjectViewId, SpatialRoomId } from '../../../builder-experience/spatialStudio/types';
import { BldrStudioIcon } from './BldrStudioIcon';

type Props = {
  placePath: PlacePathId | null;
  feelVibe: FeelVibeId | null;
  workModules: WorkModuleId[];
  view: BuildObjectViewId;
  room?: SpatialRoomId;
  onViewChange?: (view: BuildObjectViewId) => void;
  compact?: boolean;
};

export function BuildObjectStage({ placePath, feelVibe, workModules, view, room, onViewChange, compact }: Props) {
  const layerCount = Math.min(6, 2 + workModules.length + (placePath === 'WORLD' ? 2 : placePath === 'ADVANCED' ? 1 : 0));
  return (
    <div
      className={`bldr-spatial-object${compact ? ' bldr-spatial-object--compact' : ''}${feelVibe ? ` bldr-spatial-object--feel-${feelVibe.toLowerCase()}` : ''}${placePath ? ` bldr-spatial-object--place-${placePath.toLowerCase()}` : ''}${room ? ` bldr-spatial-object--room-${room.toLowerCase()}` : ''} bldr-spatial-object--view-${view.toLowerCase()}`}
      data-room={room}
      aria-hidden
    >
      <div className="bldr-spatial-object__atrium" />
      <div className="bldr-spatial-object__plinth" />
      <div className="bldr-spatial-object__glass">
        {Array.from({ length: layerCount }).map((_, i) => (
          <div key={i} className="bldr-spatial-object__slab" style={{ ['--i' as string]: i }} />
        ))}
        <div className="bldr-spatial-object__portal" />
        <div className="bldr-spatial-object__core" />
      </div>
      {onViewChange ? (
        <div className="bldr-spatial-object__inspect" role="toolbar" aria-label="Architectural views">
          {(['FRONT', 'SIDE', 'EXPLODED'] as BuildObjectViewId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={view === id ? 'is-active' : undefined}
              onClick={() => onViewChange(id)}
            >
              <BldrStudioIcon name={id === 'EXPLODED' ? 'layers' : id === 'SIDE' ? 'inspect' : 'cube'} />
              <span className="bldr-spatial-sr">{id}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
