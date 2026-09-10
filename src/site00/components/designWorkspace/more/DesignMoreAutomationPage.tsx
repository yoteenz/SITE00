/**
 * P0.VR.MOF.R2 — Automation child page.
 */

import { useState } from 'react';
import { MoreToolPageShell } from './MoreToolPageShell';

type Props = {
  onBack: () => void;
  initialAutoCrop?: boolean;
  initialSyncSupabase?: boolean;
  initialNotifyComplete?: boolean;
};

export function DesignMoreAutomationPage({
  onBack,
  initialAutoCrop = false,
  initialSyncSupabase = true,
  initialNotifyComplete = true,
}: Props) {
  const [autoCrop, setAutoCrop] = useState(initialAutoCrop);
  const [syncSupabase, setSyncSupabase] = useState(initialSyncSupabase);
  const [generateVariations, setGenerateVariations] = useState(false);
  const [notifyComplete, setNotifyComplete] = useState(initialNotifyComplete);

  const activeRules = [autoCrop, generateVariations, syncSupabase, notifyComplete].filter(Boolean).length;

  return (
    <MoreToolPageShell
      title="AUTOMATION"
      description="Rules, sync, and notifications."
      visualState="ready"
      statusBadge={`${activeRules} RULES ACTIVE`}
      headline="AUTOMATION"
      support="Toggle rules that run automatically during your workflow."
      onBack={onBack}
      transitionKey="more-automation"
      primaryAction={{ label: 'SAVE CHANGES', onClick: () => {} }}
    >
      <div className="site00-dw-more-tool__toggle-list">
        <label className="site00-dw-more-tool__toggle-row">
          <span>AUTO CROP ON UPLOAD</span>
          <input type="checkbox" checked={autoCrop} onChange={(e) => setAutoCrop(e.target.checked)} />
        </label>
        <label className="site00-dw-more-tool__toggle-row">
          <span>GENERATE VARIATIONS</span>
          <input type="checkbox" checked={generateVariations} onChange={(e) => setGenerateVariations(e.target.checked)} />
        </label>
        <label className="site00-dw-more-tool__toggle-row">
          <span>SYNC TO SUPABASE</span>
          <input type="checkbox" checked={syncSupabase} onChange={(e) => setSyncSupabase(e.target.checked)} />
        </label>
        <label className="site00-dw-more-tool__toggle-row">
          <span>NOTIFY ON COMPLETE</span>
          <input type="checkbox" checked={notifyComplete} onChange={(e) => setNotifyComplete(e.target.checked)} />
        </label>
      </div>
    </MoreToolPageShell>
  );
}
