import { Link } from 'react-router-dom';
import { EmptyState } from '../pages/Site00PagePrimitives';
import { useProjectIndex } from '../../hooks/useProjectIndex';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport';
import { useSite00 } from '../../state/Site00Context';
import { SITE00_ROUTES } from '../../config/routes';
import {
  ProjectIndexHeaderDesktop,
  ProjectIndexHeaderMobile,
  ProjectIndexFooterCta,
  ProjectIndexClientSimulationBanner,
} from './ProjectIndexHeader';
import { ProjectIndexSummary, ProjectIndexFilterChips, PROJECT_INDEX_FILTERS } from './ProjectIndexSummary';
import { ProjectIndexControls, deriveAvailableFilters } from './ProjectIndexControls';
import { ProjectIndexMobileCard } from './ProjectIndexMobileCard';
import { ProjectIndexDesktopRow } from './ProjectIndexDesktopRow';
import '../../styles/site00-project-index.css';

export function ProjectIndexPage() {
  const isWide = useSite00OriginWideViewport();
  const { isPreviewDesktop } = useSite00();
  const isDesktop = isPreviewDesktop || isWide;

  const {
    viewMode,
    items,
    allItems,
    summary,
    state,
    error,
    query,
    setQuery,
    filter,
    setFilter,
    sort,
    setSort,
    reload,
  } = useProjectIndex();

  const clientView = viewMode === 'CLIENT';

  const availableFilters = deriveAvailableFilters({
    clientView,
    hasFounder: allItems.some((i) => i.ownerType === 'FOUNDER'),
    hasClient: allItems.some((i) => i.ownerType === 'CLIENT'),
    hasPreLaunch: allItems.some((i) => i.status === 'PRE_LAUNCH'),
    hasLaunched: allItems.some((i) => i.status === 'LAUNCHED' || i.status === 'POST_LAUNCH'),
    hasOnHold: allItems.some((i) => i.isOnHold),
    hasArchived: allItems.some((i) => i.isArchived),
  });

  const clientSummary = clientView
    ? {
        total: items.length,
        active: items.filter((i) => !i.isArchived && !i.isOnHold).length,
      }
    : null;

  return (
    <div className="site00-pidx" data-site00-surface="projects-index" data-view-mode={viewMode}>
      <ProjectIndexClientSimulationBanner />

      {isDesktop ? (
        <ProjectIndexHeaderDesktop clientView={clientView} />
      ) : (
        <ProjectIndexHeaderMobile clientView={clientView} />
      )}

      <ProjectIndexSummary
        total={clientSummary?.total ?? summary.total}
        founderIndex={summary.founderIndex}
        clientProjects={summary.clientProjects}
        active={clientSummary?.active ?? summary.active}
        onHold={summary.onHold}
        archived={summary.archived}
        sourceLabel={summary.sourceLabel}
        clientView={clientView}
        compact={!isDesktop}
      />

      <ProjectIndexControls
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        showSort={isDesktop}
        showFilterButton={isDesktop}
        onFilterButtonClick={() => {
          const idx = PROJECT_INDEX_FILTERS.indexOf(filter);
          const next = PROJECT_INDEX_FILTERS[(idx + 1) % PROJECT_INDEX_FILTERS.length]!;
          if (availableFilters.includes(next)) setFilter(next);
        }}
      />

      <ProjectIndexFilterChips
        active={filter}
        onChange={setFilter}
        available={availableFilters}
        clientView={clientView}
      />

      {state === 'loading' ? (
        <p className="site00-pidx__loading">LOADING PROJECTS…</p>
      ) : state === 'error' ? (
        <div className="site00-pidx__error">
          <EmptyState
            title="PROJECT INDEX UNAVAILABLE"
            body={error ?? 'PROJECT DATA COULD NOT BE LOADED — NOT AN EMPTY PROJECT LIST.'}
          />
          <button type="button" className="site00-pidx__retry" onClick={reload}>
            RETRY →
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="site00-pidx__empty">
          <EmptyState
            title={clientView ? 'NO PROJECTS YET' : 'NO MATCHING PROJECTS'}
            body={clientView ? 'START A PROJECT TO BEGIN YOUR STUDIO EXPERIENCE.' : 'ADJUST SEARCH OR FILTERS.'}
          />
          {clientView ? (
            <Link to={SITE00_ROUTES.bldrStart} className="site00-pidx__empty-cta">
              START A PROJECT
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className={`site00-pidx-list site00-project-index-list${isDesktop ? ' site00-pidx-list--desktop' : ' site00-pidx-list--mobile'}`}>
          {items.map((item) =>
            isDesktop ? (
              <ProjectIndexDesktopRow key={item.projectId} item={item} />
            ) : (
              <ProjectIndexMobileCard key={item.projectId} item={item} />
            ),
          )}
        </ul>
      )}

      {isDesktop && !clientView ? <ProjectIndexFooterCta /> : null}

      {!isDesktop && !clientView ? (
        <div className="site00-pidx-mobile-cta">
          <Link to={SITE00_ROUTES.bldrState} className="site00-pidx-mobile-cta__btn">
            + NEW PROJECT
          </Link>
        </div>
      ) : null}
    </div>
  );
}
