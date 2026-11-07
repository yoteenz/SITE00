/**
 * The global menu's one navigation state (the hamburger, its destinations and their follow-on steps).
 *
 * A stack: the menu at the bottom, each destination over it, each follow-on step (a privacy or security tool, the
 * delete / revoke confirmation) over its destination. Only the top is drawn, so there is one dialog, one scrim and one
 * focus trap at a time. Escape, the scrim and a destination's BACK pop one step (a destination returns to the menu) and
 * focus returns to the control that opened the popped step; the menu's close pops the last step, so focus returns to
 * the hamburger. Panels are not in the URL. Leaving the app (sign out, delete account → entry) clears the stack, so
 * nothing is left open over sign-in.
 *
 * The ACCOUNT page and the approved F09 drawer open the same destinations through `useMenuPanels()` instead of carrying
 * their own copies (no duplicate sheets, no second state machine).
 */
import { createContext, useContext } from 'react';

/** Privacy and security tools, reused from onboarding (F01.11 / F01.12) after it. */
export type SettingsToolId =
  | 'privacy-your-data'
  | 'privacy-ai-access'
  | 'privacy-data-export'
  | 'privacy-remove-access'
  | 'security-biometric'
  | 'security-device'
  | 'security-sessions'
  | 'delete-account'
  | 'revoke-session';

/** The destinations a menu row (or an ACCOUNT page card) opens. */
export type MenuDestination =
  | 'connections'
  | 'currency'
  | 'buffer'
  | 'ask'
  | 'rules'
  | 'account'
  | 'preferences'
  | 'privacy'
  | 'membership'
  | 'add-ons'
  | 'help'
  | 'legal'
  | 'profile'
  | 'sign-out';

export type MenuPanel =
  | 'menu'
  | Exclude<MenuDestination, 'account'>
  | 'account-drawer'
  | { unlock: string }
  | { tool: SettingsToolId };

export type MenuPanelsApi = {
  panel: MenuPanel | null;
  /** Open a destination (from a menu row, or directly from the ACCOUNT page / drawer). */
  open: (d: MenuDestination | MenuPanel) => void;
  /** One step back (to the menu, or to the destination a tool came from); closes when nothing is under it. */
  back: () => void;
  /** How many steps are open (0 = none). */
  depth: number;
  /** Close every panel. */
  closeAll: () => void;
};

export const MenuPanelsContext = createContext<MenuPanelsApi | null>(null);

/** The menu's panel API, or null outside the corner-chrome provider (static renders, isolated tests). */
export function useMenuPanels(): MenuPanelsApi | null {
  return useContext(MenuPanelsContext);
}
