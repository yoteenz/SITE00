/**
 * PROJECTS (mobile) — the founder's personal project portfolio.
 * Personal creative/business universes only; SITE 00 client/site work lives under Sites / services.
 * No Production tooling appears here: projects show status and send requests into Production.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProjectIndexItem } from '../../../../shared/site00-projects/projectIndexItem.js';
import { isSite00PlatformDesignIndexItem } from '../../../../shared/site00-projects/buildProjectIndexItems.js';
import { PW_IMG, projectImage } from '../production/productionImagery';
import { PwFrame } from '../production/PwFrame';
import { IconDots, PwTabs } from '../production/PwPrimitives';
import { ProjectActionsSheet } from './ProjectActionsSheet';

export function isPersonalProject(item: ProjectIndexItem): boolean {
  return item.ownerType === 'FOUNDER' && !isSite00PlatformDesignIndexItem(item);
}

export function projectStatusLabel(item: ProjectIndexItem): { label: string; blue: boolean } {
  switch (item.status) {
    case 'ACTIVE':
    case 'IN_PROGRESS':
      return { label: 'IN PRODUCTION', blue: true };
    case 'NOT_STARTED':
    case 'CONFIGURATION':
      return { label: 'PLANNING', blue: false };
    case 'PRE_LAUNCH':
      return { label: 'PRE-LAUNCH', blue: true };
    case 'LAUNCHED':
    case 'POST_LAUNCH':
      return { label: 'LIVE', blue: true };
    case 'ON_HOLD':
      return { label: 'ON HOLD', blue: false };
    case 'BLOCKED':
      return { label: 'BLOCKED', blue: false };
    case 'ARCHIVED':
      return { label: 'ARCHIVED', blue: false };
    default:
      return { label: String(item.status).replace(/_/g, ' '), blue: false };
  }
}

export function projectCoverImage(item: Pick<ProjectIndexItem, 'projectId' | 'projectImage'>): string | null {
  return projectImage(item.projectId) ?? item.projectImage;
}

type Tab = 'active' | 'archive' | 'ideas';

export function PersonalProjectsMobile({
  items,
  loading,
  error,
  onRetry,
}: {
  items: ProjectIndexItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const [tab, setTab] = useState<Tab>('active');
  const [menu, setMenu] = useState<ProjectIndexItem | null>(null);
  const personal = useMemo(() => items.filter(isPersonalProject), [items]);
  const active = personal.filter((i) => !i.isArchived);
  const archived = personal.filter((i) => i.isArchived);
  const shown = tab === 'active' ? active : tab === 'archive' ? archived : [];

  return (
    <PwFrame variant="projects" heroImage={PW_IMG.heroPortrait}>
      <main data-testid="personal-projects">
        <div className="pw-projects__hero">
          <h1 className="pw-projects__title">My Projects</h1>
          <p className="pw-projects__sub">Personal studio portfolio</p>
        </div>
        <PwTabs
          tabs={[
            { id: 'active', label: `Active ${active.length}` },
            { id: 'archive', label: 'Archive' },
            { id: 'ideas', label: 'Ideas' },
          ]}
          active={tab}
          onChange={setTab}
        />
        {loading ?
          <div className="pw-empty">LOADING PORTFOLIO…</div>
        : error ?
          <div className="pw-empty" data-testid="personal-projects-error">
            <strong>PROJECTS UNAVAILABLE</strong>
            {error}
            <div className="pw-cta">
              <button type="button" className="pw-btn pw-btn--ghost" onClick={onRetry}>
                Retry
              </button>
            </div>
          </div>
        : shown.length ?
          <ul className="pw-list" data-testid="personal-project-list">
            {shown.map((item) => {
              const st = projectStatusLabel(item);
              const cover = projectCoverImage(item);
              const pct = item.progress.percent;
              return (
                <li key={item.projectId} className="pw-pcard" data-testid="personal-project-card">
                  <Link to={item.openRoute} className="pw-pcard__link">
                    <span
                      className={`pw-pcard__thumb${cover ? '' : ' pw-pcard__thumb--blank'}`}
                      style={cover ? { backgroundImage: `url(${cover})` } : undefined}
                      aria-hidden
                    >
                      {cover ? null : item.projectInitials}
                    </span>
                    <span className="pw-pcard__body">
                      <span className="pw-pcard__name">{item.projectName}</span>
                      <span className="pw-pcard__desc">{item.descriptor ?? item.currentFocus ?? item.currentPhase}</span>
                      <span className={`pw-pcard__status${st.blue ? '' : ' pw-pcard__status--muted'}`}>{st.label}</span>
                      {pct != null ?
                        <span className="pw-pcard__progress">
                          <span className="pw-progress">
                            <i style={{ width: `${pct}%` }} />
                          </span>
                          <span className="pw-pcard__pct">{pct}%</span>
                        </span>
                      : null}
                    </span>
                  </Link>
                  <button type="button" className="pw-pcard__more" aria-label={`Actions for ${item.projectName}`} onClick={() => setMenu(item)} data-testid="project-more">
                    <IconDots />
                  </button>
                </li>
              );
            })}
          </ul>
        : (
          <div className="pw-empty">
            <strong>{tab === 'ideas' ? 'NO IDEAS YET' : tab === 'archive' ? 'NOTHING ARCHIVED' : 'NO ACTIVE PROJECTS'}</strong>
            {tab === 'ideas' ? 'FUTURE PERSONAL UNIVERSES WILL BE CAPTURED HERE.' : 'PERSONAL PROJECTS APPEAR HERE.'}
          </div>
        )}
      </main>
      <ProjectActionsSheet
        open={!!menu}
        projectSlug={menu?.projectId.toLowerCase() ?? ''}
        projectName={menu?.projectName ?? ''}
        onClose={() => setMenu(null)}
      />
    </PwFrame>
  );
}
