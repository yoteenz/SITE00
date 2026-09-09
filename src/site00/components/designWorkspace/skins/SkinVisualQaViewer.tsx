/**
 * Visual QA workspace — mobile mode switcher, desktop multi-pane.
 */

import { useState } from 'react';
import { VISUAL_QA_MODES, type VisualQaMode } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsChildSurface.js';
import { SkinDriftSummary, type DriftFinding } from './SkinDriftSummary.js';

type Props = {
  referenceUrl?: string | null;
  liveUrl?: string | null;
  overlayUrl?: string | null;
  diffUrl?: string | null;
  matchStatus?: 'DRIFT' | 'HIGH_MATCH' | 'VERIFIED';
  majorCount?: number;
  minorCount?: number;
  findings?: DriftFinding[];
  iteration?: number;
  maxIterations?: number;
  onRunCorrection?: () => void;
  onAcceptMatch?: () => void;
  layout?: 'mobile' | 'desktop';
};

function PreviewPane({ label, url }: { label: string; url?: string | null }) {
  return (
    <div className="site00-dw-skins-qa__pane">
      <span className="site00-dw-skins-qa__pane-label">{label}</span>
      <div className="site00-dw-skins-qa__pane-visual">
        {url ? <img src={url} alt="" /> : <span>{label}</span>}
      </div>
    </div>
  );
}

export function SkinVisualQaViewer({
  referenceUrl,
  liveUrl,
  overlayUrl,
  diffUrl,
  matchStatus = 'DRIFT',
  majorCount = 0,
  minorCount = 0,
  findings = [],
  iteration = 1,
  maxIterations = 3,
  onRunCorrection,
  onAcceptMatch,
  layout = 'mobile',
}: Props) {
  const [mode, setMode] = useState<VisualQaMode>('REFERENCE');

  const modeUrl: Record<VisualQaMode, string | null | undefined> = {
    REFERENCE: referenceUrl,
    LIVE: liveUrl,
    OVERLAY: overlayUrl,
    DIFF: diffUrl,
  };

  if (layout === 'desktop') {
    return (
      <div className="site00-dw-skins-qa site00-dw-skins-qa--desktop">
        <div className="site00-dw-skins-qa__grid">
          <PreviewPane label="REFERENCE" url={referenceUrl} />
          <PreviewPane label="LIVE" url={liveUrl} />
          <PreviewPane label="OVERLAY" url={overlayUrl} />
          <PreviewPane label="DIFF" url={diffUrl} />
        </div>
        <SkinDriftSummary
          majorCount={majorCount}
          minorCount={minorCount}
          findings={findings}
          iteration={iteration}
          maxIterations={maxIterations}
          matchStatus={matchStatus}
          onRunCorrection={onRunCorrection}
          onAcceptMatch={onAcceptMatch}
        />
      </div>
    );
  }

  return (
    <div className="site00-dw-skins-qa site00-dw-skins-qa--mobile">
      <div className="site00-dw-skins-qa__modes" role="group" aria-label="Comparison mode">
        {VISUAL_QA_MODES.map((m) => (
          <button key={m} type="button" className={mode === m ? 'is-active' : ''} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>
      <PreviewPane label={mode} url={modeUrl[mode]} />
      <SkinDriftSummary
        majorCount={majorCount}
        minorCount={minorCount}
        findings={findings}
        iteration={iteration}
        maxIterations={maxIterations}
        matchStatus={matchStatus}
        onRunCorrection={onRunCorrection}
        onAcceptMatch={onAcceptMatch}
      />
    </div>
  );
}
