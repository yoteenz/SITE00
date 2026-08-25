import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ndxFounderWorkspaceEnabled,
  ndxFounderWorkspaceNav,
  ndxInspectRoutes,
} from '../../config/ndxFounderWorkspace';
import {
  NDX_WORKSPACE_NAV_ICONS,
  ndxFounderWorkspaceBottomNav,
  ndxFounderWorkspaceMenuItems,
  ndxFounderWorkspaceOverflowNav,
} from '../../config/ndxFounderWorkspaceIcons';
import { site00ProjectNdxIconSheetPath } from '../../config/routes';
import { NDX_ICON_CONTEXT_SIZE } from '../../../../shared/site00-studio-world-ui/icons/index.js';
import { NDXIcon } from '../../icons/ndx';
import { FounderWorkspaceMobileNav } from './FounderWorkspaceMobileNav';
import { FounderWorkspaceProjectMenu } from './FounderWorkspaceProjectMenu';
import { FounderWorkspaceHeaderChrome } from './FounderWorkspaceHeaderChrome';
import type { ExperimentJourneyStageConfig } from '../../../../shared/site00-studio-world-production/founderWorkspace/types.js';
import '../../styles/site00-founder-workspace.css';

type InspectorState = {
  open: boolean;
  title: string;
  content: ReactNode | null;
};

type FounderWorkspaceContextValue = {
  openInspector: (title: string, content: ReactNode) => void;
  closeInspector: () => void;
  inspectorOpen: boolean;
};

const FounderWorkspaceContext = createContext<FounderWorkspaceContextValue | null>(null);

export function useFounderWorkspaceInspector(): FounderWorkspaceContextValue {
  const ctx = useContext(FounderWorkspaceContext);
  if (!ctx) {
    return {
      openInspector: () => {},
      closeInspector: () => {},
      inspectorOpen: false,
    };
  }
  return ctx;
}

type FounderWorkspaceShellProps = {
  projectSlug: string;
  title: string;
  subtitle?: string;
  attentionBadge?: string;
  operate: ReactNode;
  understand?: ReactNode;
  inspect?: ReactNode;
  inspectLabel?: string;
  actions?: ReactNode;
  hideWorkspaceNav?: boolean;
  hideWorkspaceHeader?: boolean;
};

export function FounderWorkspaceShell({
  projectSlug,
  title,
  subtitle,
  attentionBadge,
  operate,
  understand,
  inspect,
  inspectLabel = 'INSPECT METHODOLOGY + SYSTEM',
  actions,
  hideWorkspaceNav = false,
  hideWorkspaceHeader = false,
}: FounderWorkspaceShellProps) {
  const location = useLocation();
  const enabled = ndxFounderWorkspaceEnabled(projectSlug);
  const nav = useMemo(() => ndxFounderWorkspaceNav(projectSlug), [projectSlug]);
  const inspectRoutes = useMemo(() => ndxInspectRoutes(projectSlug), [projectSlug]);
  const bottomNav = useMemo(() => ndxFounderWorkspaceBottomNav(projectSlug), [projectSlug]);
  const menuItems = useMemo(() => ndxFounderWorkspaceMenuItems(projectSlug), [projectSlug]);
  const overflowNav = useMemo(() => ndxFounderWorkspaceOverflowNav(projectSlug), [projectSlug]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inspector, setInspector] = useState<InspectorState>({ open: false, title: '', content: null });

  const openInspector = useCallback((inspectorTitle: string, content: ReactNode) => {
    setInspector({ open: true, title: inspectorTitle, content });
  }, []);

  const closeInspector = useCallback(() => {
    setInspector((s) => ({ ...s, open: false }));
  }, []);

  const ctx = useMemo(
    () => ({ openInspector, closeInspector, inspectorOpen: inspector.open }),
    [openInspector, closeInspector, inspector.open],
  );

  if (!enabled) {
    return <>{operate}</>;
  }

  const isNavActive = (path: string) => location.pathname.replace(/\/+$/, '') === path.replace(/\/+$/, '');

  const headerActions =
    actions ?? (
      <FounderWorkspaceHeaderChrome
        onOpenMenu={() => setMenuOpen(true)}
        onOpenNotifications={() => setMenuOpen(true)}
      />
    );

  return (
    <FounderWorkspaceContext.Provider value={ctx}>
      <div className="site00-fws">
        {!hideWorkspaceNav ? (
          <aside className="site00-fws-rail" aria-label="NDXBOOK workspace">
            <div className="site00-fws-rail__brand">
              <span className="site00-fws-rail__host">SITE 00</span>
              <span className="site00-fws-rail__client">NDXBOOK</span>
              <span className="site00-fws-rail__mode">EXPERIMENT HUB</span>
            </div>
            <nav className="site00-fws-rail__nav">
              {nav.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`site00-fws-rail__link${isNavActive(item.href) ? ' site00-fws-rail__link--active' : ''}`}
                >
                  <span className="site00-fws-rail__link-inner">
                    <NDXIcon
                      name={NDX_WORKSPACE_NAV_ICONS[item.id]}
                      size={NDX_ICON_CONTEXT_SIZE.desktopRail}
                      state={isNavActive(item.href) ? 'active' : 'inactive'}
                      decorative
                    />
                    <span>{item.label}</span>
                  </span>
                  {item.badge != null && item.badge > 0 ? (
                    <span className="site00-fws-rail__badge" aria-hidden="true" />
                  ) : null}
                </Link>
              ))}
            </nav>
            <div className="site00-fws-rail__inspect">
              <Link to={inspectRoutes.experimentsHub} className="site00-fws-rail__inspect-link">
                <span className="site00-fws-rail__link-inner">
                  <NDXIcon name="experiments_hub" size={NDX_ICON_CONTEXT_SIZE.desktopRail} state="inactive" decorative />
                  <span>{inspectLabel}</span>
                </span>
              </Link>
              <Link to={site00ProjectNdxIconSheetPath(projectSlug)} className="site00-fws-rail__inspect-link">
                <span className="site00-fws-rail__link-inner">
                  <NDXIcon name="inspect" size={NDX_ICON_CONTEXT_SIZE.desktopRail} state="inactive" decorative />
                  <span>ICON SHEET</span>
                </span>
              </Link>
            </div>
            <footer className="site00-fws-rail__footer">
              <span>ASSISTED AUTONOMY · IN PRODUCTION</span>
              <span className="site00-fws-rail__principle">FOUNDER MODE: YOU APPROVE. NOTHING PUBLISHES WITHOUT YOU.</span>
            </footer>
          </aside>
        ) : null}

        <main className="site00-fws-canvas">
          {!hideWorkspaceHeader ? (
            <header className="site00-fws-header">
              <div className="site00-fws-header__titles">
                {attentionBadge ? <span className="site00-fws-header__badge">{attentionBadge}</span> : null}
                <h1 className="site00-fws-header__title">{title}</h1>
                {subtitle ? <p className="site00-fws-header__subtitle">{subtitle}</p> : null}
              </div>
              <div className="site00-fws-header__actions">{headerActions}</div>
            </header>
          ) : null}

          <section className="site00-fws-layer site00-fws-layer--operate" aria-label="Operate">
            {operate}
          </section>

          {understand ? (
            <section className="site00-fws-layer site00-fws-layer--understand" aria-label="Understand">
              {understand}
            </section>
          ) : null}

          {inspect ? (
            <section className="site00-fws-layer site00-fws-layer--inspect-collapsed">
              <button
                type="button"
                className="site00-fws-inspect-trigger"
                onClick={() => openInspector(title, inspect)}
              >
                {inspectLabel} →
              </button>
            </section>
          ) : null}
        </main>

        {!hideWorkspaceNav ? (
          <FounderWorkspaceMobileNav items={bottomNav} onMore={() => setMenuOpen(true)} />
        ) : null}

        <FounderWorkspaceProjectMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          items={menuItems}
          overflowItems={overflowNav}
        />

        {inspector.open ? (
          <div className="site00-fws-inspector-backdrop" role="presentation" onClick={closeInspector} />
        ) : null}
        <aside
          className={`site00-fws-inspector${inspector.open ? ' site00-fws-inspector--open' : ''}`}
          aria-hidden={!inspector.open}
          aria-label="Methodology inspector"
        >
          <header className="site00-fws-inspector__head">
            <h2>{inspector.title}</h2>
            <button type="button" className="site00-fws-inspector__close" onClick={closeInspector} aria-label="Close inspector">
              ×
            </button>
          </header>
          <div className="site00-fws-inspector__body">{inspector.content}</div>
        </aside>
      </div>
    </FounderWorkspaceContext.Provider>
  );
}

export function FounderWorkspacePanel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`site00-fws-panel${className ? ` ${className}` : ''}`}>
      {title ? <h2 className="site00-fws-panel__title">{title}</h2> : null}
      {children}
    </section>
  );
}

export function OperationalPulse({
  metrics,
  primaryAction,
}: {
  metrics: Array<{ label: string; value: number }>;
  primaryAction?: { label: string; onClick?: () => void; href?: string };
}) {
  return (
    <div className="site00-fws-pulse">
      <div className="site00-fws-pulse__metrics">
        {metrics.map((m) => (
          <div key={m.label} className="site00-fws-pulse__metric">
            <span className="site00-fws-pulse__value">{m.value}</span>
            <span className="site00-fws-pulse__label">{m.label}</span>
          </div>
        ))}
      </div>
      {primaryAction ? (
        primaryAction.href ? (
          <Link to={primaryAction.href} className="site00-fws-pulse__cta">
            {primaryAction.label}
          </Link>
        ) : (
          <button type="button" className="site00-fws-pulse__cta" onClick={primaryAction.onClick ?? (() => {})}>
            {primaryAction.label}
          </button>
        )
      ) : null}
    </div>
  );
}

export function CreativeAssetCard({
  title,
  previewUrl,
  format,
  statusLabel,
  selected,
  onSelect,
  onReview,
}: {
  title: string;
  previewUrl: string | null;
  format: string;
  statusLabel: string;
  selected?: boolean;
  onSelect?: () => void;
  onReview?: () => void;
}) {
  return (
    <article
      className={`site00-fws-asset${selected ? ' site00-fws-asset--selected' : ''}`}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={onSelect ? (e) => e.key === 'Enter' && onSelect() : undefined}
    >
      <div className="site00-fws-asset__frame">
        {previewUrl ? (
          <img src={previewUrl} alt={title} className="site00-fws-asset__img" draggable={false} />
        ) : (
          <div className="site00-fws-asset__placeholder">{title.slice(0, 48)}</div>
        )}
      </div>
      <div className="site00-fws-asset__meta">
        <p className="site00-fws-asset__title">{title}</p>
        <p className="site00-fws-asset__format">{format}</p>
        <span className="site00-fws-asset__status">{statusLabel}</span>
        {onReview ? (
          <button
            type="button"
            className="site00-fws-asset__review"
            onClick={(e) => {
              e.stopPropagation();
              onReview();
            }}
          >
            REVIEW →
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function ExperimentBoard({
  artifacts,
  selectedId,
  onSelect,
}: {
  artifacts: Array<{ id: string; title: string; previewUrl: string | null; statusLabel: string }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="site00-fws-board" role="list">
      {artifacts.map((a) => (
        <CreativeAssetCard
          key={a.id}
          title={a.title}
          previewUrl={a.previewUrl}
          format="PAGE"
          statusLabel={a.statusLabel}
          selected={selectedId === a.id}
          onSelect={() => onSelect(a.id)}
        />
      ))}
    </div>
  );
}

export function VersionTimeline({
  entries,
}: {
  entries: ReadonlyArray<{ versionId: string; label: string; founderSummary: string; isCurrent: boolean }>;
}) {
  return (
    <ol className="site00-fws-version-timeline">
      {entries.map((e) => (
        <li key={e.versionId} className={e.isCurrent ? 'site00-fws-version-timeline__item--current' : undefined}>
          <span className="site00-fws-version-timeline__label">{e.label}</span>
          <span className="site00-fws-version-timeline__summary">{e.founderSummary}</span>
        </li>
      ))}
    </ol>
  );
}

export function ExperimentJourneyBar({
  stages,
  activeExperimentId,
  resolvePath,
}: {
  stages: ExperimentJourneyStageConfig[];
  activeExperimentId?: string;
  resolvePath: (experimentId: string) => string | null;
}) {
  return (
    <div className="site00-fws-journey">
      {stages.map((stage) => {
        const active = activeExperimentId ? stage.experimentIds.includes(activeExperimentId) : false;
        const firstPath = stage.experimentIds.map(resolvePath).find(Boolean);
        return (
          <div key={stage.stage} className={`site00-fws-journey__stage${active ? ' site00-fws-journey__stage--active' : ''}`}>
            <span className="site00-fws-journey__num">{String(stage.order).padStart(2, '0')}</span>
            <div className="site00-fws-journey__copy">
              <strong>{stage.title}</strong>
              <p>{stage.purpose}</p>
            </div>
            {firstPath ? (
              <Link to={firstPath} className="site00-fws-journey__enter">
                ENTER →
              </Link>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function FounderEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="site00-fws-empty">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export function CampaignDaySelector({
  days,
  selectedDay,
  onSelect,
}: {
  days: Array<{ id: string; label: string; shortLabel: string }>;
  selectedDay: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="site00-fws-day-nav" role="tablist" aria-label="Campaign days">
      {days.map((d) => (
        <button
          key={d.id}
          type="button"
          role="tab"
          aria-selected={selectedDay === d.id}
          className={`site00-fws-day-nav__btn${selectedDay === d.id ? ' site00-fws-day-nav__btn--active' : ''}`}
          onClick={() => onSelect(d.id)}
        >
          {d.shortLabel}
        </button>
      ))}
    </div>
  );
}

export function ContentLane({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="site00-fws-lane">
      <header className="site00-fws-lane__head">
        <h3>{title}</h3>
        {action}
      </header>
      <div className="site00-fws-lane__body">{children}</div>
    </section>
  );
}
