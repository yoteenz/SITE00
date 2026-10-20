import { useEffect, useMemo, useState } from 'react';
import {
  DIGITAL_FOUNDATION_REVIEW_GROUP_LABELS,
  REVIEW_GROUP_ORDER,
  allReviewRegistryEntries,
  resolveReviewEntry,
  type DfReviewGroupId,
  type DfReviewEntry,
} from './digitalFoundationReviewRegistry';
import { SITE00_ROUTES } from '../../config/routes';
import { scrollToReviewAnchor } from './reviewLinks';

function statusLabel(entry: DfReviewEntry): string {
  switch (entry.implementationStatus) {
    case 'auth_gated':
      return 'AUTH';
    case 'backend_blocked':
      return 'BLOCKED';
    case 'not_implemented':
      return 'GAP';
    case 'legacy_redirect':
      return 'DEPRECATED';
    default:
      return 'INLINE';
  }
}

function entryHref(entry: DfReviewEntry): string {
  if (entry.renderMode === 'external_route' && entry.runtimeRoute) return entry.runtimeRoute;
  return `#${entry.anchorId}`;
}

function isExternal(entry: DfReviewEntry): boolean {
  return entry.renderMode === 'external_route';
}

export default function DigitalFoundationReviewNav() {
  const all = useMemo(() => allReviewRegistryEntries(), []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<DfReviewGroupId | 'ALL'>('ALL');
  const [currentAnchor, setCurrentAnchor] = useState('');

  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.replace(/^#/, '');
      setCurrentAnchor(id);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((e) => {
      if (groupFilter !== 'ALL' && e.group !== groupFilter) return false;
      if (!q) return true;
      const hay = `${e.pageName} ${e.reviewId} ${e.componentSource} ${e.pageFamily}`.toLowerCase();
      return hay.includes(q);
    });
  }, [all, query, groupFilter]);

  const inlineNavOrder = useMemo(
    () => filtered.filter((e) => e.renderMode === 'inline_df_screen' || e.renderMode === 'legacy_redirect' || e.renderMode === 'registry_gap'),
    [filtered],
  );

  const jump = (anchorId: string) => {
    scrollToReviewAnchor(anchorId);
    setOpen(false);
  };

  const currentIndex = inlineNavOrder.findIndex((e) => e.anchorId === currentAnchor);
  const prev = currentIndex > 0 ? inlineNavOrder[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < inlineNavOrder.length - 1 ? inlineNavOrder[currentIndex + 1] : null;

  return (
    <div className={`df-review__nav-shell${open ? ' df-review__nav-shell--open' : ''}`}>
      <div className="df-review__nav-bar">
        <p className="df-review__nav-kicker">DF REVIEW · {all.length} REGISTERED</p>
        <button
          type="button"
          className="df-review__nav-toggle"
          aria-expanded={open}
          aria-controls="df-review-nav-routes"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'HIDE REGISTRY' : `SHOW REGISTRY (${all.length})`}
        </button>
      </div>
      <nav id="df-review-nav-routes" className="df-review__nav" aria-label="Digital Foundation review registry">
        <div className="df-review__nav-tools">
          <input
            className="df-review__nav-search"
            type="search"
            placeholder="Search pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search review registry"
          />
          <div className="df-review__nav-filters" role="group" aria-label="Filter by group">
            <button
              type="button"
              className={`df-review__nav-chip${groupFilter === 'ALL' ? ' df-review__nav-chip--on' : ''}`}
              onClick={() => setGroupFilter('ALL')}
            >
              ALL
            </button>
            {REVIEW_GROUP_ORDER.map((g) => (
              <button
                key={g}
                type="button"
                className={`df-review__nav-chip${groupFilter === g ? ' df-review__nav-chip--on' : ''}`}
                onClick={() => setGroupFilter(g)}
              >
                {g.split('_')[0]}
              </button>
            ))}
          </div>
          <div className="df-review__nav-step">
            <button type="button" className="df-review__nav-step-btn" disabled={!prev} onClick={() => prev && jump(prev.anchorId)}>
              PREV
            </button>
            <button type="button" className="df-review__nav-step-btn" disabled={!next} onClick={() => next && jump(next.anchorId)}>
              NEXT
            </button>
            <a className="df-review__nav-step-btn" href={SITE00_ROUTES.digitalFoundationReview}>
              REGISTRY TOP
            </a>
          </div>
        </div>
        {REVIEW_GROUP_ORDER.map((groupId) => {
          const entries = filtered.filter((e) => e.group === groupId);
          if (!entries.length) return null;
          return (
            <div className="df-review__nav-group" key={groupId}>
              <p className="df-review__nav-group-label">{DIGITAL_FOUNDATION_REVIEW_GROUP_LABELS[groupId]}</p>
              <ul className="df-review__nav-list">
                {entries.map((entry) => (
                  <li key={entry.reviewId}>
                    {isExternal(entry) ? (
                      <a
                        className="df-review__route-name df-review__route-name--external"
                        href={entryHref(entry)}
                        target="_blank"
                        rel="noreferrer"
                        title={entry.componentSource}
                      >
                        {entry.pageName} · {statusLabel(entry)}
                      </a>
                    ) : (
                      <a
                        className={`df-review__route-name${
                          entry.renderMode === 'legacy_redirect' ? ' df-review__route-name--deprecated' : ''
                        }${entry.implementationStatus === 'not_implemented' ? ' df-review__route-name--gap' : ''}${
                          currentAnchor === entry.anchorId ? ' df-review__route-name--current' : ''
                        }`}
                        href={entryHref(entry)}
                        title={entry.componentSource}
                        onClick={(ev) => {
                          if (entry.renderMode === 'registry_gap' || entry.renderMode === 'inline_df_screen' || entry.renderMode === 'legacy_redirect') {
                            ev.preventDefault();
                            jump(entry.anchorId);
                          }
                        }}
                      >
                        {entry.pageName} · {statusLabel(entry)}
                      </a>
                    )}
                    <span className="df-review__nav-source">{entry.componentSource.split('/').slice(-1)[0]}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {currentAnchor && resolveReviewEntry(currentAnchor)?.implementationStatus === 'not_implemented' && (
          <p className="df-review__nav-hint">Selected entry is inventory-only — not a rendered client surface yet.</p>
        )}
      </nav>
    </div>
  );
}
