import type { ProjectIndexFilter, ProjectIndexSort } from '../../hooks/useProjectIndex.js';

type ProjectIndexControlsProps = {
  query: string;
  onQueryChange: (value: string) => void;
  sort: ProjectIndexSort;
  onSortChange: (sort: ProjectIndexSort) => void;
  showSort?: boolean;
  showFilterButton?: boolean;
  onFilterButtonClick?: () => void;
};

const SORT_OPTIONS: { value: ProjectIndexSort; label: string }[] = [
  { value: 'LAST_UPDATED', label: 'LAST UPDATED' },
  { value: 'NAME', label: 'NAME' },
  { value: 'PROGRESS', label: 'PROGRESS' },
  { value: 'STATUS', label: 'STATUS' },
  { value: 'DATE_CREATED', label: 'DATE CREATED' },
];

export function ProjectIndexControls({
  query,
  onQueryChange,
  sort,
  onSortChange,
  showSort = true,
  showFilterButton = false,
  onFilterButtonClick,
}: ProjectIndexControlsProps) {
  return (
    <div className="site00-pidx-controls">
      <label className="site00-pidx-controls__search">
        <span className="site00-pidx-controls__search-icon" aria-hidden="true">
          ⌕
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="SEARCH PROJECTS..."
          className="site00-pidx-controls__search-input"
          aria-label="SEARCH PROJECTS"
        />
      </label>
      {showFilterButton ? (
        <button type="button" className="site00-pidx-controls__filter-btn" onClick={onFilterButtonClick}>
          FILTER
        </button>
      ) : null}
      {showSort ? (
        <label className="site00-pidx-controls__sort">
          <span className="site00-pidx-controls__sort-label">SORT:</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ProjectIndexSort)}
            className="site00-pidx-controls__sort-select"
            aria-label="SORT PROJECTS"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}

export function deriveAvailableFilters(args: {
  clientView: boolean;
  hasFounder: boolean;
  hasClient: boolean;
  hasPreLaunch: boolean;
  hasLaunched: boolean;
  hasOnHold: boolean;
  hasArchived: boolean;
}): ProjectIndexFilter[] {
  const out: ProjectIndexFilter[] = ['ALL'];
  if (!args.clientView && args.hasFounder) out.push('FOUNDER');
  if (args.hasClient) out.push('CLIENT');
  out.push('ACTIVE');
  if (args.hasPreLaunch) out.push('PRE_LAUNCH');
  if (args.hasLaunched) out.push('LAUNCHED');
  if (args.hasOnHold) out.push('ON_HOLD');
  if (args.hasArchived) out.push('ARCHIVED');
  return out;
}
