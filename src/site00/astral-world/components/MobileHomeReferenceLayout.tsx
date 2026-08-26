import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { WhosHerePanel } from './WhosHerePanel';
import { TakeMeSomewherePanel } from './TakeMeSomewherePanel';
import { AstralScene } from './immersive/AstralScene';
import { AstralEnvironmentCard } from './immersive/AstralEnvironmentCard';
import { AstralPortrait } from './immersive/AstralPortrait';

export function MobileHomeReferenceLayout() {
  const { path, occupancy, readers } = useAstralWorld();
  const featuredReader = readers[0];

  return (
    <div className="aw-ref-mobile">
      <section className="aw-ref-mobile-hero">
        <AstralScene crop="ASTRAL_WORLD_HERO" className="aw-ref-mobile-hero__bg aw-scene" minHeight={300}>
          <div className="aw-ref-mobile-hero__content">
            <p className="aw-label">Master Universe</p>
            <h1 className="aw-display aw-display--hero">Welcome to Astral World</h1>
            <p className="aw-muted">A living world of intuition, connection, readings, and transformation.</p>
            <Link to={path('astrea')} className="aw-btn-primary aw-btn-primary--hero">Enter Astréa →</Link>
          </div>
        </AstralScene>
      </section>

      <section className="aw-ref-mobile-astrea">
        <AstralScene crop="ASTREA_DISTRICT" minHeight={200}>
          <p className="aw-label">You are entering</p>
          <h2 className="aw-display aw-display--district">Astréa</h2>
          <p className="aw-muted">{occupancy.current.toLocaleString()} in Astréa</p>
        </AstralScene>
        <div className="aw-ref-mobile-dest-cards aw-ref-mobile-dest-scene">
          <AstralEnvironmentCard
            crop="TAROT_SUITE"
            title="Tarot Suite"
            descriptor="Deep · Private"
            to={path('astrea/tarot-suite')}
            cta="Enter →"
            accent="suite"
            minHeight={140}
          />
          <AstralEnvironmentCard
            crop="COFFEE_SHOP"
            title="Coffee Shop"
            descriptor="Comfort · Community"
            to={path('astrea/coffee-shop')}
            cta="Join →"
            accent="coffee"
            minHeight={140}
          />
          <AstralEnvironmentCard
            crop="ASTRAL_MALL"
            title="Astral Mall"
            descriptor="Fast · Fun"
            to={path('astrea/astral-mall')}
            cta="Browse →"
            accent="mall"
            minHeight={140}
          />
        </div>
      </section>

      <WhosHerePanel compact />
      <TakeMeSomewherePanel compact />

      {featuredReader ? (
        <section className="aw-card">
          <h2 className="aw-display aw-display--section">Find My Reader</h2>
          <div className="aw-reader-card-visual">
            <AstralPortrait personId={featuredReader.id} name={featuredReader.name} initials={featuredReader.avatarInitials} size={48} showPresence />
            <div className="aw-reader-card-visual__meta">
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
