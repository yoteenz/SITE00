import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { WhosHerePanel } from './WhosHerePanel';
import { TakeMeSomewherePanel } from './TakeMeSomewherePanel';
import { AstralCinematicBg } from './AstralCinematicBg';
import { AstralMallIcon, CoffeeShopIcon, TarotSuiteIcon } from './AstralDestIcons';

export function MobileHomeReferenceLayout() {
  const { path, occupancy, readers } = useAstralWorld();
  const featuredReader = readers[0];

  return (
    <div className="aw-ref-mobile">
      <section className="aw-ref-mobile-hero">
        <AstralCinematicBg variant="mobile-hero" className="aw-ref-mobile-hero__bg" />
        <div className="aw-ref-mobile-hero__content">
          <p className="aw-label">Master Universe</p>
          <h1 className="aw-display aw-display--hero">Welcome to Astral World</h1>
          <p className="aw-muted">A living world of intuition, connection, readings, and transformation.</p>
          <Link to={path('astrea')} className="aw-btn-primary aw-btn-primary--hero">Enter Astréa →</Link>
        </div>
      </section>

      <section className="aw-ref-mobile-astrea">
        <p className="aw-label">You are entering</p>
        <h2 className="aw-display aw-display--district">Astréa</h2>
        <p className="aw-muted">{occupancy.current.toLocaleString()} in Astréa</p>
        <div className="aw-ref-mobile-dest-cards">
          <Link to={path('astrea/tarot-suite')} className="aw-ref-mobile-dest aw-ref-mobile-dest--suite">
            <TarotSuiteIcon size={28} />
            <div>
              <strong>Tarot Suite</strong>
              <span className="aw-muted">Deep · Private</span>
            </div>
          </Link>
          <Link to={path('astrea/coffee-shop')} className="aw-ref-mobile-dest aw-ref-mobile-dest--coffee">
            <CoffeeShopIcon size={28} />
            <div>
              <strong>Coffee Shop</strong>
              <span className="aw-muted">Comfort · Community</span>
            </div>
          </Link>
          <Link to={path('astrea/astral-mall')} className="aw-ref-mobile-dest aw-ref-mobile-dest--mall">
            <AstralMallIcon size={28} />
            <div>
              <strong>Astral Mall</strong>
              <span className="aw-muted">Fast · Fun</span>
            </div>
          </Link>
        </div>
      </section>

      <WhosHerePanel compact />

      <TakeMeSomewherePanel compact />

      <section className="aw-card aw-card--gold aw-ref-mobile-routing">
        <h2 className="aw-display aw-display--section">Smart Routing</h2>
        <p className="aw-muted">You sound like you need the Coffee Shop today.</p>
        <Link to={path('astrea/coffee-shop')} className="aw-btn-primary">Go to Coffee Shop →</Link>
      </section>

      {featuredReader ? (
        <section className="aw-card">
          <h2 className="aw-display aw-display--section">Find My Reader</h2>
          <div className="aw-presence-item">
            <div className="aw-avatar">{featuredReader.avatarInitials}</div>
            <div>
              <strong>{featuredReader.name}</strong>
              <div className="aw-muted">{featuredReader.specialty}</div>
            </div>
          </div>
          <Link to={path('readers')} className="aw-btn-primary">Find My Reader →</Link>
        </section>
      ) : null}

      <Link to={path('notification-demo')} className="aw-btn-secondary aw-ref-mobile-alert-btn">
        Presence Alerts Demo →
      </Link>

      <footer className="aw-ref-mobile-value">
        <span>Real people, real connections</span>
        <span>Guidance that finds you</span>
        <span>Your world, your way</span>
      </footer>
    </div>
  );
}
