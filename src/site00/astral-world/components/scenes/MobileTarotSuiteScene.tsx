import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getHotspotsForScene } from '../../../../../shared/site00-astral-world/scenes/hotspotRegistry.js';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralWorldScene } from '../immersive/AstralWorldScene';
import { AstralHUD, AstralHUDChip } from '../immersive/AstralHUD';
import { AstralHotspotLayer } from '../immersive/AstralHotspot';
import { AstralDrawer } from '../immersive/AstralDrawer';
import { AstralPresenceItem } from '../immersive/AstralPresenceItem';

export function MobileTarotSuiteScene() {
  const { readers, path } = useAstralWorld();
  const [drawer, setDrawer] = useState<string | null>(null);
  const hotspots = getHotspotsForScene('TAROT_SUITE', true);
  const suiteReaders = readers.filter((r) => r.currentDestination === 'tarot-suite');
  const privateCount = suiteReaders.filter((r) => r.presence === 'READING_NOW').length;

  return (
    <>
      <AstralWorldScene
        sceneId="TAROT_SUITE"
        overlay={
          <div className="aw-dest-scene-title">
            <p className="aw-label">Astréa · Tarot Suite</p>
            <h1 className="aw-display aw-display--scene">Reading Room</h1>
          </div>
        }
        interaction={
          <AstralHotspotLayer hotspots={hotspots} onDrawer={(target) => setDrawer(target)} />
        }
        hud={
          <AstralHUD position="top">
            <AstralHUDChip live>{privateCount} private readings</AstralHUDChip>
            <AstralHUDChip>{suiteReaders.length} readers in suite</AstralHUDChip>
          </AstralHUD>
        }
      />

      <AstralDrawer
        open={drawer === 'reader-panel'}
        onClose={() => setDrawer(null)}
        title="Readers Available"
      >
        {suiteReaders.map((r) => (
          <AstralPresenceItem
            key={r.id}
            personId={r.id}
            name={r.name}
            initials={r.avatarInitials}
            subtitle={r.specialty}
            status={r.presence.replace(/_/g, ' ')}
          />
        ))}
        <Link to={path('readers')} className="aw-btn-secondary">Browse All Readers</Link>
      </AstralDrawer>

      <AstralDrawer
        open={drawer === 'reading-choice'}
        onClose={() => setDrawer(null)}
        title="Reading Table"
      >
        <p className="aw-muted">Choose how you&apos;d like to begin your reading.</p>
        <button type="button" className="aw-btn-primary">Begin Reading</button>
        <button type="button" className="aw-btn-secondary">Take a Seat · Wait</button>
        <Link to={path('readers')} className="aw-btn-secondary">Choose Reader First</Link>
      </AstralDrawer>
    </>
  );
}
