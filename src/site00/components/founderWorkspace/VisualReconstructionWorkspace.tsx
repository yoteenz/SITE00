/**
 * P0.VR.1D — Visual Reconstruction Workspace UI.
 * Flow: upload → identify → decompose → build → compare → correct → approve
 */

import { useMemo, useState } from 'react';
import '../../styles/site00-visual-reconstruction.css';

export type VisualReconstructionWorkspaceStep =
  | 'UPLOAD'
  | 'IDENTIFY'
  | 'DECOMPOSE'
  | 'BUILD'
  | 'COMPARE'
  | 'CORRECT'
  | 'APPROVE';

export type VisualReconstructionWorkspaceProps = {
  route: string;
  referencePreviewUrl?: string | null;
  implementationPreviewUrl?: string | null;
  diffPreviewUrl?: string | null;
  overlayOpacity?: number;
  step?: VisualReconstructionWorkspaceStep;
  pixelMatchTier?: string | null;
  iteration?: number;
  onStepChange?: (step: VisualReconstructionWorkspaceStep) => void;
};

const STEPS: VisualReconstructionWorkspaceStep[] = [
  'UPLOAD',
  'IDENTIFY',
  'DECOMPOSE',
  'BUILD',
  'COMPARE',
  'CORRECT',
  'APPROVE',
];

const STEP_LABELS: Record<VisualReconstructionWorkspaceStep, string> = {
  UPLOAD: '01 · UPLOAD / SELECT REFERENCE',
  IDENTIFY: '02 · IDENTIFY SCREEN',
  DECOMPOSE: '03 · DECOMPOSE',
  BUILD: '04 · BUILD',
  COMPARE: '05 · COMPARE',
  CORRECT: '06 · CORRECT',
  APPROVE: '07 · APPROVE',
};

export function VisualReconstructionWorkspace({
  route,
  referencePreviewUrl,
  implementationPreviewUrl,
  diffPreviewUrl,
  overlayOpacity = 0.5,
  step = 'UPLOAD',
  pixelMatchTier,
  iteration = 0,
  onStepChange,
}: VisualReconstructionWorkspaceProps) {
  const [view, setView] = useState<'reference' | 'implementation' | 'overlay' | 'difference'>('overlay');
  const [opacity, setOpacity] = useState(overlayOpacity);

  const activeIndex = useMemo(() => STEPS.indexOf(step), [step]);

  return (
    <section className="site00-vr-workspace" data-visual-reconstruction="screenshot-first-pipeline">
      <header className="site00-vr-workspace__header">
        <p className="site00-vr-workspace__kicker">VISUAL RECONSTRUCTION · P0.VR.1D</p>
        <h2 className="site00-vr-workspace__title">SCREENSHOT-FIRST PIXEL MATCHING</h2>
        <p className="site00-vr-workspace__route">{route}</p>
        {pixelMatchTier ? (
          <p className="site00-vr-workspace__tier">
            MATCH TIER · {pixelMatchTier}
            {iteration > 0 ? ` · ITERATION ${iteration}` : ''}
          </p>
        ) : null}
      </header>

      <ol className="site00-vr-workspace__steps">
        {STEPS.map((s, index) => (
          <li key={s}>
            <button
              type="button"
              className={`site00-vr-workspace__step${index === activeIndex ? ' site00-vr-workspace__step--active' : ''}${index < activeIndex ? ' site00-vr-workspace__step--done' : ''}`}
              onClick={() => onStepChange?.(s)}
            >
              {STEP_LABELS[s]}
            </button>
          </li>
        ))}
      </ol>

      <div className="site00-vr-workspace__view-tabs">
        {(['reference', 'implementation', 'overlay', 'difference'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`site00-vr-workspace__tab${view === mode ? ' site00-vr-workspace__tab--active' : ''}`}
            onClick={() => setView(mode)}
          >
            {mode.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="site00-vr-workspace__compare">
        {view === 'reference' && referencePreviewUrl ? (
          <img src={referencePreviewUrl} alt="Reference" className="site00-vr-workspace__frame" />
        ) : null}
        {view === 'implementation' && implementationPreviewUrl ? (
          <img src={implementationPreviewUrl} alt="Implementation" className="site00-vr-workspace__frame" />
        ) : null}
        {view === 'difference' && diffPreviewUrl ? (
          <img src={diffPreviewUrl} alt="Difference map" className="site00-vr-workspace__frame" />
        ) : null}
        {view === 'overlay' ? (
          <div className="site00-vr-workspace__overlay-stack">
            {referencePreviewUrl ? (
              <img
                src={referencePreviewUrl}
                alt="Reference overlay"
                className="site00-vr-workspace__frame site00-vr-workspace__frame--under"
                style={{ opacity: 1 - opacity }}
              />
            ) : null}
            {implementationPreviewUrl ? (
              <img
                src={implementationPreviewUrl}
                alt="Implementation overlay"
                className="site00-vr-workspace__frame site00-vr-workspace__frame--over"
                style={{ opacity }}
              />
            ) : null}
            <label className="site00-vr-workspace__opacity">
              OVERLAY
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(opacity * 100)}
                onChange={(e) => setOpacity(Number(e.target.value) / 100)}
              />
            </label>
          </div>
        ) : null}
        {!referencePreviewUrl && !implementationPreviewUrl ? (
          <p className="site00-vr-workspace__empty">Upload an approved screenshot to begin reconstruction.</p>
        ) : null}
      </div>

      <p className="site00-vr-workspace__rule">
        Reference image stays in the loop until the coded implementation matches it. Text supports interpretation only.
      </p>
    </section>
  );
}
