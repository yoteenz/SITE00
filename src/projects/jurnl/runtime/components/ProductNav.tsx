/** Primary nav. HOME is Today. The plus mark is the shared quick add. No MORE tab. */

import { JurnlIcon } from './icons';

const ITEMS = [
  { id: 'HOME', target: 'F03', icon: 'account' as const },
  { id: 'MONEY', target: 'F05', icon: 'money' as const },
  { id: 'ADD', target: '', icon: 'plus' as const, label: 'QUICK ADD' },
  { id: 'PLAN', target: 'F08', icon: 'clock' as const },
  { id: 'CREDIT', target: 'F12', icon: 'document' as const },
];

export function JurnlProductNav({ current, onGo, onAdd }: { current: 'HOME' | 'MONEY' | 'PLAN' | 'CREDIT' | 'ACTIVITY' | null; onGo: (target: string) => void; onAdd: () => void }) {
  return (
    <nav className="jrn-nav" aria-label="PRIMARY" data-jrn-zone="bottom-nav">
      {ITEMS.map((item) => {
        const active = item.id === current;
        const label = item.id === 'ADD' ? 'QUICK ADD' : item.id;
        return (
          <button
            key={item.id}
            type="button"
            className="jrn-btn jrn-nav__btn"
            data-active={active ? 'true' : 'false'}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            data-jrn-trigger={`nav-${item.id.toLowerCase()}`}
            onClick={() => (item.id === 'ADD' ? onAdd() : onGo(item.target))}
          >
            <JurnlIcon name={item.icon} size={16} />
            <span>{item.id === 'ADD' ? '+' : item.id}</span>
          </button>
        );
      })}
    </nav>
  );
}
