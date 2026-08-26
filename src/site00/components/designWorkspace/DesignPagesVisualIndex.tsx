/**
 * P0.VR.3E — Visual page index with implementation thumbnails.
 */

import type { DesignViewportClass } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';

export type PageVisualIndexRow = {
  screenId: string;
  displayName: string;
  routeFamily?: string;
  mobile: { publicUrl: string | null; status: string } | null;
  tablet: { publicUrl: string | null; status: string } | null;
  desktop: { publicUrl: string | null; status: string } | null;
  missingImplementation?: boolean;
};

type Props = {
  rows: PageVisualIndexRow[];
  selectedScreenId: string;
  filter: string;
  onSelectScreen: (screenId: string) => void;
  onFilterChange: (filter: string) => void;
};

const FILTERS = ['ALL', 'HAS SCREENSHOT', 'MISSING SCREENSHOT', 'STALE', 'BROKEN'] as const;

function thumbCell(snap: PageVisualIndexRow['mobile'], label: DesignViewportClass) {
  if (!snap?.publicUrl || snap.status !== 'CURRENT') {
    return <span className="site00-dw-pages__thumb-empty">{label.slice(0, 1).toUpperCase()}</span>;
  }
  return <img src={snap.publicUrl} alt={`${label} current`} className="site00-dw-pages__thumb" />;
}

export function DesignPagesVisualIndex({ rows, selectedScreenId, filter, onSelectScreen, onFilterChange }: Props) {
  const filtered = rows.filter((row) => {
    if (filter === 'ALL') return true;
    const hasAny = [row.mobile, row.tablet, row.desktop].some((s) => s?.status === 'CURRENT' && s.publicUrl);
    const anyStale = [row.mobile, row.tablet, row.desktop].some((s) => s?.status === 'STALE');
    const anyFailed = [row.mobile, row.tablet, row.desktop].some((s) => s?.status === 'FAILED');
    if (filter === 'HAS SCREENSHOT') return hasAny;
    if (filter === 'MISSING SCREENSHOT') return !hasAny && !row.missingImplementation;
    if (filter === 'STALE') return anyStale;
    if (filter === 'BROKEN') return anyFailed;
    return true;
  });

  return (
    <section className="site00-dw-pages" data-visual-reconstruction="p0vr3e-pages-index">
      <header className="site00-dw-pages__head">
        <h2>PAGES — VISUAL INDEX</h2>
        <label>
          Filter
          <select value={filter} onChange={(e) => onFilterChange(e.target.value)}>
            {FILTERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
      </header>
      <div className="site00-dw-pages__grid">
        {filtered.map((row) => (
          <button
            key={row.screenId}
            type="button"
            className={`site00-dw-pages__card${row.screenId === selectedScreenId ? ' is-selected' : ''}`}
            onClick={() => onSelectScreen(row.screenId)}
          >
            <strong>{row.displayName}</strong>
            <span className="site00-dw-pages__family">{row.routeFamily ?? 'OTHER'}</span>
            <div className="site00-dw-pages__thumbs">
              {thumbCell(row.mobile, 'mobile')}
              {thumbCell(row.tablet, 'tablet')}
              {thumbCell(row.desktop, 'desktop')}
            </div>
            {row.missingImplementation ? <em className="site00-dw-pages__missing">IMPLEMENTATION MISSING</em> : null}
          </button>
        ))}
      </div>
    </section>
  );
}
