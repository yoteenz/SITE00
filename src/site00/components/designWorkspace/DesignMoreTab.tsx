/**
 * P0.VR.6R1 — MORE tab: providers, spend guard, presets, storage, automation (canonical icons).
 */

import { useEffect, useState } from 'react';
import { requiresExplicitFounderDispatch } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/spendGuard.js';
import { uploadNeverTriggersGeneration } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr5/spendGuard.js';
import { DEFAULT_FIDELITY_SETTINGS } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/browserClient.js';
import { listInstructionPresets } from './designAssetJobApi';
import { fetchFalProviderHealth } from './designAssetReconstructionApi';
import type { DesignInstructionPreset } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr5/browserClient.js';
import { DesignDwSectionIcon } from './DesignDwSectionIcon';
import { MasterSkinEvolveProofPanel } from '../masterSkin/MasterSkinEvolveProofPanel';
import { DesignReferenceReconstructionInspector } from './DesignReferenceReconstructionInspector.js';
import { DesignScreenReplicationInspector } from './DesignScreenReplicationInspector.js';
import { DesignRouteAuditRecoveryInspector } from './DesignRouteAuditRecoveryInspector.js';
import '../../styles/site00-master-skin.css';

type Props = {
  projectId: string;
  onOpenInspect?: () => void;
  onCaptureScreen?: () => void;
  onMatchReference?: () => void;
};

const QUICK_PRESET_CHIPS = ['ISOLATE ICON', 'EXTRACT BACKGROUND', 'MULTI-ASSET', 'REPLACE CURRENT ASSET'] as const;

function SectionTitle({ iconId, title }: { iconId: Parameters<typeof DesignDwSectionIcon>[0]['iconId']; title: string }) {
  return (
    <h3 className="site00-dw-v3-more__title">
      <DesignDwSectionIcon iconId={iconId} />
      <span>{title}</span>
    </h3>
  );
}

export function DesignMoreTab({ projectId, onOpenInspect, onCaptureScreen, onMatchReference }: Props) {
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
            <SectionTitle iconId="providers" title="PROVIDERS" />
            <p>MANAGE AI PROVIDERS AND CAPABILITIES.</p>
          </div>
          <button type="button">MANAGE ALL →</button>
        </div>
        <div className="site00-dw-v3-more__provider-grid">
          <div className={`site00-dw-v3-more__provider${falAvailable ? ' is-live' : ''}`}>
            <strong>GPT IMAGE 2 EDIT</strong>
            <span className="site00-dw-v3-more__provider-role">PRIMARY</span>
            <em>{falAvailable === null ? '…' : falAvailable ? 'ACTIVE' : 'BLOCKED'}</em>
          </div>
          <div className="site00-dw-v3-more__provider">
            <strong>IDEOGRAM</strong>
            <span className="site00-dw-v3-more__provider-role">BG REMOVE</span>
            <em>ACTIVE</em>
          </div>
          <div className="site00-dw-v3-more__provider">
            <strong>FAL AUTO</strong>
            <span className="site00-dw-v3-more__provider-role">FALLBACK</span>
            <em>{falAvailable ? 'READY' : 'BLOCKED'}</em>
          </div>
        </div>
      </div>

      <div className="site00-dw-v3-more__split">
        <article className="site00-dw-v3-more__card">
          <div className="site00-dw-v3-more__section-head">
            <div>
              <SectionTitle iconId="spend-guard" title="SPEND GUARD" />
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
              <SectionTitle iconId="presets" title="INSTRUCTION PRESETS" />
            </div>
            <button type="button">MANAGE →</button>
          </div>
          <div className="site00-dw-v3-chip-row site00-dw-v3-chip-row--wrap">
            {QUICK_PRESET_CHIPS.map((chip, i) => (
              <span key={chip} className={`site00-dw-v3-chip${i === 0 ? ' is-active' : ''}`}>
                {chip}
              </span>
            ))}
          </div>
          <p className="site00-dw-v3-more__meta">FOUNDER INSTRUCTIONS ({presets.length || '—'}) ▾</p>
        </article>
      </div>

      <div className="site00-dw-v3-more__section">
        <div className="site00-dw-v3-more__section-head">
          <div>
            <SectionTitle iconId="storage" title="STORAGE & OUTPUT" />
            <p>MANAGE STORAGE, OUTPUT DESTINATIONS, AND DEPLOYMENT.</p>
          </div>
          <button type="button">CONFIGURE →</button>
        </div>
        <div className="site00-dw-v3-more__storage-grid">
          <div className="site00-dw-v3-more__storage">
            <strong>SUPABASE</strong>
            <em className="is-on">CONNECTED</em>
            <span className="site00-dw-v3-more__storage-sub">ASSET STORAGE + BINDINGS</span>
          </div>
          <div className="site00-dw-v3-more__storage">
            <strong>LIVE REPLACE</strong>
            <em className="is-on">READY</em>
            <span className="site00-dw-v3-more__storage-sub">PAGE SYSTEM BIND</span>
          </div>
        </div>
      </div>

      <div className="site00-dw-v3-more__split">
        <article className="site00-dw-v3-more__card">
          <div className="site00-dw-v3-more__section-head">
            <div>
              <SectionTitle iconId="output-rules" title="OUTPUT RULES" />
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
            <span className="site00-dw-v3-more__rule-value">SITE00_[TYPE] ›</span>
          </div>
          <div className="site00-dw-v3-more__rule-row">
            <span>AUTO-OPTIMIZE</span>
            <span>ON ›</span>
          </div>
        </article>

        <article className="site00-dw-v3-more__card">
          <div className="site00-dw-v3-more__section-head">
            <div>
              <SectionTitle iconId="automation" title="AUTOMATION" />
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

      <article className="site00-dw-v3-more__card site00-dw-v3-more__card--full">
        <MasterSkinEvolveProofPanel />
      </article>

      <article className="site00-dw-v3-more__card">
        <div className="site00-dw-v3-more__section-head">
          <div>
            <SectionTitle iconId="eye" title="REFERENCE FIDELITY" />
            <p>DEFAULT AUTHORITY, EXACT MODE, AND VISUAL CONVERGENCE POLICY.</p>
          </div>
        </div>
        <div className="site00-dw-v3-more__rule-row">
          <span>DEFAULT AUTHORITY</span>
          <span>{DEFAULT_FIDELITY_SETTINGS.defaultAuthorityMode.replace(/_/g, ' ')} ›</span>
        </div>
        <div className="site00-dw-v3-more__rule-row">
          <span>DEFAULT FIDELITY</span>
          <span>{DEFAULT_FIDELITY_SETTINGS.defaultFidelityMode} ›</span>
        </div>
        <div className="site00-dw-v3-more__rule-row">
          <span>MAX AUTO CORRECTION PASSES</span>
          <span>{DEFAULT_FIDELITY_SETTINGS.maxAutoCorrectionPasses} ›</span>
        </div>
        <div className="site00-dw-v3-more__toggle-row">
          <span>REQUIRE OVERLAY QA</span>
          <strong className={DEFAULT_FIDELITY_SETTINGS.requireOverlayQa ? 'is-on' : 'is-off'}>
            {DEFAULT_FIDELITY_SETTINGS.requireOverlayQa ? 'ON' : 'OFF'}
          </strong>
        </div>
        <div className="site00-dw-v3-more__toggle-row">
          <span>REQUIRE FOUNDER APPROVAL (ASSET SPEND)</span>
          <strong className="is-on">ON</strong>
        </div>
      </article>

      <article className="site00-dw-v3-more__card site00-dw-v3-more__card--full">
        <DesignReferenceReconstructionInspector />
      </article>

      <article className="site00-dw-v3-more__card site00-dw-v3-more__card--full">
        <DesignScreenReplicationInspector />
      </article>

      <article className="site00-dw-v3-more__card site00-dw-v3-more__card--full">
        <DesignRouteAuditRecoveryInspector projectId={projectId} />
      </article>

      <article className="site00-dw-v3-more__card">
        <div className="site00-dw-v3-more__section-head">
          <div>
            <SectionTitle iconId="quick-actions" title="QUICK ACTIONS" />
          </div>
        </div>
        <div className="site00-dw-v3-more__quick-row">
          {onMatchReference ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onMatchReference}>
              MATCH REFERENCE
            </button>
          ) : null}
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
            <DesignDwSectionIcon iconId="play" /> TEST PIPELINE
          </button>
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
            <DesignDwSectionIcon iconId="list" /> VIEW QUEUE
          </button>
          {onOpenInspect ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onOpenInspect}>
              <DesignDwSectionIcon iconId="gear" /> MANAGE PROVIDERS
            </button>
          ) : (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
              <DesignDwSectionIcon iconId="gear" /> MANAGE PROVIDERS
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
