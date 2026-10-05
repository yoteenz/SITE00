/**
 * P0.VR.MOF.R2 — Instruction Presets child page.
 */

import { useState } from 'react';
import type { DesignInstructionPreset } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr5/browserClient.js';
import { DesignDetailsDrawer } from '../wizard/DesignDetailsDrawer';
import { MoreToolPageShell } from './MoreToolPageShell';

type Props = {
  onBack: () => void;
  presets: DesignInstructionPreset[];
};

const PRESET_CHIPS = ['ISOLATE ICON', 'EXTRACT BACKGROUND', 'MULTI-ASSET', 'REPLACE CURRENT ASSET'];

export function DesignMorePresetsPage({ onBack, presets }: Props) {
  const [selected, setSelected] = useState<DesignInstructionPreset | null>(null);
  const displayPresets = presets.slice(0, 8);

  return (
    <>
      <MoreToolPageShell
        title="INSTRUCTION PRESETS"
        description="Saved instructions and workflows."
        visualState="ready"
        statusBadge={`${presets.length || 0} SAVED`}
        headline="INSTRUCTION PRESETS"
        support="Reusable instruction templates for common reconstruction tasks."
        onBack={onBack}
        transitionKey="more-presets"
        primaryAction={{ label: 'MANAGE PRESETS', onClick: () => {} }}
        secondaryAction={{ label: 'NEW PRESET', onClick: () => {}, variant: 'outline' }}
      >
        <div className="site00-dw-more-tool__preset-chips">
          {PRESET_CHIPS.map((chip) => (
            <span key={chip} className="site00-dw-more-tool__preset-chip">
              {chip}
            </span>
          ))}
        </div>
        {displayPresets.length ? (
          <div className="site00-dw-more-tool__preset-cards">
            {displayPresets.map((preset) => (
              <button
                key={preset.presetId}
                type="button"
                className="site00-dw-more-tool__preset-card"
                onClick={() => setSelected(preset)}
              >
                <strong>{preset.name}</strong>
                <em>{preset.intentType.replace(/_/g, ' ')}</em>
              </button>
            ))}
          </div>
        ) : null}
      </MoreToolPageShell>

      <DesignDetailsDrawer open={!!selected} title={selected?.name ?? 'PRESET'} onClose={() => setSelected(null)}>
        {selected ? (
          <dl className="site00-dw-more-tool__detail-grid">
            <div>
              <dt>NAME</dt>
              <dd>{selected.name}</dd>
            </div>
            <div>
              <dt>WHAT IT DOES</dt>
              <dd>{selected.instructionTemplate || 'Custom instruction template'}</dd>
            </div>
            <div>
              <dt>WHEN IT APPLIES</dt>
              <dd>{selected.targetScope ?? 'ANY ASSET'}</dd>
            </div>
            <div>
              <dt>ASSET TYPES</dt>
              <dd>{selected.assetTypes.join(', ')}</dd>
            </div>
            <div>
              <dt>LAST USED</dt>
              <dd>{selected.lastUsedAt ? new Date(selected.lastUsedAt).toLocaleDateString() : 'NEVER'}</dd>
            </div>
          </dl>
        ) : null}
      </DesignDetailsDrawer>
    </>
  );
}
