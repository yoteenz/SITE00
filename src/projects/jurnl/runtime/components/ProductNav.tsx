/**
 * Primary nav. HOME is Today. The plus mark is the shared quick add. No MORE tab.
 * The dock renders into the runtime's viewport-level nav host, so its geometry never depends on the screen, the
 * column, the content width or the screen-enter animation. Five equal cells: the plus is the geometric center.
 * Without a host (server render, or the first commit before the host attaches) it renders in place.
 */

import { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { AUTHORITY_MARK } from './authorityNavMarks';
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

/** F09 parent authority marks, traced from the approved glyphs. Other screens keep the icon pack. */
function AuthorityGlyph({ name }: { name: 'house' | 'card' | 'leaf' | 'chart' | 'plus' }) {
  const key = name === 'chart' ? 'bars' : name;
  const mark = AUTHORITY_MARK[key];
  if (key === 'plus') {
    const plus = AUTHORITY_MARK.plus;
    return (
      <svg viewBox={`0 0 ${plus.w} ${plus.h}`} width={plus.dw} height={plus.dh} aria-hidden>
        <path fill="#5b5e4b" fillRule="evenodd" d={plus.d} />
        <path fill="#f6f3ee" d={plus.plus} />
      </svg>
    );
  }
  return (
    <svg viewBox={`0 0 ${mark.w} ${mark.h}`} width={mark.dw} height={mark.dh} aria-hidden>
      <path fill="currentColor" fillRule="evenodd" d={mark.d} />
    </svg>
  );
}

const AUTHORITY_GLYPH = { HOME: 'house', MONEY: 'card', ADD: 'plus', PLAN: 'leaf', CREDIT: 'chart' } as const;

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
            {marks === 'authority' || marks === 'parent' ? (
              item.id === 'ADD'
                ? marks === 'parent'
                  ? <span className="jrn-nav__plus"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M12 3.5v17M3.5 12h17" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" /></svg></span>
                  : <span className="jrn-nav__plus"><AuthorityGlyph name="plus" /></span>
                : <span className="jrn-nav__glyph"><AuthorityGlyph name={AUTHORITY_GLYPH[item.id as 'HOME' | 'MONEY' | 'PLAN' | 'CREDIT']} /></span>
            ) : (
              <JurnlIcon name={item.icon} size={item.id === 'ADD' ? 18 : 16} />
            )}
            {item.id === 'ADD' && marks !== 'authority' && marks !== 'parent' ? null : <span>{item.id === 'ADD' ? 'ADD' : item.id}</span>}
          </button>
        );
      })}
    </nav>
  );
  return host ? createPortal(nav, host) : nav;
}
