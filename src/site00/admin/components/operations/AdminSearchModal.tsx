import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { site00ProductionApi } from '../../services/productionApi';
import type { AdminSearchResultItem } from '../../types/operations';

type AdminSearchModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminSearchModal({ open, onClose }: AdminSearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setError(null);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      setLoading(true);
      setError(null);
      site00ProductionApi
        .search(query.trim())
        .then((data) => setResults(data.results ?? []))
        .catch((e) => setError(e instanceof Error ? e.message : 'SEARCH FAILED'))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [open, query]);

  if (!open) return null;

  const selectResult = (item: AdminSearchResultItem) => {
    onClose();
    navigate(item.href);
  };

  return (
    <div className="site00-admin-search-modal" role="dialog" aria-modal="true" aria-label="Global admin search">
      <button type="button" className="site00-admin-search-modal__backdrop" aria-label="Close search" onClick={onClose} />
      <div className="site00-admin-search-modal__panel">
        <div className="site00-admin-search-modal__head">
          <input
            ref={inputRef}
            type="search"
            className="site00-admin-search-modal__input"
            placeholder="SEARCH IDENTITIES, PROJECTS, LEADS, SITES…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search query"
          />
          <kbd className="site00-admin-search-modal__hint">ESC</kbd>
        </div>
        <div className="site00-admin-search-modal__body">
          {loading ? <p className="site00-admin-empty">SEARCHING…</p> : null}
          {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}
          {!loading && !error && query.trim().length < 2 ? (
            <p className="site00-admin-empty">TYPE AT LEAST 2 CHARACTERS.</p>
          ) : null}
          {!loading && !error && query.trim().length >= 2 && results.length === 0 ? (
            <p className="site00-admin-empty">NO RESULTS FOR “{query.toUpperCase()}”.</p>
          ) : null}
          {results.length > 0 ? (
            <ul className="site00-admin-search-modal__results">
              {results.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <button type="button" className="site00-admin-search-modal__result" onClick={() => selectResult(item)}>
                    <span className="site00-admin-search-modal__result-type">{item.type}</span>
                    <span className="site00-admin-search-modal__result-label">{item.label}</span>
                    {item.subtitle ? (
                      <span className="site00-admin-search-modal__result-sub">{item.subtitle}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
