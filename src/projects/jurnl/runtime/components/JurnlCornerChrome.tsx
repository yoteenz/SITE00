/**
 * The Safe to Spend parent corner controls, pinned to the viewport on every app screen.
 * Back opens today. The hamburger opens the GLOBAL MENU (V3 editorial folio, secondary navigation — never the five dock
 * destinations); its items open the ACCOUNT page, the approved account folio (PREFERENCES), PRIVACY & CONSENTS, and the
 * MEMBERSHIP & ACCESS surfaces. The account folio (AccountDrawer) is unchanged; it is now reached from PREFERENCES.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AccountDrawer, ConsentsSheet } from '../screens/AccountScreens';
import { AddOnCollection, GlobalMenu, MembershipFolio, UnlockFolio, type GlobalMenuDestination, type GlobalMenuPanel } from '../global/GlobalMenu';
import { useJurnl } from '../state/store';

type Panel = GlobalMenuPanel | 'preferences' | 'privacy';

export function JurnlCornerChromeProvider({ children }: { children: ReactNode }) {
  const { go } = useJurnl();
  const [panel, setPanel] = useState<Panel | null>(null);
  const close = useCallback(() => setPanel(null), []);
  const back = useCallback(() => setPanel('menu'), []);
  const open = useCallback((p: GlobalMenuPanel) => setPanel(p), []);
  const toggleMenu = useCallback(() => setPanel((p) => (p === 'menu' ? null : 'menu')), []);
  const toDestination = useCallback(
    (d: GlobalMenuDestination) => {
      if (d === 'account') {
        setPanel(null);
        go('account');
      } else setPanel(d);
    },
    [go],
  );
  const unlock = typeof panel === 'object' && panel ? panel.unlock : null;
  // The corner chrome steps aside while a panel is open, so the hamburger the focus trap remembered is gone when the
  // last panel closes: hand focus to the hamburger that comes back (keyboard and screen-reader users land where they were).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (panel !== null) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    const id = window.requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-jrn-trigger="f09-menu"]')?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(id);
  }, [panel]);
  return (
    <>
      <JurnlCornerChrome hidden={panel !== null && panel !== 'menu'} menuExpanded={panel === 'menu'} onMenu={toggleMenu} />
      {children}
      {panel === 'menu' ? <GlobalMenu onClose={close} onOpen={open} onDestination={toDestination} /> : null}
      {panel === 'preferences' ? <AccountDrawer onClose={close} /> : null}
      {panel === 'privacy' ? <ConsentsSheet onClose={back} /> : null}
      {panel === 'membership' ? <MembershipFolio onClose={back} onOpen={open} /> : null}
      {panel === 'add-ons' ? <AddOnCollection onClose={back} onOpen={open} /> : null}
      {unlock ? <UnlockFolio addOnId={unlock} onClose={() => setPanel('add-ons')} /> : null}
    </>
  );
}

const ROOT_HUBS = new Set(['today', 'money', 'plan', 'credit']);

function appRoute(pathname: string): string {
  const mark = '/runtime/';
  const i = pathname.indexOf(mark);
  return i === -1 ? '' : pathname.slice(i + mark.length);
}

function JurnlCornerChrome({ hidden, menuExpanded, onMenu }: { hidden: boolean; menuExpanded?: boolean; onMenu: () => void }) {
  const { go } = useJurnl();
  const { pathname } = useLocation();
  const rel = appRoute(pathname);
  const skip = rel === '' || rel.startsWith('entry') || rel.startsWith('setup');
  if (skip || hidden) return null;
  // The four root hubs are siblings in the dock, so they keep the menu (account drawer) but no back chip:
  // their founder references draw the JURNL lockup in that corner.
  const rootHub = ROOT_HUBS.has(rel);
  return (
    <div className="jrn-corner" data-jrn-corner="app">
      <button type="button" className="jrn-f09a__menu" aria-label="MENU" data-jrn-trigger="f09-menu" aria-expanded={menuExpanded ? true : undefined} onClick={onMenu}>
        <svg viewBox="0 0 40 26" aria-hidden>
          <path d="M0 1.5h40M0 13h40M0 24.5h40" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </button>
      {rootHub ? null : (
        <button type="button" className="jrn-f09a__back" aria-label="BACK TO TODAY" data-jrn-trigger="f09-back" onClick={() => go('today')}>
          <svg viewBox="0 0 16 28" aria-hidden>
            <path d="M14 2 2 14l12 12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
