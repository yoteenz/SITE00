/**
 * P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 — fullscreen artifact viewer.
 *
 * The one dark surface in the system, because a design artifact is judged
 * against neutral ground and the workspace's paper white would tint it. It
 * still carries the workspace's typography, chrome rules and metadata
 * grammar, plus the two controls inspection actually needs: fit and zoom.
 */

import { useEffect, useState } from 'react';

import type { DesignWorkspaceArtifactView } from '../../../../../shared/site00-design-workspace-production/types.js';

type Props = {
  artifact: DesignWorkspaceArtifactView;
  onClose: () => void;
};

const ZOOM_STEPS = [100, 150, 200, 300] as const;

export function DesignArtifactFullscreenViewer({ artifact, onClose }: Props) {
  const [zoom, setZoom] = useState<number | 'FIT'>('FIT');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="tod-dcs-fullscreen" data-testid="design-artifact-fullscreen">
      <header className="tod-dcs-fullscreen__head">
        <div>
          <p className="tod-dcs-fullscreen__meta">
            {artifact.role ? `${artifact.role.toUpperCase().replace(/-/g, ' ')} · ` : ''}
            {artifact.viewport ? `${artifact.viewport} · ` : ''}
            {artifact.version ?? ''}
          </p>
          <h2 className="tod-dcs-fullscreen__title">{artifact.title}</h2>
          {artifact.subtitle ? <p className="tod-dcs-fullscreen__sub">{artifact.subtitle}</p> : null}
        </div>
        <div className="tod-dcs-fullscreen__controls">
          <button
            type="button"
            className={`tod-dcs-fullscreen__zoom${zoom === 'FIT' ? ' is-on' : ''}`}
            onClick={() => setZoom('FIT')}
          >
            FIT
          </button>
          {ZOOM_STEPS.map((step) => (
            <button
              key={step}
              type="button"
              className={`tod-dcs-fullscreen__zoom${zoom === step ? ' is-on' : ''}`}
              onClick={() => setZoom(step)}
            >
              {step}%
            </button>
          ))}
          <button
            type="button"
            className="tod-dcs-fullscreen__zoom"
            onClick={onClose}
            aria-label="Close fullscreen"
          >
            ✕
          </button>
        </div>
      </header>
      <div className={`tod-dcs-fullscreen__stage${zoom === 'FIT' ? '' : ' is-zoomed'}`}>
        {artifact.src ?
          <img
            src={artifact.src}
            alt=""
            className="tod-dcs-fullscreen__img"
            style={zoom === 'FIT' ? undefined : { width: `${zoom}%`, maxHeight: 'none', maxWidth: 'none' }}
          />
        : <p className="tod-dcs-fullscreen__sub">No artifact file is attached to this record.</p>}
      </div>
    </div>
  );
}
