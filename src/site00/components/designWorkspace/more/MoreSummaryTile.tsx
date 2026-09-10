/**
 * P0.VR.MOF.R2 — Compact summary card for MORE child pages.
 */

import type { ReactNode } from 'react';
import type { MoreSummaryTone } from './moreStatus';

export type MoreSummaryTileProps = {
  label: string;
  value: string;
  tone?: MoreSummaryTone;
};

export function MoreSummaryTile({ label, value, tone = 'neutral' }: MoreSummaryTileProps) {
  return (
    <div className={`site00-dw-more-tool__summary-tile is-${tone}`}>
      <span className="site00-dw-more-tool__summary-label">{label}</span>
      <strong className="site00-dw-more-tool__summary-value">{value}</strong>
    </div>
  );
}

export function MoreSummaryGrid({ children }: { children: ReactNode }) {
  return <div className="site00-dw-more-tool__summary-grid">{children}</div>;
}
