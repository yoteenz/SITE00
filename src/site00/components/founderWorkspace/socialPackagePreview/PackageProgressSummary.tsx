/**
 * B5.8 — Package progress summary.
 */

import type { SocialFormatPreviewModel } from './types.js';
import { formatStatusLabel } from './buildSocialPreviewModel.js';

type Props = {
  completeCount: number;
  totalCount: number;
  formats: SocialFormatPreviewModel[];
  compact?: boolean;
};

export function PackageProgressSummary({ completeCount, totalCount, formats, compact }: Props) {
  const pct = totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0;

  return (
    <div className={`site00-spp-progress${compact ? ' site00-spp-progress--compact' : ''}`}>
      <div className="site00-spp-progress__head">
        <span className="site00-spp-progress__count">
          {completeCount} / {totalCount} FORMATS COMPLETE
        </span>
        {!compact && <span className="site00-spp-progress__pct">{pct}%</span>}
      </div>
      <div className="site00-spp-progress__bar" role="progressbar" aria-valuenow={completeCount} aria-valuemin={0} aria-valuemax={totalCount}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <ul className="site00-spp-progress__formats">
        {formats.map((f) => (
          <li key={f.formatFamily} className={f.complete ? 'is-complete' : f.status === 'NOT_STARTED' ? 'is-pending' : 'is-active'}>
            <span className="site00-spp-progress__dot" aria-hidden />
            <span>{f.shortLabel}</span>
            <span className="site00-spp-progress__status">{formatStatusLabel(f.status)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
