/**
 * P0.VR.6 — MORE tab: providers, spend guard, presets, storage, automation.
 */

import { useEffect, useState } from 'react';
import { requiresExplicitFounderDispatch } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/spendGuard.js';
import { uploadNeverTriggersGeneration } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr5/spendGuard.js';
import { listInstructionPresets } from './designAssetJobApi';
import { fetchFalProviderHealth } from './designAssetReconstructionApi';
import type { DesignInstructionPreset } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr5/browserClient.js';

type Props = {
  onOpenInspect?: () => void;
  onCaptureScreen?: () => void;
  onMatchReference?: () => void;
};

export function DesignMoreTab({ onOpenInspect, onCaptureScreen, onMatchReference }: Props) {
  const [presets, setPresets] = useState<DesignInstructionPreset[]>([]);
  const [falAvailable, setFalAvailable] = useState<boolean | null>(null);
  const [autoCrop, setAutoCrop] = useState(false);
  const [syncSupabase, setSyncSupabase] = useState(true);
  const [notifyComplete, setNotifyComplete] = useState(true);

  useEffect(() => {
    void listInstructionPresets().then((res) => {
      if (res.presets) setPresets(res.presets);
    });
    void fetchFalProviderHealth().then((res) => {
      const health = res.health as { liveDispatchAllowed?: boolean } | undefined;
      setFalAvailable(health?.liveDispatchAllowed ?? null);
    });
  }, []);

  const founderGenerateOnly = requiresExplicitFounderDispatch();
  const uploadSafe = uploadNeverTriggersGeneration();

  return (
    <section className="site00-dw-v3-more" data-design-tab="more">
      <article className="site00-dw-v3-more__card">
        <header>
          <h3>PROVIDERS</h3>
          <span>MANAGE AI PROVIDERS AND CAPABILITIES.</span>
        </header>
        <div className="site00-dw-v3-more__provider-grid">
          <div className={`site00-dw-v3-more__provider${falAvailable ? ' is-live' : ''}`}>
            <strong>GPT IMAGE 2 EDIT</strong>
            <span>PRIMARY</span>
            <em>{falAvailable === null ? 'CHECKING…' : falAvailable ? 'CONNECTED' : 'UNAVAILABLE'}</em>
          </div>
          <div className="site00-dw-v3-more__provider">
            <strong>IDEOGRAM</strong>
            <span>BG REMOVE</span>
            <em>CONFIGURED</em>
          </div>
          <div className="site00-dw-v3-more__provider">
            <strong>FAL AUTO</strong>
            <span>FALLBACK</span>
            <em>{falAvailable ? 'READY' : 'BLOCKED'}</em>
          </div>
        </div>
      </article>

      <div className="site00-dw-v3-more__split">
        <article className="site00-dw-v3-more__card">
          <header>
            <h3>SPEND GUARD</h3>
            <span>CONTROL USAGE AND PREVENT UNEXPECTED COSTS.</span>
          </header>
          <div className="site00-dw-v3-more__toggle-row">
            <span>FOUNDER GENERATE ONLY</span>
            <strong className={founderGenerateOnly ? 'is-on' : 'is-off'}>{founderGenerateOnly ? 'ON' : 'OFF'}</strong>
          </div>
          <div className="site00-dw-v3-more__toggle-row">
            <span>MAX PRIMARY DISPATCH</span>
            <strong>1</strong>
          </div>
          <div className="site00-dw-v3-more__toggle-row">
            <span>UPLOAD NEVER TRIGGERS GENERATION</span>
            <strong className={uploadSafe ? 'is-on' : 'is-off'}>{uploadSafe ? 'ON' : 'OFF'}</strong>
          </div>
        </article>

        <article className="site00-dw-v3-more__card">
          <header>
            <h3>INSTRUCTION PRESETS</h3>
            <span>QUICK START WITH SAVED INSTRUCTIONS.</span>
          </header>
          <div className="site00-dw-v3-chip-row">
            {presets.slice(0, 4).map((p) => (
              <span key={p.presetId} className="site00-dw-v3-chip">
                {p.name.toUpperCase()}
              </span>
            ))}
          </div>
          <p className="site00-dw-v3-more__meta">FOUNDER INSTRUCTIONS ({presets.length})</p>
        </article>
      </div>

      <article className="site00-dw-v3-more__card">
        <header>
          <h3>STORAGE &amp; OUTPUT</h3>
          <span>MANAGE STORAGE, OUTPUT DESTINATIONS, AND DEPLOYMENT.</span>
        </header>
        <div className="site00-dw-v3-more__storage-grid">
          <div className="site00-dw-v3-more__storage">
            <strong>SUPABASE</strong>
            <em className="is-on">CONNECTED</em>
          </div>
          <div className="site00-dw-v3-more__storage">
            <strong>LIVE REPLACE</strong>
            <em className="is-on">READY</em>
          </div>
        </div>
      </article>

      <article className="site00-dw-v3-more__card">
        <header>
          <h3>AUTOMATION</h3>
          <span>STREAMLINE REPEAT TASKS — NO PAID AUTO-DISPATCH.</span>
        </header>
        <label className="site00-dw-v3-more__toggle-row">
          <span>AUTO CROP ON UPLOAD</span>
          <input type="checkbox" checked={autoCrop} onChange={(e) => setAutoCrop(e.target.checked)} />
        </label>
        <label className="site00-dw-v3-more__toggle-row">
          <span>GENERATE VARIATIONS</span>
          <input type="checkbox" checked={false} disabled title="Requires explicit founder dispatch" />
        </label>
        <label className="site00-dw-v3-more__toggle-row">
          <span>SYNC TO SUPABASE</span>
          <input type="checkbox" checked={syncSupabase} onChange={(e) => setSyncSupabase(e.target.checked)} />
        </label>
        <label className="site00-dw-v3-more__toggle-row">
          <span>NOTIFY ON COMPLETE</span>
          <input type="checkbox" checked={notifyComplete} onChange={(e) => setNotifyComplete(e.target.checked)} />
        </label>
      </article>

      <article className="site00-dw-v3-more__card">
        <header>
          <h3>QUICK ACTIONS</h3>
          <span>WORKSPACE OPERATIONS</span>
        </header>
        <div className="site00-dw-v3-more__actions">
          {onMatchReference ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onMatchReference}>
              MATCH REFERENCE
            </button>
          ) : null}
          {onCaptureScreen ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onCaptureScreen}>
              CAPTURE IMPLEMENTATION
            </button>
          ) : null}
          {onOpenInspect ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onOpenInspect}>
              OPEN INSPECTOR
            </button>
          ) : null}
        </div>
      </article>
    </section>
  );
}
