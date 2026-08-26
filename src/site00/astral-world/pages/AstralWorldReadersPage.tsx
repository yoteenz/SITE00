import { useMemo, useState } from 'react';
import { filterReaders, sortReadersWithFavoritesFirst } from '../../../../shared/site00-astral-world/fixtureService.js';
import { useAstralWorld } from '../context/AstralWorldContext';
import { AstralScene } from '../components/immersive/AstralScene';
import { AstralPortrait } from '../components/immersive/AstralPortrait';
import { AstralStatusChip } from '../components/immersive/AstralStatusChip';
import { MobileFindReaderScene } from '../components/scenes/MobileFindReaderScene';

const CATEGORIES = ['ALL', 'LOVE', 'CAREER', 'INTUITIVE', 'TAROT', 'ENERGY'] as const;

function DesktopReadersLayout() {
  const { readers, toggleFavoriteReader } = useAstralWorld();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('ALL');

  const filtered = useMemo(() => {
    const list = filterReaders(readers, query, category, false, false);
    return sortReadersWithFavoritesFirst(list);
  }, [readers, query, category]);

  return (
    <>
      <AstralScene crop="SOCIAL_PRESENCE" minHeight={180}>
        <h1 className="aw-display aw-display--hero" style={{ margin: 0 }}>Find My Reader</h1>
      </AstralScene>
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
      </section>
      <section className="aw-card">
        {filtered.map((r) => (
          <div key={r.id} className="aw-reader-card-visual">
            <AstralPortrait personId={r.id} name={r.name} initials={r.avatarInitials} size={52} showPresence />
            <div className="aw-reader-card-visual__meta">
              <strong>{r.name}</strong>
              <div className="aw-muted">{r.specialty} · ★ {r.rating}</div>
            </div>
            <button type="button" className={`aw-chip${r.isFavorite ? ' aw-tab--active' : ''}`} onClick={() => toggleFavoriteReader(r.id)}>
              {r.isFavorite ? '★ Fav' : '☆ Fav'}
            </button>
            <AstralStatusChip label={r.presence.replace(/_/g, ' ')} kind={r.presence === 'READING_NOW' ? 'reading' : 'available'} />
          </div>
        ))}
      </section>
    </>
  );
}

export default function AstralWorldReadersPage() {
  return (
    <>
      <div className="aw-desktop-only"><DesktopReadersLayout /></div>
      <div className="aw-mobile-only aw-route-scene"><MobileFindReaderScene /></div>
    </>
  );
}
