/**
 * The Safe to Spend parent corner controls, pinned to the viewport on every app screen.
 * Back opens today. The hamburger opens the account drawer (the account folio) over the current screen.
 * The word ACCOUNT in that drawer opens the full account page.
 */

import { useCallback, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AccountDrawer } from '../screens/AccountScreens';
import { useJurnl } from '../state/store';

export function JurnlCornerChromeProvider({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  return (
    <>
      <JurnlCornerChrome hidden={drawer} onMenu={() => setDrawer(true)} />
      {children}
      {drawer ? <AccountDrawer onClose={closeDrawer} /> : null}
    </>
  );
}

const ROOT_HUBS = new Set(['today', 'money', 'plan', 'credit']);

function appRoute(pathname: string): string {
  const mark = '/runtime/';
  const i = pathname.indexOf(mark);
  return i === -1 ? '' : pathname.slice(i + mark.length);
}

function JurnlCornerChrome({ hidden, onMenu }: { hidden: boolean; onMenu: () => void }) {
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
      {rootHub ? null : (
        <button type="button" className="jrn-f09a__back" aria-label="BACK TO TODAY" data-jrn-trigger="f09-back" onClick={() => go('today')}>
          <svg viewBox="0 0 16 28" aria-hidden>
            <path d="M14 2 2 14l12 12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <button type="button" className="jrn-f09a__menu" aria-label="MENU" data-jrn-trigger="f09-menu" onClick={onMenu}>
        <svg viewBox="0 0 40 26" aria-hidden>
          <path d="M0 1.5h40M0 13h40M0 24.5h40" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
