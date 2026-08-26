import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { WhosHerePanel } from '../components/WhosHerePanel';
import { TakeMeSomewherePanel } from '../components/TakeMeSomewherePanel';

function HomeDesktop() {
  const { occupancy } = useAstralWorld();
  return (
    <div className="aw-desktop-grid">
      <section className="aw-desktop-grid__full">
        <div className="aw-hero">
          <div className="aw-hero__bg aw-hero__bg--pending" aria-hidden />
          <div className="aw-hero__content">
            <p className="aw-label">Master Universe</p>
            <h1 className="aw-display aw-display--hero">Welcome to Astral World</h1>
            <p className="aw-muted">A premium celestial universe for readers, seekers, and connection.</p>
            <Link to="/projects/astral-world/experience/astrea" className="aw-btn-primary" style={{ marginTop: '1rem', width: 'fit-content' }}>
              Enter Astréa →
            </Link>
          </div>
        </div>
      </section>
      <section className="aw-card aw-card--gold">
        <div className="aw-card__header">
          <div>
            <h2 className="aw-display aw-display--section">Astréa</h2>
            <p className="aw-muted">Flagship district · {occupancy.current} here now</p>
          </div>
        </div>
        <div className="aw-dest-grid">
          <Link to="/projects/astral-world/experience/astrea/tarot-suite" className="aw-dest-card aw-dest-card--suite">
            <strong>Tarot Suite</strong>
          </Link>
          <Link to="/projects/astral-world/experience/astrea/astral-mall" className="aw-dest-card aw-dest-card--mall">
            <strong>Astral Mall</strong>
          </Link>
          <Link to="/projects/astral-world/experience/astrea/coffee-shop" className="aw-dest-card aw-dest-card--coffee">
            <strong>Coffee Shop</strong>
          </Link>
        </div>
      </section>
      <WhosHerePanel />
      <TakeMeSomewherePanel />
      <section className="aw-card">
        <h2 className="aw-display aw-display--section">Find My Reader</h2>
        <Link to="/projects/astral-world/experience/readers" className="aw-btn-primary">Browse Readers →</Link>
      </section>
      <section className="aw-card">
        <h2 className="aw-display aw-display--section">Meet My Friends</h2>
        <Link to="/projects/astral-world/experience/friends" className="aw-btn-primary">See Who&apos;s Here →</Link>
      </section>
      <section className="aw-desktop-grid__full aw-value-strip">
        <span>Live together</span>
        <span>Presence that matters</span>
        <span>Guidance anywhere</span>
        <span>Secure &amp; private</span>
        <span>Trusted readers</span>
        <span>Member benefits</span>
      </section>
    </div>
  );
}

function HomeMobile() {
  const { occupancy } = useAstralWorld();
  return (
    <div className="aw-mobile-screen">
      <div className="aw-mobile-hero">
        <div className="aw-mobile-hero__bg aw-hero__bg--pending" aria-hidden />
        <div className="aw-hero__content" style={{ minHeight: 220 }}>
          <h1 className="aw-display aw-display--hero" style={{ fontSize: '1.35rem' }}>Welcome to Astral World</h1>
          <Link to="/projects/astral-world/experience/astrea" className="aw-btn-primary">Enter Astréa →</Link>
        </div>
      </div>
      <p className="aw-muted">{occupancy.current} in Astréa</p>
      <WhosHerePanel compact />
      <TakeMeSomewherePanel compact />
    </div>
  );
}

export default function AstralWorldHomePage() {
  return (
    <>
      <div className="aw-desktop-only"><HomeDesktop /></div>
      <div className="aw-mobile-only"><HomeMobile /></div>
    </>
  );
}
