/** Canonical Production bottom navigation — Production owns its own nav (no global SITE 00 mobile bar). */
import { Link } from 'react-router-dom';
import { hubDeepLink } from '../../../../shared/site00-production-hub/model.js';
import { ProductionNavIcon } from './productionNavIcon';

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
              <ProductionNavIcon variant={it.id} active={isActive} />
              {it.id === 'inbox' && inboxCount > 0 ? <i className="pxh-nav__dot" data-nav-notify="inbox" aria-hidden /> : null}
              {it.id === 'activity' ? <i className="pxh-nav__dot" data-nav-notify="activity" aria-hidden /> : null}
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
  showLabels = true,
}: {
  active: ProductionNavId | null;
  projectId: string;
  inboxCount: number;
  onActivity?: () => void;
  /** When false, words render in ProductionNavLabelRow outside the zoomed strip. */
  showLabels?: boolean;
}) {
  return (
    <nav className={`ph-nav${showLabels ? '' : ' ph-nav--icons'}`} aria-label="Production navigation" data-testid={showLabels ? 'hub-bottom-nav' : undefined}>
      {ITEMS.map((it) => {
        const isActive = it.id === active;
        const body = (
          <>
            <span className="ph-nav__icon">
              <ProductionNavIcon variant={it.id} active={isActive} />
              {it.id === 'inbox' && inboxCount > 0 ? <sup data-nav-notify="inbox">{String(inboxCount).padStart(2, '0')}</sup> : null}
              {it.id === 'activity' ? <i className="ph-nav__notify" data-nav-notify="activity" aria-hidden /> : null}
            </span>
            {showLabels ? <span className="ph-nav__label">{it.label}</span> : null}
          </>
        );
        const className = `ph-nav__item${isActive ? ' is-active' : ''}`;
        if (it.id === 'activity' && onActivity)
          return (
            <button key={it.id} type="button" className={className} onClick={onActivity} aria-label={showLabels ? undefined : it.label} data-testid={showLabels ? 'nav-activity' : undefined}>
              {body}
            </button>
          );
        return (
          <Link
            key={it.id}
            to={productionNavHref(it.id, projectId)}
            className={className}
            aria-current={isActive ? 'page' : undefined}
            aria-label={showLabels ? undefined : it.label}
            data-testid={showLabels ? `nav-${it.id}` : undefined}
          >
            {body}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Mobile words for the host bottom bar. This row is a sibling of `.ph--hub`, never a child,
 * so the strip zoom cannot scale the type. 12px here is 12 screen pixels.
 */
export function ProductionNavLabelRow({
  active,
  projectId,
  inboxCount = 0,
}: {
  active: ProductionNavId | null;
  projectId: string;
  inboxCount?: number;
}) {
  return (
    <div className="prod-nav-labels" data-testid="hub-bottom-nav" data-nav-labels="unscaled" aria-hidden="true">
      {ITEMS.map((it) => {
        const isActive = it.id === active;
        const count = it.id === 'inbox' && inboxCount > 0 ? inboxCount : 0;
        return (
          <Link
            key={it.id}
            to={productionNavHref(it.id, projectId)}
            className={`prod-nav-labels__item${isActive ? ' is-active' : ''}`}
            tabIndex={-1}
            aria-label={count > 0 ? `${it.label} ${String(count).padStart(2, '0')}` : it.label}
            data-testid={`nav-${it.id}`}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
