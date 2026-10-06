/** Canonical Production bottom navigation — Production owns its own nav (no global SITE 00 mobile bar). */
import { Link } from 'react-router-dom';
import { scopedTabHref, type WorkspaceDomain } from '../../../../shared/site00-production-graph/index.js';
import { ProductionNavIcon } from './productionNavIcon';

export type ProductionNavId = 'hub' | 'inbox' | 'design' | 'experience' | 'expression' | 'library' | 'activity';

const NAV_TAB: Record<ProductionNavId, WorkspaceDomain> = {
  hub: 'HUB',
  inbox: 'INBOX',
  design: 'DESIGN',
  experience: 'EXPERIENCE',
  expression: 'EXPRESSION',
  library: 'LIBRARY',
  activity: 'ACTIVITY',
};

/** Every tab link carries the active project (P0 project isolation). No project → the picker at /production. */
export function productionNavHref(id: ProductionNavId, projectId: string | null): string {
  return projectId ? scopedTabHref(NAV_TAB[id], projectId) : '/production';
}

const ITEMS: { id: ProductionNavId; label: string }[] = [
  { id: 'hub', label: 'HUB' },
  { id: 'inbox', label: 'INBOX' },
  { id: 'design', label: 'DESIGN' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'expression', label: 'EXPRESSION' },
  { id: 'library', label: 'LIBRARY' },
  { id: 'activity', label: 'ACTIVITY' },
];

/**
 * Tablet + desktop host nav: one full-width panel, each item is a horizontal [ICON] LABEL pair.
 * Explicit px type only — no zoom, no transform scale, no viewport/container units.
 */
export function ProductionHostNav({
  active,
  projectId,
  inboxCount,
  recentActivity = false,
}: {
  active: ProductionNavId | null;
  projectId: string | null;
  inboxCount: number;
  /** Real recent events for the project (never an always-on dot). */
  recentActivity?: boolean;
}) {
  return (
    <nav className="pxh-nav" aria-label="Production navigation" data-testid="hub-bottom-nav" data-nav-layout="horizontal" data-inbox-count={inboxCount}>
      {ITEMS.map((it) => {
        const isActive = it.id === active;
        return (
          <Link
            key={it.id}
            to={productionNavHref(it.id, projectId)}
            className={`pxh-nav__item${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            data-testid={`nav-${it.id}`}
          >
            <span className="pxh-nav__icon">
              <ProductionNavIcon variant={it.id} active={isActive} />
              {it.id === 'inbox' && inboxCount > 0 ? <i className="pxh-nav__dot" data-nav-notify="inbox" aria-hidden /> : null}
              {it.id === 'activity' && recentActivity ? <i className="pxh-nav__dot" data-nav-notify="activity" aria-hidden /> : null}
            </span>
            <span className="pxh-nav__label">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ProductionBottomNav({
  active,
  projectId,
  inboxCount,
  onActivity,
  recentActivity = false,
}: {
  active: ProductionNavId | null;
  projectId: string | null;
  inboxCount: number;
  onActivity?: () => void;
  recentActivity?: boolean;
}) {
  return (
    <nav className="ph-nav" aria-label="Production navigation" data-testid="hub-bottom-nav">
      {ITEMS.map((it) => {
        const isActive = it.id === active;
        const body = (
          <>
            <span className="ph-nav__icon">
              <ProductionNavIcon variant={it.id} active={isActive} />
              {it.id === 'inbox' && inboxCount > 0 ? <sup data-nav-notify="inbox">{String(inboxCount).padStart(2, '0')}</sup> : null}
              {it.id === 'activity' && recentActivity ? <i className="ph-nav__notify" data-nav-notify="activity" aria-hidden /> : null}
            </span>
            <span>{it.label}</span>
          </>
        );
        if (it.id === 'activity' && onActivity)
          return (
            <button key={it.id} type="button" className={`ph-nav__item${isActive ? ' is-active' : ''}`} onClick={onActivity} data-testid="nav-activity">
              {body}
            </button>
          );
        return (
          <Link key={it.id} to={productionNavHref(it.id, projectId)} className={`ph-nav__item${isActive ? ' is-active' : ''}`} aria-current={isActive ? 'page' : undefined} data-testid={`nav-${it.id}`}>
            {body}
          </Link>
        );
      })}
    </nav>
  );
}
