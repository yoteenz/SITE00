import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { MobileSiteNavigation } from '../mobile/MobileSiteNavigation';
import { FastTravelPanel } from '../fast-travel/FastTravelPanel';
import { PublicTechnicalHeader } from './PublicTechnicalHeader';
import { SITE00_ROUTES } from '../../config/routes';
import { getAuthorityRecord } from '../../authority/publicRedesignAuthorityManifest';

export type PublicRedesignSection = 'origin' | 'idnty' | 'bldr' | 'evolve' | 'locations';

type PublicRedesignShellProps = {
  children: ReactNode;
  section: PublicRedesignSection;
  headerVariant?: 'technical' | 'wordmark' | 'directory';
  /** Manifest id — used only by the dev-only authority badge. */
  authorityId?: string;
  className?: string;
  /** Rendered behind everything (environment frame). */
  environment?: ReactNode;
  /** Hide bottom nav (never needed today; kept for the checkout family). */
  hideBottomNav?: boolean;
};

const CONTEXTUAL_BAY: Partial<Record<PublicRedesignSection, { label: string; href: string }>> = {
  bldr: { label: 'BUILDER', href: SITE00_ROUTES.bldrState },
  evolve: { label: 'EVOLVE', href: SITE00_ROUTES.evolveState },
};

/**
 * Shared public SITE 00 shell: environment → technical header → page → bottom navigation.
 * ALL visible copy inside `.s00pr` is uppercase by CSS contract (see site00-public-redesign.css).
 */
export function PublicRedesignShell({
  children,
  section,
  headerVariant = 'technical',
  authorityId,
  className = '',
  environment,
  hideBottomNav = false,
}: PublicRedesignShellProps) {
  const [fastTravelOpen, setFastTravelOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!fastTravelOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFastTravelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fastTravelOpen]);

  return (
    <div className={`s00pr s00pr-shell s00pr-shell--${section} ${className}`.trim()} data-public-section={section}>
      {environment}
      <div className="s00pr-shell__content">
        <PublicTechnicalHeader
          variant={headerVariant}
          onFastTravelOpen={() => setFastTravelOpen(true)}
          fastTravelExpanded={fastTravelOpen}
          fastTravelTriggerRef={triggerRef}
          showLinks={headerVariant === 'technical' && (section === 'bldr' || section === 'evolve')}
        />
        <main className="s00pr-shell__main">{children}</main>
        {hideBottomNav ? null : (
          <MobileSiteNavigation
            contextualBay={CONTEXTUAL_BAY[section] ?? null}
            active={section === 'origin' ? 'origin' : section === 'locations' ? 'locations' : 'idnty'}
          />
        )}
      </div>
      <FastTravelPanel open={fastTravelOpen} onClose={() => setFastTravelOpen(false)} returnFocusRef={triggerRef} />
      {authorityId ? <PublicAuthorityDevBadge authorityId={authorityId} /> : null}
    </div>
  );
}

/**
 * DEV-ONLY: shows the authority id / route / implementation status for the current page.
 * Enabled with `?authority=1` in `import.meta.env.DEV`. Compiled to nothing in production builds.
 */
function PublicAuthorityDevBadge({ authorityId }: { authorityId: string }) {
  const { search, pathname } = useLocation();
  if (!import.meta.env.DEV) return null;
  if (!/(^|[?&])authority=1(&|$)/.test(search)) return null;
  const record = getAuthorityRecord(authorityId);
  return (
    <div className="s00pr-dev-badge" data-dev-only="true">
      <span>{authorityId}</span>
      <span>{pathname}</span>
      <span>{record?.status ?? 'UNMAPPED'}</span>
    </div>
  );
}
