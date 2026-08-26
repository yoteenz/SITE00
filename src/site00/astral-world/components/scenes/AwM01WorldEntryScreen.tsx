import { Link } from 'react-router-dom';
import type { ReferenceCropKey } from '../../../../../shared/site00-astral-world/referenceCropRegistry.js';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralScene } from '../immersive/AstralScene';
import { AstralPortrait } from '../immersive/AstralPortrait';
import {
  AstralMallIcon,
  CoffeeShopIcon,
  TarotSuiteIcon,
} from '../AstralDestIcons';

type AwM01WorldEntryScreenProps = {
  onWhosHere: () => void;
  onTakeMeSomewhere: () => void;
};

type DestinationSpec = {
  id: string;
  title: string;
  descriptor: string;
  to: string;
  crop: ReferenceCropKey;
  accent: 'suite' | 'coffee' | 'mall';
  Icon: typeof TarotSuiteIcon;
};

function CelestialMark() {
  return (
    <svg className="aw-m01-celestial" width="40" height="28" viewBox="0 0 40 28" aria-hidden>
      <line x1="2" y1="14" x2="11" y2="14" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
      <line x1="29" y1="14" x2="38" y2="14" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
      <circle cx="20" cy="14" r="11" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.45" />
      <path
        d="M20 5 L21.8 13 L20 15 L18.2 13 Z M20 23 L21.8 15 L20 13 L18.2 15 Z M11 14 L18.2 15 L20 14 L18.2 13 Z M29 14 L21.8 15 L20 14 L21.8 13 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="14" r="2" fill="currentColor" />
    </svg>
  );
}

function OrnamentLine() {
  return (
    <span className="aw-m01-ornament-line" aria-hidden>
      <span className="aw-m01-ornament-line__cap" />
      <span className="aw-m01-ornament-line__bar" />
      <span className="aw-m01-ornament-line__cap" />
    </span>
  );
}

function DestinationRow({ spec }: { spec: DestinationSpec }) {
  return (
    <Link to={spec.to} className={`aw-m01-dest aw-m01-dest--${spec.accent}`}>
      <span className={`aw-m01-dest__emblem aw-m01-dest__emblem--${spec.accent}`}>
        <spec.Icon size={28} />
      </span>
      <span className="aw-m01-dest__copy">
        <span className="aw-m01-dest__name">{spec.title}</span>
        <span className="aw-m01-dest__desc">{spec.descriptor}</span>
      </span>
      <span className="aw-m01-dest__scene" aria-hidden>
        <AstralScene crop={spec.crop} minHeight="100%" overlay={false} responsive={false} />
      </span>
      <span className="aw-m01-dest__arrow" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="11" cy="11" r="10" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.65" />
          <path d="M9 7l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

/**
 * AW_M_01_WORLD_ENTRY — canonical mobile Home / World Entry (390px authority).
 * Reference: canonical screen master v2. Live React layers over environment art only.
 */
export function AwM01WorldEntryScreen({ onWhosHere, onTakeMeSomewhere }: AwM01WorldEntryScreenProps) {
  const { path, demoSession } = useAstralWorld();

  const destinations: DestinationSpec[] = [
    {
      id: 'tarot-suite',
      title: 'Tarot Suite',
      descriptor: 'Deep. Private. Immersive.',
      to: path('astrea/tarot-suite'),
      crop: 'TAROT_SUITE_MOBILE',
      accent: 'suite',
      Icon: TarotSuiteIcon,
    },
    {
      id: 'coffee-shop',
      title: 'Coffee Shop',
      descriptor: 'Conversations. Comfort. Community.',
      to: path('astrea/coffee-shop'),
      crop: 'COFFEE_SHOP_MOBILE',
      accent: 'coffee',
      Icon: CoffeeShopIcon,
    },
    {
      id: 'astral-mall',
      title: 'Astral Mall',
      descriptor: 'Fast. Fun. On the go.',
      to: path('astrea/astral-mall'),
      crop: 'ASTRAL_MALL_MOBILE',
      accent: 'mall',
      Icon: AstralMallIcon,
    },
  ];

  return (
    <article
      className="aw-m01 aw-mobile-only"
      data-screen-master="AW_M_01_WORLD_ENTRY"
      data-scene-id="HOME_ARRIVAL"
      data-asset-slot="ASTRAL_WORLD_HERO_MOBILE"
    >
      <header className="aw-m01-hero">
        <div className="aw-m01-hero__environment" aria-hidden>
          <AstralScene
            crop="ASTRAL_WORLD_HERO_MOBILE"
            sceneId="HOME_ARRIVAL"
            className="aw-m01-hero__scene aw-scene"
            minHeight="100%"
            overlay={false}
            responsive={false}
          />
          <div className="aw-m01-hero__veil" />
        </div>

        <div className="aw-m01-hero__layer">
          <div className="aw-m01-hero__top">
            <CelestialMark />
            <Link to={path('profile')} className="aw-m01-hero__avatar-link" aria-label={`${demoSession.displayName} profile`}>
              <AstralPortrait
                personId={demoSession.userId}
                name={demoSession.displayName}
                initials={demoSession.displayName[0]}
                size={44}
                showPresence
                className="aw-m01-hero__avatar"
              />
            </Link>
          </div>

          <div className="aw-m01-hero__titles">
            <p className="aw-m01-kicker">Welcome to</p>
            <h1 className="aw-m01-title">Astral World</h1>
          </div>

          <p className="aw-m01-subtitle">
            A living world of intuition, connection, readings, and transformation.
          </p>
        </div>
      </header>

      <section className="aw-m01-astrea" aria-labelledby="aw-m01-astrea-heading">
        <div className="aw-m01-astrea__frame">
          <span className="aw-m01-astrea__glyph aw-m01-astrea__glyph--sun" aria-hidden>☉</span>
          <span className="aw-m01-astrea__glyph aw-m01-astrea__glyph--moon" aria-hidden>☽</span>

          <OrnamentLine />
          <p className="aw-m01-astrea__entering">You are entering</p>
          <OrnamentLine />

          <h2 id="aw-m01-astrea-heading" className="aw-m01-astrea__title">
            <Link to={path('astrea')} className="aw-m01-astrea__title-link">
              <span className="aw-m01-astrea__sparkle" aria-hidden>✦</span>
              Astréa
              <span className="aw-m01-astrea__sparkle" aria-hidden>✦</span>
            </Link>
          </h2>

          <p className="aw-m01-astrea__district">The social district of Astral World.</p>
          <p className="aw-m01-astrea__tagline">Explore. Connect. Belong.</p>

          <nav className="aw-m01-destinations" aria-label="Astréa destinations">
            {destinations.map((spec) => (
              <DestinationRow key={spec.id} spec={spec} />
            ))}
          </nav>

          <Link to={path('astrea')} className="aw-m01-astrea__enter aw-sr-only-focusable">
            Enter Astréa
          </Link>
        </div>
      </section>

      <div className="aw-m01-secondary" aria-label="World actions">
        <button type="button" className="aw-m01-secondary__action" onClick={onWhosHere}>
          Who&apos;s Here
        </button>
        <button type="button" className="aw-m01-secondary__action" onClick={onTakeMeSomewhere}>
          Take Me Somewhere
        </button>
        <Link to={path('readers')} className="aw-m01-secondary__action">
          Find My Reader
        </Link>
      </div>
    </article>
  );
}
