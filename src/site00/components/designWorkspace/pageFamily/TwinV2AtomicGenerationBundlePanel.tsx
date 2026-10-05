/**
 * P0.VR.TWINV2.9 — Atomic bundle founder review (no BUILD).
 */

import { useState } from 'react';
import type { AtomicCreativeGenerationResult } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV29/types.js';

type ReviewMode = 'VISUAL' | 'BLUEPRINT_TWIN' | 'OVERLAY' | 'OBJECT_DATA' | 'ASSETS' | 'FUNCTIONS';

type Props = {
  result: AtomicCreativeGenerationResult;
};

export function TwinV2AtomicGenerationBundlePanel({ result }: Props) {
  const [mode, setMode] = useState<ReviewMode>('VISUAL');
  const authUrl = result.authorityArtifact.storageUrl;
  const bpUrl = result.blueprintTwinArtifact.storageUrl;

  return (
    <section className="site00-twin-v2-atomic-bundle" aria-label="Atomic generation bundle">
      <header className="site00-twin-v2-fal-proof__header">
        <strong>ATOMIC BUNDLE</strong>
        <span>{result.bundle.generationBundleId}</span>
        <span>{result.classification.replace(/ATOMIC_CREATIVE_GENERATION_/, '')}</span>
        <span>Approve {result.approveEnabled ? 'enabled' : 'disabled'}</span>
      </header>
      <p className="site00-twin-v2-fal-proof-controls__hint">
        v28 dependency: {result.v28CapabilityStatus} · completeness {result.completeness.status} · checksum{' '}
        {result.registration.bundleChecksum}
      </p>
      <div className="site00-twin-v2-fal-proof__tabs" role="tablist">
        {(['VISUAL', 'BLUEPRINT_TWIN', 'OVERLAY', 'OBJECT_DATA', 'ASSETS', 'FUNCTIONS'] as ReviewMode[]).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}>
            {m.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      <div className="site00-twin-v2-fal-proof__stage">
        {mode === 'VISUAL' ? <img src={authUrl} alt="Authority visual" className="site00-twin-v2-fal-proof__img" /> : null}
        {mode === 'BLUEPRINT_TWIN' ? (
          <img src={bpUrl} alt="Blueprint twin visual" className="site00-twin-v2-fal-proof__img" />
        ) : null}
        {mode === 'OVERLAY' ? (
          <div className="site00-twin-v2-fal-proof__overlay-wrap">
            <img src={authUrl} alt="" className="site00-twin-v2-fal-proof__img" />
            <img src={bpUrl} alt="" className="site00-twin-v2-fal-proof__overlay-bp" aria-hidden />
          </div>
        ) : null}
        {mode === 'OBJECT_DATA' ? (
          <ul className="site00-twin-v2-paired-review__object-list">
            {result.surgicalBlueprintData.objects.map((o) => (
              <li key={o.objectId}>
                <code>{o.objectId}</code> — {o.role} ({o.type}) z={o.zIndex}
              </li>
            ))}
            <li>
              <em>Relationships: {result.surgicalBlueprintData.relationships.length}</em>
            </li>
          </ul>
        ) : null}
        {mode === 'ASSETS' ? (
          <ul className="site00-twin-v2-paired-review__object-list">
            {result.assetContractSet.contracts.map((c) => (
              <li key={c.assetGenerationContractId}>
                <code>{c.objectId}</code> — {c.assetType} — {c.assetSlotId}
              </li>
            ))}
            {result.standaloneAssets.map((a) => (
              <li key={a.artifactId}>
                standalone <code>{a.objectId}</code> — {a.assetVersionId} —{' '}
                <a href={a.storageUrl}>preview</a>
              </li>
            ))}
          </ul>
        ) : null}
        {mode === 'FUNCTIONS' ? (
          <ul className="site00-twin-v2-paired-review__object-list">
            {result.functionBindingMap.bindings.map((b) => (
              <li key={b.functionBindingId}>
                <code>{b.objectId}</code> → {b.sourceFunction}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export function TwinV2AtomicGenerationBundleControls({
  onRun,
  running,
  error,
  result,
}: {
  onRun: () => void;
  running: boolean;
  error: string | null;
  result: AtomicCreativeGenerationResult | null;
}) {
  return (
    <div className="site00-twin-v2-fal-proof-controls">
      <button type="button" disabled={running} onClick={onRun}>
        {running ? 'Atomic generation running…' : 'RUN ATOMIC GENERATION BUNDLE (v29)'}
      </button>
      <p className="site00-twin-v2-fal-proof-controls__hint">
        Produces authority + blueprint twin + surgical data + contracts + standalone assets + function map. No BUILD.
      </p>
      {error ? (
        <p className="site00-twin-v2-fal-proof-controls__error" role="alert">
          {error}
        </p>
      ) : null}
      {result ? <TwinV2AtomicGenerationBundlePanel result={result} /> : null}
    </div>
  );
}
