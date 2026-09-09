/**
 * ADD SCREEN AUTHORITY — whole-screen skin authority ingestion (not asset extraction).
 */

import { useEffect, useMemo, useState } from 'react';
import {
  fetchAuthorityPrefill,
  registerScreenAuthority,
} from './brandFamilySkinApi.js';
import type { StandardScreenType } from '../../../../shared/site00-brand-lore/projectSkin/brandFamily/types.js';

type Viewport = 'MOBILE' | 'TABLET' | 'DESKTOP';

type Props = {
  brandFamilySkinId: string;
  packScreenType: StandardScreenType;
  projectId: string;
  onRegistered: () => void;
  onCancel: () => void;
};

export function SkinScreenAuthorityIngestion({
  brandFamilySkinId,
  packScreenType,
  projectId,
  onRegistered,
  onCancel,
}: Props) {
  const [viewport, setViewport] = useState<Viewport>('MOBILE');
  const [referenceAssetId, setReferenceAssetId] = useState('');
  const [founderNote, setFounderNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [prefill, setPrefill] = useState<{
    moduleId: string;
    screenType: string;
    screenLabel: string;
    defaultViewport: Viewport;
  } | null>(null);
  const [contractPreview, setContractPreview] = useState<{
    keepFunction: boolean;
    rebuildLook: boolean;
    protectCurrentVisuals: boolean;
    screenshotQaRequired: boolean;
    visualConvergenceRequired: boolean;
  } | null>(null);

  useEffect(() => {
    void fetchAuthorityPrefill(brandFamilySkinId, packScreenType).then((res) => {
      if (res.prefill) {
        setPrefill(res.prefill);
        setViewport(res.prefill.defaultViewport ?? 'MOBILE');
      }
      if (res.contractPreview) setContractPreview(res.contractPreview);
    });
  }, [brandFamilySkinId, packScreenType]);

  const convergenceRequired = useMemo(
    () => contractPreview?.visualConvergenceRequired ?? true,
    [contractPreview],
  );

  async function handleRegister() {
    if (!referenceAssetId.trim()) return;
    setSubmitting(true);
    try {
      const res = await registerScreenAuthority({
        brandFamilySkinId,
        packScreenType,
        moduleId: prefill?.moduleId,
        screenType: prefill?.screenType,
        viewport,
        referenceAssetId: referenceAssetId.trim(),
        projectId,
        founderNote: founderNote.trim() || undefined,
      });
      if (res.ok) onRegistered();
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReferenceAssetId(`ref://${brandFamilySkinId}/${packScreenType}/${viewport}/${file.name}`);
  }

  return (
    <section className="site00-bfs-ingestion" data-panel="screen-authority-ingestion">
      <header className="site00-bfs-ingestion__head">
        <h3>ADD SCREEN AUTHORITY</h3>
        <p>DESIGN AUTHORITY · EXACT MATCH · NOT ASSET EXTRACTION</p>
      </header>

      <dl className="site00-bfs-ingestion__prefill">
        <div>
          <dt>BRAND FAMILY</dt>
          <dd>{brandFamilySkinId}</dd>
        </div>
        <div>
          <dt>MODULE</dt>
          <dd>{prefill?.moduleId ?? '…'}</dd>
        </div>
        <div>
          <dt>SCREEN</dt>
          <dd>{prefill?.screenType ?? '…'}</dd>
        </div>
      </dl>

      <div className="site00-bfs-ingestion__viewport" role="group" aria-label="Viewport">
        {(['MOBILE', 'TABLET', 'DESKTOP'] as Viewport[]).map((v) => (
          <button
            key={v}
            type="button"
            className={`site00-bfs-ingestion__viewport-btn${viewport === v ? ' is-active' : ''}`}
            onClick={() => setViewport(v)}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="site00-bfs-ingestion__modes">
        <label>
          <span>AUTHORITY MODE</span>
          <select value="DESIGN_AUTHORITY" disabled aria-readonly>
            <option value="DESIGN_AUTHORITY">DESIGN AUTHORITY</option>
          </select>
        </label>
        <label>
          <span>FIDELITY MODE</span>
          <select value="EXACT" disabled aria-readonly>
            <option value="EXACT">EXACT</option>
          </select>
        </label>
      </div>

      <div className="site00-bfs-ingestion__convergence">
        <strong>VISUAL CONVERGENCE</strong>
        <span className={convergenceRequired ? 'is-required' : ''}>{convergenceRequired ? 'REQUIRED' : 'OFF'}</span>
      </div>

      <article className="site00-bfs-ingestion__contract">
        <h4>REFERENCE CONTRACT</h4>
        <ul>
          <li>KEEP FUNCTION: {contractPreview?.keepFunction ? 'YES' : 'NO'}</li>
          <li>REBUILD LOOK: {contractPreview?.rebuildLook ? 'YES' : 'NO'}</li>
          <li>PROTECT CURRENT VISUALS: {contractPreview?.protectCurrentVisuals ? 'YES' : 'NO'}</li>
          <li>SCREENSHOT QA: {contractPreview?.screenshotQaRequired ? 'REQUIRED' : 'OFF'}</li>
          <li>VISUAL CONVERGENCE: {contractPreview?.visualConvergenceRequired ? 'REQUIRED' : 'OFF'}</li>
        </ul>
      </article>

      <label className="site00-bfs-ingestion__upload">
        <span>REFERENCE IMAGE</span>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {referenceAssetId ? <em>{referenceAssetId}</em> : null}
      </label>

      <label className="site00-bfs-ingestion__note">
        <span>FOUNDER NOTE (OPTIONAL)</span>
        <textarea
          value={founderNote}
          onChange={(e) => setFounderNote(e.target.value.toUpperCase())}
          placeholder="ADDITIVE INSTRUCTIONS ONLY — EXACT MATCH COMES FROM SYSTEM CONTRACT"
          rows={2}
        />
      </label>

      <div className="site00-bfs-ingestion__actions">
        <button type="button" className="site00-bfs-ingestion__cancel" onClick={onCancel}>
          CANCEL
        </button>
        <button
          type="button"
          className="site00-bfs-ingestion__register"
          disabled={!referenceAssetId.trim() || submitting}
          onClick={() => void handleRegister()}
        >
          {submitting ? 'REGISTERING…' : 'REGISTER AUTHORITY'}
        </button>
      </div>
    </section>
  );
}
