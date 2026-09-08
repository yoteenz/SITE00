import type { ProjectIndexFilter } from '../../hooks/useProjectIndex.js';
import type { ProjectIndexSummaryMetrics } from '../../../../shared/site00-projects/projectIndexMetrics.js';

type ProjectIndexSummaryProps = {
  metrics: ProjectIndexSummaryMetrics;
  clientView: boolean;
  clientActive?: number;
  clientTotal?: number;
};

export function ProjectIndexSummary({
  metrics,
  clientView,
  clientActive = 0,
  clientTotal = 0,
}: ProjectIndexSummaryProps) {
  if (clientView) {
    return (
      <div className="site00-pidx-summary site00-pidx-summary--client">
        <SummaryTile value={String(clientTotal).padStart(2, '0')} label="YOUR PROJECTS" icon="stack" />
        <SummaryTile value={String(clientActive).padStart(2, '0')} label="ACTIVE" icon="pulse" />
      </div>
    );
  }

  return (
    <div className="site00-pidx-summary">
      <SummaryTile value={String(metrics.total).padStart(2, '0')} label="TOTAL PROJECTS" icon="stack" />
      <SummaryTile value={String(metrics.active).padStart(2, '0')} label="ACTIVE" icon="pulse" />
      <SummaryTile value={String(metrics.preLaunch).padStart(2, '0')} label="PRE LAUNCH" icon="orbit" />
      <SummaryTile value={String(metrics.complete).padStart(2, '0')} label="COMPLETE" icon="check" />
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
  icon: 'stack' | 'pulse' | 'orbit' | 'check';
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
