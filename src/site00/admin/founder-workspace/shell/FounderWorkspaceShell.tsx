import { type ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSupabase } from '../../../../utils/supabase';
import {
  FOUNDER_WORKSPACE_MOBILE_BOTTOM_NAV,
  FOUNDER_WORKSPACE_MOBILE_MENU_EXTRA,
  FOUNDER_WORKSPACE_SIDEBAR_NAV,
  destinationFromPathname,
  navItemIsActive,
} from '../config/navigation';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { OverlayHost } from '../overlay/OverlayHost';
import { ToastStack } from '../overlay/ToastStack';
import '../../../styles/site00-correspondence-fonts.css';
import '../styles/idnty-founder-workspace.css';

type Props = {
  children: ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
};

export function FounderWorkspaceShell({ children, pageTitle, pageSubtitle }: Props) {
  const { pathname } = useLocation();
  const dest = destinationFromPathname(pathname);
  const { openOverlay } = useFounderWorkspaceOverlay();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileLabel, setProfileLabel] = useState('FOUNDER');

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      if (email) {
        const local = email.split('@')[0]?.replace(/\./g, ' ').toUpperCase();
        setProfileLabel(local || 'FOUNDER');
      }
    });
  }, []);

  return (
    <div className="ifw ifw-shell" data-ifw-destination={dest}>
      <aside className="ifw-shell__sidebar" aria-label="Workspace navigation">
        <div className="ifw-shell__brand">
          <span className="ifw-shell__brand-mark">IDNTY</span>
          <span className="ifw-shell__brand-sub">Founder workspace</span>
        </div>
        <nav className="ifw-shell__nav">
          {FOUNDER_WORKSPACE_SIDEBAR_NAV.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={`ifw-shell__nav-link ${navItemIsActive(pathname, item.href) ? 'ifw-shell__nav-link--active' : ''}`.trim()}
            >
              <span className="ifw-shell__nav-ord">{item.ordinal}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="ifw-shell__tablet-rail" aria-hidden="true">
        {FOUNDER_WORKSPACE_SIDEBAR_NAV.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className={`ifw-shell__rail-link ${navItemIsActive(pathname, item.href) ? 'ifw-shell__rail-link--active' : ''}`.trim()}
            title={item.label}
          >
            <span className="ifw-shell__rail-ord">{item.ordinal}</span>
            <span className="ifw-shell__rail-label">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="ifw-shell__main">
        <header className="ifw-shell__header">
          <div className="ifw-shell__header-top">
            <button type="button" className="ifw-shell__menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
              Menu
            </button>
            <div className="ifw-shell__header-meta">
              <span className="ifw-shell__context">{profileLabel}</span>
            </div>
            <button type="button" className="ifw-btn ifw-btn--primary ifw-shell__create" onClick={() => openOverlay('CREATE_CLIENT')}>
              Create
            </button>
          </div>
          <h1 className="ifw-page-title">
            {pageTitle}
            <span className="ifw-period" aria-hidden="true" />
          </h1>
          {pageSubtitle ? <p className="ifw-page-sub">{pageSubtitle}</p> : null}
        </header>

        <div className="ifw-shell__stage">{children}</div>
      </div>

      <nav className="ifw-shell__bottom" aria-label="Mobile primary navigation">
        {FOUNDER_WORKSPACE_MOBILE_BOTTOM_NAV.map((item) => {
          if (item.kind === 'action') {
            return (
              <button
                key={item.id}
                type="button"
                className="ifw-shell__bottom-btn ifw-shell__bottom-btn--create"
                onClick={() => openOverlay('CREATE_CLIENT')}
              >
                {item.label}
              </button>
            );
          }
          const active = item.href ? navItemIsActive(pathname, item.href) : false;
          return (
            <Link key={item.id} to={item.href!} className={`ifw-shell__bottom-link ${active ? 'ifw-shell__bottom-link--active' : ''}`.trim()}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {menuOpen ? (
        <div className="ifw-mobile-menu">
          <button type="button" className="ifw-mobile-menu__scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          <div className="ifw-mobile-menu__panel" role="dialog" aria-label="Workspace menu">
            <p className="ifw-mobile-menu__title">Workspace</p>
            {FOUNDER_WORKSPACE_MOBILE_MENU_EXTRA.map((item) => (
              <Link key={item.id} to={item.href} className="ifw-mobile-menu__link" onClick={() => setMenuOpen(false)}>
                <span>{item.ordinal}</span> {item.label}
              </Link>
            ))}
            <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => setMenuOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}

      <OverlayHost />
      <ToastStack />
    </div>
  );
}
