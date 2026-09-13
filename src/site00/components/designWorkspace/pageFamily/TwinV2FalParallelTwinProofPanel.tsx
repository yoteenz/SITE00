/**
 * P0.VR.TWINV2.8 — Founder review pack: authority + blueprint twin + QA overlay (not build).
 */

import { useState } from 'react';
import type { ConceptDirectedTwinSession } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import type { FalParallelTwinProofBundle } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV28/types.js';
import { MINIMAL_TWIN_OVERLAY_ANCHORS } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV28/minimalTwinOverlayLayout.js';

type ViewMode = 'AUTHORITY' | 'BLUEPRINT' | 'SIDE_BY_SIDE' | 'OVERLAY';

type Props = {
  bundle: FalParallelTwinProofBundle;
};

export function TwinV2FalParallelTwinProofPanel({ bundle }: Props) {
  const [mode, setMode] = useState<ViewMode>('SIDE_BY_SIDE');
  const authUrl = bundle.authorityArtifact.storageUrl;
  const bpUrl = bundle.blueprintArtifact.storageUrl;
  const receipt = bundle.generationReceipt;
  const align = bundle.alignmentReceipt;

  return (
    <section className="site00-twin-v2-fal-proof" aria-label="FAL parallel twin proof">
      <header className="site00-twin-v2-fal-proof__header">
        <strong>FAL TWIN PROOF</strong>
        <span>{receipt.generationMode}</span>
        <span className={`site00-twin-v2-fal-proof__cap-${bundle.capabilityClassification}`}>
          {bundle.capabilityClassification.replace(/FAL_PARALLEL_TWIN_CAPABILITY_/, '')}
        </span>
      </header>
      <dl className="site00-twin-v2-fal-proof__meta">
        <div>
          <dt>compositionStateId</dt>
          <dd>{receipt.compositionStateId}</dd>
        </div>
        <div>
          <dt>Authority job</dt>
          <dd>{receipt.authorityJobRef.slice(0, 32)}…</dd>
        </div>
        <div>
          <dt>Blueprint job</dt>
          <dd>{receipt.blueprintJobRef.slice(0, 32)}…</dd>
        </div>
        <div>
          <dt>Objects</dt>
          <dd>{bundle.minimalState.objectIds.length}</dd>
        </div>
        <div>
          <dt>Alignment</dt>
          <dd>{align.status}</dd>
        </div>
      </dl>
      <div className="site00-twin-v2-fal-proof__tabs" role="tablist">
        {(['AUTHORITY', 'BLUEPRINT', 'SIDE_BY_SIDE', 'OVERLAY'] as ViewMode[]).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}>
            {m.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      <div className="site00-twin-v2-fal-proof__stage">
        {mode === 'AUTHORITY' ? (
          <img src={authUrl} alt="FAL authority visual" className="site00-twin-v2-fal-proof__img" />
        ) : null}
        {mode === 'BLUEPRINT' ? (
          <img src={bpUrl} alt="FAL blueprint twin visual" className="site00-twin-v2-fal-proof__img" />
        ) : null}
        {mode === 'SIDE_BY_SIDE' ? (
          <div className="site00-twin-v2-fal-proof__pair">
            <figure>
              <figcaption>Authority</figcaption>
              <img src={authUrl} alt="" />
            </figure>
            <figure>
              <figcaption>Blueprint twin</figcaption>
              <img src={bpUrl} alt="" />
            </figure>
          </div>
        ) : null}
        {mode === 'OVERLAY' ? (
          <div className="site00-twin-v2-fal-proof__overlay-wrap">
            <img src={authUrl} alt="" className="site00-twin-v2-fal-proof__img" />
            <img src={bpUrl} alt="" className="site00-twin-v2-fal-proof__overlay-bp" aria-hidden />
            {Object.entries(MINIMAL_TWIN_OVERLAY_ANCHORS).map(([objectId, box]) => (
              <div
                key={objectId}
                className="site00-twin-v2-fal-proof__overlay-box"
                title={objectId}
                style={{
                  left: `${box.x * 100}%`,
                  top: `${box.y * 100}%`,
                  width: `${box.w * 100}%`,
                  height: `${box.h * 100}%`,
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
      {bundle.assetProofs.length ? (
        <ul className="site00-twin-v2-fal-proof__assets">
          {bundle.assetProofs.map((p) => (
            <li key={p.objectId}>
              <code>{p.objectId}</code> — {p.status} — job {p.providerJobRef.slice(0, 20) || '—'}
            </li>
          ))}
        </ul>
      ) : null}
      <pre className="site00-twin-v2-fal-proof__trace">{bundle.providerTrace.join('\n')}</pre>
    </section>
  );
}

export type FalProofSessionProps = {
  session: ConceptDirectedTwinSession;
  onRunProof: () => void;
  running: boolean;
  error: string | null;
  bundle: FalParallelTwinProofBundle | null;
};

export function TwinV2FalParallelTwinProofControls({
  onRunProof,
  running,
  error,
  bundle,
}: Omit<FalProofSessionProps, 'session'>) {
  return (
    <div className="site00-twin-v2-fal-proof-controls">
      <button type="button" disabled={running} onClick={onRunProof}>
        {running ? 'FAL twin proof running…' : 'RUN FAL PARALLEL TWIN PROOF (v28)'}
      </button>
      <p className="site00-twin-v2-fal-proof-controls__hint">
        Capability sprint only — does not BUILD. Requires Railway FAL_KEY for live proof.
      </p>
      {error ? (
        <p className="site00-twin-v2-fal-proof-controls__error" role="alert">
          {error}
        </p>
      ) : null}
      {bundle ? <TwinV2FalParallelTwinProofPanel bundle={bundle} /> : null}
    </div>
  );
}
