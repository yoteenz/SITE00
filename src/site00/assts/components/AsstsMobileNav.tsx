import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { fetchAsstsLibrary } from '../services/asstsApi';

function useAsstsNotificationCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetchAsstsLibrary()
      .then((res) => {
        if (cancelled) return;
        setCount(res.summary?.needsReview ?? 0);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return count;
}

/** Asset Vault mobile navigation — Library / Batches / Search / Notifications / Profile */
export function AsstsVaultNav() {
  const location = useLocation();
  const path = location.pathname;
  const notificationCount = useAsstsNotificationCount();

  const onLibrary = path === '/assts' || path === '/assts/';
  const onBatches = path === '/assts/batches' || path.startsWith('/assts/batches/');
  const onSearch = path === '/assts/search';
  const onNotifications = path === '/assts/notifications';
  const onProfile = path === '/assts/profile';

  return (
    <div className="assts-vault-nav-wrap" data-anchor="library.bottomNav">
      <nav className="assts-vault-nav" aria-label="Asset Vault navigation">
        <NavLink to="/assts" end className={`assts-vault-nav__item ${onLibrary ? 'active' : ''}`}>
          <span className="assts-vault-nav__glyph assts-vault-nav__glyph--library" aria-hidden="true" />
          <span>LIBRARY</span>
        </NavLink>
        <NavLink to="/assts/batches" className={`assts-vault-nav__item ${onBatches ? 'active' : ''}`}>
          <span className="assts-vault-nav__glyph assts-vault-nav__glyph--batches" aria-hidden="true" />
          <span>BATCHES</span>
        </NavLink>
        <NavLink to="/assts/search" className={`assts-vault-nav__item ${onSearch ? 'active' : ''}`}>
          <span className="assts-vault-nav__glyph assts-vault-nav__glyph--search" aria-hidden="true" />
          <span>SEARCH</span>
        </NavLink>
        <NavLink to="/assts/notifications" className={`assts-vault-nav__item ${onNotifications ? 'active' : ''}`}>
          <span className="assts-vault-nav__glyph assts-vault-nav__glyph--notifications" aria-hidden="true" />
          <span>NOTIFICATIONS</span>
          {notificationCount > 0 ? (
            <span className="assts-vault-nav__badge" aria-label={`${notificationCount} notifications`}>
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          ) : null}
        </NavLink>
        <NavLink to="/assts/profile" className={`assts-vault-nav__item ${onProfile ? 'active' : ''}`}>
          <span className="assts-vault-nav__glyph assts-vault-nav__glyph--profile" aria-hidden="true" />
          <span>PROFILE</span>
        </NavLink>
      </nav>
    </div>
  );
}

/** @deprecated use AsstsVaultNav */
export function AsstsBottomDock() {
  return <AsstsVaultNav />;
}

/** @deprecated use AsstsVaultNav */
export const AsstsMobileNav = AsstsVaultNav;

const STATUS_CLASS: Record<string, string> = {
  QUEUED: 'queued',
  GENERATING: 'generating',
  NEEDS_REVIEW: 'needs-review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REGENERATING: 'regenerating',
  VARIANT_REQUESTED: 'variant-requested',
  LOCKED: 'locked',
  FAILED: 'failed',
  IN_REVIEW: 'needs-review',
  READY_TO_LOCK: 'approved',
  PARTIALLY_APPROVED: 'needs-review',
  DRAFT: 'queued',
};

type AsstsStatusBadgeProps = {
  status: string;
  variant?: 'default' | 'review' | 'muted';
  compact?: boolean;
};

export function AsstsStatusBadge({ status, variant = 'default', compact = false }: AsstsStatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  const token = STATUS_CLASS[normalized] ?? (variant === 'review' ? 'needs-review' : variant === 'muted' ? 'queued' : 'queued');
  const label = status.replace(/_/g, ' ');
  return (
    <span className={`assts-status assts-status--${token}${compact ? ' assts-status--compact' : ''}`}>
      <span className="assts-status__dot" aria-hidden="true" />
      {compact ? label.split(' ')[0] : label}
    </span>
  );
}

export type BatchViewMode = 'grid' | 'contact' | 'compare';

type ViewModeToggleProps = {
  mode: BatchViewMode;
  onChange: (mode: BatchViewMode) => void;
  showContact?: boolean;
  showCompare?: boolean;
  className?: string;
};

export function AsstsViewModeToggle({ mode, onChange, showContact, showCompare, className }: ViewModeToggleProps) {
  return (
    <div className={`assts-view-toggle ${className ?? ''}`.trim()} role="tablist" aria-label="Batch view mode">
      <button type="button" role="tab" aria-selected={mode === 'grid'} className={mode === 'grid' ? 'active' : ''} onClick={() => onChange('grid')}>
        GRID
      </button>
      {showContact ? (
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'contact'}
          className={mode === 'contact' ? 'active' : ''}
          onClick={() => onChange('contact')}
        >
          CONTACT SHEET
        </button>
      ) : null}
      {showCompare ? (
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'compare'}
          className={mode === 'compare' ? 'active' : ''}
          onClick={() => onChange('compare')}
        >
          COMPARE
        </button>
      ) : null}
    </div>
  );
}
