/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 — embedded Grok asset agent (fixture pipeline, no live spend).
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
import { compileDesignPageContext } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/pageContext.js';
import { listPageConceptCandidates } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import { useDesignGrokDock } from './DesignGrokDockContext';
import { useDesignAgentTarget } from './useDesignAgentTarget';

const MODES: readonly GrokAssetMode[] = [
  'PAGE_ASSET_PACK',
  'SINGLE_ASSET',
  'ICON_SYSTEM',
  'REPLACE_ASSET',
  'ASSET_VARIATION',
];

export function DesignGrokDock({ projectSlug }: { projectSlug: string }) {
  const { open, setOpen } = useDesignGrokDock();
  const agentTarget = useDesignAgentTarget();
  const target = agentTarget.projectSlug === projectSlug ? agentTarget : { ...agentTarget, projectSlug };
  const pageId = target.pageId ?? `${projectSlug}:overview`;
  const [mode, setMode] = useState<GrokAssetMode>('ICON_SYSTEM');
  const [prompt, setPrompt] = useState('');
  const [attachmentClass, setAttachmentClass] = useState<GrokAttachmentClass>('REFERENCE');
  const [attachments, setAttachments] = useState<{ name: string; class: GrokAttachmentClass; dataUrl: string }[]>([]);
  const [includeCapture, setIncludeCapture] = useState(true);
  const [pendingCostAck, setPendingCostAck] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  const pageCtx = useMemo(() => compileDesignPageContext(projectSlug, pageId), [pageId, projectSlug]);
  const concepts = listPageConceptCandidates(projectSlug, pageId);
  const selectedConcept = concepts.find((c) => c.status === 'SELECTED') ?? concepts[0] ?? null;

  const staged = useMemo(
    () => listStagedGrokAssets(projectSlug, pageId),
    [pageId, projectSlug, refresh],
  );
  const approved = useMemo(
    () => listApprovedGrokAssets(projectSlug, pageId),
    [pageId, projectSlug, refresh],
  );

  const onFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.match(/^image\/(png|jpeg|webp)$/i)) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      setAttachments((prev) => [...prev, { name: file.name, class: attachmentClass, dataUrl }]);
    };
    reader.readAsDataURL(file);
  }, [attachmentClass]);

  const runFixtureGeneration = useCallback(() => {
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
      viewport: agentTarget.target.viewport ?? 'MOBILE',
      mode,
      prompt: prompt || `${mode} fixture`,
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
    setRefresh((n) => n + 1);
  }, [
    agentTarget.target.viewport,
    attachments,
    mode,
    pageId,
    pendingCostAck,
    projectSlug,
    prompt,
    selectedConcept?.conceptId,
  ]);

  const approvePreview = useCallback(() => {
    if (!previewId) return;
    approveGrokStagedAsset(previewId);
    setRefresh((n) => n + 1);
  }, [previewId]);

  if (!open) return null;

  return (
    <aside id="s00-grok-panel" className="s00-grok-dock" aria-label="Grok asset agent">
      <header className="s00-grok-dock__head">
        <div>
          <p className="s00-grok-dock__eyebrow">GROK · ASSET AGENT</p>
          <h2 className="s00-grok-dock__title">{target.pageLabel ?? pageCtx?.route ?? pageId}</h2>
          <p className="s00-grok-dock__meta">
            PAGE {target.pageLabel ?? '—'} · CONCEPT {selectedConcept?.conceptTitle ?? 'NONE'} ·{' '}
            {agentTarget.target.viewport ?? 'MOBILE'}
          </p>
        </div>
        <button type="button" className="s00-grok-dock__close" onClick={() => setOpen(false)} aria-label="Close Grok panel">
          CLOSE
        </button>
      </header>

      <div className="s00-grok-dock__body">
        <label className="s00-grok-dock__field">
          MODE
          <select value={mode} onChange={(e) => setMode(e.target.value as GrokAssetMode)}>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>

        {mode === 'PAGE_ASSET_PACK' && !selectedConcept ?
          <p className="s00-grok-dock__warn">SELECT A PAGE CONCEPT FIRST</p>
        : null}

        <label className="s00-grok-dock__field">
          PROMPT
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="Describe the asset…" />
        </label>

        <label className="s00-grok-dock__check">
          <input type="checkbox" checked={includeCapture} onChange={(e) => setIncludeCapture(e.target.checked)} />
          INCLUDE CURRENT CAPTURE
        </label>

        <div className="s00-grok-dock__upload">
          <label className="s00-grok-dock__field">
            ATTACHMENT CLASS
            <select value={attachmentClass} onChange={(e) => setAttachmentClass(e.target.value as GrokAttachmentClass)}>
              <option value="REFERENCE">REFERENCE</option>
              <option value="CURRENT_SCREEN">CURRENT SCREEN</option>
              <option value="GOLDEN">GOLDEN</option>
              <option value="STYLE_REFERENCE">STYLE REFERENCE</option>
              <option value="ASSET_TO_MODIFY">ASSET TO MODIFY</option>
            </select>
          </label>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onFiles(e.target.files)} />
        </div>

        {pendingCostAck ?
          <div className="s00-grok-dock__cost">
            <p>MODEL: GROK (FIXTURE) · ASSETS: 1 · EST: $0.00</p>
            <button type="button" onClick={runFixtureGeneration}>
              CONFIRM FIXTURE GENERATION
            </button>
            <button type="button" className="s00-grok-dock__ghost" onClick={() => setPendingCostAck(false)}>
              CANCEL
            </button>
          </div>
        : <button type="button" className="s00-grok-dock__primary" onClick={runFixtureGeneration}>
            GENERATE (FIXTURE)
          </button>
        }

        <section className="s00-grok-dock__preview" aria-label="Generated asset preview">
          <h3>PREVIEW</h3>
          {previewId ?
            staged.find((s) => s.assetId === previewId) ?
              <>
                <img
                  src={staged.find((s) => s.assetId === previewId)!.previewDataUrl}
                  alt=""
                  className="s00-grok-dock__previewImg"
                />
                <button type="button" onClick={approvePreview}>
                  APPROVE
                </button>
              </>
            : null
          : <p>No staged output yet.</p>}
        </section>

        <section className="s00-grok-dock__manifest">
          <h3>MANIFEST</h3>
          <p>STAGED: {staged.length} · APPROVED: {approved.length}</p>
        </section>
      </div>
    </aside>
  );
}

export default DesignGrokDock;
