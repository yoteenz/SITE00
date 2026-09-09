/**
 * P0.VR.6 + Reference-Fidelity — MORE tab: providers, spend guard, presets, storage, automation.
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

const QUICK_PRESET_CHIPS = ['ISOLATE ICON', 'EXTRACT BACKGROUND', 'MULTI-ASSET', 'REPLACE CURRENT ASSET'] as const;

export function DesignMoreTab({ onOpenInspect, onCaptureScreen, onMatchReference }: Props) {
  const [presets, setPresets] = useState<DesignInstructionPreset[]>([]);
  const [falAvailable, setFalAvailable] = useState<boolean | null>(null);
  const [autoCrop, setAutoCrop] = useState(false);
  const [syncSupabase, setSyncSupabase] = useState(true);
  const [notifyComplete, setNotifyComplete] = useState(true);
  const [generateVariations, setGenerateVariations] = useState(false);

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
      <div className="site00-dw-v3-more__section">
        <div className="site00-dw-v3-more__section-head">
          <div>
            <h3>⬡ PROVIDERS</h3>
            <p>MANAGE AI PROVIDERS AND CAPABILITIES.</p>
          </div>
          <button type="button">MANAGE ALL →</button>
        </div>
        <div className="site00-dw-v3-more__provider-grid">
          <div className={`site00-dw-v3-more__provider${falAvailable ? ' is-live' : ''}`}>
            <strong>GPT IMAGE 2 EDIT</strong>
            <span>PRIMARY DISPATCH</span>
            <em>{falAvailable === null ? '…' : falAvailable ? '✓ ACTIVE' : 'BLOCKED'}</em>
          </div>
          <div className="site00-dw-v3-more__provider">
            <strong>IDEOGRAM</strong>
            <span>BG REMOVE</span>
            <em>✓ ACTIVE</em>
          </div>
          <div className="site00-dw-v3-more__provider">
            <strong>FAL AUTO</strong>
            <span>FALLBACK</span>
            <em>{falAvailable ? '✓ READY' : 'BLOCKED'}</em>
          </div>
        </div>
      </div>

      <div className="site00-dw-v3-more__split">
        <article className="site00-dw-v3-more__card">
          <div className="site00-dw-v3-more__section-head">
            <div>
              <h3>🛡 SPEND GUARD</h3>
            </div>
          </div>
          <div className="site00-dw-v3-more__toggle-row">
            <span>FOUNDER GENERATE ONLY</span>
            <strong className={founderGenerateOnly ? 'is-on' : 'is-off'}>{founderGenerateOnly ? 'ON' : 'OFF'}</strong>
          </div>
          <div className="site00-dw-v3-more__toggle-row">
            <span>MAX PRIMARY DISPATCH</span>
            <strong>1</strong>
          </div>
          <div className="site00-dw-v3-more__toggle-row">
            <span>UPLOAD NEVER TRIGGERS GEN</span>
            <strong className={uploadSafe ? 'is-on' : 'is-off'}>{uploadSafe ? 'ON' : 'OFF'}</strong>
          </div>
        </article>

        <article className="site00-dw-v3-more__card">
          <div className="site00-dw-v3-more__section-head">
            <div>
              <h3>📄 INSTRUCTION PRESETS</h3>
            </div>
            <button type="button">MANAGE →</button>
          </div>
          <div className="site00-dw-v3-chip-row">
            {QUICK_PRESET_CHIPS.map((chip, i) => (
              <span key={chip} className={`site00-dw-v3-chip${i === 0 ? ' is-active' : ''}`}>
                {chip}
              </span>
            ))}
          </div>
          <p className="site00-dw-v3-more__meta">✦ FOUNDER INSTRUCTIONS ({presets.length || '—'}) ▾</p>
        </article>
      </div>

      <div className="site00-dw-v3-more__section">
        <div className="site00-dw-v3-more__section-head">
          <div>
            <h3>🗄 STORAGE &amp; OUTPUT</h3>
            <p>MANAGE STORAGE, OUTPUT DESTINATIONS, AND DEPLOYMENT.</p>
          </div>
          <button type="button">CONFIGURE →</button>
        </div>
        <div className="site00-dw-v3-more__storage-grid">
          <div className="site00-dw-v3-more__storage">
            <strong>SUPABASE</strong>
            <em className="is-on">● CONNECTED</em>
            <span style={{ display: 'block', fontSize: 6, marginTop: 4, color: 'var(--site00-dw-muted)' }}>
              ASSET STORAGE + BINDINGS
            </span>
          </div>
          <div className="site00-dw-v3-more__storage">
            <strong>LIVE REPLACE</strong>
            <em className="is-on">● READY</em>
            <span style={{ display: 'block', fontSize: 6, marginTop: 4, color: 'var(--site00-dw-muted)' }}>
              PAGE SYSTEM BIND
            </span>
          </div>
        </div>
      </div>

      <div className="site00-dw-v3-more__split">
        <article className="site00-dw-v3-more__card">
          <div className="site00-dw-v3-more__section-head">
            <div>
              <h3>⚙ OUTPUT RULES</h3>
            </div>
            <button type="button">MANAGE →</button>
          </div>
          <div className="site00-dw-v3-more__rule-row">
            <span>DEFAULT FORMAT</span>
            <span>PNG ›</span>
          </div>
          <div className="site00-dw-v3-more__rule-row">
            <span>DEFAULT RESOLUTION</span>
            <span>ORIGINAL ›</span>
          </div>
          <div className="site00-dw-v3-more__rule-row">
            <span>NAMING PATTERN</span>
            <span style={{ fontSize: 6 }}>SITE00_[TYPE] ›</span>
          </div>
          <div className="site00-dw-v3-more__rule-row">
            <span>AUTO-OPTIMIZE</span>
            <span>ON ›</span>
          </div>
        </article>

        <article className="site00-dw-v3-more__card">
          <div className="site00-dw-v3-more__section-head">
            <div>
              <h3>⚡ AUTOMATION</h3>
            </div>
            <button type="button">MANAGE →</button>
          </div>
          <label className="site00-dw-v3-more__toggle-row">
            <span>AUTO CROP ON UPLOAD</span>
            <input type="checkbox" checked={autoCrop} onChange={(e) => setAutoCrop(e.target.checked)} />
          </label>
          <label className="site00-dw-v3-more__toggle-row">
            <span>GENERATE VARIATIONS</span>
            <input
              type="checkbox"
              checked={generateVariations}
              onChange={(e) => setGenerateVariations(e.target.checked)}
              disabled
              title="Requires explicit founder dispatch"
            />
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
      </div>

      <article className="site00-dw-v3-more__card">
        <div className="site00-dw-v3-more__section-head">
          <div>
            <h3>🚀 QUICK ACTIONS</h3>
          </div>
        </div>
        <div className="site00-dw-v3-more__quick-row">
          {onMatchReference ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onMatchReference}>
              MATCH REFERENCE
            </button>
          ) : null}
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
            ▶ TEST PIPELINE
          </button>
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
            ☰ VIEW QUEUE
          </button>
          {onOpenInspect ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onOpenInspect}>
              ⚙ MANAGE PROVIDERS
            </button>
          ) : (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
              ⚙ MANAGE PROVIDERS
            </button>
          )}
          {onCaptureScreen ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onCaptureScreen}>
              CAPTURE
            </button>
          ) : null}
        </div>
      </article>
    </section>
  );
}
