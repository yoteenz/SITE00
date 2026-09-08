/**
 * B5.3 — History expanded accordion (compact timeline table).
 */

import type { B49R4PipelineResponse } from './types';

type HistoryRow = {
  id: string;
  when: string;
  sprint: string;
  event: string;
  status: string;
};

type Props = {
  b49r4: B49R4PipelineResponse | null;
  cinematicSequenceStatus?: string;
  authorityApprovedAt?: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  FAILED_STORYBOARD_STRUCTURE: 'FAILED STRUCTURE',
  FAILED_STORYBOARD_RENDER_MODE: 'FAILED RENDER',
  FAILED_REEL_COHERENCE: 'REEL COHERENCE',
  FAILED_VISUAL_AUTHORITY_BINDING: 'AUTHORITY BINDING',
  PIPELINE_TEST_ONLY: 'TEST ONLY',
  STORYBOARD_REQUIRES_FOUNDER_DECISION: 'FOUNDER DECISION',
  AWAITING_FOUNDER_APPROVAL: 'AWAITING REVIEW',
  LOVE_IT: 'APPROVED',
};

function labelFor(status: string): string {
  return STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
}

function buildRows(props: Props): HistoryRow[] {
  const rows: HistoryRow[] = [];
  const { b49r4, cinematicSequenceStatus, authorityApprovedAt } = props;

  if (authorityApprovedAt) {
    rows.push({
      id: 'authorities',
      when: authorityApprovedAt.slice(0, 10),
      sprint: 'B48',
      event: 'Visual authorities approved',
      status: 'APPROVED',
    });
  }

  if (cinematicSequenceStatus) {
    rows.push({
      id: 'cinematic-seq',
      when: '—',
      sprint: 'B45',
      event: 'Pre-authority cinematic sequence experiment',
      status: labelFor(cinematicSequenceStatus),
    });
  }

  const historical = [
    { id: '001', record: b49r4?.storyboard001Historical },
    { id: '002', record: b49r4?.storyboard002Historical },
    { id: '003', record: b49r4?.storyboard003Historical },
    { id: '004', record: b49r4?.storyboard004Historical },
    { id: '005', record: b49r4?.storyboard005Historical },
  ].filter((h) => h.record);

  for (const { id, record } of historical) {
    rows.push({
      id: `sb-${id}`,
      when: '—',
      sprint: `V${id}`,
      event: record!.failureReason ?? `Storyboard attempt v${id}`,
      status: labelFor(record!.status),
    });
  }

  const current = b49r4?.finalCinematicStoryboard;
  if (current) {
    rows.unshift({
      id: 'current-sb',
      when: '—',
      sprint: current.version.replace(/^v?0*/i, 'v'),
      event:
        current.storyboardSource === 'FOUNDER_SUPPLIED'
          ? 'Founder storyboard imported'
          : 'Storyboard generation attempt',
      status: labelFor(current.status),
    });
  }

  if (rows.length === 0) {
    rows.push({
      id: 'empty',
      when: '—',
      sprint: '—',
      event: 'No historical records yet',
      status: 'PENDING',
    });
  }

  return rows.slice(0, 8);
}

export function ReferenceExpandedHistory(props: Props) {
  const rows = buildRows(props);

  return (
    <section className="site00-ee-ref-history">
      <div className="site00-ee-ref-history__head" aria-hidden>
        <span>DATE</span>
        <span>SPRINT</span>
        <span>EVENT</span>
        <span>STATUS</span>
      </div>
      <ul className="site00-ee-ref-history__list">
        {rows.map((row) => (
          <li key={row.id} className="site00-ee-ref-history__row">
            <span>{row.when}</span>
            <span>{row.sprint}</span>
            <span>{row.event}</span>
            <span className="site00-ee-ref-history__chip">{row.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
