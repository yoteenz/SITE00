/**
 * Shared Production header + bottom nav geometry.
 * Authored in the 864px hub coordinate space and zoomed with the same scale as the hub,
 * so the bars land on the same screen pixels on every production workspace.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { hubAssetUrl } from '../../../../shared/site00-production-hub/assets.js';
import { useProductionRequests } from '../../state/productionRequestStore';
import '../../styles/site00-production-hub.css';
import '../../styles/site00-production-hub-authority.css';
import '../../styles/site00-production-system-chrome-typography.css';
import { HubImage } from './HubImage';
import { IcChevD, IcMenu, Reticle } from './icons';
import { ProductionBottomNav, type ProductionNavId } from './nav';

export const PRODUCTION_CHROME_WIDTH = 864;

export function productionChromeScale(): number {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.innerWidth, 520) / PRODUCTION_CHROME_WIDTH;
}

export function useProductionChromeScale(): number {
  const [scale, setScale] = useState(productionChromeScale);
  useEffect(() => {
    const onResize = () => setScale(productionChromeScale());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
}

export function ProductionChromeStrip({ children }: { children: ReactNode }) {
  const scale = useProductionChromeScale();
  return (
    <div
      className="ph ph--hub ph--system-chrome prod-chrome-strip"
      style={{ ['--phz' as string]: scale }}
      data-testid="production-chrome-strip"
    >
      {children}
    </div>
  );
}

function projectIdFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'production') return 'ndxbook';
  const slug = parts[1];
  if (!slug || slug === 'queue' || slug === 'libraries') return 'ndxbook';
  return slug;
}

export function useProductionWorkspaceChrome(): {
  brand: string;
  active: ProductionNavId | null;
  projectId: string;
  queued: number;
  sectionLabel: string;
  sectionValue: string;
} {
  const { pathname } = useLocation();
  const requests = useProductionRequests();
  const queued = requests.filter((r) => r.status === 'QUEUED').length;
  const projectId = projectIdFromPath(pathname);
  let brand = 'PRODUCTION';
  let active: ProductionNavId | null = null;
  let sectionLabel = 'CURRENT PRODUCTION';
  let sectionValue = 'ENTRY';
  if (pathname.startsWith('/production/queue')) {
    brand = 'INBOX';
    active = 'inbox';
    sectionLabel = 'CURRENT QUEUE';
    sectionValue = 'REQUESTS';
  } else if (pathname.startsWith('/production/libraries')) {
    brand = 'LIBRARY';
    active = 'library';
    sectionLabel = 'SHARED LIBRARY';
    sectionValue = 'ASSETS';
  } else if (
    (/^\/production\/[^/]+\/design(\/|$)/.test(pathname) &&
      !pathname.includes('/design-workspace') &&
      !pathname.includes('/design-legacy')) ||
    /^\/production\/[^/]+\/design-workspace(\/|$)/.test(pathname) ||
    /^\/production\/[^/]+\/design-legacy(\/|$)/.test(pathname)
  ) {
    brand = 'DESIGN';
    active = 'design';
    sectionLabel = 'CURRENT WORKSPACE';
    sectionValue = 'DESIGN';
  } else if (/^\/production\/[^/]+\/experience(\/|$)/.test(pathname)) {
    brand = 'EXPERIENCE';
    active = 'experience';
    sectionLabel = 'CURRENT WORKSPACE';
    sectionValue = 'EXPERIENCE';
  } else if (/^\/production\/[^/]+\/expression(\/|$)/.test(pathname)) {
    brand = 'EXPRESSION';
    active = 'expression';
    sectionLabel = 'CURRENT WORKSPACE';
    sectionValue = 'EXPRESSION';
  }
  return { brand, active, projectId, queued, sectionLabel, sectionValue };
}

/** Light authority header used by every production workspace that is not the hub or character fabrication. */
export function ProductionWorkspaceHeader() {
  const { brand, projectId, queued, sectionLabel, sectionValue } = useProductionWorkspaceChrome();
  const [menu, setMenu] = useState(false);
  const long = brand.length > 12;
  return (
    <header className="ph-top" data-testid="production-workspace-header">
      <div className={`ph-top__brand${long ? ' ph-top__brand--long' : ''}`}>
        <b>{brand}</b>
        <small>SITE 00 / STUDIO WORLD</small>
      </div>
      <Link to="/production" className="ph-top__sel" data-testid="production-chrome-project">
        <HubImage slotId="project.ndxbook.cover" url={hubAssetUrl('project.ndxbook.cover')} label="" className="ph-top__thumb" />
        <span>
          <small>PROJECT</small>
          <b>{projectId.toUpperCase()}</b>
        </span>
        <IcChevD width={14} height={14} />
      </Link>
      <Link to="/production" className="ph-top__sel ph-top__sel--prod">
        <span>
          <small>{sectionLabel}</small>
          <b>{sectionValue}</b>
        </span>
        <IcChevD width={14} height={14} />
      </Link>
      <Link to="/production/queue" className="ph-top__attn" aria-label={`${queued} items need you`}>
        <Reticle size={46} />
        <span>
          <b>{String(queued).padStart(2, '0')}</b>
          <small>ITEMS NEED YOU</small>
        </span>
      </Link>
      <button type="button" className="ph-top__menu" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
        <IcMenu width={22} height={22} />
      </button>
      {menu ? (
        <div className="prod-chrome-pop" role="dialog">
          <Link to="/production" onClick={() => setMenu(false)}><b>PRODUCTION HUB</b><span>RETURN TO CHAMBER</span></Link>
          <Link to="/production/queue" onClick={() => setMenu(false)}><b>INBOX</b><span>REQUESTS</span></Link>
          <Link to="/control" onClick={() => setMenu(false)}><b>CONTROL</b><span>ACCOUNT</span></Link>
        </div>
      ) : null}
    </header>
  );
}

export function ProductionWorkspaceNav() {
  const { active, projectId, queued } = useProductionWorkspaceChrome();
  return <ProductionBottomNav active={active} projectId={projectId} inboxCount={queued} />;
}

/** Fixed bars for full-bleed surfaces (Design) that are not inside PwFrame. */
export function ProductionChromeOverlay() {
  const ui = (
    <>
      <div className="prod-chrome-fixed prod-chrome-fixed--top">
        <ProductionChromeStrip>
          <ProductionWorkspaceHeader />
        </ProductionChromeStrip>
      </div>
      <div className="prod-chrome-fixed prod-chrome-fixed--bottom">
        <ProductionChromeStrip>
          <ProductionWorkspaceNav />
        </ProductionChromeStrip>
      </div>
    </>
  );
  return createPortal(ui, document.body);
}
