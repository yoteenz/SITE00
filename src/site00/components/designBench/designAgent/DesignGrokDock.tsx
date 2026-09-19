/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 + GROK-GATING1 — embedded Grok asset agent (gated).
 * P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 — rebuilt as an art-production desk on
 * the shared overlay grammar.
 *
 * Grok produces pictures, so this panel is judged on pictures: the current
 * capture and the approved target sit at the top, generated output lands in a
 * contact sheet, and the gating story is told with stage rows rather than a
 * paragraph of reasons.
 */

import { useCallback, useMemo, useState } from 'react';

import {
  appendGrokAssetRun,
  approveGrokStagedAsset,
  createFixtureGrokStagedAsset,
  listApprovedGrokAssets,
  listStagedGrokAssets,
  type GrokAssetMode,
  type GrokAttachmentClass,
} from '../../../../../shared/site00-design-workspace-production/designGrokAssetModel.js';
import { modeAllowedForEligibility } from '../../../../../shared/site00-design-workspace-production/designGrokAssetEligibility.js';
import { loadPageCaptureHistory } from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import {
  loadPageAuthorityWorkflow,
  savePageAuthorityWorkflow,
  setGrokOptOut,
} from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { compileDesignPageContext } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/pageContext.js';
import { listPageConceptCandidates } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import {
  OverlayActions,
  OverlayBody,
  OverlayCallout,
  OverlayChips,
  OverlayCompare,
  OverlayComposer,
  OverlayDropzone,
  OverlayFiles,
  OverlayMeta,
  OverlayPreview,
  OverlayRows,
  OverlaySection,
  OverlayStatus,
  OverlayThumbs,
} from '../production/designOverlayKit';
import { useDesignGrokEligibility } from '../opusDirect/DesignGrokEligibilityProvider';
import { useDesignGrokDock } from './DesignGrokDockContext';
import { useDesignAgentTarget } from './useDesignAgentTarget';

const MODES: readonly GrokAssetMode[] = [
  'PAGE_ASSET_PACK',
  'SINGLE_ASSET',
  'ICON_SYSTEM',
  'REPLACE_ASSET',
  'ASSET_VARIATION',
];

const ATTACHMENT_CLASSES: readonly GrokAttachmentClass[] = [
  'REFERENCE',
  'CURRENT_SCREEN',
  'GOLDEN',
  'STYLE_REFERENCE',
  'ASSET_TO_MODIFY',
];

export function DesignGrokDock({ projectSlug }: { projectSlug: string }) {
  const { open, setOpen } = useDesignGrokDock();
  const { eligibility, refresh } = useDesignGrokEligibility();
  const agentTarget = useDesignAgentTarget();
  const target = agentTarget.projectSlug === projectSlug ? agentTarget : { ...agentTarget, projectSlug };
  const pageId = target.pageId ?? `${projectSlug}:overview`;
  const viewport = (agentTarget.target.viewport === 'DESKTOP' || agentTarget.target.viewport === 'TABLET' ?
    agentTarget.target.viewport
  : 'MOBILE') as 'MOBILE' | 'TABLET' | 'DESKTOP';
  const [mode, setMode] = useState<GrokAssetMode>('PAGE_ASSET_PACK');
  const [prompt, setPrompt] = useState('');
  const [attachmentClass, setAttachmentClass] = useState<GrokAttachmentClass>('REFERENCE');
  const [attachments, setAttachments] = useState<{ name: string; class: GrokAttachmentClass; dataUrl: string }[]>([]);
  const [includeCapture, setIncludeCapture] = useState(true);
  const [pendingCostAck, setPendingCostAck] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [refreshAssets, setRefreshAssets] = useState(0);

  const pageCtx = useMemo(() => compileDesignPageContext(projectSlug, pageId), [pageId, projectSlug]);
  const concepts = listPageConceptCandidates(projectSlug, pageId);
  const selectedConcept = concepts.find((concept) => concept.status === 'SELECTED') ?? concepts[0] ?? null;
  const capture = loadPageCaptureHistory(projectSlug, pageId, viewport);

  const staged = useMemo(() => listStagedGrokAssets(projectSlug, pageId), [pageId, projectSlug, refreshAssets]);
  const approved = useMemo(() => listApprovedGrokAssets(projectSlug, pageId), [pageId, projectSlug, refreshAssets]);
  const preview = staged.find((asset) => asset.assetId === previewId) ?? null;

  const modeGate = modeAllowedForEligibility(mode, eligibility);

  const onFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file || !file.type.match(/^image\/(png|jpeg|webp)$/i)) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result ?? '');
        setAttachments((prev) => [...prev, { name: file.name, class: attachmentClass, dataUrl }]);
      };
      reader.readAsDataURL(file);
    },
    [attachmentClass],
  );

  const runGeneration = useCallback(() => {
    if (!modeGate.allowed) return;
    if (!pendingCostAck) {
      setPendingCostAck(true);
      return;
    }
    const runId = `grok-run-${Date.now()}`;
    appendGrokAssetRun({
      runId,
      projectId: projectSlug,
      pageId,
      conceptId: selectedConcept?.conceptId ?? null,
      viewport,
      mode,
      prompt: prompt || `${mode} run`,
      attachments,
      outputs: [],
      approvedOutputs: [],
      rejectedOutputs: [],
      model: 'GROK',
      estimatedCostUsd: 0,
      timestamp: new Date().toISOString(),
    });
    const asset = createFixtureGrokStagedAsset({
      projectId: projectSlug,
      pageId,
      slot: mode === 'ICON_SYSTEM' ? 'icon-system' : 'page-hero',
      runId,
    });
    setPreviewId(asset.assetId);
    setPendingCostAck(false);
    setRefreshAssets((count) => count + 1);
  }, [
    attachments,
    mode,
    modeGate.allowed,
    pageId,
    pendingCostAck,
    projectSlug,
    prompt,
    selectedConcept?.conceptId,
    viewport,
  ]);

  const approvePreview = useCallback(() => {
    if (!previewId) return;
    approveGrokStagedAsset(previewId);
    setRefreshAssets((count) => count + 1);
  }, [previewId]);

  const setOptOut = (optOut: boolean) => {
    const workflow = loadPageAuthorityWorkflow(projectSlug, pageId);
    savePageAuthorityWorkflow(projectSlug, pageId, setGrokOptOut(workflow, optOut));
    refresh();
  };

  if (!open) return null;

  const ready = eligibility.canGenerateProductionAssets;

  return (
    <aside id="s00-grok-panel" className="s00-grok-dock" aria-label="Grok asset agent">
      <header className="s00-grok-dock__head">
        <div>
          <p className="s00-grok-dock__eyebrow">GROK · ASSET AGENT</p>
          <h2 className="s00-grok-dock__title">{target.pageLabel ?? pageCtx?.route ?? pageId}</h2>
          <p className="s00-grok-dock__meta">
            {viewport} · {eligibility.assetProductionStatus.replace(/_/g, ' ')}
          </p>
        </div>
        <button
          type="button"
          className="s00-grok-dock__close"
          onClick={() => setOpen(false)}
          aria-label="Close Grok panel"
        >
          ✕
        </button>
      </header>

      <div className="s00-grok-dock__body">
        <OverlayBody>
          <OverlayCompare>
            <OverlayPreview
              src={capture.latest?.artifactPath}
              caption="CURRENT CAPTURE"
              side={<OverlayStatus label={capture.latest ? 'ON FILE' : 'MISSING'} />}
              emptyLabel="NO CAPTURE YET"
              emptyHint="CAPTURE SCREEN on the workspace hero gives Grok the live state."
            />
            <OverlayPreview
              src={selectedConcept?.visualReference ?? null}
              caption="APPROVED DESIGN TARGET"
              side={<OverlayStatus label={selectedConcept ? 'SELECTED' : 'MISSING'} />}
              emptyLabel="NO CONCEPT SELECTED"
            />
          </OverlayCompare>

          {ready ? null : (
            <OverlaySection
              title="GROK ASSET PRODUCTION · NOT READY"
              meta={eligibility.eligibility.replace(/_/g, ' ')}
            >
              <OverlayCallout title="WHY" tone="blocked">
                {eligibility.shortReason}
              </OverlayCallout>
              {eligibility.nextAction ?
                <OverlayCallout title="NEXT" tone="next">
                  {eligibility.nextAction}
                </OverlayCallout>
              : null}
              <OverlayRows
                rows={eligibility.gates.map((gate) => ({
                  id: gate.id,
                  name: gate.label,
                  sub: gate.detail ?? undefined,
                  side: <OverlayStatus label={gate.status} />,
                }))}
              />
              <OverlayActions
                secondary={[
                  eligibility.eligibility === 'BLOCKED_GROK_NOT_NEEDED' ?
                    { label: 'RE-ENABLE GROK ASSETS', onClick: () => setOptOut(false) }
                  : { label: 'NO GROK ASSETS NEEDED', onClick: () => setOptOut(true) },
                ]}
              />
            </OverlaySection>
          )}

          {ready ?
            <>
              <OverlaySection title="MODE" flat>
                <OverlayChips
                  active={mode}
                  onSelect={(id) => setMode(id as GrokAssetMode)}
                  chips={MODES.map((entry) => ({ id: entry, label: entry.replace(/_/g, ' ') }))}
                />
                {modeGate.allowed ? null : (
                  <OverlayCallout title="MODE UNAVAILABLE" tone="blocked">
                    {modeGate.reason ?? 'This mode is not available at the current readiness.'}
                  </OverlayCallout>
                )}
              </OverlaySection>

              <OverlaySection title="ASSET BRIEF" flat>
                <OverlayComposer
                  value={prompt}
                  onChange={setPrompt}
                  onSend={runGeneration}
                  placeholder="Describe the asset you need…"
                  sendLabel={pendingCostAck ? 'CONFIRM' : 'GENERATE'}
                  disabled={!modeGate.allowed}
                />
                <label className="tod-ok-note">
                  <input
                    type="checkbox"
                    checked={includeCapture}
                    onChange={(event) => setIncludeCapture(event.target.checked)}
                  />{' '}
                  INCLUDE CURRENT CAPTURE AS REFERENCE
                </label>
              </OverlaySection>

              <OverlaySection title="REFERENCES" meta={`${attachments.length} ATTACHED`}>
                <OverlayChips
                  active={attachmentClass}
                  onSelect={(id) => setAttachmentClass(id as GrokAttachmentClass)}
                  chips={ATTACHMENT_CLASSES.map((entry) => ({ id: entry, label: entry.replace(/_/g, ' ') }))}
                />
                <OverlayDropzone
                  accept="image/png,image/jpeg,image/webp"
                  hint={attachmentClass.replace(/_/g, ' ')}
                  onFiles={(files) => onFiles(files)}
                />
                <OverlayFiles
                  files={attachments.map((attachment, index) => ({
                    id: `${attachment.name}-${index}`,
                    name: `${attachment.name} · ${attachment.class.replace(/_/g, ' ')}`,
                    src: attachment.dataUrl,
                  }))}
                />
              </OverlaySection>

              {pendingCostAck ?
                <OverlayCallout title="CONFIRM SPEND" tone="next">
                  <OverlayMeta
                    entries={[
                      { k: 'MODEL', v: 'GROK' },
                      { k: 'ASSETS', v: '1' },
                      { k: 'ESTIMATE', v: '$0.00' },
                    ]}
                  />
                </OverlayCallout>
              : null}
            </>
          : null}

          <OverlaySection title="GENERATED" meta={`${staged.length} STAGED · ${approved.length} APPROVED`}>
            <OverlayThumbs
              items={staged.map((asset) => ({
                id: asset.assetId,
                src: asset.previewDataUrl,
                label: asset.slot,
                sub: asset.status,
                selected: asset.assetId === previewId,
              }))}
              onPick={setPreviewId}
              emptyLabel="NO GENERATED ASSETS YET"
              emptyHint="Generated output lands here as a contact sheet."
            />
            {preview ?
              <OverlayPreview
                src={preview.previewDataUrl}
                caption={`${preview.slot} · STAGED`}
                side={<OverlayStatus label={preview.status} />}
              />
            : null}
          </OverlaySection>

          <OverlayActions
            primary={
              ready ?
                {
                  label: pendingCostAck ? 'CONFIRM GENERATION' : 'GENERATE',
                  onClick: runGeneration,
                  disabled: !modeGate.allowed,
                }
              : undefined
            }
            secondary={[
              { label: 'APPROVE SELECTED', onClick: approvePreview, disabled: !preview || !ready },
              ...(pendingCostAck ? [{ label: 'CANCEL', onClick: () => setPendingCostAck(false) }] : []),
            ]}
          />
        </OverlayBody>
      </div>
    </aside>
  );
}

export default DesignGrokDock;
