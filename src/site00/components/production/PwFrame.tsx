/**
 * SITE 00 mobile app frame — fixed full-screen host surface with its own header and bottom nav.
 * Two variants follow the reference pack: PROJECTS (5 tabs) and PRODUCTION (4 tabs).
 */

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { canAccessAdminPages } from '../../../utils/adminAuth';
import { SITE00_ROUTES } from '../../config/routes';
import { ProductionChromeStrip, ProductionWorkspaceHeader, ProductionWorkspaceNav } from '../productionHub/chrome';
import { IconGlyph } from './PwPrimitives';
import '../../styles/site00-production-mobile.css';

type NavItem = { id: string; label: string; href: string; icon: string; match: (p: string) => boolean };

const ICONS = {
  projects: 'M5 4h10l4 4v12H5zM14 4v5h5M8 13h8M8 17h5',
  sites: 'M4 4h16v16H4zM12 8v8M8 12h8',
  production: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9',
  library: 'M7 20c0-8 3-13 11-16-1 6-3 10-9 12M7 20c-1-3-1-5 0-8',
  system: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
};

const NAV_PRODUCTION: NavItem[] = [
  { id: 'hub', label: 'HUB', href: '/production', icon: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z', match: (p) => p === '/production' },
  { id: 'inbox', label: 'INBOX', href: '/production/queue', icon: 'M4 6h16v12H4zM4 7l8 6 8-6', match: (p) => p.startsWith('/production/queue') },
  { id: 'design', label: 'DESIGN', href: '/production/ndxbook/design', icon: ICONS.library, match: (p) => /^\/production\/[^/]+\/design/.test(p) },
  { id: 'experience', label: 'EXPERIENCE', href: '/production/ndxbook/experience', icon: 'M12 4l9 16H3zM12 4v16', match: (p) => /^\/production\/[^/]+\/experience/.test(p) },
  { id: 'expression', label: 'EXPRESSION', href: '/production/ndxbook/expression', icon: 'M12 3l8 4.5v9L12 21l-8-4.5v-9z', match: (p) => /^\/production\/[^/]+\/expression/.test(p) },
  { id: 'library', label: 'LIBRARY', href: SITE00_ROUTES.productionLibraries, icon: ICONS.production, match: (p) => p.startsWith('/production/libraries') },
  { id: 'activity', label: 'ACTIVITY', href: '/production?panel=activity', icon: 'M12 4a8 8 0 100 16 8 8 0 000-16zM12 8v4l3 2', match: () => false },
];

function navProjects(admin: boolean): NavItem[] {
  return [
    { id: 'projects', label: 'PROJECTS', href: SITE00_ROUTES.projects, icon: ICONS.projects, match: (p) => p.startsWith('/projects') },
    { id: 'sites', label: 'SITES', href: SITE00_ROUTES.controlSites, icon: ICONS.sites, match: (p) => p.startsWith('/control/sites') },
    ...(admin ?
      [
        { id: 'production', label: 'PRODUCTION', href: SITE00_ROUTES.productionWorkspace, icon: ICONS.production, match: (p: string) => p.startsWith('/production') },
        { id: 'library', label: 'LIBRARY', href: SITE00_ROUTES.productionLibraries, icon: ICONS.library, match: (p: string) => p.startsWith(SITE00_ROUTES.productionLibraries) },
      ]
    : []),
    { id: 'more', label: 'MORE', href: SITE00_ROUTES.control, icon: ICONS.more, match: (p) => p === SITE00_ROUTES.control },
  ];
}

function useBodyLock() {
  useEffect(() => {
    const { body, documentElement } = document;
    const prev = [body.style.overflow, documentElement.style.overflow];
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prev[0]!;
      documentElement.style.overflow = prev[1]!;
    };
  }, []);
}

function operatorInitials(): string {
  try {
    const raw = window.localStorage.getItem('currentUser');
    const user = raw ? (JSON.parse(raw) as { name?: string; email?: string }) : null;
    const src = user?.name?.trim() || user?.email?.split('@')[0] || '';
    const parts = src.split(/[\s._-]+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  } catch {
    /* ignore */
  }
  return 'AD';
}

export function PwFrame({
  variant,
  children,
  heroImage,
}: {
  variant: 'production' | 'projects';
  children: ReactNode;
  /** Optional cinematic backdrop behind the top of the scroll area (Projects home / detail). */
  heroImage?: string;
}) {
  useBodyLock();
  const { pathname } = useLocation();
  const admin = canAccessAdminPages();
  const items = variant === 'production' ? NAV_PRODUCTION : navProjects(admin);

  // Portal to <body>: host page CSS (uppercase/letter-spacing rules on .site00-page etc.) must not leak in.
  if (variant === 'production') {
    return createPortal(
      <div className="pw pw--production pw--authority" data-testid="pw-frame-production">
        <ProductionChromeStrip host>
          <ProductionWorkspaceHeader />
        </ProductionChromeStrip>
        <div className="pw-scroll">
          {heroImage ?
            <div className="pw-scroll__hero" style={{ backgroundImage: `url(${heroImage})` }} aria-hidden />
          : null}
          <div className="pw-scroll__body">{children}</div>
        </div>
        <ProductionChromeStrip host>
          <ProductionWorkspaceNav />
        </ProductionChromeStrip>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className={`pw pw--${variant}`} data-testid={`pw-frame-${variant}`}>
      <header className="pw-top">
        <Link to={SITE00_ROUTES.origin} className="pw-top__brand">
          SITE 00
        </Link>
        <Link to={SITE00_ROUTES.control} className="pw-top__avatar" aria-label="Account">
          {operatorInitials()}
        </Link>
      </header>
      <div className="pw-scroll">
        {heroImage ?
          <div className="pw-scroll__hero" style={{ backgroundImage: `url(${heroImage})` }} aria-hidden />
        : null}
        <div className="pw-scroll__body">{children}</div>
      </div>
      <nav className="pw-nav" aria-label="Projects navigation" data-testid="pw-bottom-nav">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link key={item.id} to={item.href} className={`pw-nav__item${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined}>
              <IconGlyph d={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>,
    document.body,
  );
}
