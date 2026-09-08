/**
 * B5.0 — Creative history (superseded / failed assets).
 */

import type { B49R4PipelineResponse } from './types';

type Props = {
  b49r4: B49R4PipelineResponse | null;
  cinematicSequenceStatus?: string;
};

export function HistoryPanel({ b49r4, cinematicSequenceStatus }: Props) {
  const historical = [
    { id: '001', record: b49r4?.storyboard001Historical },
    { id: '002', record: b49r4?.storyboard002Historical },
    { id: '003', record: b49r4?.storyboard003Historical },
    { id: '004', record: b49r4?.storyboard004Historical },
  ].filter((h) => h.record);

  return (
    <section className="site00-ee-history">
      <h2 className="site00-ee-history__title">CREATIVE HISTORY</h2>

      {cinematicSequenceStatus ? (
        <article className="site00-ee-history__item site00-ee-history__item--experiment">
          <span className="site00-ee-history__badge">EXPERIMENT</span>
          <h3>PRE-AUTHORITY CINEMATIC SEQUENCE</h3>
          <p>{cinematicSequenceStatus} · reference only · not visual authority</p>
        </article>
      ) : null}

      {historical.length === 0 ? (
        <p className="site00-ee-history__empty">No superseded storyboard records.</p>
      ) : (
        <ul className="site00-ee-history__list">
          {historical.map(({ id, record }) => (
            <li key={id} className="site00-ee-history__item">
              <span className="site00-ee-history__badge site00-ee-history__badge--failed">FAILED</span>
              <h3>STORYBOARD {id}</h3>
              <p>{record!.status}</p>
              {record!.failureReason ? <p className="site00-ee-history__reason">{record!.failureReason}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
