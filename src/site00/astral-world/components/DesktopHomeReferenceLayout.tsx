import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { TakeMeSomewherePanel } from './TakeMeSomewherePanel';
import { AstralScene } from './immersive/AstralScene';
import { AstralEnvironmentCard } from './immersive/AstralEnvironmentCard';
import { AstralPortrait } from './immersive/AstralPortrait';

export function DesktopHomeReferenceLayout() {
  const { path, occupancy, readers, friends, demoSession } = useAstralWorld();
  const mallReaders = readers.filter((r) => r.currentDestination === 'astral-mall').slice(0, 4);
  const suiteReaders = readers.filter((r) => r.currentDestination === 'tarot-suite').slice(0, 4);
  const coffeePeople = friends.filter((f) => f.currentDestination === 'coffee-shop').slice(0, 4);

  return (
    <div className="aw-ref-desktop">
      <section className="aw-ref-top-band">
        <div className="aw-ref-hero">
          <AstralScene crop="ASTRAL_WORLD_HERO" className="aw-ref-hero__bg aw-scene" minHeight={320}>
            <div className="aw-ref-hero__content">
              <p className="aw-label">Master Universe</p>
              <h1 className="aw-display aw-display--hero">Welcome to Astral World</h1>
              <p className="aw-muted aw-ref-tagline">A living world of intuition, connection, readings, and transformation.</p>
              <Link to={path('astrea')} className="aw-btn-primary aw-btn-primary--hero">Enter Astréa →</Link>
            </div>
          </AstralScene>
        </div>
        <div className="aw-ref-astrea-panorama">
          <AstralScene crop="ASTREA_DISTRICT" className="aw-ref-astrea-panorama__bg aw-scene" minHeight={320}>
            <div className="aw-ref-astrea-panorama__content">
              <p className="aw-label">You are entering</p>
              <h2 className="aw-display aw-display--district">Astréa</h2>
              <p className="aw-muted">Flagship district · {occupancy.current.toLocaleString()} souls exploring right now</p>
              <div className="aw-ref-dest-orbs">
                <Link to={path('astrea/tarot-suite')} className="aw-ref-orb aw-ref-orb--suite">
                  <span>Tarot Suite</span>
                </Link>
                <Link to={path('astrea/astral-mall')} className="aw-ref-orb aw-ref-orb--mall">
                  <span>Astral Mall</span>
                </Link>
                <Link to={path('astrea/coffee-shop')} className="aw-ref-orb aw-ref-orb--coffee">
                  <span>Coffee Shop</span>
                </Link>
              </div>
            </div>
          </AstralScene>
        </div>
      </section>

      <section className="aw-ref-mid-band">
        <TakeMeSomewherePanel />
        <div className="aw-routing-preview">
          <AstralScene crop="COFFEE_SHOP" minHeight={180}>
            <h2 className="aw-display aw-display--section" style={{ margin: 0 }}>Smart Routing Suggestion</h2>
            <p className="aw-muted">You sound like you need the Coffee Shop today.</p>
            <Link to={path('astrea/coffee-shop')} className="aw-btn-primary">Go to Coffee Shop →</Link>
          </AstralScene>
        </div>
        <div className="aw-ref-social-stack">
          <section className="aw-card">
            <h2 className="aw-display aw-display--section">Find My Reader</h2>
            {readers[0] ? (
              <div className="aw-reader-card-visual">
                <AstralPortrait personId={readers[0].id} name={readers[0].name} initials={readers[0].avatarInitials} size={52} showPresence />
                <div className="aw-reader-card-visual__meta">
                  <strong>{readers[0].name}</strong>
                  <div className="aw-muted">{readers[0].specialty}</div>
                </div>
              </div>
            ) : null}
            <Link to={path('readers')} className="aw-btn-primary">Find My Reader →</Link>
          </section>
          <section className="aw-card">
            <h2 className="aw-display aw-display--section">Meet My Friends</h2>
            <div className="aw-portrait-row">
              {friends.slice(0, 4).map((f) => (
                <AstralPortrait key={f.id} personId={f.id} name={f.name} initials={f.avatarInitials} size={40} showPresence />
              ))}
            </div>
            <Link to={path('friends')} className="aw-btn-primary">See Who&apos;s Here →</Link>
          </section>
        </div>
      </section>

      <section className="aw-ref-dest-showcase aw-ref-dest-showcase--immersive">
        <AstralEnvironmentCard
          crop="TAROT_SUITE"
          title="Tarot Suite"
          descriptor="Deep · Private · Intentional"
          to={path('astrea/tarot-suite')}
          cta="Enter Suite →"
          accent="suite"
          activity={`${suiteReaders.length} readers in suite`}
          people={suiteReaders.map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials }))}
          minHeight={280}
        />
        <AstralEnvironmentCard
          crop="ASTRAL_MALL"
          title="Astral Mall"
          descriptor="Fast · Fun · On the go"
          to={path('astrea/astral-mall')}
          cta="Pick a Kiosk →"
          accent="mall"
          activity="Quick Readings · $5–$10 · DEMO"
          people={mallReaders.map((r) => ({ id: r.id, name: r.name, initials: r.avatarInitials }))}
          minHeight={280}
        />
        <AstralEnvironmentCard
          crop="COFFEE_SHOP"
          title="Coffee Shop"
          descriptor="Conversations · Comfort · Community"
          to={path('astrea/coffee-shop')}
          cta="Join Her Table →"
          accent="coffee"
          activity="People sitting together now"
          people={coffeePeople.map((f) => ({ id: f.id, name: f.name, initials: f.avatarInitials }))}
          minHeight={280}
        />
      </section>

      <footer className="aw-value-strip aw-ref-value-strip">
        <span>Live together</span>
        <span>Presence that matters</span>
        <span>Guidance anywhere</span>
        <span>Secure &amp; private</span>
        <span>Trusted readers</span>
        <span>Member benefits</span>
      </footer>
      <p className="aw-ref-footer-tagline">Guidance · Community · Magic · All in one place · {demoSession.membershipBadge}</p>
    </div>
  );
}
