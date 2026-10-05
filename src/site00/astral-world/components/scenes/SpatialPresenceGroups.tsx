import { AstralPortrait } from '../immersive/AstralPortrait';

export type PresencePerson = {
  id: string;
  name: string;
  initials?: string;
  avatarId?: string | null;
  status?: string;
  kind?: 'friend' | 'reader';
};

const DEST_LABELS: Record<string, string> = {
  'coffee-shop': 'Coffee Shop',
  'tarot-suite': 'Tarot Suite',
  'astral-mall': 'Astral Mall',
  astrea: 'Astréa',
};

/** Portrait-led presence grouped by location — not CRM rows */
export function SpatialPresenceGroups({
  groups,
  onSelect,
}: {
  groups: { destination: string; people: PresencePerson[] }[];
  onSelect?: (personId: string) => void;
}) {
  return (
    <div className="aw-spatial-presence">
      {groups.map((g) => (
        <section key={g.destination} className="aw-spatial-presence__place">
          <h3 className="aw-spatial-presence__place-label">{DEST_LABELS[g.destination] ?? g.destination.replace(/-/g, ' ')}</h3>
          <div className="aw-spatial-presence__tiles">
            {g.people.map((p) => (
              <button
                key={p.id}
                type="button"
                className="aw-spatial-presence__tile"
                onClick={() => onSelect?.(p.id)}
                aria-label={`${p.name}${p.status ? ` · ${p.status}` : ''}`}
              >
                <AstralPortrait
                  personId={p.id}
                  avatarId={p.avatarId}
                  name={p.name}
                  initials={p.initials}
                  size={44}
                  showPresence
                  variant={p.kind === 'reader' ? 'reader' : 'friend'}
                />
                <span className="aw-spatial-presence__name">{p.name.split(' ')[0]}</span>
                {p.status ? <span className="aw-spatial-presence__status">{p.status}</span> : null}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function groupPeopleByDestination<T extends { id: string; currentDestination?: string | null }>(
  people: readonly T[],
  getMeta: (p: T) => Omit<PresencePerson, 'id'>,
): { destination: string; people: PresencePerson[] }[] {
  const map = new Map<string, PresencePerson[]>();
  for (const p of people) {
    const dest = p.currentDestination ?? 'astrea';
    const bucket = map.get(dest) ?? [];
    bucket.push({ id: p.id, ...getMeta(p) });
    map.set(dest, bucket);
  }
  return Array.from(map.entries()).map(([destination, group]) => ({ destination, people: group }));
}
