/**
 * Primary nav. HOME is Today. The plus mark is the shared quick add. No MORE tab.
 * The dock renders into the runtime's viewport-level nav host, so its geometry never depends on the screen, the
 * column, the content width or the screen-enter animation. Five equal cells: the plus is the geometric center.
 * Without a host (server render, or the first commit before the host attaches) it renders in place.
 */

import { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { JurnlIcon } from './icons';

/** Viewport-level dock host. `undefined` = no runtime root (render in place). */
export const JurnlNavHostContext = createContext<HTMLElement | null | undefined>(undefined);

const ITEMS = [
  { id: 'HOME', target: 'F03', icon: 'account' as const },
  { id: 'MONEY', target: 'F05', icon: 'money' as const },
  { id: 'ADD', target: '', icon: 'plus' as const, label: 'QUICK ADD' },
  { id: 'PLAN', target: 'F08', icon: 'clock' as const },
  { id: 'CREDIT', target: 'F12', icon: 'document' as const },
];

/** F09 parent authority marks: house, card, plus, leaf, bars. Other screens keep the icon pack. */
function AuthorityGlyph({ name }: { name: 'house' | 'card' | 'leaf' | 'chart' | 'plus' }) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'house') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <path {...stroke} d="M3.2 11.2 12 4l8.8 7.2" />
        <path {...stroke} d="M6 10.4V19.2h12V10.4" />
        <path {...stroke} d="M10 19.2v-5h4v5" />
      </svg>
    );
  }
  if (name === 'card') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <rect x="3.2" y="6" width="17.6" height="12" rx="2" {...stroke} />
        <path {...stroke} d="M3.2 10.2h17.6" />
      </svg>
    );
  }
  if (name === 'leaf') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <path {...stroke} d="M12 4.2c3 2.4 4.6 5.4 4.6 8.6 0 2.6-1.8 4.6-4.6 5.6-2.8-1-4.6-3-4.6-5.6C7.4 9.6 9 6.6 12 4.2z" />
        <path {...stroke} d="M12 18.2V7.2" />
      </svg>
    );
  }
  if (name === 'chart') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <path {...stroke} d="M5 19.5V12M12 19.5V7.5M19 19.5V4.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path {...stroke} strokeWidth={1.8} d="M12 5v14M5 12h14" />
    </svg>
  );
}

const AUTHORITY_GLYPH = { HOME: 'house', MONEY: 'card', ADD: 'plus', PLAN: 'leaf', CREDIT: 'chart' } as const;

export function JurnlProductNav({ current, onGo, onAdd, marks }: { current: 'HOME' | 'MONEY' | 'PLAN' | 'CREDIT' | 'ACTIVITY' | null; onGo: (target: string) => void; onAdd: () => void; marks?: 'authority' }) {
  const host = useContext(JurnlNavHostContext);
  const nav = (
    <nav className="jrn-nav" aria-label="PRIMARY" data-jrn-zone="bottom-nav" data-runtime-stage="NAV FOOTPRINT" data-jrn-nav={marks}>
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
            {marks === 'authority' ? (
              item.id === 'ADD'
                ? <span className="jrn-nav__plus"><AuthorityGlyph name="plus" /></span>
                : <AuthorityGlyph name={AUTHORITY_GLYPH[item.id]} />
            ) : (
              <JurnlIcon name={item.icon} size={item.id === 'ADD' ? 18 : 16} />
            )}
            {item.id === 'ADD' && marks !== 'authority' ? null : <span>{item.id === 'ADD' ? 'ADD' : item.id}</span>}
          </button>
        );
      })}
    </nav>
  );
  return host ? createPortal(nav, host) : nav;
}
