import { useEffect, useRef, useState } from 'react';
import { AdminSearchModal } from '../operations/AdminSearchModal';

export function Site00AdminHeader() {
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
      <header className="site00-admin-header">
        <div className="site00-admin-header__search-wrap">
          <input
            ref={searchRef}
            className="site00-admin-header__search"
            type="search"
            placeholder="SEARCH PROJECTS, CLIENTS, LEADS…"
            aria-label="Global search"
            readOnly
            onFocus={() => setSearchOpen(true)}
            onClick={() => setSearchOpen(true)}
          />
          <kbd className="site00-admin-header__kbd">⌘K</kbd>
        </div>
        <div className="site00-admin-health" aria-label="Admin user">
          <span className="site00-admin-health__dot" aria-hidden="true" />
          <span>ADMIN</span>
        </div>
      </header>
      <AdminSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
