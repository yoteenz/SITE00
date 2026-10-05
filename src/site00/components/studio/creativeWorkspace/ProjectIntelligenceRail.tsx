import type { WorkspaceCreativeDirectorSnapshot } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import type { CreativeThread } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import type { RuntimeStatus } from '../../../services/experienceCompilerCreativeDirectorApi';

type Props = {
  snapshot: WorkspaceCreativeDirectorSnapshot;
  thread: CreativeThread | null;
  runtime: RuntimeStatus | null;
  expanded: boolean;
  onToggleExpand: () => void;
  onLoadContext: () => void;
  contextManifest: string;
};

export function ProjectIntelligenceRail({
  snapshot,
  thread,
  runtime,
  expanded,
  onToggleExpand,
  onLoadContext,
  contextManifest,
}: Props) {
  const intel = snapshot.intelligence_summary;
  return (
    <aside className="ec-cw-rail ec-cw-rail--intel" aria-label="Project intelligence">
      <h2 className="ec-cw-rail__title">Project intelligence</h2>
      <dl className="ec-cw-dl">
        <dt>Project</dt>
        <dd>{snapshot.project_name}</dd>
        <dt>Brand</dt>
        <dd>{String(intel.brand_name ?? '—')}</dd>
        <dt>Mode</dt>
        <dd>{snapshot.mode}</dd>
        <dt>Stage</dt>
        <dd>{snapshot.phase_label}</dd>
        <dt>Task mode</dt>
        <dd>{thread?.task_mode ?? 'CONCEPT_TERRITORIES'}</dd>
        <dt>Founder gate</dt>
        <dd>{snapshot.open_founder_gates.join(', ') || '—'}</dd>
        <dt>Experience family</dt>
        <dd>{snapshot.active_experience_family ?? '—'}</dd>
        <dt>Approved authorities</dt>
        <dd>{snapshot.approved_authority_count}</dd>
        <dt>Context pack</dt>
        <dd>{thread?.last_context_pack_id ? 'Compiled' : 'Not compiled'}</dd>
        <dt>Runtime</dt>
        <dd>{runtime?.runtime_state ?? (runtime?.configured ? 'READY' : 'BLOCKED')}</dd>
      </dl>
      <button type="button" className="ec-cw-btn ec-cw-btn--ghost" onClick={onToggleExpand}>
        {expanded ? 'Collapse references' : 'Expand brand & pipeline'}
      </button>
      {expanded ? (
        <div className="ec-cw-rail__expand">
          <p><strong>Creative appetite</strong> {String(intel.creative_appetite ?? '—')}</p>
          <p><strong>Audience</strong> {String(intel.audience ?? '—')}</p>
          <p><strong>Constraints</strong> {String(intel.constraints ?? '—')}</p>
          <button type="button" className="ec-cw-btn ec-cw-btn--ghost" onClick={onLoadContext}>
            Load context manifest (debug)
          </button>
          {contextManifest ? <pre className="ec-cw-run-details">{contextManifest}</pre> : null}
        </div>
      ) : null}
    </aside>
  );
}
