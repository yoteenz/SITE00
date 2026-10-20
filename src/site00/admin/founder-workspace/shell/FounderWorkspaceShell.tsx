import { Fragment, type ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSupabase } from '../../../../utils/supabase';
import { SITE00_ROUTES } from '../../../config/routes';
import { FOUNDER_WORKSPACE_MOBILE_BOTTOM_NAV, FOUNDER_WORKSPACE_SIDEBAR_NAV, destinationFromPathname, navItemIsActive } from '../config/navigation';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { OverlayHost } from '../overlay/OverlayHost';
import { ToastStack } from '../overlay/ToastStack';
import { WsBrand, WsIcon, WsIconButton, WsPlate, WsPlus } from './wsKit';
import { useFounderWorkspaceFontsReady } from './useFounderWorkspaceFontsReady';
import '../styles/idnty-founder-workspace.css';
import '../styles/ifw-authority.css';
import '../styles/ifw-recovery2.css';

type Props = {
  children: ReactNode;
  /** Breadcrumb trail after the destination index, e.g. ['FOUNDATIONS', 'CARTER & LANE']. */
  crumb: string[];
  density?: 'relaxed' | 'standard' | 'compact';
  /** Inspector markup (ws-insp). Docked beside the stage ≥ 1100 px; a right sheet / phone sheet below. */
  inspector?: ReactNode;
  onInspectorClose?: () => void;
};

/** Environment tag beside the SITE 00 wordmark — derived from the host, never hard-coded. */
function environmentLabel(): string {
  if (typeof window === 'undefined') return 'PREVIEW';
  const h = window.location.hostname;
  if (h === 'site00.com' || h === 'www.site00.com') return 'LIVE';
  if (h.includes('staging')) return 'STAGING';
  return 'PREVIEW';
}

const NAV_ICON: Record<string, string> = {
  overview: 'home',
  foundations: 'users',
  reviews: 'approval',
  operations: 'checklist',
  correspondence: 'email',
  referrals: 'share',
  system: 'server',
};
const RAIL_LABEL: Record<string, string> = { overview: 'HOME', operations: 'OPS', correspondence: 'MAIL' };

/**
 * Founder workspace frame — React port of the approved OPUS2 shell (ws-kit `app()`):
 * sidebar ≥ 1280 · 80 px rail 768–1279 · header + bottom bar < 768; the stage is a `stage` container so pages
 * recompose from the width they actually have.
 */
export function FounderWorkspaceShell({ children, crumb, density = 'standard', inspector, onInspectorClose }: Props) {
  const { pathname } = useLocation();
  const dest = destinationFromPathname(pathname);
  const { openOverlay } = useFounderWorkspaceOverlay();
  const [profileLabel, setProfileLabel] = useState('FOUNDER');
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const env = environmentLabel();
  const fontsReady = useFounderWorkspaceFontsReady();
  const current = FOUNDER_WORKSPACE_SIDEBAR_NAV.find((n) => n.id === dest) ?? FOUNDER_WORKSPACE_SIDEBAR_NAV[0];

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      if (email) {
        setProfileEmail(email);
        const local = email.split('@')[0]?.replace(/\./g, ' ').toUpperCase();
        setProfileLabel(local || 'FOUNDER');
      }
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openOverlay('OL-04');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openOverlay]);

  useEffect(() => {
    if (!inspector || !onInspectorClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[data-ifw-overlay]')) onInspectorClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inspector, onInspectorClose]);

  const openAccount = () => openOverlay('OL-18', { email: profileEmail ?? profileLabel });

  return (
    <div
      className={`ws ifw ${fontsReady ? '' : 'ws--fonts-pending'}`.trim()}
      data-ifw-destination={dest}
      aria-busy={!fontsReady}
    >
      <div className={`ws-app ${inspector ? 'ws-app--insp' : ''}`.trim()}>
        <nav className="ws-nav" aria-label="PRIMARY">
          <div className="ws-side">
            <WsBrand env={env} />
            <div className="ws-side__create">
              <button type="button" className="ws-btn ws-btn--red ws-btn--block" onClick={() => openOverlay('OL-01')}>
                <WsIcon name="add" />
                <span>NEW FOUNDATION</span>
              </button>
            </div>
            <ul className="ws-side__list">
              {FOUNDER_WORKSPACE_SIDEBAR_NAV.map((n) => {
                const on = navItemIsActive(pathname, n.href);
                return (
                  <li key={n.id}>
                    <Link to={n.href} className={`ws-side__i ${on ? 'ws-side__i--on' : ''}`.trim()} aria-current={on ? 'page' : undefined}>
                      <span className="ws-idx">{n.ordinal}</span>
                      <i />
                      <span>{n.label.toUpperCase()}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="ws-side__sep" />
            <Link className="ws-side__tool" to={SITE00_ROUTES.digitalFoundationReadiness}>
              <WsIcon name="checklist" />
              <span>READINESS DESK</span>
              <WsIcon name="external" />
            </Link>
            <button type="button" className="ws-side__foot" onClick={openAccount}>
              <WsPlate name={profileLabel} size="xs" />
              <span className="ws-who">
                <b style={{ fontSize: 12 }}>{profileLabel}</b>
                <span>ADMIN · SIGNED IN</span>
              </span>
              <span style={{ marginLeft: 'auto', color: 'var(--ws-muted)' }}>
                <WsIcon name="more" />
              </span>
            </button>
          </div>

          <div className="ws-rail">
            <span className="ws-plate ws-plate--xs" aria-hidden="true">
              00
            </span>
            <button type="button" className="ws-rail__create" onClick={() => openOverlay('OL-01')}>
              <span>
                <WsPlus />
              </span>
              NEW
            </button>
            {FOUNDER_WORKSPACE_SIDEBAR_NAV.map((n) => {
              const on = navItemIsActive(pathname, n.href);
              return (
                <Link
                  key={n.id}
                  to={n.href}
                  className={`ws-rail__i ${on ? 'ws-rail__i--on' : ''}`.trim()}
                  aria-current={on ? 'page' : undefined}
                  aria-label={n.label.toUpperCase()}
                >
                  <WsIcon name={NAV_ICON[n.id]} />
                  <span>{RAIL_LABEL[n.id] ?? n.label.toUpperCase()}</span>
                </Link>
              );
            })}
            <button type="button" className="ws-rail__foot" onClick={openAccount} aria-label="ACCOUNT">
              <WsPlate name={profileLabel} size="xs" />
            </button>
          </div>
        </nav>

        <header className="ws-top">
          <div className="ws-top__m">
            <WsBrand env={env} />
            <span className="ws-top__acts">
              <WsIconButton icon="search" label="SEARCH" onClick={() => openOverlay('OL-04')} />
              <WsIconButton icon="notification" label="NOTIFICATIONS" onClick={() => openOverlay('OL-05')} />
              <WsIconButton icon="menu" label="MENU" onClick={() => openOverlay('OL-03')} />
            </span>
          </div>
          <div className="ws-top__d">
            <nav className="ws-crumb" aria-label="BREADCRUMB">
              <b>{current.ordinal}</b>
              <i />
              {crumb.map((p, i) =>
                i < crumb.length - 1 ? (
                  <Fragment key={p}>
                    <span style={{ color: 'var(--ws-muted)', whiteSpace: 'nowrap' }}>{p}</span>
                    <span className="sep">/</span>
                  </Fragment>
                ) : (
                  <span key={p} className="cur">
                    {p}
                  </span>
                ),
              )}
            </nav>
            <button type="button" className="ws-search ws-search--top" onClick={() => openOverlay('OL-04')}>
              <WsIcon name="search" />
              <span>SEARCH CLIENTS, REVIEWS, TASKS</span>
              <span className="ws-kbd">⌘K</span>
            </button>
            <WsIconButton icon="notification" label="NOTIFICATIONS" onClick={() => openOverlay('OL-05')} />
          </div>
        </header>

        <main className={`ws-stage ws-${density}`} id="stage">
          {children}
        </main>

        {inspector ? (
          <>
            <button type="button" className="ifw-insp-scrim" aria-label="CLOSE INSPECTOR" tabIndex={-1} onClick={onInspectorClose} />
            <aside className={`ws-insp ws-${density}`} aria-label="INSPECTOR">
              {inspector}
            </aside>
          </>
        ) : null}

        <nav className="ws-bnav" aria-label="PRIMARY">
          {/* Founder lock: HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM (config/navigation). REFERRALS lives in the MENU. */}
          {FOUNDER_WORKSPACE_MOBILE_BOTTOM_NAV.map((item) =>
            item.kind === 'action' ? (
              <button key={item.id} type="button" className="ws-bnav__c" onClick={() => openOverlay('OL-01')}>
                <span>
                  <WsPlus />
                </span>
                {item.label.toUpperCase()}
              </button>
            ) : (
              <BottomItem key={item.id} id={item.id} label={item.label} href={item.href!} pathname={pathname} />
            ),
          )}
        </nav>
      </div>

      <OverlayHost />
      <ToastStack />
    </div>
  );
}

function BottomItem({ id, label, href, pathname }: { id: string; label: string; href: string; pathname: string }) {
  // Menu destinations (REFERRALS, OPERATIONS, CORRESPONDENCE) leave every bottom item unselected.
  const on = navItemIsActive(pathname, href);
  return (
    <Link to={href} className={`ws-bnav__i ${on ? 'ws-bnav__i--on' : ''}`.trim()} aria-current={on ? 'page' : undefined}>
      <WsIcon name={NAV_ICON[id]} />
      {label.toUpperCase()}
    </Link>
  );
}
