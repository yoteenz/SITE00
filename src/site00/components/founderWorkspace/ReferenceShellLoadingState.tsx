/**
 * P0.VR.1D.12 — Reference-shell loading content inside current geometry.
 * Skeleton placeholders match reconstructed mobile screen regions — never legacy shell markup.
 */

import type { CSSProperties } from 'react';
import type { NdxReconstructedMobileScreenId } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr1d12/client.js';
import { CURRENT_VISUAL_SHELL_VERSION } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr1d12/client.js';

type Props = {
  screenId: NdxReconstructedMobileScreenId;
  label?: string;
};

function SkeletonBlock({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={`site00-ref-shell-loading__block${className ? ` ${className}` : ''}`} style={style} />;
}

function Experiment01Skeleton() {
  return (
    <div className="site00-ref-shell-loading site00-ref-shell-loading--experiment-01">
      <SkeletonBlock className="site00-ref-shell-loading__breadcrumb" />
      <div className="site00-ref-shell-loading__title-row">
        <SkeletonBlock className="site00-ref-shell-loading__title" />
        <SkeletonBlock className="site00-ref-shell-loading__badge" />
      </div>
      <SkeletonBlock className="site00-ref-shell-loading__subject" />
      <div className="site00-ref-shell-loading__metrics">
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonBlock key={i} className="site00-ref-shell-loading__metric" />
        ))}
      </div>
      <div className="site00-ref-shell-loading__grid" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <SkeletonBlock key={i} className="site00-ref-shell-loading__grid-cell" />
        ))}
      </div>
      <div className="site00-ref-shell-loading__direction">
        <SkeletonBlock className="site00-ref-shell-loading__direction-heading" />
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonBlock key={i} className="site00-ref-shell-loading__direction-row" />
        ))}
      </div>
    </div>
  );
}

function GenericShellSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="site00-ref-shell-loading site00-ref-shell-loading--generic">
      <SkeletonBlock className="site00-ref-shell-loading__title" />
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonBlock key={i} className="site00-ref-shell-loading__row" style={{ width: `${92 - i * 8}%` }} />
      ))}
    </div>
  );
}

function CampaignBoardSkeleton() {
  return (
    <div className="site00-ref-shell-loading site00-ref-shell-loading--campaign-board">
      <SkeletonBlock className="site00-ref-shell-loading__breadcrumb" />
      <SkeletonBlock className="site00-ref-shell-loading__title-block" />
      <div className="site00-ref-shell-loading__status-card">
        <SkeletonBlock className="site00-ref-shell-loading__status-col" />
        <SkeletonBlock style={{ width: 1, height: '100%' }} />
        <SkeletonBlock className="site00-ref-shell-loading__status-col" />
      </div>
      <div className="site00-ref-shell-loading__schedule">
        {Array.from({ length: 7 }, (_, i) => (
          <SkeletonBlock key={i} className="site00-ref-shell-loading__schedule-cell" />
        ))}
      </div>
      <div className="site00-ref-shell-loading__pages-lane">
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonBlock key={i} className="site00-ref-shell-loading__page-card" />
        ))}
      </div>
      <SkeletonBlock className="site00-ref-shell-loading__motion-card" />
      <div className="site00-ref-shell-loading__quick-grid">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonBlock key={i} className="site00-ref-shell-loading__quick-cell" />
        ))}
      </div>
    </div>
  );
}

export function ReferenceShellLoadingState({ screenId, label }: Props) {
  const statusLabel =
    label ??
    (screenId === 'experiment-01'
      ? 'LOADING EXPERIMENT 01…'
      : screenId === 'campaign-board'
        ? 'LOADING CAMPAIGN BOARD…'
        : 'LOADING…');

  return (
    <div
      className="site00-ref-shell-loading-wrap"
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-visual-shell-version={CURRENT_VISUAL_SHELL_VERSION}
      data-reference-shell-loading={screenId}
    >
      <p className="site00-ref-shell-loading-wrap__label">{statusLabel}</p>
      {screenId === 'experiment-01' ? (
        <Experiment01Skeleton />
      ) : screenId === 'campaign-board' ? (
        <CampaignBoardSkeleton />
      ) : (
        <GenericShellSkeleton />
      )}
    </div>
  );
}
