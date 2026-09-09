/**
 * P0.VR.6 — Visual history timeline tab.
 */

import { useMemo, useState } from 'react';
import type { DesignWorkspaceActivityEntry } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2b/types.js';
import {
  HISTORY_FILTERS,
  type HistoryFilter,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/index.js';

type Props = {
  activity: DesignWorkspaceActivityEntry[];
  matrixSummary?: {
    uploads: number;
    detections: number;
    approvals: number;
    replacements: number;
  };
};

function iconForLabel(label: string): string {
  const u = label.toUpperCase();
  if (u.includes('UPLOAD')) return '↑';
  if (u.includes('DETECT')) return '◎';
  if (u.includes('CROP')) return '▢';
  if (u.includes('APPROV')) return '✓';
  if (u.includes('REPLACE') || u.includes('LIVE')) return '◉';
  return '·';
}

export function DesignHistoryTab({ activity, matrixSummary }: Props) {
  const [filter, setFilter] = useState<HistoryFilter>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const metrics = matrixSummary ?? {
    uploads: activity.filter((a) => a.label.toUpperCase().includes('UPLOAD')).length,
    detections: activity.filter((a) => a.label.toUpperCase().includes('DETECT')).length,
    approvals: activity.filter((a) => a.label.toUpperCase().includes('APPROV')).length,
    replacements: activity.filter((a) => a.label.toUpperCase().includes('REPLACE')).length,
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    return activity.filter((entry) => {
      const ts = new Date(entry.timestamp).getTime();
      const label = entry.label.toUpperCase();
      if (filter === 'TODAY') return now - ts < 86400_000;
      if (filter === 'THIS WEEK') return now - ts < 7 * 86400_000;
      if (filter === 'APPROVALS') return label.includes('APPROV');
      if (filter === 'REPLACEMENTS') return label.includes('REPLACE') || label.includes('LIVE');
      return true;
    });
  }, [activity, filter]);

  return (
    <section className="site00-dw-v3-history" data-design-tab="history">
      <header className="site00-dw-v3-history__head">
        <div>
          <h2>HISTORY TIMELINE</h2>
          <p>TRACK PROGRESS FROM REFERENCE TO REALITY.</p>
        </div>
        <span className="site00-dw-v3-history__count">
          {filtered.length} ITEM{filtered.length === 1 ? '' : 'S'} IN THIS PROJECT
        </span>
      </header>

      <div className="site00-dw-v3-history__metrics">
        <div>
          <strong>{String(metrics.uploads).padStart(2, '0')}</strong>
          <span>UPLOADS</span>
        </div>
        <div>
          <strong>{String(metrics.detections).padStart(2, '0')}</strong>
          <span>DETECTIONS</span>
        </div>
        <div>
          <strong>{String(metrics.approvals).padStart(2, '0')}</strong>
          <span>APPROVALS</span>
        </div>
        <div>
          <strong>{String(metrics.replacements).padStart(2, '0')}</strong>
          <span>REPLACEMENTS</span>
        </div>
      </div>

      <div className="site00-dw-v3-chip-row" role="group" aria-label="History filters">
        {HISTORY_FILTERS.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`site00-dw-v3-chip${filter === chip ? ' is-active' : ''}`}
            onClick={() => setFilter(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <ol className="site00-dw-v3-timeline">
        {filtered.length ? (
          filtered.map((entry) => {
            const expanded = expandedId === entry.id;
            return (
              <li key={entry.id} className={`site00-dw-v3-timeline__item${expanded ? ' is-expanded' : ''}`}>
                <button
                  type="button"
                  className="site00-dw-v3-timeline__row"
                  onClick={() => setExpandedId(expanded ? null : entry.id)}
                  aria-expanded={expanded}
                >
                  <span className="site00-dw-v3-timeline__icon">{iconForLabel(entry.label)}</span>
                  <span className="site00-dw-v3-timeline__label">{entry.label.toUpperCase()}</span>
                  <time>{new Date(entry.timestamp).toLocaleString()}</time>
                </button>
                {expanded ? (
                  <div className="site00-dw-v3-timeline__detail">
                    <p>
                      {entry.status.toUpperCase()} · BY {entry.actor.toUpperCase()}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })
        ) : (
          <li className="site00-dw-v3-timeline__empty">NO HISTORY EVENTS FOR THIS FILTER</li>
        )}
      </ol>
    </section>
  );
}
