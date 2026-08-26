import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filterReaders, sortReadersWithFavoritesFirst } from '../../../../shared/site00-astral-world/fixtureService.js';
import { useAstralWorld } from '../context/AstralWorldContext';
import { AstralWorldScene } from '../components/immersive/AstralWorldScene';
import { AstralInvokeField } from '../components/immersive/AstralInvokeField';
import { AstralCategorySigilRow } from '../components/immersive/AstralCategorySigil';
import { AstralReaderOrbit } from '../components/immersive/AstralReaderOrbit';
import { AstralPortrait } from '../components/immersive/AstralPortrait';
import { ReaderDetailTray } from '../components/scenes/overlays/ReaderDetailTray';
import { MobileFindReaderScene } from '../components/scenes/MobileFindReaderScene';

const CATEGORIES = ['ALL', 'LOVE', 'CAREER', 'INTUITIVE', 'TAROT', 'ENERGY'] as const;

function DesktopReadersLayout() {
  const { readers, path } = useAstralWorld();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('ALL');
  const [selectedReaderId, setSelectedReaderId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = filterReaders(readers, query, category, false, false);
    return sortReadersWithFavoritesFirst(list);
  }, [readers, query, category]);

  return (
    <div className="aw-route-scene aw-desktop-scene">
      <AstralWorldScene
        sceneId="ASTREA_DISTRICT"
        viewport
        overlay={
          <div className="aw-reader-discovery-lens">
            <p className="aw-label">Reader Oracle</p>
            <h1 className="aw-display aw-display--scene">Find My Reader</h1>
            <AstralInvokeField label="Ask who you need" placeholder="Invoke a reader name…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Ask who you need" />
            <AstralCategorySigilRow categories={CATEGORIES} active={category} onSelect={(c) => setCategory(c as (typeof CATEGORIES)[number])} />
          </div>
        }
        interaction={
          <AstralReaderOrbit readers={filtered.map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials }))} selectedId={selectedReaderId} onSelect={setSelectedReaderId} categoryKey={category} />
        }
      />
      <ReaderDetailTray readerId={selectedReaderId} onClose={() => setSelectedReaderId(null)} onGo={(dest) => navigate(path(`astrea/${dest}`))} />
      {/* FT3: portrait-led */}
      <span className="aw-visually-compact" aria-hidden><AstralPortrait personId="reader-madame-j" name="Madame J" size={1} /></span>
    </div>
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
