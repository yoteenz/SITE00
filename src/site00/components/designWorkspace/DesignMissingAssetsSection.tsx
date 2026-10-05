/**
 * P0.VR.2B — Missing visual assets table (desktop) / cards (mobile).
 */

import type { ReferenceVisualAssetSlot } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2a/client.js';
import type { MissingAssetsSummary } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2a/client.js';
import type { CompiledReferenceAssetPrompt } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2a/client.js';

type Props = {
  slots: ReferenceVisualAssetSlot[];
  summary: MissingAssetsSummary;
  selectedPromptSlotId: string | null;
  selectedPrompt: CompiledReferenceAssetPrompt | null;
  onInspectPrompt: (slotId: string) => void;
  onGenerate: (slotId: string) => void;
  onUseAsset: (slotId: string) => void;
  onGenerateAll: () => void;
};

function slotStatusLabel(slot: ReferenceVisualAssetSlot): string {
  if (slot.generationStatus === 'EXISTING_ASSET_FOUND') return 'REFERENCE FOUND';
  if (slot.generationStatus === 'READY_TO_GENERATE') return 'READY TO GENERATE';
  if (slot.generationStatus === 'GENERATING' || slot.generationStatus === 'QUEUED') return 'GENERATING';
  if (slot.assetStatus === 'FAILED') return 'GENERATION FAILED';
  if (slot.assetStatus === 'BLOCKED') return 'BLOCKED';
  return slot.assetStatus;
}

function slotSubtitle(slot: ReferenceVisualAssetSlot): string {
  if (slot.assetRole === 'STICKY_NOTE') return 'Top Priority';
  if (slot.assetRole === 'CHARACTER_PORTRAIT') return 'Founder';
  return slot.regionId.replace(/-/g, ' ');
}

export function DesignMissingAssetsSection({
  slots,
  summary,
  selectedPromptSlotId,
  selectedPrompt,
  onInspectPrompt,
  onGenerate,
  onUseAsset,
  onGenerateAll,
}: Props) {
  if (slots.length === 0) return null;

  return (
    <section className="site00-dw-assets" data-visual-reconstruction="p0vr2a-missing-assets">
      <div className="site00-dw-assets__head">
        <h2>MISSING VISUAL ASSETS</h2>
        {summary.readyToGenerate > 0 ? (
          <span className="site00-dw-assets__badge">{summary.readyToGenerate} ASSETS NEED GENERATION</span>
        ) : null}
      </div>

      <div className="site00-dw-assets__table-wrap">
        <table className="site00-dw-assets__table">
          <thead>
            <tr>
              <th>ASSET</th>
              <th>SLOT</th>
              <th>SIZE</th>
              <th>STATUS</th>
              <th>PROMPT</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.slotId}>
                <td>
                  <div className="site00-dw-assets__asset-cell">
                    <span className="site00-dw-assets__thumb" aria-hidden />
                    <div>
                      <strong>{slot.assetRole.replace(/_/g, ' ')}</strong>
                      <span>{slotSubtitle(slot)}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <code>{slot.regionId}</code>
                </td>
                <td>
                  {slot.width}×{slot.height}
                  <br />
                  {slot.aspectRatio}:1
                </td>
                <td>
                  <span
                    className={`site00-dw-assets__status${
                      slot.generationStatus === 'READY_TO_GENERATE' ? ' is-ready' : ''
                    }${slot.generationStatus === 'EXISTING_ASSET_FOUND' ? ' is-found' : ''}`}
                  >
                    {slotStatusLabel(slot)}
                  </span>
                </td>
                <td>
                  <button type="button" className="site00-dw-assets__prompt-btn" onClick={() => onInspectPrompt(slot.slotId)}>
                    💬
                  </button>
                </td>
                <td>
                  {slot.generationStatus === 'READY_TO_GENERATE' ? (
                    <button type="button" className="site00-dw-assets__generate-btn" onClick={() => onGenerate(slot.slotId)}>
                      GENERATE
                    </button>
                  ) : slot.generationStatus === 'EXISTING_ASSET_FOUND' ? (
                    <button type="button" className="site00-dw-assets__use-btn" onClick={() => onUseAsset(slot.slotId)}>
                      USE ASSET
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="site00-dw-assets__cards">
        {slots.map((slot) => (
          <article key={slot.slotId} className="site00-dw-assets__card">
            <div className="site00-dw-assets__card-head">
              <strong>{slot.assetRole.replace(/_/g, ' ')}</strong>
              <span>{slotSubtitle(slot)}</span>
            </div>
            <p>
              {slot.width}×{slot.height} · {slotStatusLabel(slot)}
            </p>
            <div className="site00-dw-assets__card-actions">
              <button type="button" onClick={() => onInspectPrompt(slot.slotId)}>
                PROMPT
              </button>
              {slot.generationStatus === 'READY_TO_GENERATE' ? (
                <button type="button" className="site00-dw-assets__generate-btn" onClick={() => onGenerate(slot.slotId)}>
                  GENERATE
                </button>
              ) : slot.generationStatus === 'EXISTING_ASSET_FOUND' ? (
                <button type="button" className="site00-dw-assets__use-btn" onClick={() => onUseAsset(slot.slotId)}>
                  USE ASSET
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {selectedPromptSlotId && selectedPrompt ? (
        <pre className="site00-dw-assets__prompt-panel">{selectedPrompt.promptText}</pre>
      ) : null}

      {summary.readyToGenerate > 0 ? (
        <button type="button" className="site00-dw-assets__generate-all" onClick={onGenerateAll}>
          GENERATE ALL READY ASSETS
        </button>
      ) : null}
    </section>
  );
}
