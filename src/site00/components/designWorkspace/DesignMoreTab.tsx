/**
 * P0.VR.8R3R5R1 — MORE tab category landing + dedicated sub-screens.
 */

import { useEffect, useState } from 'react';
import { requiresExplicitFounderDispatch } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/spendGuard.js';
import { uploadNeverTriggersGeneration } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr5/spendGuard.js';
import { DEFAULT_FIDELITY_SETTINGS } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/browserClient.js';
import { listInstructionPresets } from './designAssetJobApi';
import { fetchFalProviderHealth } from './designAssetReconstructionApi';
import type { DesignInstructionPreset } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr5/browserClient.js';
import { DesignDwSectionIcon } from './DesignDwSectionIcon';
import { DesignCaptureOrchestrationInspector } from './DesignCaptureOrchestrationInspector';
import { DesignRouteAuditRecoveryInspector } from './DesignRouteAuditRecoveryInspector';
import { DesignTaskWizardShell } from './wizard/DesignTaskWizardShell';
import {
  MORE_CATEGORIES,
  moreCategoryLabel,
  normalizeMoreCategory,
  type MoreCategory,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3r1/designWizardSteps.js';

type Props = {
  projectId: string;
  onOpenInspect?: () => void;
  onCaptureScreen?: () => void;
  onMatchReference?: () => void;
  moreCategory?: string;
  onMoreCategoryChange?: (category: MoreCategory) => void;
};

const CATEGORY_GRID: Array<{ id: MoreCategory; icon: Parameters<typeof DesignDwSectionIcon>[0]['iconId']; desc: string }> = [
  { id: 'system', icon: 'gear', desc: 'System status and build info' },
  { id: 'providers', icon: 'providers', desc: 'AI providers and capabilities' },
  { id: 'capture', icon: 'play', desc: 'Capture orchestration' },
  { id: 'route-audit', icon: 'list', desc: 'Route audit and recovery' },
  { id: 'storage', icon: 'storage', desc: 'Storage and output destinations' },
  { id: 'automation', icon: 'automation', desc: 'Automation toggles' },
  { id: 'presets', icon: 'presets', desc: 'Instruction presets' },
];

export function DesignMoreTab({
  projectId,
  onOpenInspect,
  onCaptureScreen,
  onMatchReference,
  moreCategory: moreCategoryProp,
  onMoreCategoryChange,
}: Props) {
  const [presets, setPresets] = useState<DesignInstructionPreset[]>([]);
  const [falAvailable, setFalAvailable] = useState<boolean | null>(null);
  const [autoCrop, setAutoCrop] = useState(false);
  const [syncSupabase, setSyncSupabase] = useState(true);
  const [notifyComplete, setNotifyComplete] = useState(true);
  const [localCategory, setLocalCategory] = useState<MoreCategory>('landing');

  const activeCategory = moreCategoryProp ? normalizeMoreCategory(moreCategoryProp) : localCategory;

  useEffect(() => {
    if (moreCategoryProp) setLocalCategory(normalizeMoreCategory(moreCategoryProp));
  }, [moreCategoryProp]);

  useEffect(() => {
    void listInstructionPresets().then((res) => {
      if (res.presets) setPresets(res.presets);
    });
    void fetchFalProviderHealth().then((res) => {
      const health = res.health as { liveDispatchAllowed?: boolean } | undefined;
      setFalAvailable(health?.liveDispatchAllowed ?? null);
    });
  }, []);

  const goTo = (category: MoreCategory) => {
    setLocalCategory(category);
    onMoreCategoryChange?.(category);
  };

  const founderGenerateOnly = requiresExplicitFounderDispatch();
  const uploadSafe = uploadNeverTriggersGeneration();

  if (activeCategory === 'landing') {
    return (
      <section className="site00-dw-v3-more site00-dw-wizard-host site00-dw-more-landing" data-design-tab="more">
        <DesignTaskWizardShell
          stepTitle="MORE"
          headline="SYSTEM & SETTINGS"
          support="Technical tools and configuration live here — not in your primary creative flows."
          visualState="ready"
          transitionKey="more-landing"
        >
          <div className="site00-dw-more-landing__grid">
            {CATEGORY_GRID.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="site00-dw-more-landing__tile"
                onClick={() => goTo(cat.id)}
              >
                <DesignDwSectionIcon iconId={cat.icon} />
                <strong>{moreCategoryLabel(cat.id)}</strong>
                <span>{cat.desc}</span>
              </button>
            ))}
          </div>
        </DesignTaskWizardShell>
      </section>
    );
  }

  const backToLanding = () => goTo('landing');

  if (activeCategory === 'providers') {
    return (
      <section className="site00-dw-v3-more site00-dw-wizard-host" data-design-tab="more" data-more-category="providers">
        <DesignTaskWizardShell
          stepTitle={moreCategoryLabel('providers')}
          headline="PROVIDERS"
          support="Manage AI providers and capabilities."
          onBack={backToLanding}
          transitionKey="more-providers"
        >
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
        </DesignTaskWizardShell>
      </section>
    );
  }

  if (activeCategory === 'capture') {
    return (
      <section className="site00-dw-v3-more site00-dw-wizard-host" data-design-tab="more" data-more-category="capture">
        <DesignTaskWizardShell
          stepTitle={moreCategoryLabel('capture')}
          headline="CAPTURE ORCHESTRATION"
          support="Service status and worker diagnostics."
          onBack={backToLanding}
          transitionKey="more-capture"
        >
          <DesignCaptureOrchestrationInspector projectId={projectId} />
        </DesignTaskWizardShell>
      </section>
    );
  }

  if (activeCategory === 'route-audit') {
    return (
      <section className="site00-dw-v3-more site00-dw-wizard-host" data-design-tab="more" data-more-category="route-audit">
        <DesignTaskWizardShell
          stepTitle={moreCategoryLabel('route-audit')}
          headline="ROUTE AUDIT / RECOVERY"
          support="Reconcile routes with capture inventory."
          onBack={backToLanding}
          transitionKey="more-route-audit"
        >
          <DesignRouteAuditRecoveryInspector projectId={projectId} />
        </DesignTaskWizardShell>
      </section>
    );
  }

  if (activeCategory === 'storage') {
    return (
      <section className="site00-dw-v3-more site00-dw-wizard-host" data-design-tab="more" data-more-category="storage">
        <DesignTaskWizardShell stepTitle={moreCategoryLabel('storage')} headline="STORAGE & OUTPUT" onBack={backToLanding} transitionKey="more-storage">
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
        </DesignTaskWizardShell>
      </section>
    );
  }

  if (activeCategory === 'automation') {
    return (
      <section className="site00-dw-v3-more site00-dw-wizard-host" data-design-tab="more" data-more-category="automation">
        <DesignTaskWizardShell stepTitle={moreCategoryLabel('automation')} headline="AUTOMATION" onBack={backToLanding} transitionKey="more-automation">
          <label className="site00-dw-v3-more__toggle-row">
            <span>AUTO CROP ON UPLOAD</span>
            <input type="checkbox" checked={autoCrop} onChange={(e) => setAutoCrop(e.target.checked)} />
          </label>
          <label className="site00-dw-v3-more__toggle-row">
            <span>SYNC TO SUPABASE</span>
            <input type="checkbox" checked={syncSupabase} onChange={(e) => setSyncSupabase(e.target.checked)} />
          </label>
          <label className="site00-dw-v3-more__toggle-row">
            <span>NOTIFY ON COMPLETE</span>
            <input type="checkbox" checked={notifyComplete} onChange={(e) => setNotifyComplete(e.target.checked)} />
          </label>
        </DesignTaskWizardShell>
      </section>
    );
  }

  if (activeCategory === 'presets') {
    return (
      <section className="site00-dw-v3-more site00-dw-wizard-host" data-design-tab="more" data-more-category="presets">
        <DesignTaskWizardShell stepTitle={moreCategoryLabel('presets')} headline="INSTRUCTION PRESETS" onBack={backToLanding} transitionKey="more-presets">
          <p className="site00-dw-v3-more__meta">FOUNDER INSTRUCTIONS ({presets.length || '—'})</p>
        </DesignTaskWizardShell>
      </section>
    );
  }

  if (activeCategory === 'system') {
    return (
      <section className="site00-dw-v3-more site00-dw-wizard-host" data-design-tab="more" data-more-category="system">
        <DesignTaskWizardShell stepTitle={moreCategoryLabel('system')} headline="SYSTEM" onBack={backToLanding} transitionKey="more-system">
          <div className="site00-dw-v3-more__toggle-row">
            <span>FOUNDER GENERATE ONLY</span>
            <strong className={founderGenerateOnly ? 'is-on' : 'is-off'}>{founderGenerateOnly ? 'ON' : 'OFF'}</strong>
          </div>
          <div className="site00-dw-v3-more__toggle-row">
            <span>UPLOAD NEVER TRIGGERS GEN</span>
            <strong className={uploadSafe ? 'is-on' : 'is-off'}>{uploadSafe ? 'ON' : 'OFF'}</strong>
          </div>
          <div className="site00-dw-v3-more__rule-row">
            <span>DEFAULT AUTHORITY</span>
            <span>{DEFAULT_FIDELITY_SETTINGS.defaultAuthorityMode.replace(/_/g, ' ')}</span>
          </div>
          {onOpenInspect ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onOpenInspect}>
              OPEN INSPECT
            </button>
          ) : null}
          {onCaptureScreen ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onCaptureScreen}>
              CAPTURE SCREEN
            </button>
          ) : null}
          {onMatchReference ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onMatchReference}>
              MATCH REFERENCE
            </button>
          ) : null}
        </DesignTaskWizardShell>
      </section>
    );
  }

  return null;
}

export { MORE_CATEGORIES };
