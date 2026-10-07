/**
 * The Safe to Spend parent corner controls, pinned to the viewport on every app screen.
 * Back opens today. The hamburger opens the account drawer over the current screen.
 * The word ACCOUNT in that drawer opens the full account page.
 */

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AccountDrawer } from '../screens/AccountScreens';
import { referenceFit } from './ReferenceStage';
import { useJurnl } from '../state/store';

export function JurnlCornerChromeProvider({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  return (
    <>
      <JurnlCornerChrome hidden={drawer} onMenu={() => setDrawer(true)} />
      {children}
      {drawer ? <AccountDrawerHost onClose={() => setDrawer(false)} /> : null}
    </>
  );
}

/** The drawer photograph is 853 × 1844. Scale it the same way a reference stage does, over whatever screen is open. */
function AccountDrawerHost({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(() => referenceFit(typeof window === 'undefined' ? 393 : window.innerWidth, typeof window === 'undefined' ? 852 : window.innerHeight, 48));
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      if (!el.clientWidth || !el.clientHeight) return;
      const nav = document.querySelector<HTMLElement>(".jrn-nav[data-jrn-nav='authority'], .jrn-nav");
      let dock = 48;
      if (nav) {
        const box = nav.getBoundingClientRect();
        const bottom = Number.parseFloat(getComputedStyle(nav).bottom) || 0;
        dock = Math.ceil(box.height + bottom);
      }
      const next = referenceFit(el.clientWidth, el.clientHeight, dock);
      setFit((prev) => (prev.k === next.k && prev.top === next.top && prev.bleed === next.bleed ? prev : next));
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="jrn-ref jrn-account-drawer-host" data-jrn-account-drawer-host>
      <div className="jrn-ref__stage" style={{ '--k': fit.k, '--ref-top': `${fit.top}px` } as CSSProperties}>
        <AccountDrawer onClose={onClose} />
      </div>
    </div>
  );
}

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
      <button type="button" className="jrn-f09a__menu" aria-label="MENU" data-jrn-trigger="f09-menu" onClick={onMenu}>
        <svg viewBox="0 0 40 26" aria-hidden>
          <path d="M0 1.5h40M0 13h40M0 24.5h40" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
