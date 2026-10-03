/** Canonical Production bottom navigation — Production owns its own nav (no global SITE 00 mobile bar). */
import { Link } from 'react-router-dom';
import { hubDeepLink } from '../../../../shared/site00-production-hub/model.js';
import { BottomNavPackIcon } from './bottomNavPack';

export type ProductionNavId = 'hub' | 'inbox' | 'design' | 'experience' | 'expression' | 'library' | 'activity';

export function productionNavHref(id: ProductionNavId, projectId: string): string {
  switch (id) {
    case 'hub':
      return '/production';
    case 'inbox':
      return hubDeepLink({ projectId, target: 'queue' });
    case 'design':
      return hubDeepLink({ projectId, target: 'design' }).split('?')[0]!;
    case 'experience':
      return hubDeepLink({ projectId, target: 'experience' }).split('?')[0]!;
    case 'expression':
      return `/production/${projectId}/expression`;
    case 'library':
      return hubDeepLink({ projectId, target: 'libraries' });
    case 'activity':
      return '/production/activity';
  }
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
}: {
  active: ProductionNavId | null;
  projectId: string;
  inboxCount: number;
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
              <BottomNavPackIcon id={it.id} />
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
}: {
  active: ProductionNavId | null;
  projectId: string;
  inboxCount: number;
  onActivity?: () => void;
}) {
  return (
    <nav className="ph-nav" aria-label="Production navigation" data-testid="hub-bottom-nav">
      {ITEMS.map((it) => {
        const isActive = it.id === active;
        const body = (
          <>
            <span className="ph-nav__icon">
              <BottomNavPackIcon id={it.id} />
              {it.id === 'inbox' && inboxCount > 0 ? <sup>{String(inboxCount).padStart(2, '0')}</sup> : null}
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
