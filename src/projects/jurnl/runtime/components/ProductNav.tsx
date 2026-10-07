/**
 * Primary nav. HOME is Today. The plus mark is the shared quick add. No MORE tab.
 * The dock renders into the runtime's viewport-level nav host, so its geometry never depends on the screen, the
 * column, the content width or the screen-enter animation. Five equal cells: the plus is the geometric center.
 * Without a host (server render, or the first commit before the host attaches) it renders in place.
 *
 * Marks are the HQ sheet: house, wallet, plus-in-square, leaf, ascending bars.
 * The traced authority paths stay on the reference dock only.
 */

import { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { HqNavIcon } from './hqNavIcons';

/** Viewport-level dock host. `undefined` = no runtime root (render in place). */
export const JurnlNavHostContext = createContext<HTMLElement | null | undefined>(undefined);

const ITEMS = [
  { id: 'HOME', target: 'F03', icon: 'home' as const },
  { id: 'MONEY', target: 'F05', icon: 'money' as const },
  { id: 'ADD', target: '', icon: 'add' as const, label: 'QUICK ADD' },
  { id: 'PLAN', target: 'F08', icon: 'plan' as const },
  { id: 'CREDIT', target: 'F12', icon: 'credit' as const },
];

export function JurnlProductNav({ current, onGo, onAdd, marks }: { current: 'HOME' | 'MONEY' | 'PLAN' | 'CREDIT' | 'ACTIVITY' | null; onGo: (target: string) => void; onAdd: () => void; marks?: 'authority' | 'parent' }) {
  const host = useContext(JurnlNavHostContext);
  const nav = (
    <nav className="jrn-nav" aria-label="PRIMARY" data-jrn-zone="bottom-nav" data-runtime-stage="NAV FOOTPRINT" data-jrn-nav={marks === 'parent' ? 'parent' : marks}>
      {ITEMS.map((item) => {
        const active = item.id === current;
        const label = item.id === 'ADD' ? 'QUICK ADD' : item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`jrn-btn jrn-nav__btn${item.id === 'ADD' ? ' jrn-nav__btn--mark' : ''}`}
            data-active={active ? 'true' : 'false'}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            data-jrn-trigger={`nav-${item.id.toLowerCase()}`}
            onClick={() => (item.id === 'ADD' ? onAdd() : onGo(item.target))}
          >
            {item.id === 'ADD' ? (
              <span className="jrn-nav__plus"><HqNavIcon name="add" /></span>
            ) : (
              <span className="jrn-nav__glyph"><HqNavIcon name={item.icon} /></span>
            )}
            <span>{item.id === 'ADD' ? 'ADD' : item.id}</span>
          </button>
        );
      })}
    </nav>
  );
  return host ? createPortal(nav, host) : nav;
}
