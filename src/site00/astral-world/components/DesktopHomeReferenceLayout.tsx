import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { TakeMeSomewherePanel } from './TakeMeSomewherePanel';
import { AstralCinematicBg } from './AstralCinematicBg';
import { AstralMallIcon, CoffeeShopIcon, TarotSuiteIcon } from './AstralDestIcons';

export function DesktopHomeReferenceLayout() {
  const { path, occupancy, readers, friends, demoSession } = useAstralWorld();
  const mallReaders = readers.filter((r) => r.currentDestination === 'astral-mall').slice(0, 4);
  const suiteReaders = readers.filter((r) => r.currentDestination === 'tarot-suite').slice(0, 4);
  const coffeePeople = friends.filter((f) => f.currentDestination === 'coffee-shop').slice(0, 4);

  return (
    <div className="aw-ref-desktop">
      {/* Top band: Hero + Astréa panorama */}
      <section className="aw-ref-top-band">
        <div className="aw-ref-hero">
          <AstralCinematicBg variant="desktop-hero" className="aw-ref-hero__bg" />
          <div className="aw-ref-hero__content">
            <p className="aw-label">Master Universe</p>
            <h1 className="aw-display aw-display--hero">Welcome to Astral World</h1>
            <p className="aw-muted aw-ref-tagline">A living world of intuition, connection, readings, and transformation.</p>
            <Link to={path('astrea')} className="aw-btn-primary aw-btn-primary--hero">Enter Astréa →</Link>
          </div>
        </div>
        <div className="aw-ref-astrea-panorama">
          <AstralCinematicBg variant="desktop-astrea" className="aw-ref-astrea-panorama__bg" />
          <div className="aw-ref-astrea-panorama__content">
          <p className="aw-label">You are entering</p>
          <h2 className="aw-display aw-display--district">Astréa</h2>
          <p className="aw-muted">Flagship district · {occupancy.current.toLocaleString()} souls exploring right now</p>
          <div className="aw-ref-dest-orbs">
            <Link to={path('astrea/tarot-suite')} className="aw-ref-orb aw-ref-orb--suite">
              <TarotSuiteIcon size={36} />
              <span>Tarot Suite</span>
            </Link>
            <Link to={path('astrea/astral-mall')} className="aw-ref-orb aw-ref-orb--mall">
              <AstralMallIcon size={36} />
              <span>Astral Mall</span>
            </Link>
            <Link to={path('astrea/coffee-shop')} className="aw-ref-orb aw-ref-orb--coffee">
              <CoffeeShopIcon size={36} />
              <span>Coffee Shop</span>
            </Link>
          </div>
          </div>
        </div>
      </section>
      <section className="aw-ref-mid-band">
        <TakeMeSomewherePanel />
        <div className="aw-card aw-card--gold aw-ref-routing-card">
          <h2 className="aw-display aw-display--section">Smart Routing Suggestion</h2>
          <p className="aw-muted">You sound like you need the Coffee Shop today.</p>
          <Link to={path('astrea/coffee-shop')} className="aw-btn-primary">Go to Coffee Shop →</Link>
        </div>
        <div className="aw-ref-social-stack">
          <section className="aw-card">
            <h2 className="aw-display aw-display--section">Find My Reader</h2>
            <div className="aw-presence-item">
              <div className="aw-avatar">{readers[0]?.avatarInitials ?? '?'}</div>
              <div><strong>{readers[0]?.name ?? 'Browse'}</strong><div className="aw-muted">{readers[0]?.specialty}</div></div>
            </div>
            <Link to={path('readers')} className="aw-btn-primary">Find My Reader →</Link>
          </section>
          <section className="aw-card">
            <h2 className="aw-display aw-display--section">Meet My Friends</h2>
            <div className="aw-avatar-row">
              {friends.slice(0, 4).map((f) => (
                <div key={f.id} className="aw-avatar" title={f.name}>{f.avatarInitials}</div>
              ))}
            </div>
            <Link to={path('friends')} className="aw-btn-primary">See Who&apos;s Here →</Link>
          </section>
        </div>
      </section>

      {/* Bottom destination showcase */}
      <section className="aw-ref-dest-showcase">
        <article className="aw-ref-dest-panel aw-ref-dest-panel--suite">
          <h3 className="aw-display">Tarot Suite</h3>
          <p className="aw-muted">Deep · Private · Intentional</p>
          <ul className="aw-ref-feature-list">
            <li>Private Readings</li>
            <li>Choose Your Reader</li>
            <li>Join Wait</li>
          </ul>
          <Link to={path('astrea/tarot-suite')} className="aw-btn-primary">Enter Suite →</Link>
          <div className="aw-avatar-row">{suiteReaders.map((r) => <div key={r.id} className="aw-avatar">{r.avatarInitials}</div>)}</div>
          <p className="aw-muted">Readers in Suite (+{suiteReaders.length})</p>
        </article>
        <article className="aw-ref-dest-panel aw-ref-dest-panel--mall">
          <h3 className="aw-display">Astral Mall</h3>
          <p className="aw-muted">Fast · Fun · On the go</p>
          <Link to={path('astrea/astral-mall')} className="aw-btn-primary">Pick a Kiosk →</Link>
          <p className="aw-muted">Quick Readings · $5–$10 · DEMO</p>
          <div className="aw-avatar-row">{mallReaders.map((r) => <div key={r.id} className="aw-avatar">{r.avatarInitials}</div>)}</div>
        </article>
        <article className="aw-ref-dest-panel aw-ref-dest-panel--coffee">
          <h3 className="aw-display">Coffee Shop</h3>
          <p className="aw-muted">Conversations · Comfort · Community</p>
          <Link to={path('astrea/coffee-shop')} className="aw-btn-primary">Join Her Table →</Link>
          <div className="aw-avatar-row">{coffeePeople.map((f) => <div key={f.id} className="aw-avatar">{f.avatarInitials}</div>)}</div>
          <p className="aw-muted">People at the Coffee Shop</p>
        </article>
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
