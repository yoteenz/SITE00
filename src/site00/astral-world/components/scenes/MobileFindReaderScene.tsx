import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filterReaders, sortReadersWithFavoritesFirst } from '../../../../../shared/site00-astral-world/fixtureService.js';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../immersive/AstralWorldScene';
import { AstralDrawer } from '../immersive/AstralDrawer';
import { AstralPortrait } from '../immersive/AstralPortrait';
import { AstralStatusChip } from '../immersive/AstralStatusChip';

const CATEGORIES = ['ALL', 'LOVE', 'CAREER', 'INTUITIVE', 'TAROT', 'ENERGY'] as const;

/** Find My Reader as search layer over the world — portrait carousel + detail drawer */
export function MobileFindReaderScene() {
  const { readers, toggleFavoriteReader, path } = useAstralWorld();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedReaderId, setSelectedReaderId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = filterReaders(readers, query, category, favoritesOnly, availableOnly);
    return sortReadersWithFavoritesFirst(list);
  }, [readers, query, category, favoritesOnly, availableOnly]);

  const selectedReader = selectedReaderId ? readers.find((r) => r.id === selectedReaderId) : null;

  const surprise = () => {
    const pick = readers[Math.floor(Math.random() * readers.length)];
    if (pick) setSelectedReaderId(pick.id);
  };

  const goToReader = () => {
    if (!selectedReader?.currentDestination) return;
    navigate(path(`astrea/${selectedReader.currentDestination}`));
  };

  return (
    <>
      <AstralWorldScene
        sceneId="FIND_MY_READER"
        overlay={
          <div className="aw-reader-search-layer">
            <h1 className="aw-display aw-display--scene">Find My Reader</h1>
            <div className="aw-reader-search-bar">
              <input
                type="search"
                placeholder="Search readers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search readers"
                className="aw-reader-search-input"
              />
              <button type="button" className="aw-world-action aw-world-action--sm" onClick={() => setFilterOpen(true)} aria-label="Filters">
                Filter
              </button>
            </div>
            <div className="aw-chips aw-reader-search-chips">
              {CATEGORIES.slice(0, 4).map((c) => (
                <button key={c} type="button" className={`aw-chip${category === c ? ' aw-tab--active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
            <div className="aw-reader-carousel" role="list">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`aw-reader-carousel__item${selectedReaderId === r.id ? ' aw-reader-carousel__item--active' : ''}`}
                  onClick={() => setSelectedReaderId(r.id)}
                  role="listitem"
                >
                  <AstralPortrait personId={r.id} name={r.name} initials={r.avatarInitials} size={56} showPresence />
                  <span className="aw-reader-carousel__name">{r.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
            <button type="button" className="aw-btn-secondary aw-reader-surprise" onClick={surprise}>Surprise Me</button>
          </div>
        }
      />

      <AstralDrawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Filters">
        <div className="aw-chips">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className={`aw-chip${category === c ? ' aw-tab--active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <div className="aw-chips" style={{ marginTop: '0.5rem' }}>
          <button type="button" className={`aw-chip${favoritesOnly ? ' aw-tab--active' : ''}`} onClick={() => setFavoritesOnly((v) => !v)}>Favorites</button>
          <button type="button" className={`aw-chip${availableOnly ? ' aw-tab--active' : ''}`} onClick={() => setAvailableOnly((v) => !v)}>Available Now</button>
        </div>
      </AstralDrawer>

      <AstralDrawer
        open={Boolean(selectedReader)}
        onClose={() => setSelectedReaderId(null)}
        title={selectedReader?.name ?? 'Reader'}
      >
        {selectedReader ? (
          <>
            <div className="aw-reader-detail-head">
              <AstralPortrait personId={selectedReader.id} name={selectedReader.name} initials={selectedReader.avatarInitials} size={64} showPresence />
              <div>
                <strong>{selectedReader.name}</strong>
                <p className="aw-muted">{selectedReader.specialty} · ★ {selectedReader.rating}</p>
                <AstralStatusChip label={selectedReader.presence.replace(/_/g, ' ')} kind={selectedReader.presence === 'READING_NOW' ? 'reading' : 'available'} />
              </div>
            </div>
            <p className="aw-muted">Currently: {selectedReader.currentDestination?.replace(/-/g, ' ') ?? 'Offline'}</p>
            <button type="button" className="aw-btn-primary" onClick={goToReader}>Go to Her</button>
            <button
              type="button"
              className={`aw-chip${selectedReader.isFavorite ? ' aw-tab--active' : ''}`}
              onClick={() => toggleFavoriteReader(selectedReader.id)}
            >
              {selectedReader.isFavorite ? '★ Favorited' : '☆ Favorite'}
            </button>
          </>
        ) : null}
      </AstralDrawer>
    </>
  );
}
