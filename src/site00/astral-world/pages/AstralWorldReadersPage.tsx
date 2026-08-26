import { useMemo, useState } from 'react';
import { filterReaders, sortReadersWithFavoritesFirst } from '../../../../shared/site00-astral-world/fixtureService.js';
import { useAstralWorld } from '../context/AstralWorldContext';

const CATEGORIES = ['ALL', 'LOVE', 'CAREER', 'INTUITIVE', 'TAROT', 'ENERGY'] as const;

export default function AstralWorldReadersPage() {
  const { readers, toggleFavoriteReader } = useAstralWorld();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = useMemo(() => {
    const list = filterReaders(readers, query, category, favoritesOnly, availableOnly);
    return sortReadersWithFavoritesFirst(list);
  }, [readers, query, category, favoritesOnly, availableOnly]);

  const surprise = () => {
    const pick = readers[Math.floor(Math.random() * readers.length)];
    if (pick) setQuery(pick.name);
  };

  return (
    <>
      <div className="aw-mobile-only aw-mobile-screen">
        <h1 className="aw-display">Find My Reader</h1>
      </div>
      <div className="aw-desktop-only">
        <h1 className="aw-display aw-display--hero">Find My Reader</h1>
      </div>
      <section className="aw-card aw-card--gold">
        <input
          type="search"
          placeholder="Search readers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search readers"
          style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--aw-border)', color: 'var(--aw-text)', marginBottom: '0.75rem' }}
        />
        <div className="aw-chips">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className={`aw-chip${category === c ? ' aw-tab--active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <div className="aw-chips" style={{ marginTop: '0.5rem' }}>
          <button type="button" className={`aw-chip${favoritesOnly ? ' aw-tab--active' : ''}`} onClick={() => setFavoritesOnly((v) => !v)}>Favorites</button>
          <button type="button" className={`aw-chip${availableOnly ? ' aw-tab--active' : ''}`} onClick={() => setAvailableOnly((v) => !v)}>Available Now</button>
        </div>
        <button type="button" className="aw-btn-secondary" onClick={surprise}>Surprise Me</button>
      </section>
      <section className="aw-card">
        {filtered.map((r) => (
          <div key={r.id} className="aw-presence-item">
            <div className="aw-avatar">{r.avatarInitials}</div>
            <div style={{ flex: 1 }}>
              <strong>{r.name}</strong>
              <div className="aw-muted">{r.specialty} · ★ {r.rating}</div>
              <div className="aw-muted">{r.currentDestination?.replace(/-/g, ' ') ?? 'Offline'}</div>
            </div>
            <button type="button" className={`aw-chip${r.isFavorite ? ' aw-tab--active' : ''}`} onClick={() => toggleFavoriteReader(r.id)} aria-pressed={r.isFavorite}>
              {r.isFavorite ? '★ Fav' : '☆ Fav'}
            </button>
            <span className="aw-status aw-status--available">{r.presence.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </section>
    </>
  );
}
