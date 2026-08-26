import { Link } from 'react-router-dom';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { TakeMeSomewherePanel } from '../../components/TakeMeSomewherePanel';
import { AstralScene } from '../../components/immersive/AstralScene';
import { AstralPresenceItem } from '../../components/immersive/AstralPresenceItem';
import { MobileTarotSuiteScene } from '../../components/scenes/MobileTarotSuiteScene';

function DesktopTarotSuiteLayout() {
  const { readers, path } = useAstralWorld();
  const suiteReaders = readers.filter((r) => r.currentDestination === 'tarot-suite');
  const privateCount = suiteReaders.filter((r) => r.presence === 'READING_NOW').length;

  return (
    <div className="aw-immersive-panel aw-immersive-panel--scene">
      <AstralScene crop="TAROT_SUITE" minHeight={360}>
        <p className="aw-label">Astréa · Destination</p>
        <h1 className="aw-display aw-display--hero">Tarot Suite</h1>
        <p className="aw-muted">Deep · private · intentional · velvet · candlelight</p>
        <button type="button" className="aw-btn-primary" style={{ marginTop: '0.75rem', alignSelf: 'flex-start' }}>Enter Suite →</button>
      </AstralScene>
      <div className="aw-immersive-panel__sheet">
        <section className="aw-card aw-card--gold">
          <h2 className="aw-display aw-display--section">Suite Status</h2>
          <p className="aw-muted">{privateCount} private reading(s) in progress · client identities protected</p>
        </section>
        <section className="aw-card">
          <h2 className="aw-display aw-display--section">Choose Reader</h2>
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
        </section>
        <TakeMeSomewherePanel compact />
      </div>
    </div>
  );
}

export default function TarotSuitePage() {
  return (
    <>
      <div className="aw-desktop-only"><DesktopTarotSuiteLayout /></div>
      <div className="aw-mobile-only aw-route-scene"><MobileTarotSuiteScene /></div>
    </>
  );
}
