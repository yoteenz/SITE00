/**
 * P0.VR.6 + Reference-Fidelity — Visual history timeline tab.
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

function timelineKind(label: string): 'upload' | 'detect' | 'crop' | 'approval' | 'replace' | 'default' {
  const u = label.toUpperCase();
  if (u.includes('UPLOAD')) return 'upload';
  if (u.includes('DETECT')) return 'detect';
  if (u.includes('CROP')) return 'crop';
  if (u.includes('APPROV') || u.includes('OUTPUT')) return 'approval';
  if (u.includes('REPLACE') || u.includes('LIVE')) return 'replace';
  return 'default';
}

function iconForKind(kind: ReturnType<typeof timelineKind>): string {
  switch (kind) {
    case 'upload':
      return '↑';
    case 'detect':
      return '◎';
    case 'crop':
      return '✓';
    case 'approval':
      return '▣';
    case 'replace':
      return '◉';
    default:
      return '·';
  }
}

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatTimeShort(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
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
      if (filter === 'APPROVALS') return label.includes('APPROV') || label.includes('OUTPUT');
      if (filter === 'REPLACEMENTS') return label.includes('REPLACE') || label.includes('LIVE');
      return true;
    });
  }, [activity, filter]);

  const totalItems = activity.length;

  return (
    <section className="site00-dw-v3-history" data-design-tab="history">
      <header className="site00-dw-v3-history__head">
        <div>
          <h2>HISTORY TIMELINE</h2>
          <p>TRACK PROGRESS FROM REFERENCE TO REALITY.</p>
        </div>
        <span className="site00-dw-v3-history__count">
          {totalItems} ITEM{totalItems === 1 ? '' : 'S'} IN THIS PROJECT
        </span>
      </header>

      <div className="site00-dw-v3-history__metrics">
        <div>
          <strong>{metrics.uploads}</strong>
          <span>UPLOADS</span>
        </div>
        <div>
          <strong>{metrics.detections}</strong>
          <span>DETECTIONS</span>
        </div>
        <div>
          <strong>{metrics.approvals}</strong>
          <span>APPROVALS</span>
        </div>
        <div>
          <strong>{metrics.replacements}</strong>
          <span>REPLACEMENTS</span>
        </div>
      </div>

      <div className="site00-dw-v3-chip-row site00-dw-v3-chip-row--scroll" role="group" aria-label="History filters">
        {HISTORY_FILTERS.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`site00-dw-v3-chip${filter === chip ? ' is-filled' : ''}`}
            onClick={() => setFilter(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <ol className="site00-dw-v3-timeline">
        {filtered.length ? (
          filtered.map((entry) => {
            const kind = timelineKind(entry.label);
            const expanded = expandedId === entry.id;
            const isApproval = kind === 'approval';
            const itemClass = [
              kind === 'upload' ? 'is-upload' : '',
              kind === 'approval' ? 'is-approval' : '',
              kind === 'replace' || entry.status === 'COMPLETE' ? 'is-success' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <li key={entry.id} className={`site00-dw-v3-timeline__item ${itemClass}`.trim()}>
                <button
                  type="button"
                  className="site00-dw-v3-timeline__row"
                  onClick={() => setExpandedId(expanded ? null : entry.id)}
                  aria-expanded={expanded}
                >
                  <span className="site00-dw-v3-timeline__icon">{iconForKind(kind)}</span>
                  <span className="site00-dw-v3-timeline__label">{entry.label.toUpperCase()}</span>
                  <time>{formatTimeShort(entry.timestamp)}</time>
                  <span className="site00-dw-v3-disclosure__chev" aria-hidden>
                    {expanded ? '▾' : '›'}
                  </span>
                </button>
                <p className="site00-dw-v3-timeline__sub">{entry.status.toUpperCase()} · {formatTime(entry.timestamp)}</p>
                {expanded && isApproval ? (
                  <div className="site00-dw-v3-timeline__detail">
                    <div className="site00-dw-v3-timeline__before-after">
                      <div>
                        <span>BEFORE</span>
                        <div className="site00-dw-v3-checkerboard" style={{ minHeight: 72 }}>
                          <span style={{ fontSize: 7 }}>SOURCE</span>
                        </div>
                      </div>
                      <span aria-hidden>→</span>
                      <div>
                        <span>AFTER</span>
                        <div className="site00-dw-v3-checkerboard" style={{ minHeight: 72 }}>
                          <span style={{ fontSize: 7 }}>FINAL</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 8, letterSpacing: '0.04em', margin: '0 0 8px' }}>
                      VERSION 1.0 · APPROVED BY {entry.actor.toUpperCase()}
                      <br />
                      NOTE: {entry.status === 'COMPLETE' ? 'READY FOR DEPLOYMENT.' : entry.status.toUpperCase()}
                    </p>
                    <div className="site00-dw-v3-timeline__detail-actions">
                      <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
                        👁 VIEW SNAPSHOT
                      </button>
                      <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
                        ↺ RESTORE VERSION
                      </button>
                    </div>
                  </div>
                ) : expanded ? (
                  <div className="site00-dw-v3-timeline__detail">
                    <p style={{ fontSize: 8, letterSpacing: '0.04em', margin: 0 }}>
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
