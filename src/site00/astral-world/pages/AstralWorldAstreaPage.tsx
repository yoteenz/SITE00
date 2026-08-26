import { DESTINATION_PURPOSES } from '../../../../shared/site00-astral-world/types.js';
import { useAstralWorld } from '../context/AstralWorldContext';
import { AstralScene } from '../components/immersive/AstralScene';
import { AstralEnvironmentCard } from '../components/immersive/AstralEnvironmentCard';
import { destinationCropKeys } from '../components/immersive/immersiveHelpers';
import { MobileAstreaScene } from '../components/scenes/MobileAstreaScene';

const DEST_ACCENT: Record<string, 'suite' | 'mall' | 'coffee'> = {
  'tarot-suite': 'suite',
  'astral-mall': 'mall',
  'coffee-shop': 'coffee',
};

const DEST_ACTIVITY: Record<string, string> = {
  'tarot-suite': 'Private readings in progress',
  'astral-mall': 'Kiosks open · quick reads',
  'coffee-shop': 'Tables active · joinable now',
};

function DesktopAstreaLayout() {
  const { occupancy, path, readers, friends, tables, kiosks } = useAstralWorld();
  const readersOnline = readers.filter((r) => r.presence !== 'OFFLINE').length;
  const friendsHere = friends.length;
  const activeTables = tables.filter((t) => t.occupants.length > 0).length;
  const openKiosks = kiosks.filter((k) => k.kioskState !== 'CLOSED').length;
  const privateReadings = readers.filter((r) => r.presence === 'READING_NOW').length;

  return (
    <div className="aw-immersive-panel aw-immersive-panel--scene">
      <AstralScene crop="ASTREA_DISTRICT" minHeight={380}>
        <p className="aw-label">You are entering</p>
        <h1 className="aw-display aw-display--hero">Astréa</h1>
        <p className="aw-muted">Flagship district · {occupancy.current} souls here now</p>
        <div className="aw-value-strip" style={{ marginTop: '0.75rem', fontSize: '0.68rem' }}>
          <span>{readersOnline} readers</span>
          <span>{activeTables} tables</span>
          <span>{privateReadings} private</span>
          <span>{openKiosks} kiosks</span>
          <span>{friendsHere} friends</span>
        </div>
      </AstralScene>
      <div className="aw-immersive-panel__sheet">
        <div className="aw-ref-dest-showcase aw-ref-dest-showcase--immersive">
          {DESTINATION_PURPOSES.map((d) => {
            const crops = destinationCropKeys(d.slug);
            const destPeople = d.slug === 'coffee-shop'
              ? friends.filter((f) => f.currentDestination === 'coffee-shop').slice(0, 3).map((f) => ({ id: f.id, name: f.name, initials: f.avatarInitials }))
              : readers.filter((r) => r.currentDestination === d.slug).slice(0, 3).map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials }));
            return (
              <AstralEnvironmentCard
                key={d.slug}
                crop={crops.desktop}
                title={d.label}
                descriptor={d.purpose}
                to={path(`astrea/${d.slug}`)}
                cta={`Enter ${d.label.split(' ')[0]} →`}
                accent={DEST_ACCENT[d.slug]}
                activity={DEST_ACTIVITY[d.slug]}
                people={destPeople}
                minHeight={240}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AstralWorldAstreaPage() {
  return (
    <>
      <div className="aw-desktop-only"><DesktopAstreaLayout /></div>
      <div className="aw-mobile-only aw-route-scene"><MobileAstreaScene /></div>
    </>
  );
}
