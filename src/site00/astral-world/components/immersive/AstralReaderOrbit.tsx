import { AstralPortrait } from './AstralPortrait';

type OrbitReader = {
  id: string;
  name: string;
  initials?: string;
  avatarId?: string | null;
};

type AstralReaderOrbitProps = {
  readers: OrbitReader[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  categoryKey?: string;
};

/** Spatial portrait carousel — readers orbit in the discovery lens */
export function AstralReaderOrbit({ readers, selectedId, onSelect, categoryKey }: AstralReaderOrbitProps) {
  return (
    <div className="aw-reader-orbit" role="list" aria-label="Reader portraits" data-category={categoryKey}>
      {readers.map((r, idx) => {
        const angle = (idx / Math.max(readers.length, 1)) * 360;
        const radius = 38 + (idx % 3) * 4;
        const x = 50 + radius * Math.cos((angle - 90) * (Math.PI / 180));
        const y = 42 + radius * 0.55 * Math.sin((angle - 90) * (Math.PI / 180));
        return (
          <button
            key={r.id}
            type="button"
            className={`aw-reader-orbit__node${selectedId === r.id ? ' aw-reader-orbit__node--active' : ''}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => onSelect(r.id)}
            role="listitem"
            aria-label={r.name}
          >
            <AstralPortrait personId={r.id} avatarId={r.avatarId} name={r.name} initials={r.initials} size={52} showPresence variant="reader" />
            <span className="aw-reader-orbit__name">{r.name.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}
