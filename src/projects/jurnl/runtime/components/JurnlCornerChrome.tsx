/**
 * The Safe to Spend parent corner controls, pinned to the viewport on every app screen.
 * Back opens today. The menu opens account, unless the current screen registers its own menu (the account drawer).
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useJurnl } from '../state/store';

type CornerApi = {
  setMenu: (fn: (() => void) | null) => void;
  setHidden: (hidden: boolean) => void;
};

const CornerApiContext = createContext<CornerApi | null>(null);

export function JurnlCornerChromeProvider({ children }: { children: ReactNode }) {
  const [menu, setMenuState] = useState<(() => void) | null>(null);
  const [hidden, setHidden] = useState(false);
  const api = useMemo<CornerApi>(() => ({
    setMenu: (fn) => setMenuState(() => fn),
    setHidden,
  }), []);
  return (
    <CornerApiContext.Provider value={api}>
      <JurnlCornerChrome menu={menu} hidden={hidden} />
      {children}
    </CornerApiContext.Provider>
  );
}

/** Account (and any other screen that owns a drawer) takes the shared menu button. `covered` hides the buttons while that drawer is open. */
export function useCornerMenu(open: () => void, covered: boolean) {
  const api = useContext(CornerApiContext);
  useEffect(() => {
    if (!api) return;
    api.setMenu(() => open());
    return () => api.setMenu(null);
  }, [api, open]);
  useEffect(() => {
    if (!api) return;
    api.setHidden(covered);
    return () => api.setHidden(false);
  }, [api, covered]);
}

function appRoute(pathname: string): string {
  const mark = '/runtime/';
  const i = pathname.indexOf(mark);
  return i === -1 ? '' : pathname.slice(i + mark.length);
}

function JurnlCornerChrome({ menu, hidden }: { menu: (() => void) | null; hidden: boolean }) {
  const { go } = useJurnl();
  const { pathname } = useLocation();
  const rel = appRoute(pathname);
  const skip = rel === '' || rel.startsWith('entry') || rel.startsWith('setup');
  if (skip || hidden) return null;
  const onToday = rel === 'today';
  return (
    <div className="jrn-corner" data-jrn-corner="app">
      {onToday ? null : (
        <button type="button" className="jrn-f09a__back" aria-label="BACK TO TODAY" data-jrn-trigger="f09-back" onClick={() => go('today')}>
          <svg viewBox="0 0 16 28" aria-hidden>
            <path d="M14 2 2 14l12 12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <button type="button" className="jrn-f09a__menu" aria-label="MENU" data-jrn-trigger="f09-menu" onClick={() => (menu ? menu() : go('account'))}>
        <svg viewBox="0 0 40 26" aria-hidden>
          <path d="M0 1.5h40M0 13h40M0 24.5h40" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
