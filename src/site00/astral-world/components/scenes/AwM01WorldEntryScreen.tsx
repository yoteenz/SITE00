import type { CSSProperties } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  AW_M_01_CANONICAL,
  AW_M_01_OVERLAY_ANCHORS,
  resolveAwM01BackgroundPath,
  resolveAwM01IconKey,
} from '../../../../../shared/site00-astral-world/screen-masters/awM01LayeredAssets.js';
import { canonicalPctRectStyle, type CanonicalPctRect } from '../../../../../shared/site00-astral-world/screen-masters/canonicalScreenStage.js';
import { useAstralWorld } from '../../context/AstralWorldContext';
import {
  AstralMallIcon,
  CoffeeShopIcon,
  NavIconFriends,
  NavIconHome,
  NavIconJournal,
  NavIconProfile,
  NavIconWorld,
  TarotSuiteIcon,
} from '../AstralDestIcons';
import { AstralPortrait } from '../immersive/AstralPortrait';
import { CanonicalScreenStage } from '../immersive/CanonicalScreenStage';

type AwM01WorldEntryScreenProps = {
  onWhosHere: () => void;
  onTakeMeSomewhere: () => void;
};

function anchorStyle(anchor: CanonicalPctRect): CSSProperties {
  return canonicalPctRectStyle(anchor) as CSSProperties;
}

const ICON_BY_KEY = {
  TAROT_SUITE: TarotSuiteIcon,
  COFFEE_SHOP: CoffeeShopIcon,
  ASTRAL_MALL: AstralMallIcon,
} as const;

function DestinationIcon({ iconKey }: { iconKey: keyof typeof ICON_BY_KEY }) {
  const Icon = ICON_BY_KEY[iconKey];
  return (
    <span className="aw-m01-layered__medallion" aria-hidden>
      <Icon size={36} className="aw-m01-layered__dest-icon" />
    </span>
  );
}

type DestinationRowProps = {
  anchor: CanonicalPctRect;
  to: string;
  title: string;
  descriptor: string;
  accent: 'suite' | 'coffee' | 'mall';
  iconSlot: 'TAROT_DESTINATION_ICON' | 'COFFEE_DESTINATION_ICON' | 'MALL_DESTINATION_ICON';
};

function DestinationRow({ anchor, to, title, descriptor, accent, iconSlot }: DestinationRowProps) {
  const iconKey = resolveAwM01IconKey(iconSlot);
  return (
    <Link to={to} className={`aw-m01-layered__dest aw-m01-layered__dest--${accent}`} style={anchorStyle(anchor)}>
      <DestinationIcon iconKey={iconKey} />
      <span className="aw-m01-layered__dest-copy">
        <span className="aw-m01-layered__dest-name">{title}</span>
        <span className="aw-m01-layered__dest-desc">{descriptor}</span>
      </span>
    </Link>
  );
}

function M01BottomNav({ path }: { path: (segment: string) => string }) {
  const tabs = [
    { to: path('home'), label: 'Home', end: true, Icon: NavIconHome },
    { to: path('astrea'), label: 'World', Icon: NavIconWorld },
    { to: path('journal'), label: 'Journal', Icon: NavIconJournal },
    { to: path('friends'), label: 'Friends', Icon: NavIconFriends },
    { to: path('profile'), label: 'Profile', Icon: NavIconProfile },
  ];

  return (
    <nav className="aw-m01-layered__nav" style={anchorStyle(AW_M_01_OVERLAY_ANCHORS.BOTTOM_NAV)} aria-label="Mobile navigation">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `aw-m01-layered__nav-link${isActive ? ' aw-m01-layered__nav-link--active' : ''}`}
        >
          <tab.Icon size={18} />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * AW_M_01_WORLD_ENTRY — canonical stage (FT5.2D).
 * Background V2 + overlays share one 854×1842 coordinate plane.
 */
export function AwM01WorldEntryScreen({ onWhosHere, onTakeMeSomewhere }: AwM01WorldEntryScreenProps) {
  const { path, demoSession } = useAstralWorld();
  const bgPath = resolveAwM01BackgroundPath();

  return (
    <article
      className="aw-m01-layered aw-mobile-only"
      data-scene-id="HOME_ARRIVAL"
      data-canonical-stage="AW_M_01_WORLD_ENTRY"
      data-background-version="AW_M_01_WORLD_ENTRY_BACKGROUND_V2"
    >
      <CanonicalScreenStage
        stage={AW_M_01_CANONICAL}
        backgroundSrc={bgPath}
        className="aw-m01-layered__stage"
      >
        <div className="aw-m01-layered__hero-kicker" style={anchorStyle(AW_M_01_OVERLAY_ANCHORS.HERO_KICKER_CENTER)}>
          Welcome to
        </div>
        <h1 className="aw-m01-layered__hero-title" style={anchorStyle(AW_M_01_OVERLAY_ANCHORS.HERO_TITLE_CENTER)}>
          Astral World
        </h1>
        <p className="aw-m01-layered__hero-subtitle" style={anchorStyle(AW_M_01_OVERLAY_ANCHORS.HERO_SUBTITLE_CENTER)}>
          A living world of intuition,
          <br />
          readings, and transformation.
        </p>

        <Link
          to={path('profile')}
          className="aw-m01-layered__avatar-hit"
          style={anchorStyle(AW_M_01_OVERLAY_ANCHORS.AVATAR_SHELL_CENTER)}
          aria-label={`${demoSession.displayName} profile`}
        >
          <AstralPortrait
            personId={demoSession.userId}
            name={demoSession.displayName}
            initials={demoSession.displayName[0]}
            size={48}
            showPresence
            className="aw-m01-layered__avatar"
          />
        </Link>

        <section className="aw-m01-layered__astrea" aria-labelledby="aw-m01-layered-astrea-heading">
          <p className="aw-m01-layered__astrea-kicker" style={anchorStyle(AW_M_01_OVERLAY_ANCHORS.ASTREA_ENTERING_CENTER)}>
            You are entering
          </p>
          <h2 id="aw-m01-layered-astrea-heading" className="aw-m01-layered__astrea-title" style={anchorStyle(AW_M_01_OVERLAY_ANCHORS.ASTREA_TITLE_CENTER)}>
            <Link to={path('astrea')} className="aw-m01-layered__astrea-link">
              Astréa
            </Link>
          </h2>
          <p className="aw-m01-layered__astrea-district" style={anchorStyle(AW_M_01_OVERLAY_ANCHORS.ASTREA_DISTRICT_CENTER)}>
            The social district of Astral World.
          </p>
          <p className="aw-m01-layered__astrea-tagline" style={anchorStyle(AW_M_01_OVERLAY_ANCHORS.ASTREA_TAGLINE_CENTER)}>
            Explore. Connect. Belong.
          </p>
        </section>

        <nav className="aw-m01-layered__destinations" aria-label="Astréa destinations">
          <DestinationRow
            anchor={AW_M_01_OVERLAY_ANCHORS.DESTINATION_ROW_1}
            to={path('astrea/tarot-suite')}
            title="Tarot Suite"
            descriptor="Deep. Private. Immersive."
            accent="suite"
            iconSlot="TAROT_DESTINATION_ICON"
          />
          <DestinationRow
            anchor={AW_M_01_OVERLAY_ANCHORS.DESTINATION_ROW_2}
            to={path('astrea/coffee-shop')}
            title="Coffee Shop"
            descriptor="Conversations. Comfort. Community."
            accent="coffee"
            iconSlot="COFFEE_DESTINATION_ICON"
          />
          <DestinationRow
            anchor={AW_M_01_OVERLAY_ANCHORS.DESTINATION_ROW_3}
            to={path('astrea/astral-mall')}
            title="Astral Mall"
            descriptor="Fast. Fun. On the go."
            accent="mall"
            iconSlot="MALL_DESTINATION_ICON"
          />
        </nav>

        <Link to={path('astrea')} className="aw-sr-only-focusable">
          Enter Astréa
        </Link>

        <div className="aw-m01-layered__quick-actions" aria-label="World actions">
          <button
            type="button"
            className="aw-m01-layered__quick-hit"
            style={anchorStyle(AW_M_01_OVERLAY_ANCHORS.QUICK_ACTION_1)}
            onClick={onWhosHere}
          >
            Who&apos;s Here
          </button>
          <button
            type="button"
            className="aw-m01-layered__quick-hit"
            style={anchorStyle(AW_M_01_OVERLAY_ANCHORS.QUICK_ACTION_2)}
            onClick={onTakeMeSomewhere}
          >
            Take Me Somewhere
          </button>
          <Link to={path('readers')} className="aw-m01-layered__quick-hit" style={anchorStyle(AW_M_01_OVERLAY_ANCHORS.QUICK_ACTION_3)}>
            Find My Reader
          </Link>
        </div>

        <M01BottomNav path={path} />
      </CanonicalScreenStage>
    </article>
  );
}
