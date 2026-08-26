import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { isAstralDebugMode } from '../../../../shared/site00-astral-world/referenceAssets.js';
import { ASTRAL_REFERENCE_DESKTOP, ASTRAL_REFERENCE_MOBILE } from '../../../../shared/site00-astral-world/referenceAssets.js';
import { P0_SLOT_KEYS, type AstralAssetSlotKey } from '../../../../shared/site00-astral-world/generation/assetSlotRegistry.js';
import { useAstralAssets } from '../hooks/useAstralAssets';

type SlotRecord = {
  targetSlot: string;
  status: string;
  approvalState?: string;
  outputUrl?: string | null;
  version?: number;
  error?: string | null;
};

export function AstralGenerationDebugPanel() {
  const { search } = useLocation();
  const show = isAstralDebugMode(search);
  const { assets, loaded, refresh } = useAstralAssets();
  const [records, setRecords] = useState<Record<string, SlotRecord>>({});
  const [selectedSlot, setSelectedSlot] = useState<AstralAssetSlotKey>(P0_SLOT_KEYS[0]);
  const [compareMode, setCompareMode] = useState<'reference' | 'generated' | 'side'>('side');

  if (!show) return null;

  const count = Object.keys(assets).length;

  const adminFetch = async (action: string, body?: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/site00-astral-world-generation?action=${action}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  };

  const loadStore = async () => {
    const data = await adminFetch('store');
    if (data.records) setRecords(data.records);
  };

  const dispatchP0 = async () => {
    await adminFetch('dispatch-p0', { action: 'dispatch-p0' });
    await loadStore();
    void refresh();
  };

  const dispatchP1 = async () => {
    await adminFetch('dispatch-p1', { action: 'dispatch-p1' });
    await loadStore();
    void refresh();
  };

  const activateSlot = async () => {
    await adminFetch('activate', { action: 'activate', slotKey: selectedSlot });
    await loadStore();
    void refresh();
  };

  const regenerateSlot = async () => {
    await adminFetch('regenerate', { action: 'regenerate', slotKey: selectedSlot });
    await loadStore();
    void refresh();
  };

  const selected = records[selectedSlot];
  const refUrl = selectedSlot.includes('MOBILE')
    ? ASTRAL_REFERENCE_MOBILE.publicPath
    : ASTRAL_REFERENCE_DESKTOP.publicPath;
  const genUrl = selected?.outputUrl ?? assets[selectedSlot]?.url ?? null;

  return (
    <section className="aw-gen-debug-panel">
      <h2 className="aw-display aw-display--section">FAL Asset Factory (debug)</h2>
      <p className="aw-muted">{loaded ? `${count} client-active slot(s)` : 'Loading asset map…'}</p>
      <div className="aw-gen-debug-actions">
        <button type="button" className="aw-btn-secondary" onClick={() => void refresh()}>Refresh slots</button>
        <button type="button" className="aw-btn-secondary" onClick={() => void loadStore()}>Load store</button>
        <button type="button" className="aw-btn-primary" onClick={() => void dispatchP0()}>Dispatch P0 batch</button>
        <button type="button" className="aw-btn-secondary" onClick={() => void dispatchP1()}>Dispatch P1 portraits</button>
      </div>

      <div className="aw-gen-debug-review">
        <label className="aw-label" htmlFor="aw-gen-slot-select">Founder slot review</label>
        <select
          id="aw-gen-slot-select"
          className="aw-gen-debug-select"
          value={selectedSlot}
          onChange={(e) => setSelectedSlot(e.target.value as AstralAssetSlotKey)}
        >
          {P0_SLOT_KEYS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <div className="aw-gen-debug-compare-tabs">
          {(['reference', 'generated', 'side'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`aw-chip${compareMode === mode ? ' aw-tab--active' : ''}`}
              onClick={() => setCompareMode(mode)}
            >
              {mode === 'side' ? 'Side-by-side' : mode}
            </button>
          ))}
        </div>
        <div className={`aw-gen-debug-compare aw-gen-debug-compare--${compareMode}`}>
          {(compareMode === 'reference' || compareMode === 'side') ? (
            <figure className="aw-gen-debug-figure">
              <figcaption className="aw-label">Reference</figcaption>
              <img src={refUrl} alt="Reference authority" className="aw-gen-debug-img" />
            </figure>
          ) : null}
          {(compareMode === 'generated' || compareMode === 'side') ? (
            <figure className="aw-gen-debug-figure">
              <figcaption className="aw-label">Generated {selected?.status ?? '—'}</figcaption>
              {genUrl ? (
                <img src={genUrl} alt="Generated asset" className="aw-gen-debug-img" />
              ) : (
                <p className="aw-muted">No generated output yet — reference crop active</p>
              )}
            </figure>
          ) : null}
        </div>
        <p className="aw-muted">
          {selected ? `${selected.status} · v${selected.version ?? 0} · ${selected.approvalState ?? '—'}` : 'Load store to inspect records'}
        </p>
        <div className="aw-gen-debug-actions">
          <button type="button" className="aw-btn-primary" onClick={() => void activateSlot()}>Activate</button>
          <button type="button" className="aw-btn-secondary" onClick={() => void regenerateSlot()}>Regenerate</button>
          <button
            type="button"
            className="aw-btn-secondary"
            onClick={() => void adminFetch('prompt', undefined).then(() => adminFetch(`prompt&slot=${selectedSlot}`))}
          >
            View prompt
          </button>
        </div>
      </div>
    </section>
  );
}
