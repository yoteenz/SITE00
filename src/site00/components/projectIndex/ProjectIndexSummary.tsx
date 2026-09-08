import type { ProjectIndexFilter } from '../../hooks/useProjectIndex.js';

type ProjectIndexSummaryProps = {
  total: number;
  founderIndex: number;
  clientProjects: number;
  active: number;
  onHold: number;
  archived: number;
  sourceLabel: string;
  clientView: boolean;
  compact?: boolean;
};

export function ProjectIndexSummary({
  total,
  founderIndex,
  clientProjects,
  active,
  onHold,
  archived,
  sourceLabel,
  clientView,
  compact = false,
}: ProjectIndexSummaryProps) {
  if (clientView) {
    return (
      <div className={`site00-pidx-summary site00-pidx-summary--client${compact ? ' site00-pidx-summary--compact' : ''}`}>
        <div className="site00-pidx-summary__tile">
          <span className="site00-pidx-summary__value">{total}</span>
          <span className="site00-pidx-summary__label">YOUR PROJECTS</span>
        </div>
        <div className="site00-pidx-summary__tile">
          <span className="site00-pidx-summary__value">{active}</span>
          <span className="site00-pidx-summary__label">ACTIVE</span>
        </div>
      </div>
    );
  }

  const tiles = compact
    ? [
        { value: total, label: 'TOTAL PROJECTS' },
        { value: founderIndex, label: 'FOUNDER INDEX' },
        { value: clientProjects, label: 'CLIENT PROJECTS' },
        { value: sourceLabel, label: 'SOURCE' },
      ]
    : [
        { value: total, label: 'TOTAL PROJECTS' },
        { value: founderIndex, label: 'FOUNDER INDEX' },
        { value: clientProjects, label: 'CLIENT PROJECTS' },
        { value: active, label: 'ACTIVE', dot: 'green' as const },
        { value: onHold, label: 'ON HOLD', dot: 'amber' as const },
        { value: archived, label: 'ARCHIVED', dot: 'gray' as const },
      ];

  return (
    <div className={`site00-pidx-summary${compact ? ' site00-pidx-summary--compact' : ''}`}>
      {tiles.map((tile) => (
        <div key={tile.label} className="site00-pidx-summary__tile">
          <span className="site00-pidx-summary__value">
            {'dot' in tile && tile.dot ? (
              <span className={`site00-pidx-status-dot site00-pidx-status-dot--${tile.dot}`} aria-hidden="true" />
            ) : null}
            {tile.value}
          </span>
          <span className="site00-pidx-summary__label">{tile.label}</span>
        </div>
      ))}
      {compact ? null : (
        <span className="site00-pidx-summary__live" aria-label="Data source">
          {sourceLabel}
        </span>
      )}
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
  available: ProjectIndexFilter[];
  clientView: boolean;
};

export function ProjectIndexFilterChips({ active, onChange, available, clientView }: ProjectIndexFilterChipsProps) {
  const filters = clientView
    ? available.filter((f) => !['FOUNDER', 'CLIENT'].includes(f))
    : available;

  return (
    <div className="site00-pidx-filters" role="toolbar" aria-label="PROJECT FILTERS">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          className={`site00-pidx-filters__chip${active === filter ? ' is-active' : ''}`}
          onClick={() => onChange(filter)}
          aria-pressed={active === filter}
        >
          {filter.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  );
}
