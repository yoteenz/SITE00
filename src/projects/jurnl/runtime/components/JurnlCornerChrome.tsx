/**
 * The Safe to Spend parent corner controls, pinned to the viewport on every app screen, and the global menu's host.
 * Back opens today. The hamburger opens the GLOBAL MENU (the OV08 sectioned menu, secondary navigation — never the five
 * dock destinations). Its destinations and their follow-on steps are one stack (menuPanels.ts): only the top is drawn,
 * every destination returns to the menu, Escape / the scrim / BACK pop one step and focus returns to the control that
 * opened it. The ACCOUNT page and the approved F09 drawer open the same destinations through the same stack.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AccountDrawer } from '../screens/AccountScreens';
import { CurrencySheet } from '../screens/SettingsScreens';
import { DeleteAccountModal, PrivacyDrawer, RevokeSessionModal, SecurityDrawer, type ToolNav } from '../screens/SecurityScreens';
import { AskJurnlSheet } from '../global/GlobalSheets';
import { AddOnCollection, GlobalMenu, MembershipFolio, UnlockFolio } from '../global/GlobalMenu';
import { BufferFolio, ConnectionsFolio, HelpFolio, LegalFolio, PreferencesFolio, PrivacyConsentsFolio, ProfileFolio, RulesFolio, SignOutConfirm } from '../global/MenuDestinations';
import { MenuPanelsContext, type MenuDestination, type MenuPanel, type MenuPanelsApi } from '../global/menuPanels';
import { useJurnl } from '../state/store';
import { JurnlUtilityArtButton, useMenuArt } from './JurnlUtilityArtButton';

type Entry = { panel: MenuPanel; opener: string | null };
const HAMBURGER = '[data-jrn-trigger="f09-menu"]';
const normalize = (d: MenuDestination | MenuPanel): MenuPanel => (d === 'account' ? 'account-drawer' : d);
const activeTrigger = () => (typeof document === 'undefined' ? null : (document.activeElement?.closest('[data-jrn-trigger]')?.getAttribute('data-jrn-trigger') ?? null));
const outsideApp = (rel: string) => rel === '' || rel.startsWith('entry') || rel.startsWith('setup');

export function JurnlCornerChromeProvider({ children }: { children: ReactNode }) {
  const { go, basePath } = useJurnl();
  const { pathname } = useLocation();
  const [stack, setStack] = useState<Entry[]>([]);
  /** pending focus return: the trigger to focus once the stack has rendered (null = the hamburger / nothing) */
  const focusAfter = useRef<{ want: string | null } | null>(null);
  const top = stack.length ? stack[stack.length - 1]!.panel : null;

  const open = useCallback((d: MenuDestination | MenuPanel) => {
    const panel = normalize(d);
    const opener = activeTrigger();
    setStack((s) => (panel === 'menu' ? [{ panel, opener }] : [...s, { panel, opener }]));
  }, []);
  const back = useCallback(() => {
    setStack((s) => {
      if (!s.length) return s;
      focusAfter.current = { want: s[s.length - 1]!.opener };
      return s.slice(0, -1);
    });
  }, []);
  const closeAll = useCallback(() => {
    setStack((s) => {
      focusAfter.current = { want: s[0]?.opener ?? null };
      return [];
    });
  }, []);
  const toggleMenu = useCallback(() => (top === 'menu' && stack.length === 1 ? closeAll() : open('menu')), [top, stack.length, closeAll, open]);
  /** Leave the menu for a route: close every step first, so nothing stays open over the next screen. */
  const leaveTo = useCallback(
    (route: string) => {
      focusAfter.current = null;
      setStack([]);
      go(route);
    },
    [go],
  );

  // Signing out (or deleting the account) lands on entry: clear every step, nothing is left over sign-in.
  const rel = appRoute(pathname, basePath);
  useEffect(() => {
    if (outsideApp(rel) && stack.length) {
      focusAfter.current = null;
      setStack([]);
    }
  }, [rel, stack.length]);

  // Focus return: after a step closes, the control that opened it (in the step now on top, or on the page), else the
  // hamburger (the corner chrome steps aside while a destination is open, so the element the trap remembered is gone).
  useEffect(() => {
    const pending = focusAfter.current;
    if (!pending) return;
    focusAfter.current = null;
    const want = pending.want;
    const id = window.requestAnimationFrame(() => {
      const el = (want && document.querySelector<HTMLElement>(`[data-jrn-trigger="${want}"]`)) || (stack.length === 0 ? document.querySelector<HTMLElement>(HAMBURGER) : null);
      el?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(id);
  }, [stack]);

  const api = useMemo<MenuPanelsApi>(() => ({ panel: top, open, back, closeAll, depth: stack.length }), [top, open, back, closeAll, stack.length]);
  const toolNav: ToolNav = useMemo(() => ({ close: back, open: (id) => open({ tool: id }) }), [back, open]);

  return (
    <MenuPanelsContext.Provider value={api}>
      <JurnlCornerChrome hidden={top !== null && top !== 'menu'} menuExpanded={top === 'menu'} onMenu={toggleMenu} />
      {children}
      {top ? renderPanel(top, { open, back, closeAll, leaveTo, toolNav }) : null}
    </MenuPanelsContext.Provider>
  );
}

function renderPanel(
  p: MenuPanel,
  { open, back, closeAll, leaveTo, toolNav }: { open: MenuPanelsApi['open']; back: () => void; closeAll: () => void; leaveTo: (route: string) => void; toolNav: ToolNav },
): ReactNode {
  const nav = { onBack: back, onOpen: open };
  if (typeof p === 'object') {
    if ('unlock' in p) return <UnlockFolio addOnId={p.unlock} onClose={back} />;
    const id = p.tool;
    if (id === 'delete-account') return <DeleteAccountModal nav={toolNav} />;
    if (id === 'revoke-session') return <RevokeSessionModal nav={toolNav} />;
    if (id.startsWith('privacy-')) return <PrivacyDrawer id={id.slice('privacy-'.length)} nav={toolNav} />;
    return <SecurityDrawer id={id.slice('security-'.length)} nav={toolNav} />;
  }
  switch (p) {
    case 'menu':
      return <GlobalMenu onClose={back} onOpen={open} />;
    case 'connections':
      return <ConnectionsFolio onBack={back} onManual={() => leaveTo('money/places')} />;
    case 'currency':
      return <CurrencySheet onClose={back} />;
    case 'buffer':
      return <BufferFolio onBack={back} onCurrency={() => open('currency')} />;
    case 'ask':
      return <AskJurnlSheet familyId="GS" nodeId="GS.MENU" onClose={back} onOpenPrivacy={() => open('privacy')} />;
    case 'rules':
      return <RulesFolio {...nav} />;
    case 'account-drawer':
      return <AccountDrawer onClose={back} />;
    case 'preferences':
      return <PreferencesFolio {...nav} />;
    case 'privacy':
      return <PrivacyConsentsFolio {...nav} />;
    case 'membership':
      return <MembershipFolio onClose={back} onOpen={open} />;
    case 'add-ons':
      return <AddOnCollection onClose={back} onOpen={open} />;
    case 'help':
      return <HelpFolio {...nav} />;
    case 'legal':
      return <LegalFolio {...nav} />;
    case 'profile':
      return <ProfileFolio onBack={back} />;
    case 'sign-out':
      return <SignOutConfirm onCancel={back} onSignedOut={closeAll} />;
    default:
      return null;
  }
}

const ROOT_HUBS = new Set(['today', 'money', 'plan', 'credit']);

/** The route inside the runtime, relative to its base path (`/production/jurnl/runtime` or the real app `/jurnl/app`). */
function appRoute(pathname: string, basePath: string): string {
  if (basePath && pathname.startsWith(basePath)) return pathname.slice(basePath.length).replace(/^\/+/, '');
  const mark = '/runtime/';
  const i = pathname.indexOf(mark);
  return i === -1 ? '' : pathname.slice(i + mark.length);
}

/**
 * While the global menu is open, the MONEY hamburger (founder MENU artwork) steps aside when it would sit on the menu's own
 * CLOSE artwork (tablet widths place the two in the same corner): one control per spot, and both do the same thing. On
 * phones the two do not meet and the hamburger stays as the menu's toggle.
 */
function useYieldToMenuClose(active: boolean): boolean {
  const [overlap, setOverlap] = useState(false);
  useEffect(() => {
    if (!active) {
      setOverlap(false);
      return;
    }
    let raf = 0;
    const check = () => {
      const a = document.querySelector('.jrn-corner [data-jrn-trigger="f09-menu"]')?.getBoundingClientRect();
      const b = document.querySelector('[data-jrn-overlay="global-menu"] [data-jrn-trigger="global-menu-close"]')?.getBoundingClientRect();
      setOverlap(!!a && !!b && a.width > 0 && b.width > 0 && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom);
    };
    raf = requestAnimationFrame(check);
    window.addEventListener('resize', check);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', check);
    };
  }, [active]);
  // synchronous on close: the hamburger is visible again in the same render the menu closes in, so focus can return to it
  return active && overlap;
}

function JurnlCornerChrome({ hidden, menuExpanded, onMenu }: { hidden: boolean; menuExpanded?: boolean; onMenu: () => void }) {
  const { go, basePath } = useJurnl();
  const { pathname } = useLocation();
  const menuArt = useMenuArt();
  const yieldToClose = useYieldToMenuClose(menuArt && !!menuExpanded);
  const rel = appRoute(pathname, basePath);
  if (outsideApp(rel) || hidden) return null;
  // The four root hubs are siblings in the dock, so they keep the menu (account drawer) but no back chip:
  // their founder references draw the JURNL lockup in that corner.
  const rootHub = ROOT_HUBS.has(rel);
  return (
    <div className="jrn-corner" data-jrn-corner="app" data-menu-open={menuExpanded ? 'true' : undefined}>
      {/* MONEY parent: the founder-supplied MENU artwork (F05.UTILITY.MENU.GOLD), same name, trigger, state and handler */}
      {menuArt ? (
        <JurnlUtilityArtButton kind="menu" className="jrn-f09a__menu" trigger="f09-menu" label="MENU" aria-expanded={menuExpanded ? true : undefined} data-yield={yieldToClose ? 'true' : undefined} onClick={onMenu} />
      ) : (
        <button type="button" className="jrn-f09a__menu" aria-label="MENU" data-jrn-trigger="f09-menu" aria-expanded={menuExpanded ? true : undefined} onClick={onMenu}>
          <svg viewBox="0 0 40 26" aria-hidden>
            <path d="M0 1.5h40M0 13h40M0 24.5h40" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {/* while the menu is open the hamburger stays above it as its toggle; BACK steps aside (one action at a time) */}
      {rootHub || menuExpanded ? null : (
        <button type="button" className="jrn-f09a__back" aria-label="BACK TO TODAY" data-jrn-trigger="f09-back" onClick={() => go('today')}>
          <svg viewBox="0 0 16 28" aria-hidden>
            <path d="M14 2 2 14l12 12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
