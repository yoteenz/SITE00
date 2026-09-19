/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 + GROK-GATING1 + P0.VR.DESIGN.OPUS-AI-CONSOLES1
 * — the Grok asset agent console (fixture pipeline; gated; no live model call).
 *
 * Grok's job is downstream asset production, so this console is a contact sheet
 * first: the concept it is producing against, the assets it has produced, and
 * the one selected asset in detail. Eligibility is still the gate — but a
 * blocked console keeps its visual body and adds one blocker card and a
 * four-cell readiness strip, instead of collapsing into a wall of gate text.
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import {
  appendGrokAssetRun,
  approveGrokStagedAsset,
  createFixtureGrokStagedAsset,
  listApprovedGrokAssets,
  listStagedGrokAssets,
  persistStagedGrokAsset,
  type GrokAssetMode,
  type GrokAttachmentClass,
  type GrokStagedAsset,
} from '../../../../../shared/site00-design-workspace-production/designGrokAssetModel.js';
import { modeAllowedForEligibility } from '../../../../../shared/site00-design-workspace-production/designGrokAssetEligibility.js';
import {
  authorityUploadRejection,
  grokAssetCategories,
  grokAssetCategory,
  grokAssetDisplayName,
  grokConsoleStatus,
  grokModesForTab,
  grokReadinessStrip,
  GROK_CONSOLE_TABS,
  GROK_MODE_LABELS,
  type GrokAssetCategoryId,
  type GrokConsoleTabId,
} from '../../../../../shared/site00-design-workspace-production/designAiConsolePresentation.js';
import { loadPageCaptureHistory } from '../../../../../shared/site00-design-workspace-production/designPageCapture.js';
import {
  loadPageAuthorityWorkflow,
  savePageAuthorityWorkflow,
  setGrokOptOut,
} from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { compileDesignPageContext } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/pageContext.js';
import { listPageConceptCandidates } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import { resolveDesignPageTargetForShell } from '../production/designProductionPageTarget';
import { useDesignGrokEligibility } from '../opusDirect/DesignGrokEligibilityProvider';
import {
  AiConsoleButton,
  AiConsoleEmptyState,
  AiConsoleMeta,
  AiConsolePreview,
  AiConsoleSection,
  AiConsoleSectionAction,
  AiConsoleSurface,
  AiConsoleTab,
} from '../aiConsoles/AiConsoleShell';
import { useDesignGrokDock } from './DesignGrokDockContext';
import { useDesignAgentTarget } from './useDesignAgentTarget';

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
  // The registry page id carries its route, so the console must resolve the
  // shell target the same way the workspace does. Guessing `slug:overview`
  // pointed the console at a page id the eligibility provider never uses, and
  // the concept and staged assets silently came back empty.
  const shellTarget = useMemo(() => resolveDesignPageTargetForShell(projectSlug), [projectSlug]);
  const pageId = target.pageId ?? shellTarget.pageId;
  const viewport = (agentTarget.target.viewport === 'DESKTOP' || agentTarget.target.viewport === 'TABLET' ?
    agentTarget.target.viewport
  : 'MOBILE') as 'MOBILE' | 'TABLET' | 'DESKTOP';

  const [tab, setTab] = useState<GrokConsoleTabId>('GENERATE');
  const [mode, setMode] = useState<GrokAssetMode>('PAGE_ASSET_PACK');
  const [category, setCategory] = useState<GrokAssetCategoryId>('ALL');
  const [prompt, setPrompt] = useState('');
  const [attachmentClass, setAttachmentClass] = useState<GrokAttachmentClass>('REFERENCE');
  const [attachments, setAttachments] = useState<{ name: string; class: GrokAttachmentClass; dataUrl: string }[]>([]);
  const [includeCapture, setIncludeCapture] = useState(true);
  const [pendingCostAck, setPendingCostAck] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [refreshAssets, setRefreshAssets] = useState(0);
  const [showRequirements, setShowRequirements] = useState(false);
  const [showInspect, setShowInspect] = useState(false);
  const [regenerate, setRegenerate] = useState<{ assetId: string; note: string } | null>(null);
  const [replacement, setReplacement] = useState<{ assetId: string; name: string; dataUrl: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<{ beforeSrc: string; afterSrc: string; label: string } | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);

  const attachInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  const pageCtx = useMemo(() => compileDesignPageContext(projectSlug, pageId), [pageId, projectSlug]);
  const concepts = listPageConceptCandidates(projectSlug, pageId);
  const selectedConcept = concepts.find((c) => c.status === 'SELECTED' || c.status === 'PROMOTED') ?? concepts[0] ?? null;
  const capture = loadPageCaptureHistory(projectSlug, pageId, viewport);

  const staged = useMemo(
    () => listStagedGrokAssets(projectSlug, pageId),
    [pageId, projectSlug, refreshAssets],
  );
  const approved = useMemo(
    () => listApprovedGrokAssets(projectSlug, pageId),
    [pageId, projectSlug, refreshAssets],
  );

  const status = grokConsoleStatus(eligibility);
  const readiness = grokReadinessStrip(eligibility.gates);
  const modeGate = modeAllowedForEligibility(mode, eligibility);
  const tabModes = grokModesForTab(tab);

  const libraryAssets: GrokStagedAsset[] = tab === 'LIBRARY' ? approved : [...staged, ...approved];
  const categories = grokAssetCategories(libraryAssets);
  const visibleAssets =
    category === 'ALL' ? libraryAssets : libraryAssets.filter((asset) => grokAssetCategory(asset) === category);
  const selectedAsset = libraryAssets.find((asset) => asset.assetId === selectedAssetId) ?? null;

  const readFile = useCallback((file: File, onDone: (dataUrl: string) => void) => {
    const rejection = authorityUploadRejection(file);
    if (rejection) {
      setUploadError(rejection);
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => onDone(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  }, []);

  const onAttachFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      readFile(file, (dataUrl) =>
        setAttachments((prev) => [...prev, { name: file.name, class: attachmentClass, dataUrl }]),
      );
    },
    [attachmentClass, readFile],
  );

  const runFixtureGeneration = useCallback(() => {
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
    setSelectedAssetId(asset.assetId);
    setPendingCostAck(false);
    setRefreshAssets((n) => n + 1);
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

  const confirmRegenerate = useCallback(() => {
    if (!regenerate) return;
    const source = libraryAssets.find((asset) => asset.assetId === regenerate.assetId);
    if (!source) return;
    const runId = `grok-run-${Date.now()}`;
    appendGrokAssetRun({
      runId,
      projectId: projectSlug,
      pageId,
      conceptId: selectedConcept?.conceptId ?? null,
      viewport,
      mode: 'ASSET_VARIATION',
      prompt: regenerate.note || `Regenerate ${source.slot}`,
      attachments: [],
      outputs: [],
      approvedOutputs: [],
      rejectedOutputs: [],
      model: 'GROK',
      estimatedCostUsd: 0,
      timestamp: new Date().toISOString(),
    });
    const next = createFixtureGrokStagedAsset({ projectId: projectSlug, pageId, slot: source.slot, runId });
    setComparison({ beforeSrc: source.previewDataUrl, afterSrc: next.previewDataUrl, label: 'REGENERATED' });
    setSelectedAssetId(next.assetId);
    setRegenerate(null);
    setRefreshAssets((n) => n + 1);
  }, [libraryAssets, pageId, projectSlug, regenerate, selectedConcept?.conceptId, viewport]);

  const confirmReplacement = useCallback(() => {
    if (!replacement) return;
    const source = libraryAssets.find((asset) => asset.assetId === replacement.assetId);
    if (!source) return;
    const next: GrokStagedAsset = {
      ...source,
      assetId: `${source.assetId}-r${Date.now().toString(36)}`,
      previewDataUrl: replacement.dataUrl,
      status: 'STAGED',
      createdAt: new Date().toISOString(),
    };
    persistStagedGrokAsset(next);
    setComparison({ beforeSrc: source.previewDataUrl, afterSrc: next.previewDataUrl, label: 'FOUNDER UPLOAD' });
    setSelectedAssetId(next.assetId);
    setReplacement(null);
    setRefreshAssets((n) => n + 1);
  }, [libraryAssets, replacement]);

  const approveSelected = useCallback(() => {
    if (!selectedAsset) return;
    approveGrokStagedAsset(selectedAsset.assetId);
    setRefreshAssets((n) => n + 1);
  }, [selectedAsset]);

  const setOptOut = (optOut: boolean) => {
    const wf = loadPageAuthorityWorkflow(projectSlug, pageId);
    savePageAuthorityWorkflow(projectSlug, pageId, setGrokOptOut(wf, optOut));
    refresh();
  };

  if (!open) return null;

  const conceptSrc = selectedConcept?.visualReference ?? null;
  const generateDisabledReason =
    !modeGate.allowed ? `${status.headline} — ${status.instruction}`
    : tab === 'LIBRARY' ? 'LIBRARY is a review surface. Switch to GENERATE to produce assets.'
    : null;

  return (
    <AiConsoleSurface
      console="grok"
      testId="design-grok-console"
      panelId="s00-grok-panel"
      name="GROK ASSET AGENT"
      model="GROK · FIXTURE"
      status={status.label}
      statusTone={status.tone}
      title="GROK ASSET AGENT"
      purpose={`AI asset production for ${projectSlug.toUpperCase()} · ${(target.pageLabel ?? shellTarget.pageLabel).toUpperCase()}`}
      ariaLabel="Grok asset agent console"
      onClose={() => setOpen(false)}
      tabs={
        <>
          {GROK_CONSOLE_TABS.map((entry) => (
            <AiConsoleTab
              key={entry.id}
              label={entry.label}
              active={tab === entry.id}
              onClick={() => {
                setTab(entry.id);
                const first = grokModesForTab(entry.id)[0];
                if (first) setMode(first);
                setCategory('ALL');
              }}
            />
          ))}
          <span className="s00-aic__tabsTrail">
            <span className="s00-aic__modelChip">{GROK_MODE_LABELS[mode]}</span>
          </span>
        </>
      }
      footer={
        <>
          <AiConsoleButton label="CANCEL" onClick={() => setOpen(false)} />
          <AiConsoleButton
            label="REGENERATE"
            glyph="⟳"
            onClick={() => selectedAsset && setRegenerate({ assetId: selectedAsset.assetId, note: '' })}
            disabled={!selectedAsset || !eligibility.canGenerateProductionAssets}
            disabledReason={
              !selectedAsset ? 'Select an asset first.' : `${status.headline} — ${status.instruction}`
            }
          />
          <AiConsoleButton
            label="INSPECT"
            glyph="⌕"
            onClick={() => setShowInspect((value) => !value)}
            disabled={!selectedAsset}
            disabledReason="Select an asset first."
          />
          <AiConsoleButton
            label={pendingCostAck ? 'CONFIRM GENERATION' : 'GENERATE ASSETS →'}
            primary
            onClick={runFixtureGeneration}
            disabled={Boolean(generateDisabledReason)}
            disabledReason={generateDisabledReason}
            interactionId="grok-generate-assets"
          />
        </>
      }
    >
      {!eligibility.canGenerateProductionAssets ? (
        <AiConsoleSection label="ASSET PRODUCTION" ariaLabel="Grok readiness">
          <div className="s00-aic__blocker">
            <span className="s00-aic__blockerGlyph" aria-hidden="true">
              !
            </span>
            <span className="s00-aic__blockerText">
              <span className="s00-aic__blockerTitle">{status.headline}</span>
              <span className="s00-aic__blockerNote">{status.instruction}</span>
            </span>
            <button
              type="button"
              className="s00-aic__blockerAction"
              onClick={() => setShowRequirements((value) => !value)}
            >
              {showRequirements ? 'HIDE REQUIREMENTS' : 'VIEW REQUIREMENTS'}
            </button>
          </div>

          <div className="s00-aic__ready" style={{ marginTop: 8 }}>
            {readiness.map((cell) => (
              <div className="s00-aic__readyCell" key={cell.id} data-state={cell.state}>
                <span className="s00-aic__readyMark" aria-hidden="true">
                  ✓
                </span>
                <span>
                  <span className="s00-aic__readyLabel">{cell.label}</span>
                  <span className="s00-aic__readyNote">{cell.note}</span>
                </span>
              </div>
            ))}
          </div>

          {showRequirements ? (
            <div style={{ marginTop: 8 }}>
              <p className="s00-aic__secLabel">GROK ASSET PRODUCTION · NOT READY</p>
              <AiConsoleMeta
                rows={eligibility.gates.map((gate) => ({
                  label: gate.label.toUpperCase(),
                  value: gate.status === 'PASS' ? 'PASS' : gate.detail ? gate.detail.toUpperCase() : gate.status,
                }))}
              />
              {eligibility.nextAction ? <p className="s00-aic__notice">NEXT: {eligibility.nextAction}</p> : null}
            </div>
          ) : null}

          <div className="s00-aic__chips" style={{ marginTop: 8 }}>
            {eligibility.eligibility === 'BLOCKED_GROK_NOT_NEEDED' ? (
              <button type="button" className="s00-aic__chip" onClick={() => setOptOut(false)}>
                RE-ENABLE GROK ASSET PRODUCTION
              </button>
            ) : (
              <button type="button" className="s00-aic__chip" onClick={() => setOptOut(true)}>
                NO GROK ASSETS NEEDED
              </button>
            )}
          </div>
        </AiConsoleSection>
      ) : null}

      <AiConsoleSection
        label="CONCEPT REFERENCE"
        action={
          <AiConsoleSectionAction
            label="VIEW FULLSCREEN ↗"
            onClick={() => conceptSrc && setLightbox({ src: conceptSrc, label: 'CONCEPT REFERENCE' })}
            disabled={!conceptSrc}
            disabledReason="No concept image for this page yet."
          />
        }
      >
        <div className="s00-aic__split s00-aic__split--wide">
          <AiConsolePreview
            src={conceptSrc}
            alt="Selected page concept"
            emptyLabel="NO CONCEPT SELECTED"
            emptyNote="Select a page concept in the workspace gallery before producing assets."
            onOpen={() => conceptSrc && setLightbox({ src: conceptSrc, label: 'CONCEPT REFERENCE' })}
          />
          <div>
            <p className="s00-aic__metaTitle">{(selectedConcept?.conceptTitle ?? 'NO CONCEPT').toUpperCase()}</p>
            <AiConsoleMeta
              rows={[
                { label: 'PAGE', value: (target.pageLabel ?? shellTarget.pageLabel).toUpperCase() },
                { label: 'VIEWPORT', value: viewport },
                { label: 'STATUS', value: selectedConcept?.status ?? 'NONE' },
                { label: 'ROUTE', value: pageCtx?.route ?? '—' },
                { label: 'CONCEPT ID', value: selectedConcept?.conceptId ?? '—' },
              ]}
            />
            <div className="s00-aic__chips" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="s00-aic__chip"
                disabled={concepts.length < 2}
                title={
                  concepts.length < 2 ?
                    'Only one concept exists for this page — generate more in the workspace gallery.'
                  : 'Opens the concept gallery in the workspace.'
                }
                onClick={() => setOpen(false)}
              >
                ⇄ CHANGE CONCEPT
              </button>
            </div>
          </div>
        </div>
      </AiConsoleSection>

      {eligibility.canGenerateProductionAssets ? (
        <AiConsoleSection label="CURRENT VS DESIGN TARGET">
          <div className="s00-aic__split">
            <div>
              <p className="s00-aic__metaSub">CURRENT TWIN CAPTURE</p>
              <AiConsolePreview
                src={capture.latest?.artifactPath ?? null}
                alt="Current twin capture"
                emptyLabel="NO CURRENT CAPTURE"
                onOpen={() =>
                  capture.latest?.artifactPath &&
                  setLightbox({ src: capture.latest.artifactPath, label: 'CURRENT CAPTURE' })
                }
              />
            </div>
            <div>
              <p className="s00-aic__metaSub">APPROVED DESIGN TARGET</p>
              <AiConsolePreview
                src={conceptSrc}
                alt="Approved design target"
                emptyLabel="NO DESIGN TARGET"
                onOpen={() => conceptSrc && setLightbox({ src: conceptSrc, label: 'DESIGN TARGET' })}
              />
            </div>
          </div>
        </AiConsoleSection>
      ) : null}

      {tab !== 'LIBRARY' ? (
        <AiConsoleSection label={tab === 'EDIT' ? 'REPLACE ASSET' : tab === 'VARIATIONS' ? 'ASSET VARIATION' : 'GENERATE ASSETS'}>
          <div className="s00-aic__chips">
            {tabModes.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={mode === value}
                className={`s00-aic__chip${mode === value ? ' is-on' : ''}`}
                onClick={() => setMode(value)}
              >
                {GROK_MODE_LABELS[value]}
              </button>
            ))}
          </div>

          <div className="s00-aic__composer" style={{ marginTop: 8 }}>
            <textarea
              className="s00-aic__composerInput"
              value={prompt}
              rows={3}
              placeholder="Describe the asset — subject, treatment, slot and how it should sit in the page."
              onChange={(event) => setPrompt(event.target.value)}
              aria-label="Asset request"
            />
            <div className="s00-aic__composerTools">
              <button
                type="button"
                className="s00-aic__tool"
                onClick={() => attachInputRef.current?.click()}
                title="Attach a PNG, JPG or WEBP reference."
              >
                <span className="s00-aic__toolGlyph" aria-hidden="true">
                  ⬚
                </span>
                ADD REFERENCE
              </button>
              <select
                className="s00-aic__select"
                value={attachmentClass}
                onChange={(event) => setAttachmentClass(event.target.value as GrokAttachmentClass)}
                aria-label="Attachment class"
              >
                {ATTACHMENT_CLASSES.map((value) => (
                  <option key={value} value={value}>
                    {value.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`s00-aic__tool s00-aic__tool--trail${includeCapture ? '' : ''}`}
                aria-pressed={includeCapture}
                onClick={() => setIncludeCapture((value) => !value)}
                title="Send the current page capture with the request."
              >
                {includeCapture ? '✓ ' : '· '}
                INCLUDE CURRENT CAPTURE
              </button>
            </div>
          </div>
          <input
            ref={attachInputRef}
            className="s00-aic__hiddenFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => onAttachFiles(event.target.files)}
          />
          {uploadError ? <p className="s00-aic__notice s00-aic__notice--error">{uploadError}</p> : null}
          {attachments.length > 0 ? (
            <div className="s00-aic__thumbs" style={{ marginTop: 8 }}>
              {attachments.map((attachment, index) => (
                <span key={`${attachment.name}-${index}`}>
                  <span className="s00-aic__thumb" style={{ display: 'inline-block' }}>
                    <img src={attachment.dataUrl} alt="" />
                    <button
                      type="button"
                      className="s00-aic__thumbRemove"
                      aria-label={`Remove ${attachment.name}`}
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                    >
                      ✕
                    </button>
                  </span>
                  <span className="s00-aic__thumbCap">{attachment.class.replace(/_/g, ' ')}</span>
                </span>
              ))}
            </div>
          ) : null}

          {pendingCostAck ? (
            <p className="s00-aic__notice s00-aic__notice--grant">
              MODEL: GROK (FIXTURE) · ASSETS: 1 · EST $0.00 — press CONFIRM GENERATION to stage the output, or{' '}
              <button type="button" className="s00-aic__inlineLink" onClick={() => setPendingCostAck(false)}>
                cancel
              </button>
              .
            </p>
          ) : null}
        </AiConsoleSection>
      ) : null}

      <AiConsoleSection
        label={tab === 'LIBRARY' ? 'APPROVED LIBRARY' : 'STAGED OUTPUT'}
        action={
          categories.length > 1 ? undefined : (
            <AiConsoleSectionAction label="ALL" onClick={() => setCategory('ALL')} disabled />
          )
        }
      >
        {categories.length > 1 ? (
          <div className="s00-aic__chips" style={{ marginBottom: 8 }}>
            {categories.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={`s00-aic__chip${category === entry.id ? ' is-on' : ''}`}
                onClick={() => setCategory(entry.id)}
              >
                {entry.label} {entry.count}
              </button>
            ))}
          </div>
        ) : null}

        {visibleAssets.length > 0 ? (
          <div className="s00-aic__grid">
            {visibleAssets.map((asset) => (
              <button
                key={asset.assetId}
                type="button"
                className={`s00-aic__tile${selectedAssetId === asset.assetId ? ' is-selected' : ''}`}
                aria-pressed={selectedAssetId === asset.assetId}
                onClick={() => setSelectedAssetId(asset.assetId)}
              >
                <img className="s00-aic__tileImg" src={asset.previewDataUrl} alt="" />
                {selectedAssetId === asset.assetId ? (
                  <span className="s00-aic__tileCheck" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
                <span className="s00-aic__tileCap">{grokAssetDisplayName(asset)}</span>
              </button>
            ))}
            <button
              type="button"
              className="s00-aic__tile s00-aic__tile--more"
              onClick={runFixtureGeneration}
              disabled={Boolean(generateDisabledReason)}
              title={generateDisabledReason ?? 'Stage one more asset for this page.'}
            >
              + GENERATE MORE
            </button>
          </div>
        ) : (
          <AiConsoleEmptyState
            title={tab === 'LIBRARY' ? 'NO APPROVED ASSETS' : 'NO ASSETS YET'}
            note={
              tab === 'LIBRARY' ?
                'Approved assets appear here once you accept a staged output.'
              : 'Generate assets to see results here. Every output is staged for your review before it reaches the page.'
            }
          />
        )}
      </AiConsoleSection>

      {selectedAsset ? (
        <AiConsoleSection
          label="SELECTED ASSET"
          action={
            <AiConsoleSectionAction
              label={`${visibleAssets.findIndex((asset) => asset.assetId === selectedAsset.assetId) + 1} / ${visibleAssets.length}`}
              onClick={() => setSelectedAssetId(null)}
            />
          }
        >
          <div className="s00-aic__split">
            <AiConsolePreview
              src={selectedAsset.previewDataUrl}
              alt={grokAssetDisplayName(selectedAsset)}
              emptyLabel="NO PREVIEW"
              contain
              onOpen={() =>
                setLightbox({ src: selectedAsset.previewDataUrl, label: grokAssetDisplayName(selectedAsset) })
              }
            />
            <div>
              <p className="s00-aic__metaTitle">{grokAssetDisplayName(selectedAsset)}</p>
              <AiConsoleMeta
                rows={[
                  { label: 'DIMENSIONS', value: `${selectedAsset.width} × ${selectedAsset.height}` },
                  { label: 'FORMAT', value: selectedAsset.format },
                  { label: 'SLOT', value: selectedAsset.slot.toUpperCase() },
                  { label: 'STATUS', value: selectedAsset.status },
                  { label: 'CATEGORY', value: grokAssetCategory(selectedAsset) },
                ]}
              />
              <div className="s00-aic__chips" style={{ marginTop: 8 }}>
                <button type="button" className="s00-aic__chip" onClick={() => replaceInputRef.current?.click()}>
                  ⬆ REPLACE
                </button>
                <button type="button" className="s00-aic__chip" onClick={() => setShowInspect((value) => !value)}>
                  ⌕ INSPECT
                </button>
                <button
                  type="button"
                  className="s00-aic__chip"
                  disabled={!eligibility.canGenerateProductionAssets}
                  title={
                    eligibility.canGenerateProductionAssets ? undefined : (
                      `${status.headline} — ${status.instruction}`
                    )
                  }
                  onClick={() => setRegenerate({ assetId: selectedAsset.assetId, note: '' })}
                >
                  ⟳ REGENERATE
                </button>
                {selectedAsset.status === 'STAGED' ? (
                  <button
                    type="button"
                    className="s00-aic__chip is-on"
                    onClick={approveSelected}
                    disabled={!eligibility.canGenerateProductionAssets}
                    title={
                      eligibility.canGenerateProductionAssets ? undefined : (
                        `${status.headline} — ${status.instruction}`
                      )
                    }
                  >
                    ✓ APPROVE
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <input
            ref={replaceInputRef}
            className="s00-aic__hiddenFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              readFile(file, (dataUrl) =>
                setReplacement({ assetId: selectedAsset.assetId, name: file.name, dataUrl }),
              );
            }}
          />
          {showInspect ? (
            <AiConsoleMeta
              rows={[
                { label: 'ASSET ID', value: selectedAsset.assetId },
                { label: 'RUN', value: selectedAsset.runId },
                { label: 'ORIGIN', value: selectedAsset.origin },
                { label: 'CREATED', value: selectedAsset.createdAt.slice(0, 19).replace('T', ' ') },
              ]}
            />
          ) : null}
        </AiConsoleSection>
      ) : null}

      {regenerate ? (
        <AiConsoleSection label="CONFIRM REGENERATE">
          <div className="s00-aic__composer">
            <textarea
              className="s00-aic__composerInput"
              rows={2}
              value={regenerate.note}
              placeholder="Optional improvement request for this asset…"
              onChange={(event) => setRegenerate({ ...regenerate, note: event.target.value })}
              aria-label="Improvement request"
            />
            <div className="s00-aic__composerTools">
              <button type="button" className="s00-aic__tool" onClick={confirmRegenerate}>
                CONFIRM REGENERATE (FIXTURE)
              </button>
              <button type="button" className="s00-aic__tool s00-aic__tool--trail" onClick={() => setRegenerate(null)}>
                CANCEL
              </button>
            </div>
          </div>
        </AiConsoleSection>
      ) : null}

      {replacement ? (
        <AiConsoleSection label="CONFIRM REPLACEMENT">
          <div className="s00-aic__split">
            <div>
              <p className="s00-aic__metaSub">CURRENT</p>
              <AiConsolePreview
                src={libraryAssets.find((asset) => asset.assetId === replacement.assetId)?.previewDataUrl ?? null}
                alt="Current asset"
                emptyLabel="NO CURRENT ASSET"
                contain
              />
            </div>
            <div>
              <p className="s00-aic__metaSub">UPLOADED · {replacement.name.toUpperCase()}</p>
              <AiConsolePreview src={replacement.dataUrl} alt="Uploaded asset" emptyLabel="NO UPLOAD" contain />
            </div>
          </div>
          <div className="s00-aic__chips" style={{ marginTop: 8 }}>
            <AiConsoleButton label="CONFIRM REPLACEMENT" primary onClick={confirmReplacement} />
            <AiConsoleButton label="DISCARD" onClick={() => setReplacement(null)} />
          </div>
        </AiConsoleSection>
      ) : null}

      {comparison ? (
        <AiConsoleSection
          label={`BEFORE / ${comparison.label}`}
          action={<AiConsoleSectionAction label="DISMISS" onClick={() => setComparison(null)} />}
        >
          <div className="s00-aic__split">
            <AiConsolePreview src={comparison.beforeSrc} alt="Before" emptyLabel="NO BEFORE" contain />
            <AiConsolePreview src={comparison.afterSrc} alt="After" emptyLabel="NO AFTER" contain />
          </div>
        </AiConsoleSection>
      ) : null}

      <AiConsoleSection label="MANIFEST">
        <div className="s00-aic__manifest">
          <span className="s00-aic__manifestItem">
            STAGED <strong>{staged.length}</strong>
          </span>
          <span className="s00-aic__manifestItem">
            APPROVED <strong>{approved.length}</strong>
          </span>
          <span className="s00-aic__manifestItem">
            IMPLEMENTED <strong>{approved.filter((asset) => asset.slot.includes('implemented')).length}</strong>
          </span>
          <span className="s00-aic__manifestState">
            {staged.length + approved.length === 0 ? 'NO ASSETS YET' : eligibility.assetProductionStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </AiConsoleSection>

      {lightbox ? (
        <div className="s00-aic__lightbox" role="dialog" aria-label={`${lightbox.label} fullscreen`}>
          <button
            type="button"
            className="s00-aic__lightboxScrim"
            aria-label="Close fullscreen"
            onClick={() => setLightbox(null)}
          />
          <figure className="s00-aic__lightboxFrame">
            <img src={lightbox.src} alt={lightbox.label} />
            <figcaption>{lightbox.label}</figcaption>
          </figure>
        </div>
      ) : null}
    </AiConsoleSurface>
  );
}

export default DesignGrokDock;
