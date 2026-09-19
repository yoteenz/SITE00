/**
 * P0.VR.DESIGNBENCH.OPUS-VIEWMODE1R1 — CANONICAL / LIST view-mode control.
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 — Opus + Grok agents on the left; no redundant VIEW label.
 */

import { useRef } from 'react';

import { DesignWorkspaceAgentButtons } from './DesignWorkspaceAgentButtons';
import {
  TWIN_OPUS_DIRECT_VIEW_MODES,
  TWIN_OPUS_DIRECT_VIEW_MODE_LABELS,
  type TwinOpusDirectViewMode,
} from './twinOpusDirectWorkspace';

interface TwinOpusDirectViewModeControlProps {
  mode: TwinOpusDirectViewMode;
  onChange: (mode: TwinOpusDirectViewMode) => void;
}

export function TwinOpusDirectViewModeControl({ mode, onChange }: TwinOpusDirectViewModeControlProps) {
  const groupRef = useRef<HTMLDivElement | null>(null);

  const moveSelection = (delta: number) => {
    const index = TWIN_OPUS_DIRECT_VIEW_MODES.indexOf(mode);
    const next = TWIN_OPUS_DIRECT_VIEW_MODES[
      (index + delta + TWIN_OPUS_DIRECT_VIEW_MODES.length) % TWIN_OPUS_DIRECT_VIEW_MODES.length
    ];
    onChange(next);
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons?.[TWIN_OPUS_DIRECT_VIEW_MODES.indexOf(next)]?.focus();
  };

  return (
    <div className="tod-viewrow">
      <DesignWorkspaceAgentButtons />
      <div
        ref={groupRef}
        className="tod-viewmode__group"
        role="radiogroup"
        aria-label="Presentation view mode"
      >
        {TWIN_OPUS_DIRECT_VIEW_MODES.map((candidate) => {
          const active = candidate === mode;
          return (
            <button
              key={candidate}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              className={`tod-viewmode__cell${active ? ' is-active' : ''}`}
              aria-label={TWIN_OPUS_DIRECT_VIEW_MODE_LABELS[candidate]}
              title={TWIN_OPUS_DIRECT_VIEW_MODE_LABELS[candidate]}
              onClick={() => onChange(candidate)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                  event.preventDefault();
                  moveSelection(1);
                } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  moveSelection(-1);
                }
              }}
            >
              <span className="tod-viewmode__icon" aria-hidden="true">
                {candidate === 'canonical' ?
                  <svg viewBox="0 0 16 16" focusable="false">
                    <rect x="1.5" y="1.5" width="13" height="13" />
                    <line x1="1.5" y1="5.5" x2="14.5" y2="5.5" />
                    <line x1="6" y1="5.5" x2="6" y2="14.5" />
                  </svg>
                : <svg viewBox="0 0 16 16" focusable="false">
                    <line x1="1.5" y1="4" x2="14.5" y2="4" />
                    <line x1="1.5" y1="8" x2="14.5" y2="8" />
                    <line x1="1.5" y1="12" x2="14.5" y2="12" />
                  </svg>
                }
              </span>
              <span className="tod-viewmode__sr">{TWIN_OPUS_DIRECT_VIEW_MODE_LABELS[candidate]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
