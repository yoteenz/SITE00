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
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'house') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <path fill="currentColor" fillRule="evenodd" d="M12 3.1 20.8 11v10.2H3.2V11L12 3.1zm-1.55 18.1v-5.1c0-1.05.75-1.85 1.55-1.85s1.55.8 1.55 1.85v5.1h-3.1z" />
      </svg>
    );
  }
  if (name === 'card') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <rect x="2.8" y="6.4" width="18.4" height="11.6" rx="2.4" {...stroke} />
        <path {...stroke} d="M2.8 11.6h5.2" />
      </svg>
    );
  }
  if (name === 'leaf') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <path {...stroke} d="M6.2 18.6c1.4-5.2 5-9.4 11.6-11.6.2 5.4-2.6 10.6-8.2 12.4-1.3.4-2.6-.1-3.4-.8z" />
        <path {...stroke} strokeWidth={1.5} d="M9.2 16.4c1.8-1.7 3.6-3.1 5.6-4" />
      </svg>
    );
  }
  if (name === 'chart') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <path {...stroke} strokeWidth={2.15} d="M4.2 19V15.2M8.7 19V11.4M13.2 19V7.6M17.8 19V4.2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path stroke="#f4f1ea" strokeWidth={1.8} strokeLinecap="round" d="M12 5.2v13.6M5.2 12h13.6" />
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
                : <AuthorityGlyph name={AUTHORITY_GLYPH[item.id as 'HOME' | 'MONEY' | 'PLAN' | 'CREDIT']} />
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
