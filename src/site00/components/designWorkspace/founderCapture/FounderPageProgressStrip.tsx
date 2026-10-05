/**
 * P0.VR.8R3R5 — Horizontal page progress strip for active capture runs.
 */

import type { PageVisualIndexRow } from '../DesignPagesVisualIndex';
import { founderPageStatusLabel } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureFounderGuidance.js';

type Props = {
  rows: PageVisualIndexRow[];
  selectedScreenId: string;
  onSelect: (screenId: string) => void;
  resolveStatus: (row: PageVisualIndexRow) => string;
};

function stripIcon(status: string): string {
  const s = status.toUpperCase();
  if (s === 'CURRENT') return '✓';
  if (s === 'CAPTURING') return '◉';
  if (s === 'FAILED' || s === 'NEED REVIEW') return '!';
  if (s === 'QUEUED' || s === 'WAITING') return '○';
  return '○';
}

function shortPageName(row: PageVisualIndexRow): string {
  const name = row.displayName ?? row.screenId;
  return name.length > 12 ? `${name.slice(0, 10)}…` : name.toUpperCase();
}

export function FounderPageProgressStrip({ rows, selectedScreenId, onSelect, resolveStatus }: Props) {
  if (rows.length < 2) return null;

  return (
    <div className="site00-founder-capture__page-strip" role="list" aria-label="Page capture progress">
      {rows.slice(0, 12).map((row, idx) => {
        const raw = resolveStatus(row);
        const label = founderPageStatusLabel(raw);
        const isActive = row.screenId === selectedScreenId;
        return (
          <button
            key={row.screenId}
            type="button"
            role="listitem"
            className={`site00-founder-capture__page-strip-item${isActive ? ' is-active' : ''}${raw === 'CAPTURING' ? ' is-capturing' : ''}`}
            onClick={() => onSelect(row.screenId)}
          >
            <span className="site00-founder-capture__page-strip-idx">{String(idx + 1).padStart(2, '0')}</span>
            <span className="site00-founder-capture__page-strip-name">{shortPageName(row)}</span>
            <span className="site00-founder-capture__page-strip-icon" aria-label={label}>
              {stripIcon(raw)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
