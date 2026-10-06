/**
 * Shared Production header + bottom nav geometry.
 * Authored in the 864px hub coordinate space and zoomed with the same scale as the hub,
 * so the bars land on the same screen pixels on every production workspace.
 */
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { hostProjectName, listHostProductionProjects, projectCoverUrl, projectSwitchPath } from '../../projectRuntime/projectHostProfile';
import { scopedTabHref, workspaceTabOf } from '../../../../shared/site00-production-graph/projectScope.js';
import { useActiveProjectId } from '../../production/activeProject';
import '../../styles/site00-production-hub.css';
import '../../styles/site00-production-hub-authority.css';
import '../../styles/site00-production-host-chrome.css';
import { HubImage } from './HubImage';
import { IcChevD, IcMenu, Reticle } from './icons';
import { useProductionViewportFamily } from '../../hooks/useProductionViewportFamily';
import { useProjectGraphData } from '../productionAuthority/ProductionAuthorityData';
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

const RECENT_MS = 24 * 60 * 60 * 1000;

export function useProductionWorkspaceChrome(): {
  brand: string;
  active: ProductionNavId | null;
  /** Active project (null = none chosen — never a default project). */
  projectId: string | null;
  projectName: string;
  /** Real count: the active project's founder decisions that NEED YOU. */
  queued: number;
  /** The active project has recorded events in the last 24 h (drives the ACTIVITY dot — never always-on). */
  recentActivity: boolean;
  sectionLabel: string;
  sectionValue: string;
} {
  const { pathname } = useLocation();
  const graph = useProjectGraphData();
  const urlProject = useActiveProjectId();
  const projectId = graph?.project_id ?? urlProject;
  const projectName = graph?.project_name ?? (projectId ? hostProjectName(projectId) : 'SELECT');
  const queued = graph ? graph.decisions.filter((d) => d.state === 'NEEDS_YOU').length : 0;
  const now = Date.now();
  const recentActivity = !!graph?.events.some((e) => e.origin !== 'SOURCE_TRUTH' && now - Date.parse(e.timestamp) < RECENT_MS);
  let brand = 'PRODUCTION';
  let active: ProductionNavId | null = null;
  let sectionLabel = 'CURRENT PRODUCTION';
  let sectionValue = 'ENTRY';
  const tab = workspaceTabOf(pathname);
  if (tab === 'HUB') {
    brand = 'HUB';
    active = 'hub';
    sectionLabel = 'CURRENT WORKSPACE';
    sectionValue = 'HUB';
  } else if (tab === 'ACTIVITY') {
    brand = 'ACTIVITY';
    active = 'activity';
    sectionLabel = 'CURRENT WORKSPACE';
    sectionValue = 'ACTIVITY';
  } else if (tab === 'INBOX') {
    brand = 'INBOX';
    active = 'inbox';
    sectionLabel = 'CURRENT QUEUE';
    sectionValue = 'DECISIONS';
  } else if (tab === 'LIBRARY') {
    brand = 'LIBRARY';
    active = 'library';
    sectionLabel = 'PROJECT LIBRARY';
    sectionValue = 'ARTIFACTS';
  } else if (tab === 'DESIGN') {
    brand = 'DESIGN';
    active = 'design';
    sectionLabel = 'CURRENT WORKSPACE';
    sectionValue = 'DESIGN';
  } else if (tab === 'EXPERIENCE') {
    brand = 'EXPERIENCE';
    active = 'experience';
    sectionLabel = 'CURRENT WORKSPACE';
    sectionValue = 'EXPERIENCE';
  } else if (tab === 'EXPRESSION') {
    brand = 'EXPRESSION';
    active = 'expression';
    sectionLabel = 'CURRENT WORKSPACE';
    sectionValue = 'EXPRESSION';
  }
  return { brand, active, projectId, projectName, queued, recentActivity, sectionLabel, sectionValue };
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

function menuItems(projectId: string | null, phone: boolean): MenuItem[] {
  const hub = projectId ? scopedTabHref('HUB', projectId) : '/production';
  const inbox = projectId ? scopedTabHref('INBOX', projectId) : '/production/queue';
  return [
    { to: hub, title: 'PRODUCTION HUB', sub: phone ? 'RETURN TO CHAMBER' : 'PROJECT COMMAND' },
    { to: inbox, title: 'INBOX', sub: 'DECISIONS' },
    { to: '/control', title: 'CONTROL', sub: 'ACCOUNT' },
  ];
}

/** Project switcher: real project selection; keeps the current TAB (never redirects to a populated tab). */
function useProjectSwitchItems(projectId: string | null): MenuItem[] {
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
  const { brand, projectId, projectName, queued } = useProductionWorkspaceChrome();
  const family = useProductionViewportFamily();
  const [menu, setMenu] = useState(false);
  const [projects, setProjects] = useState(false);
  const closeMenu = useCallback(() => setMenu(false), []);
  const closeProjects = useCallback(() => setProjects(false), []);
  const projectItems = useProjectSwitchItems(projectId);
  if (family !== 'mobile') {
    return <ProductionHostTop projectId={projectId} projectName={projectName} queued={queued} />;
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
        data-project={projectId ?? ''}
        aria-haspopup="dialog"
        aria-expanded={projects}
        onClick={() => setProjects((v) => !v)}
      >
        <HubImage slotId={projectId ? `project.${projectId}.cover` : null} url={projectId ? projectCoverUrl(projectId) : null} label="" className="ph-top__thumb" />
        <span className="ph-top__copy">
          <small>PROJECT</small>
          <b>{projectName}</b>
        </span>
        <IcChevD width={14} height={14} />
      </button>
      <Link to={projectId ? scopedTabHref('INBOX', projectId) : '/production/queue'} className="ph-top__attn" aria-label={`${queued} items need you`} data-testid="production-attention-count" data-count={queued}>
        <Reticle size={46} />
        <span className="ph-top__copy">
          <b>{String(queued).padStart(2, '0')}</b>
          <small>ITEMS NEED YOU</small>
        </span>
      </Link>
      <button type="button" className="ph-top__menu" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
        <IcMenu width={22} height={22} />
      </button>
      {menu ? <ProductionMenuPanel items={menuItems(projectId, true)} className="prod-chrome-pop" onClose={closeMenu} /> : null}
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
function ProductionHostTop({ projectId, projectName, queued }: { projectId: string | null; projectName: string; queued: number }) {
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
          data-project={projectId ?? ''}
          aria-haspopup="dialog"
          aria-expanded={projects}
          onClick={() => setProjects((v) => !v)}
        >
          <HubImage slotId={projectId ? `project.${projectId}.cover` : null} url={projectId ? projectCoverUrl(projectId) : null} label="" className="pxh-top__thumb" />
          <span>
            <small>PROJECT</small>
            <b>{projectName}</b>
          </span>
          <IcChevD width={14} height={14} />
        </button>
        <Link to={projectId ? scopedTabHref('INBOX', projectId) : '/production/queue'} className="pxh-top__attn" aria-label={`${queued} items need you`} data-testid="production-host-attention" data-count={queued}>
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
      {menu ? <ProductionMenuPanel items={menuItems(projectId, false)} className="pxh-pop" onClose={closeMenu} /> : null}
      {projects ?
        <ProductionMenuPanel items={projectItems} title="PROJECTS" testId="production-project-menu" className="pxh-pop pxm--projects" onClose={closeProjects} />
      : null}
    </header>
  );
}

export function ProductionWorkspaceNav() {
  const { active, projectId, queued, recentActivity } = useProductionWorkspaceChrome();
  const family = useProductionViewportFamily();
  if (family !== 'mobile') return <ProductionHostNav active={active} projectId={projectId} inboxCount={queued} recentActivity={recentActivity} />;
  return <ProductionBottomNav active={active} projectId={projectId} inboxCount={queued} recentActivity={recentActivity} />;
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
