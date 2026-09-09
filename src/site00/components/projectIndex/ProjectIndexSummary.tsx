import type { ProjectIndexFilter } from '../../hooks/useProjectIndex.js';
import type { ProjectsSummaryTile } from '../../../../shared/site00-projects/projectsViewDataAdapter.js';

type ProjectIndexSummaryProps = {
  tiles: [ProjectsSummaryTile, ProjectsSummaryTile, ProjectsSummaryTile, ProjectsSummaryTile];
};

export function ProjectIndexSummary({ tiles }: ProjectIndexSummaryProps) {
  return (
    <div className="site00-pidx-summary" data-dynamic-region="metric-card-content">
      {tiles.map((tile) => (
        <SummaryTile key={tile.label} value={tile.value} label={tile.label} icon={tile.icon} />
      ))}
    </div>
  );
}

function SummaryTile({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: ProjectsSummaryTile['icon'];
}) {
  return (
    <div className="site00-pidx-summary__tile">
      <span className={`site00-pidx-summary__icon site00-pidx-summary__icon--${icon}`} aria-hidden="true" />
      <span className="site00-pidx-summary__value">{value}</span>
      <span className="site00-pidx-summary__label">{label}</span>
    </div>
  );
}

export const PROJECT_INDEX_FILTERS: ProjectIndexFilter[] = [
  'ALL',
  'FOUNDER',
  'CLIENT',
  'ACTIVE',
  'PRE_LAUNCH',
  'LAUNCHED',
  'ON_HOLD',
  'ARCHIVED',
];

type ProjectIndexFilterChipsProps = {
  active: ProjectIndexFilter;
  onChange: (filter: ProjectIndexFilter) => void;
  chips: Array<{ filter: string; disabled: boolean }>;
  allFilters: ProjectIndexFilter[];
};

export function ProjectIndexFilterChips({
  active,
  onChange,
  chips,
  allFilters,
}: ProjectIndexFilterChipsProps) {
  const chipMap = new Map(chips.map((c) => [c.filter, c.disabled]));

  return (
    <div className="site00-pidx-filters" role="toolbar" aria-label="PROJECT FILTERS">
      {allFilters.map((filter) => {
        const disabled = chipMap.get(filter) ?? true;
        return (
          <button
            key={filter}
            type="button"
            className={`site00-pidx-filters__chip${active === filter ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}
            onClick={() => !disabled && onChange(filter)}
            aria-pressed={active === filter}
            disabled={disabled}
            data-dynamic-region="filter-chip-active-state"
          >
            {filter.replace(/_/g, ' ')}
          </button>
        );
      })}
    </div>
  );
}
