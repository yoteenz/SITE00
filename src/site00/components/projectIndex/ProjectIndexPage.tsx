import { Link } from 'react-router-dom';
import { EmptyState } from '../pages/Site00PagePrimitives';
import { useProjectIndex } from '../../hooks/useProjectIndex';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport';
import { useSite00 } from '../../state/Site00Context';
import { SITE00_ROUTES } from '../../config/routes';
import { ProjectIndexHero } from './ProjectIndexHero';
import { ProjectIndexViewStrip } from './ProjectIndexViewStrip';
import { ProjectIndexClientSimulationBanner } from './ProjectIndexHeader';
import { ProjectIndexSummary, ProjectIndexFilterChips, PROJECT_INDEX_FILTERS } from './ProjectIndexSummary';
import { ProjectIndexControls, deriveAvailableFilters } from './ProjectIndexControls';
import { ProjectIndexDesignCard } from './ProjectIndexDesignCard';
import { ProjectIndexProjectCard } from './ProjectIndexProjectCard';
import { ProjectIndexNewProjectCard } from './ProjectIndexNewProjectCard';
import { ProjectIndexSkeletonGrid } from './ProjectIndexSkeleton';
import '../../styles/site00-project-index.css';
import '../../styles/site00-auth.css';

function ProjectIndexProjectGrid({
  projectItems,
  showNewProject,
}: {
  projectItems: import('../../../../shared/site00-projects/projectIndexItem.js').ProjectIndexItem[];
  showNewProject: boolean;
}) {
  if (projectItems.length === 0 && !showNewProject) return null;

  return (
    <ul className="site00-pidx-grid">
      {projectItems.map((item) => (
        <ProjectIndexProjectCard key={item.projectId} item={item} />
      ))}
      {showNewProject ? <ProjectIndexNewProjectCard /> : null}
    </ul>
  );
}

export function ProjectIndexPage() {
  const isWide = useSite00OriginWideViewport();
  const { isPreviewDesktop } = useSite00();
  const isDesktop = isPreviewDesktop || isWide;

  const {
    viewMode,
    items: projectItems,
    designItem,
    allItems,
    metrics,
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
  const showNewProject = !clientView;

  const availableFilters = deriveAvailableFilters({
    clientView,
    hasFounder: allItems.some((i) => i.ownerType === 'FOUNDER'),
    hasClient: allItems.some((i) => i.ownerType === 'CLIENT'),
    hasPreLaunch: allItems.some((i) => i.status === 'PRE_LAUNCH'),
    hasLaunched: allItems.some((i) => i.status === 'LAUNCHED' || i.status === 'POST_LAUNCH'),
    hasOnHold: allItems.some((i) => i.isOnHold),
    hasArchived: allItems.some((i) => i.isArchived),
  });

  const clientActive = clientView
    ? projectItems.filter((i) => !i.isArchived && !i.isOnHold).length
    : 0;

  const showFilteredEmpty = state !== 'loading' && state !== 'error' && projectItems.length === 0;

  return (
    <div
      className={`site00-pidx${isDesktop ? ' site00-pidx--desktop' : ' site00-pidx--mobile'}`}
      data-site00-surface="projects-index"
      data-view-mode={viewMode}
    >
      <ProjectIndexClientSimulationBanner />

      <ProjectIndexHero clientView={clientView} />

      {!clientView ? <ProjectIndexViewStrip /> : null}

      <ProjectIndexSummary
        metrics={metrics}
        clientView={clientView}
        clientTotal={clientView ? projectItems.length : undefined}
        clientActive={clientActive}
      />

      <ProjectIndexControls
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        showSort={isDesktop}
        showFilterButton={!isDesktop}
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
        <ProjectIndexSkeletonGrid includeDesign={!clientView && !!designItem} />
      ) : (
        <>
          {!clientView && designItem ? <ProjectIndexDesignCard item={designItem} /> : null}

          {state === 'error' ? (
            <div className="site00-pidx__error">
              <EmptyState
                title="PROJECT INDEX UNAVAILABLE"
                body={
                  error ??
                  'PROJECT DATA COULD NOT BE LOADED — SITE 00 DESIGN WORKSPACE REMAINS AVAILABLE ABOVE.'
                }
              />
              <button type="button" className="site00-pidx__retry" onClick={reload}>
                RETRY →
              </button>
            </div>
          ) : null}

          {showFilteredEmpty ? (
            <div className="site00-pidx__empty">
              <EmptyState
                title={clientView ? 'NO PROJECTS YET' : 'NO MATCHING PROJECTS'}
                body={
                  clientView
                    ? 'START A PROJECT TO BEGIN YOUR STUDIO EXPERIENCE.'
                    : 'ADJUST SEARCH OR FILTERS.'
                }
              />
              {clientView ? (
                <Link to={SITE00_ROUTES.bldrStart} className="site00-pidx__empty-cta">
                  START A PROJECT
                </Link>
              ) : null}
            </div>
          ) : null}

          <ProjectIndexProjectGrid projectItems={projectItems} showNewProject={showNewProject} />
        </>
      )}
    </div>
  );
}
