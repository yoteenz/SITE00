import { useEffect, useRef, useState } from 'react';
import { AdminSearchModal } from '../operations/AdminSearchModal';

type Site00AdminHeaderProps = {
  alertCount?: number;
};

export function Site00AdminHeader({ alertCount = 0 }: Site00AdminHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className="site00-control-header site00-admin-header">
        <div className="site00-control-header__search-wrap site00-admin-header__search-wrap">
          <input
            ref={searchRef}
            className="site00-control-header__search site00-admin-header__search"
            type="search"
            placeholder="SEARCH PROJECTS, CLIENTS, REVIEWS…"
            aria-label="COMMAND PALETTE SEARCH"
            readOnly
            onFocus={() => setSearchOpen(true)}
            onClick={() => setSearchOpen(true)}
          />
          <kbd className="site00-control-header__kbd site00-admin-header__kbd">⌘K</kbd>
        </div>
        <div className="site00-control-header__actions">
          <button type="button" className="site00-control-header__alert" aria-label={`${alertCount} alerts`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <path d="M4 6a4 4 0 0 1 8 0v3l1 2H3l1-2V6" />
              <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
            </svg>
            {alertCount > 0 ? <span className="site00-control-header__alert-badge">{alertCount}</span> : null}
          </button>
          <div className="site00-control-header__operator site00-admin-health" aria-label="OPERATOR STATUS">
            <span className="site00-admin-health__dot" aria-hidden="true" />
            <span>ONLINE</span>
          </div>
        </div>
      </header>
      <AdminSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <footer className="site00-control-palette-hint">
        <button type="button" className="site00-control-palette-hint__btn" onClick={() => setSearchOpen(true)}>
          COMMAND PALETTE <kbd>⌘K</kbd>
        </button>
      </footer>
    </>
  );
}
