import type { CSSProperties, ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  AW_D_01_OVERLAY_ANCHORS,
  resolveAwD01BackgroundPath,
  resolveAwD01DestinationIconCrop,
} from '../../../../../shared/site00-astral-world/screen-masters/awD01LayeredAssets.js';
import { useAstralWorld } from '../../context/AstralWorldContext';
import { AstralPortrait } from '../immersive/AstralPortrait';
import {
  NavIconFriends,
  NavIconHome,
  NavIconJournal,
  NavIconProfile,
  NavIconReaders,
  NavIconWorld,
} from '../AstralDestIcons';

type AwD01WorldEntryScreenProps = {
  onWhosHere: () => void;
  onTakeMeSomewhere: () => void;
};

type AnchorRect = { x: number; y: number; w: number; h: number };

function anchorStyle(anchor: AnchorRect): CSSProperties {
  return {
    position: 'absolute',
    left: `${anchor.x - anchor.w / 2}%`,
    top: `${anchor.y}%`,
    width: `${anchor.w}%`,
    height: `${anchor.h}%`,
  };
}

function CelestialBrandMark() {
  return (
    <svg className="aw-d01-layered__brand-mark" width="22" height="22" viewBox="0 0 22 22" aria-hidden>
      <circle cx="11" cy="11" r="9" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <path d="M11 4 L12 11 L11 13 L10 11 Z M11 18 L12 11 L11 9 L10 11 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="11" cy="11" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconBell({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M6 17h12l-1.2-1.5A4 4 0 0116 12V9a4 4 0 00-8 0v3a4 4 0 01-.8 2.5L6 17z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 18a2 2 0 004 0" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconMail({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="4" y="6" width="16" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 8l8 5 8-5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconCompass({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12 6l1.5 6L12 14l-1.5-2Z M12 18l-1.5-6L12 10l1.5 2Z" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function DestinationMedallion({ cropKey }: { cropKey: 'TAROT_SUITE' | 'COFFEE_SHOP' | 'ASTRAL_MALL' }) {
  const crop = resolveAwD01DestinationIconCrop(cropKey);
  return (
    <span
      className="aw-d01-layered__medallion"
      style={{
        backgroundImage: `url(${crop.src})`,
        backgroundPosition: crop.position,
        backgroundSize: crop.size,
        backgroundRepeat: 'no-repeat',
      }}
      aria-hidden
    />
  );
}

function DestinationRow({
  anchor,
  to,
  title,
  descriptor,
  accent,
  cropKey,
}: {
  anchor: AnchorRect;
  to: string;
  title: string;
  descriptor: string;
  accent: 'suite' | 'coffee' | 'mall';
  cropKey: 'TAROT_SUITE' | 'COFFEE_SHOP' | 'ASTRAL_MALL';
}) {
  return (
    <Link to={to} className={`aw-d01-layered__dest aw-d01-layered__dest--${accent}`} style={anchorStyle(anchor)}>
      <DestinationMedallion cropKey={cropKey} />
      <span className="aw-d01-layered__dest-copy">
        <span className="aw-d01-layered__dest-name">{title}</span>
        <span className="aw-d01-layered__dest-desc">{descriptor}</span>
      </span>
    </Link>
  );
}

function ActionRow({
  anchor,
  label,
  icon,
  onClick,
  to,
}: {
  anchor: AnchorRect;
  label: ReactNode;
  icon: ReactNode;
  onClick?: () => void;
  to?: string;
}) {
  const className = 'aw-d01-layered__action';
  const content = (
    <>
      <span className="aw-d01-layered__action-icon">{icon}</span>
      <span className="aw-d01-layered__action-label">{label}</span>
    </>
  );
  if (to) {
    return (
      <Link to={to} className={className} style={anchorStyle(anchor)}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={className} style={anchorStyle(anchor)} onClick={onClick}>
      {content}
    </button>
  );
}

function D01TopNav({ path }: { path: (segment: string) => string }) {
  const tabs = [
    { to: path('home'), label: 'Home', end: true },
    { to: path('astrea'), label: 'World' },
    { to: path('journal'), label: 'Journal' },
    { to: path('friends'), label: 'Friends' },
    { to: path('profile'), label: 'Profile' },
  ];

  return (
    <>
      <div className="aw-d01-layered__top-brand" style={anchorStyle(AW_D_01_OVERLAY_ANCHORS.TOP_NAV_BRAND)}>
        <CelestialBrandMark />
        <span>Astral World</span>
      </div>
      <nav className="aw-d01-layered__top-links" style={anchorStyle(AW_D_01_OVERLAY_ANCHORS.TOP_NAV_LINKS)} aria-label="Primary">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `aw-d01-layered__top-link${isActive ? ' aw-d01-layered__top-link--active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <div className="aw-d01-layered__top-utils" style={anchorStyle(AW_D_01_OVERLAY_ANCHORS.TOP_NAV_UTILITIES)}>
        <button type="button" className="aw-d01-layered__top-icon-btn" aria-label="Notifications">
          <IconBell />
        </button>
        <button type="button" className="aw-d01-layered__top-icon-btn" aria-label="Messages">
          <IconMail />
        </button>
      </div>
    </>
  );
}

function D01BottomNav({ path }: { path: (segment: string) => string }) {
  const tabs = [
    { to: path('home'), label: 'Home', end: true, Icon: NavIconHome },
    { to: path('astrea'), label: 'World', Icon: NavIconWorld },
    { to: path('journal'), label: 'Journal', Icon: NavIconJournal },
    { to: path('friends'), label: 'Friends', Icon: NavIconFriends },
    { to: path('profile'), label: 'Profile', Icon: NavIconProfile },
  ];

  return (
    <nav className="aw-d01-layered__bottom-nav" style={anchorStyle(AW_D_01_OVERLAY_ANCHORS.BOTTOM_NAV)} aria-label="Desktop bottom navigation">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `aw-d01-layered__bottom-link${isActive ? ' aw-d01-layered__bottom-link--active' : ''}`}
        >
          <tab.Icon size={20} />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * AW_D_01_WORLD_ENTRY — desktop layered replication (FT5.2C).
 */
export function AwD01WorldEntryScreen({ onWhosHere, onTakeMeSomewhere }: AwD01WorldEntryScreenProps) {
  const { path, demoSession } = useAstralWorld();
  const bgPath = resolveAwD01BackgroundPath();

  return (
    <article
      className="aw-d01-layered aw-desktop-only"
      data-screen-master="AW_D_01_WORLD_ENTRY"
      data-scene-id="HOME_ARRIVAL"
      data-background-slot="AW_D_01_WORLD_ENTRY_BACKGROUND_V1"
    >
      <div className="aw-d01-layered__stage">
        <img
          className="aw-d01-layered__bg"
          src={bgPath}
          alt=""
          width={1672}
          height={941}
          decoding="async"
          draggable={false}
        />

        <div className="aw-d01-layered__overlays">
          <D01TopNav path={path} />

          <Link
            to={path('profile')}
            className="aw-d01-layered__avatar-hit"
            style={anchorStyle(AW_D_01_OVERLAY_ANCHORS.AVATAR_SHELL_CENTER)}
            aria-label={`${demoSession.displayName} profile`}
          >
            <AstralPortrait
              personId={demoSession.userId}
              name={demoSession.displayName}
              initials={demoSession.displayName[0]}
              size={52}
              showPresence
              className="aw-d01-layered__avatar"
            />
          </Link>

          <p className="aw-d01-layered__hero-kicker" style={anchorStyle(AW_D_01_OVERLAY_ANCHORS.HERO_KICKER_CENTER)}>
            Welcome to
          </p>
          <h1 className="aw-d01-layered__hero-title" style={anchorStyle(AW_D_01_OVERLAY_ANCHORS.HERO_TITLE_CENTER)}>
            Astral World
          </h1>
          <p className="aw-d01-layered__hero-subtitle" style={anchorStyle(AW_D_01_OVERLAY_ANCHORS.HERO_SUBTITLE_CENTER)}>
            A living world of intuition,
            <br />
            readings, and transformation.
          </p>

          <section className="aw-d01-layered__left" aria-labelledby="aw-d01-astrea-heading">
            <p className="aw-d01-layered__astrea-kicker" style={anchorStyle(AW_D_01_OVERLAY_ANCHORS.ASTREA_ENTERING)}>
              You are entering
            </p>
            <h2 id="aw-d01-astrea-heading" className="aw-d01-layered__astrea-title" style={anchorStyle(AW_D_01_OVERLAY_ANCHORS.ASTREA_TITLE)}>
              <Link to={path('astrea')} className="aw-d01-layered__astrea-link">
                Astréa
              </Link>
            </h2>
            <p className="aw-d01-layered__astrea-district" style={anchorStyle(AW_D_01_OVERLAY_ANCHORS.ASTREA_DISTRICT)}>
              The social district of Astral World.
            </p>
            <p className="aw-d01-layered__astrea-tagline" style={anchorStyle(AW_D_01_OVERLAY_ANCHORS.ASTREA_TAGLINE)}>
              Explore. Connect. Belong.
            </p>

            <nav className="aw-d01-layered__destinations" aria-label="Astréa destinations">
              <DestinationRow
                anchor={AW_D_01_OVERLAY_ANCHORS.DESTINATION_ROW_1}
                to={path('astrea/tarot-suite')}
                title="Tarot Suite"
                descriptor="Deep. Private. Immersive."
                accent="suite"
                cropKey="TAROT_SUITE"
              />
              <DestinationRow
                anchor={AW_D_01_OVERLAY_ANCHORS.DESTINATION_ROW_2}
                to={path('astrea/coffee-shop')}
                title="Coffee Shop"
                descriptor="Conversations. Comfort. Community."
                accent="coffee"
                cropKey="COFFEE_SHOP"
              />
              <DestinationRow
                anchor={AW_D_01_OVERLAY_ANCHORS.DESTINATION_ROW_3}
                to={path('astrea/astral-mall')}
                title="Astral Mall"
                descriptor="Fast. Fun. On the go."
                accent="mall"
                cropKey="ASTRAL_MALL"
              />
            </nav>
          </section>

          <aside className="aw-d01-layered__right" aria-label="World actions">
            <ActionRow
              anchor={AW_D_01_OVERLAY_ANCHORS.RIGHT_ACTION_1}
              label="Who's Here"
              icon={<NavIconFriends size={18} />}
              onClick={onWhosHere}
            />
            <ActionRow
              anchor={AW_D_01_OVERLAY_ANCHORS.RIGHT_ACTION_2}
              label={
                <>
                  Take Me
                  <br />
                  Somewhere
                </>
              }
              icon={<IconCompass />}
              onClick={onTakeMeSomewhere}
            />
            <ActionRow
              anchor={AW_D_01_OVERLAY_ANCHORS.RIGHT_ACTION_3}
              label="Find My Reader"
              icon={<NavIconReaders size={18} />}
              to={path('readers')}
            />
          </aside>

          <Link to={path('astrea')} className="aw-sr-only-focusable">
            Enter Astréa
          </Link>

          <D01BottomNav path={path} />
        </div>
      </div>
    </article>
  );
}
