import type { PlacePathId, FeelVibeId, WorkModuleId, BuildObjectViewId } from '../../../builder-experience/spatialStudio/types';

type Props = {
  placePath: PlacePathId | null;
  feelVibe: FeelVibeId | null;
  workModules: WorkModuleId[];
  view: BuildObjectViewId;
  onViewChange?: (view: BuildObjectViewId) => void;
  compact?: boolean;
};

export function BuildObjectStage({ placePath, feelVibe, workModules, view, onViewChange, compact }: Props) {
  const layerCount = Math.min(6, 2 + workModules.length + (placePath === 'WORLD' ? 2 : placePath === 'ADVANCED' ? 1 : 0));
  return (
    <div
      className={`bldr-spatial-object${compact ? ' bldr-spatial-object--compact' : ''}${feelVibe ? ` bldr-spatial-object--feel-${feelVibe.toLowerCase()}` : ''}${placePath ? ` bldr-spatial-object--place-${placePath.toLowerCase()}` : ''} bldr-spatial-object--view-${view.toLowerCase()}`}
      aria-hidden
    >
      <div className="bldr-spatial-object__plinth" />
      <div className="bldr-spatial-object__glass">
        {Array.from({ length: layerCount }).map((_, i) => (
          <div key={i} className="bldr-spatial-object__slab" style={{ ['--i' as string]: i }} />
        ))}
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
              {id === 'FRONT' ? 'FRONT' : id === 'SIDE' ? 'SIDE' : 'LAYERS'}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
