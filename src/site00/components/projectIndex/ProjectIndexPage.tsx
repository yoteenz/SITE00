import { Link } from 'react-router-dom';
import { EmptyState } from '../pages/Site00PagePrimitives';
import { useProjectIndex } from '../../hooks/useProjectIndex';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport';
import { useSite00 } from '../../state/Site00Context';
import { SITE00_ROUTES } from '../../config/routes';
import { ProjectsPageShell } from './ProjectsPageShell';
import { ProjectIndexDesignCard } from './ProjectIndexDesignCard';
import { ProjectIndexProjectCard } from './ProjectIndexProjectCard';
import { ProjectIndexNewProjectCard } from './ProjectIndexNewProjectCard';
import { ProjectIndexSkeletonGrid } from './ProjectIndexSkeleton';
import { resolveProjectsDesignItemForRender } from '../../../../shared/site00-projects/projectsViewDataAdapter.js';
import { PROJECT_INDEX_FILTERS } from './ProjectIndexSummary';
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
    <ul className="site00-pidx-grid" data-dynamic-region="project-card-content">
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
    viewData,
    designItem,
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

  const designRender = designItem
    ? resolveProjectsDesignItemForRender({ viewMode, designItem })
    : null;

  return (
    <div
      className={`site00-pidx${isDesktop ? ' site00-pidx--desktop' : ' site00-pidx--mobile'}`}
      data-site00-surface="projects-index"
      data-site00-shell="projects"
      data-site00-view-mode={viewMode.toLowerCase()}
    >
      <ProjectsPageShell
        isDesktop={isDesktop}
        summaryTiles={viewData.summaryTiles}
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        filter={filter}
        onFilterChange={setFilter}
        filterChips={viewData.filterChips}
        onFilterButtonClick={() => {
          const enabled = viewData.filterChips.filter((c) => !c.disabled).map((c) => c.filter);
          const idx = enabled.indexOf(filter);
          const next = enabled[(idx + 1) % enabled.length] ?? 'ALL';
          if (PROJECT_INDEX_FILTERS.includes(next as typeof filter)) {
            setFilter(next as typeof filter);
          }
        }}
      >
        {state === 'loading' ? (
          <ProjectIndexSkeletonGrid includeDesign={viewData.showDesignCard && !!designItem} />
        ) : (
          <>
            {viewData.showDesignCard && designRender ? (
              <ProjectIndexDesignCard item={designRender.item} interactive={designRender.interactive} />
            ) : null}

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

            {viewData.emptyState ? (
              <div className="site00-pidx__empty">
                <EmptyState title={viewData.emptyState.title} body={viewData.emptyState.body} />
                {viewData.emptyState.showStartCta ? (
                  <Link to={SITE00_ROUTES.bldrStart} className="site00-pidx__empty-cta">
                    START A PROJECT
                  </Link>
                ) : null}
              </div>
            ) : null}

            <ProjectIndexProjectGrid
              projectItems={viewData.projectItems}
              showNewProject={viewData.showNewProject}
            />
          </>
        )}
      </ProjectsPageShell>
    </div>
  );
}
