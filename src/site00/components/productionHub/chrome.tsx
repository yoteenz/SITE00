/**
 * Shared Production header + bottom nav geometry.
 * Authored in the 864px hub coordinate space and zoomed with the same scale as the hub,
 * so the bars land on the same screen pixels on every production workspace.
 */
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { listHostProductionProjects, projectCoverUrl, projectSwitchPath } from '../../projectRuntime/projectHostProfile';
import { useProductionRequests } from '../../state/productionRequestStore';
import '../../styles/site00-production-hub.css';
import '../../styles/site00-production-hub-authority.css';
import '../../styles/site00-production-host-chrome.css';
import { HubImage } from './HubImage';
import { IcChevD, IcMenu, Reticle } from './icons';
import { useProductionViewportFamily } from '../../hooks/useProductionViewportFamily';
import { useProductionAuthorityData } from '../productionAuthority/ProductionAuthorityData';
import { ProductionBottomNav, ProductionHostNav, type ProductionNavId } from './nav';

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

/**
 * `host` strips (Production authority frames) render tablet + desktop chrome at native size:
 * no zoom, no transform, explicit px type. Mobile keeps the approved 864-coordinate chrome.
 */
export function ProductionChromeStrip({ children, host = false }: { children: ReactNode; host?: boolean }) {
  const scale = useProductionChromeScale();
  const family = useProductionViewportFamily();
  if (host && family !== 'mobile') {
    return (
      <div className="pxh-strip" data-family={family} data-testid="production-chrome-strip">
        {children}
      </div>
    );
  }
  return (
    <div className="ph ph--hub prod-chrome-strip" style={{ ['--phz' as string]: scale }} data-testid="production-chrome-strip">
      {children}
    </div>
  );
}

function projectIdFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'production') return 'ndxbook';
  const slug = parts[1];
  if (!slug || slug === 'queue' || slug === 'libraries' || slug === 'activity') return 'ndxbook';
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
  const hubData = useProductionAuthorityData();
  const queuedRequests = requests.filter((r) => r.status === 'QUEUED').length;
  const queued = hubData ? hubData.attention.length : queuedRequests;
  const projectId = projectIdFromPath(pathname);
  let brand = 'PRODUCTION';
  let active: ProductionNavId | null = null;
  let sectionLabel = 'CURRENT PRODUCTION';
  let sectionValue = 'ENTRY';
  if (pathname === '/production' || pathname === '/production/') {
    brand = 'HUB';
    active = 'hub';
    sectionLabel = 'CURRENT WORKSPACE';
    sectionValue = 'HUB';
  } else if (pathname.startsWith('/production/activity')) {
    brand = 'ACTIVITY';
    active = 'activity';
    sectionLabel = 'CURRENT WORKSPACE';
    sectionValue = 'ACTIVITY';
  } else if (pathname.startsWith('/production/queue')) {
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

type MenuItem = { to: string; title: string; sub: string; thumb?: string | null; current?: boolean };

/**
 * Host menu panel (HUB.DESCENDANTS-INTERACTIONS.OPUS1): one authored panel for the phone strip and the
 * tablet / desktop host top — red-pipe head, indexed rows, current-route marker, chevrons. Same three
 * destinations as before; Escape and an outside press close it.
 */
function ProductionMenuPanel({
  items,
  className,
  onClose,
  title = 'MENU',
  testId = 'production-menu',
}: {
  items: MenuItem[];
  className: string;
  onClose: () => void;
  title?: string;
  testId?: string;
}) {
  const { pathname } = useLocation();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t && !t.closest('[data-production-menu], .pxh-top__menu, .ph-top__menu, [data-production-project-trigger]')) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [onClose]);
  return (
    <div className={`${className} pxm`} role="dialog" aria-label={`Production ${title.toLowerCase()}`} data-production-menu data-testid={testId}>
      <header className="pxm__head">
        <i aria-hidden />
        <b>{title}</b>
        <button type="button" className="pxm__close" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}>
          ×
        </button>
      </header>
      <nav className="pxm__list">
        {items.map((it, i) => {
          const current = it.current ?? it.to === pathname;
          return (
            <Link key={it.to} to={it.to} onClick={onClose} className={current ? 'is-current' : undefined} aria-current={current ? 'page' : undefined} data-testid={`${testId}-item`}>
              {it.thumb !== undefined ?
                <HubImage slotId={null} url={it.thumb} label="" className="pxm__thumb" />
              : <em>{String(i + 1).padStart(2, '0')}</em>}
              <span>
                <b>{it.title}</b>
                <small>{it.sub}</small>
              </span>
              <i aria-hidden>›</i>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

const MENU_PHONE: MenuItem[] = [
  { to: '/production', title: 'PRODUCTION HUB', sub: 'RETURN TO CHAMBER' },
  { to: '/production/queue', title: 'INBOX', sub: 'REQUESTS' },
  { to: '/control', title: 'CONTROL', sub: 'ACCOUNT' },
];
const MENU_HOST: MenuItem[] = [
  { to: '/production', title: 'PRODUCTION HUB', sub: 'PROJECT COMMAND' },
  { to: '/production/queue', title: 'INBOX', sub: 'REQUESTS' },
  { to: '/control', title: 'CONTROL', sub: 'ACCOUNT' },
];

/** Project switcher (P0.JURNL.SITE00-INGEST-F01): real project selection; lands on the same workspace + mode. */
function useProjectSwitchItems(projectId: string): MenuItem[] {
  const { pathname, search } = useLocation();
  return listHostProductionProjects().map((p) => ({
    to: projectSwitchPath(pathname, search, p.slug),
    title: p.name,
    sub: p.kind,
    thumb: p.cover,
    current: p.slug === projectId,
  }));
}

/** Light authority header used by every production workspace that is not the hub or character fabrication. */
export function ProductionWorkspaceHeader() {
  const { brand, projectId, queued } = useProductionWorkspaceChrome();
  const family = useProductionViewportFamily();
  const [menu, setMenu] = useState(false);
  const [projects, setProjects] = useState(false);
  const closeMenu = useCallback(() => setMenu(false), []);
  const closeProjects = useCallback(() => setProjects(false), []);
  const projectItems = useProjectSwitchItems(projectId);
  if (family !== 'mobile') {
    return <ProductionHostTop projectId={projectId} queued={queued} />;
  }
  const long = brand.length > 12;
  return (
    <header className="ph-top" data-testid="production-workspace-header">
      <div className={`ph-top__brand${long ? ' ph-top__brand--long' : ''}`}>
        <span className="ph-top__copy">
          <b>{brand}</b>
          <small>SITE 00 / STUDIO WORLD</small>
        </span>
      </div>
      <button
        type="button"
        className="ph-top__sel"
        data-testid="production-chrome-project"
        data-production-project-trigger
        data-project={projectId}
        aria-haspopup="dialog"
        aria-expanded={projects}
        onClick={() => setProjects((v) => !v)}
      >
        <HubImage slotId={`project.${projectId}.cover`} url={projectCoverUrl(projectId)} label="" className="ph-top__thumb" />
        <span className="ph-top__copy">
          <small>PROJECT</small>
          <b>{projectId.toUpperCase()}</b>
        </span>
        <IcChevD width={14} height={14} />
      </button>
      <Link to="/production/queue" className="ph-top__attn" aria-label={`${queued} items need you`}>
        <Reticle size={46} />
        <span className="ph-top__copy">
          <b>{String(queued).padStart(2, '0')}</b>
          <small>ITEMS NEED YOU</small>
        </span>
      </Link>
      <button type="button" className="ph-top__menu" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
        <IcMenu width={22} height={22} />
      </button>
      {menu ? <ProductionMenuPanel items={MENU_PHONE} className="prod-chrome-pop" onClose={closeMenu} /> : null}
      {projects ?
        <ProductionMenuPanel items={projectItems} title="PROJECTS" testId="production-project-menu" className="prod-chrome-pop pxm--projects" onClose={closeProjects} />
      : null}
    </header>
  );
}

/**
 * Tablet + desktop top host panel.
 * [ PROJECT / NDXBOOK ] [ ITEMS NEED YOU ] ........ [ MENU ]
 */
function ProductionHostTop({ projectId, queued }: { projectId: string; queued: number }) {
  const [menu, setMenu] = useState(false);
  const [projects, setProjects] = useState(false);
  const closeMenu = useCallback(() => setMenu(false), []);
  const closeProjects = useCallback(() => setProjects(false), []);
  const projectItems = useProjectSwitchItems(projectId);
  return (
    <header className="pxh-top" data-testid="production-workspace-header" data-shell="host-top">
      <div className="pxh-top__cluster" data-testid="production-host-cluster">
        <button
          type="button"
          className="pxh-top__project"
          data-testid="production-chrome-project"
          data-production-project-trigger
          data-project={projectId}
          aria-haspopup="dialog"
          aria-expanded={projects}
          onClick={() => setProjects((v) => !v)}
        >
          <HubImage slotId={`project.${projectId}.cover`} url={projectCoverUrl(projectId)} label="" className="pxh-top__thumb" />
          <span>
            <small>PROJECT</small>
            <b>{projectId.toUpperCase()}</b>
          </span>
          <IcChevD width={14} height={14} />
        </button>
        <Link to="/production/queue" className="pxh-top__attn" aria-label={`${queued} items need you`} data-testid="production-host-attention">
          <Reticle size={34} />
          <span>
            <b>{String(queued).padStart(2, '0')}</b>
            <small>ITEMS NEED YOU</small>
          </span>
        </Link>
      </div>
      <button type="button" className="pxh-top__menu" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)} data-testid="production-host-menu">
        <IcMenu width={24} height={24} />
      </button>
      {menu ? <ProductionMenuPanel items={MENU_HOST} className="pxh-pop" onClose={closeMenu} /> : null}
      {projects ?
        <ProductionMenuPanel items={projectItems} title="PROJECTS" testId="production-project-menu" className="pxh-pop pxm--projects" onClose={closeProjects} />
      : null}
    </header>
  );
}

export function ProductionWorkspaceNav() {
  const { active, projectId, queued } = useProductionWorkspaceChrome();
  const family = useProductionViewportFamily();
  if (family !== 'mobile') return <ProductionHostNav active={active} projectId={projectId} inboxCount={queued} />;
  return <ProductionBottomNav active={active} projectId={projectId} inboxCount={queued} />;
}

/** Fixed bars for full-bleed surfaces (Design) that are not inside PwFrame. */
export function ProductionChromeOverlay() {
  const ui = (
    <>
      <div className="prod-chrome-fixed prod-chrome-fixed--top">
        <ProductionChromeStrip host>
          <ProductionWorkspaceHeader />
        </ProductionChromeStrip>
      </div>
      <div className="prod-chrome-fixed prod-chrome-fixed--bottom">
        <ProductionChromeStrip host>
          <ProductionWorkspaceNav />
        </ProductionChromeStrip>
      </div>
    </>
  );
  return createPortal(ui, document.body);
}
