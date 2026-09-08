/**
 * B5.0R2 — Storyboard version history (failed attempts preserved).
 */

import type { B49R4PipelineResponse } from './types';

type Props = {
  b49r4: B49R4PipelineResponse | null;
  cinematicSequenceStatus?: string;
};

const STATUS_LABELS: Record<string, string> = {
  FAILED_STORYBOARD_STRUCTURE: 'FAILED STRUCTURE',
  FAILED_STORYBOARD_RENDER_MODE: 'FAILED RENDER MODE',
  FAILED_REEL_COHERENCE: 'FAILED REEL COHERENCE',
  FAILED_VISUAL_AUTHORITY_BINDING: 'FAILED AUTHORITY FIDELITY',
  PIPELINE_TEST_ONLY: 'PIPELINE TEST ONLY',
  STORYBOARD_REQUIRES_FOUNDER_DECISION: 'REQUIRES FOUNDER DECISION',
  AWAITING_FOUNDER_APPROVAL: 'AWAITING REVIEW',
};

function labelFor(status: string): string {
  return STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
}

export function HistoryPanel({ b49r4, cinematicSequenceStatus }: Props) {
  const current = b49r4?.finalCinematicStoryboard;
  const historical = [
    { id: '001', record: b49r4?.storyboard001Historical },
    { id: '002', record: b49r4?.storyboard002Historical },
    { id: '003', record: b49r4?.storyboard003Historical },
    { id: '004', record: b49r4?.storyboard004Historical },
    { id: '005', record: b49r4?.storyboard005Historical },
  ].filter((h) => h.record);

  return (
    <section className="site00-ee-history">
      <h2 className="site00-ee-history__title">STORYBOARD HISTORY</h2>

      {current ? (
        <article className="site00-ee-history__item site00-ee-history__item--current">
          <span className="site00-ee-history__badge site00-ee-history__badge--current">CURRENT</span>
          <h3>V{current.version.replace(/^v?0*/i, '')} · {current.storyboardSource === 'FOUNDER_SUPPLIED' ? 'FOUNDER SUPPLIED' : 'GENERATED'}</h3>
          <p>{labelFor(current.status)}</p>
        </article>
      ) : null}

      {cinematicSequenceStatus ? (
        <article className="site00-ee-history__item site00-ee-history__item--experiment">
          <span className="site00-ee-history__badge">EXPERIMENT</span>
          <h3>PRE-AUTHORITY CINEMATIC SEQUENCE</h3>
          <p>{cinematicSequenceStatus} · reference only</p>
        </article>
      ) : null}

      {historical.length === 0 ? (
        <p className="site00-ee-history__empty">No superseded storyboard records.</p>
      ) : (
        <ul className="site00-ee-history__list">
          {historical.map(({ id, record }) => (
            <li key={id} className="site00-ee-history__item">
              <span className="site00-ee-history__badge site00-ee-history__badge--failed">V{id}</span>
              <h3>{labelFor(record!.status)}</h3>
              {record!.failureReason ? <p className="site00-ee-history__reason">{record!.failureReason}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
