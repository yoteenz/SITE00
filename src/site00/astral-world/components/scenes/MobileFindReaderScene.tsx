import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filterReaders, sortReadersWithFavoritesFirst } from '../../../../../shared/site00-astral-world/fixtureService.js';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../immersive/AstralWorldScene';
import { AstralInvokeField } from '../immersive/AstralInvokeField';
import { AstralCategorySigilRow } from '../immersive/AstralCategorySigil';
import { AstralReaderOrbit } from '../immersive/AstralReaderOrbit';
import { ReaderDetailTray } from './overlays/ReaderDetailTray';

const CATEGORIES = ['ALL', 'LOVE', 'CAREER', 'INTUITIVE', 'TAROT', 'ENERGY'] as const;

/** Find My Reader — world-native discovery over Astréa (not a directory page) */
export function MobileFindReaderScene() {
  const { readers, path } = useAstralWorld();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedReaderId, setSelectedReaderId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = filterReaders(readers, query, category, favoritesOnly, availableOnly);
    return sortReadersWithFavoritesFirst(list);
  }, [readers, query, category, favoritesOnly, availableOnly]);

  const surprise = () => {
    const pick = readers[Math.floor(Math.random() * readers.length)];
    if (pick) setSelectedReaderId(pick.id);
  };

  return (
    <>
      <AstralWorldScene
        sceneId="ASTREA_DISTRICT"
        overlay={
          <div className="aw-reader-discovery-lens">
            <p className="aw-label">Reader Oracle</p>
            <h1 className="aw-display aw-display--scene">Find My Reader</h1>
            <AstralInvokeField
              label="Ask who you need"
              placeholder="Invoke a reader name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Ask who you need"
            />
            <AstralCategorySigilRow categories={CATEGORIES} active={category} onSelect={(c) => setCategory(c as (typeof CATEGORIES)[number])} />
            <div className="aw-reader-discovery-toggles">
              <button type="button" className={`aw-world-action aw-world-action--sm${favoritesOnly ? ' aw-world-action--active' : ''}`} onClick={() => setFavoritesOnly((v) => !v)}>★ Favorites</button>
              <button type="button" className={`aw-world-action aw-world-action--sm${availableOnly ? ' aw-world-action--active' : ''}`} onClick={() => setAvailableOnly((v) => !v)}>Available</button>
              <button type="button" className="aw-world-action aw-world-action--sm" onClick={surprise}>Surprise Me</button>
            </div>
          </div>
        }
        interaction={
          <AstralReaderOrbit
            readers={filtered.map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials, avatarId: r.avatarId }))}
            selectedId={selectedReaderId}
            onSelect={setSelectedReaderId}
            categoryKey={category}
          />
        }
      />

      <ReaderDetailTray
        readerId={selectedReaderId}
        onClose={() => setSelectedReaderId(null)}
        onGo={(dest) => navigate(path(`astrea/${dest}`))}
      />
    </>
  );
}
