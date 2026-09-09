/**
 * P0.VR.5 — Founder-facing multi-asset deconstruction job workspace.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BUILT_IN_PRESET_IDS,
  JOB_WORKFLOW_STEPS,
  type AssetJob,
  type AssetJobPlanSummary,
  type DesignInstructionPreset,
  type DetectedAssetCandidate,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr5/browserClient.js';
import {
  addJobSourceUpload,
  applyJobCropActions,
  bindJobAssets,
  confirmJobCrops,
  createDesignAssetJob,
  listInstructionPresets,
  reconstructJobAssets,
  runJobDetection,
  saveJobPreset,
  suggestJobPresets,
  updateJobInstruction,
  uploadJobAssets,
  approveJobVersion,
} from './designAssetJobApi';
import type { DesignReferenceFidelityContract } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr7/browserClient.js';
import { confirmFidelityInterpretation, type FidelityInterpretation } from './designFidelityApi';
import { DesignReferenceFidelityBadge } from './DesignReferenceFidelityBadge';
import { DesignReferenceInterpretationPanel } from './DesignReferenceInterpretationPanel';
import { DesignDwSectionIcon } from './DesignDwSectionIcon';
import { Site00TrashIcon } from '../../icons/Site00HubIcons';

import { ASSET_PIPELINE_STEP_LABELS } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/index.js';

const QUICK_PRESETS = ['ISOLATE ICON', 'MULTI-ASSET', 'EXTRACT BACKGROUND', 'REPLACE CURRENT ASSET'] as const;

export type DesignAssetJobWorkspaceProps = {
  projectId: string;
  pageId: string;
  route: string;
  referenceUrl: string | null;
  sourcePage?: string | null;
};

export function DesignAssetJobWorkspace({
  projectId,
  pageId,
  route,
  referenceUrl,
  sourcePage,
}: DesignAssetJobWorkspaceProps) {
  const [job, setJob] = useState<AssetJob | null>(null);
  const [plan, setPlan] = useState<AssetJobPlanSummary | null>(null);
  const [presets, setPresets] = useState<DesignInstructionPreset[]>([]);
  const [suggestedPresets, setSuggestedPresets] = useState<DesignInstructionPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(BUILT_IN_PRESET_IDS.CUSTOM);
  const [instruction, setInstruction] = useState('');
  const [busy, setBusy] = useState(false);
  const [blocker, setBlocker] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [viewStep, setViewStep] = useState<string>('UPLOAD');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [activeQuickPreset, setActiveQuickPreset] = useState<string>('ISOLATE ICON');
  const [selectedProvider, setSelectedProvider] = useState('GPT IMAGE 2 EDIT (PRIMARY)');
  const [selectedOutputCandidate, setSelectedOutputCandidate] = useState('A');
  const [alternateCrop, setAlternateCrop] = useState('A');
  const [fidelityContract, setFidelityContract] = useState<DesignReferenceFidelityContract | null>(null);
  const [interpretation, setInterpretation] = useState<FidelityInterpretation | null>(null);
  const [showContract, setShowContract] = useState(false);

  useEffect(() => {
    void listInstructionPresets().then((res) => {
      if (res.presets) setPresets(res.presets);
    });
  }, []);

  useEffect(() => {
    if (!instruction.trim()) return;
    const t = setTimeout(() => {
      void suggestJobPresets({ founderInstruction: instruction }).then((res) => {
        if (res.suggested?.length) setSuggestedPresets(res.suggested);
      });
    }, 400);
    return () => clearTimeout(t);
  }, [instruction]);

  const currentStep = job?.currentStep ?? 'UPLOAD';

  const stepIndex = useMemo(
    () => JOB_WORKFLOW_STEPS.indexOf(currentStep as (typeof JOB_WORKFLOW_STEPS)[number]),
    [currentStep],
  );

  useEffect(() => {
    setViewStep(currentStep);
  }, [currentStep]);

  const viewStepIndex = useMemo(
    () => JOB_WORKFLOW_STEPS.indexOf(viewStep as (typeof JOB_WORKFLOW_STEPS)[number]),
    [viewStep],
  );

  const detectedCount = job?.detectedRegions.length ?? 0;
  const approvedCropCount = job?.detectedRegions.filter((c) => c.founderDecision === 'CONFIRMED').length ?? 0;

  const ensureJob = useCallback(async () => {
    if (job) return job;
    const res = await createDesignAssetJob({
      workspaceId: 'design-workspace',
      projectId,
      pageId,
      route,
      founderInstruction: instruction,
      selectedPresetId,
    });
    if (res.job) {
      setJob(res.job);
      return res.job;
    }
    return null;
  }, [job, projectId, pageId, route, instruction, selectedPresetId]);

  const handlePresetChange = useCallback(
    (presetId: string) => {
      setSelectedPresetId(presetId);
      const preset = presets.find((p) => p.presetId === presetId);
      if (preset?.instructionTemplate) setInstruction(preset.instructionTemplate);
    },
    [presets],
  );

  const handleFileUpload = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setBusy(true);
      setBlocker(null);
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        setUploadPreview(dataUrl);
        const activeJob = await ensureJob();
        if (!activeJob) return;
        const res = await addJobSourceUpload({
          jobId: activeJob.jobId,
          url: dataUrl,
          fileName: file.name,
          sourcePage: sourcePage ?? pageId,
          sourceRoute: route,
        });
        if (res.job) {
          setJob(res.job);
          if ('plan' in res && res.plan) setPlan(res.plan);
          if (res.fidelityContract) setFidelityContract(res.fidelityContract);
          if (res.interpretation) setInterpretation(res.interpretation);
        }
      } finally {
        setBusy(false);
      }
    },
    [ensureJob, pageId, route, sourcePage],
  );

  const handleUseReference = useCallback(async () => {
    if (!referenceUrl) return;
    setBusy(true);
    try {
      setUploadPreview(referenceUrl);
      const activeJob = await ensureJob();
      if (!activeJob) return;
      const res = await addJobSourceUpload({
        jobId: activeJob.jobId,
        url: referenceUrl,
        fileName: 'approved-reference.jpg',
        sourcePage: sourcePage ?? pageId,
        sourceRoute: route,
      });
      if (res.job) {
        setJob(res.job);
        if ('plan' in res && res.plan) setPlan(res.plan);
        if (res.fidelityContract) setFidelityContract(res.fidelityContract);
        if (res.interpretation) setInterpretation(res.interpretation);
      }
    } finally {
      setBusy(false);
    }
  }, [referenceUrl, ensureJob, pageId, route, sourcePage]);

  const handleConfirmInterpretation = useCallback(async () => {
    if (!fidelityContract) return;
    setBusy(true);
    try {
      const res = await confirmFidelityInterpretation(fidelityContract.contractId);
      if (res.contract) setFidelityContract(res.contract);
    } finally {
      setBusy(false);
    }
  }, [fidelityContract]);

  const handleInstructionSubmit = useCallback(async () => {
    setBusy(true);
    setBlocker(null);
    try {
      const activeJob = await ensureJob();
      if (!activeJob) return;
      const res = await updateJobInstruction({
        jobId: activeJob.jobId,
        founderInstruction: instruction,
        selectedPresetId,
      });
      if (res.job) {
        setJob(res.job);
        if (res.plan) setPlan(res.plan);
      }
    } finally {
      setBusy(false);
    }
  }, [ensureJob, instruction, selectedPresetId]);

  const handleDetect = useCallback(async () => {
    if (!job) return;
    setBusy(true);
    setBlocker(null);
    try {
      const res = await runJobDetection({ jobId: job.jobId });
      if (res.job) {
        setJob(res.job);
        if (res.plan) setPlan(res.plan);
      }
    } finally {
      setBusy(false);
    }
  }, [job]);

  const handleCropAction = useCallback(
    async (candidateId: string, type: 'CONFIRM' | 'REJECT' | 'SKIP') => {
      if (!job) return;
      const res = await applyJobCropActions({
        jobId: job.jobId,
        actions: [{ type, candidateId }],
      });
      if (res.job) setJob(res.job);
    },
    [job],
  );

  const handleConfirmAllCrops = useCallback(async () => {
    if (!job) return;
    setBusy(true);
    setBlocker(null);
    try {
      await applyJobCropActions({ jobId: job.jobId, actions: [{ type: 'CONFIRM_ALL' }] });
      const res = await confirmJobCrops({ jobId: job.jobId });
      if (res.job) setJob(res.job);
      if (!res.ok) setBlocker(res.blocker ?? 'CROP_CONFIRMATION_FAILED');
    } finally {
      setBusy(false);
    }
  }, [job]);

  const handleReconstruct = useCallback(async () => {
    if (!job) return;
    setBusy(true);
    setBlocker(null);
    try {
      const res = await reconstructJobAssets({ jobId: job.jobId, explicitFounderAction: true });
      if (res.job) setJob(res.job);
      if (res.blocked) setBlocker(res.blocker ?? 'GENERATION_BLOCKED');
    } finally {
      setBusy(false);
    }
  }, [job]);

  const handleApproveAll = useCallback(async () => {
    if (!job) return;
    setBusy(true);
    try {
      for (const v of job.reconstructedVersions.filter((r) => r.approvalState === 'PENDING')) {
        await approveJobVersion({ jobId: job.jobId, versionId: v.versionId, approved: true });
      }
      const versionIds = job.reconstructedVersions.map((v) => v.versionId);
      const uploadRes = await uploadJobAssets({ jobId: job.jobId, versionIds });
      if (uploadRes.job) setJob(uploadRes.job);
      const bindRes = await bindJobAssets({ jobId: job.jobId, versionIds });
      if (bindRes.job) setJob(bindRes.job);
    } finally {
      setBusy(false);
    }
  }, [job]);

  const handleSavePreset = useCallback(async () => {
    if (!job || !instruction.trim()) return;
    const res = await saveJobPreset({
      name: `CUSTOM ${job.jobType}`,
      instructionTemplate: instruction,
      intentType: job.jobType,
      assetTypes: job.targetAssetTypes,
      multiAsset: job.multiAsset,
      orderingRule: job.orderingRule,
      backgroundPolicy: job.backgroundPolicy,
      replacementBehavior: job.replacementMapping?.slotMatchingMode ?? 'NONE',
      targetScope: job.replacementMapping?.replacementTargetScope ?? null,
      fromJobId: job.jobId,
    });
    if (res.preset) {
      setPresets((prev) => [...prev, res.preset!]);
    }
  }, [job, instruction]);

  const sourceUpload = job?.sourceUploads[0];
  const sourceMeta = sourceUpload
    ? `${sourceUpload.imageWidth ?? '—'} × ${sourceUpload.imageHeight ?? '—'}`
    : '—';

  const renderDetectCard = (candidate: DetectedAssetCandidate) => (
    <article key={candidate.candidateId} className="site00-dw-v3-detect-card">
      <span
        className={`site00-dw-v3-detect-card__check${candidate.founderDecision === 'CONFIRMED' ? ' is-on' : ''}`}
        aria-hidden
      >
        {candidate.founderDecision === 'CONFIRMED' ? '✓' : ''}
      </span>
      <div className="site00-dw-v3-detect-card__preview">
        {uploadPreview ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${uploadPreview})`,
              backgroundPosition: `-${candidate.boundingBox.x * 0.15}px -${candidate.boundingBox.y * 0.15}px`,
              backgroundSize: `${(job?.sourceUploads[0]?.imageWidth ?? 946) * 0.15}px`,
            }}
          />
        ) : null}
      </div>
      <strong>{candidate.classification.toUpperCase()}</strong>
      <span>
        {candidate.classification.toUpperCase()} · CONF {(candidate.confidence * 100).toFixed(0)}%
      </span>
    </article>
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderActiveStage = () => {
    switch (viewStep) {
      case 'UPLOAD':
        return (
          <div className="site00-dw-v3-stage">
            <header className="site00-dw-v3-stage__head">
              <h2>
                <span className="site00-dw-v3-stage__num">01</span> UPLOAD REFERENCE
              </h2>
              <p>ADD A DESIGN REFERENCE TO START THE ASSET RECONSTRUCTION PIPELINE.</p>
            </header>
            {fidelityContract ? (
              <DesignReferenceFidelityBadge
                contract={fidelityContract}
                onViewContract={() => setShowContract((v) => !v)}
              />
            ) : null}
            {fidelityContract && interpretation ? (
              <DesignReferenceInterpretationPanel
                contract={fidelityContract}
                interpretation={interpretation}
                busy={busy}
                showContract={showContract}
                onConfirm={() => void handleConfirmInterpretation()}
                onEditInterpretation={() => setViewStep('INSTRUCT')}
                onCloseContract={() => setShowContract(false)}
              />
            ) : null}
            <div
              className="site00-dw-v3-upload-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) void handleFileUpload(file);
              }}
            >
              <span className="site00-dw-v3-upload-zone__icon" aria-hidden>
                <DesignDwSectionIcon iconId="image" />
              </span>
              <strong>DROP DESIGN REFERENCE</strong>
              <span>PNG, JPG, WEBP · UP TO 50MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/*"
                hidden
                id="site00-dw-upload-input"
                onChange={(e) => void handleFileUpload(e.target.files?.[0] ?? null)}
              />
              <label htmlFor="site00-dw-upload-input" className="site00-dw-v3-btn site00-dw-v3-btn--dark">
                ↑ CHOOSE FILE
              </label>
              {referenceUrl ? (
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" disabled={busy} onClick={() => void handleUseReference()}>
                  USE APPROVED REFERENCE
                </button>
              ) : null}
            </div>
            <div className="site00-dw-v3-recent-uploads">
              <div className="site00-dw-v3-recent-uploads__head">
                <strong>RECENT UPLOADS</strong>
                <button type="button">VIEW ALL →</button>
              </div>
              <div className="site00-dw-v3-recent-uploads__rail">
                {job?.sourceUploads.length ? (
                  job.sourceUploads.slice(0, 5).map((u) => (
                    <div key={u.uploadId} className="site00-dw-v3-recent-uploads__thumb">
                      {uploadPreview ? <img src={uploadPreview} alt="" /> : <div />}
                      <time>{new Date().toLocaleDateString()}</time>
                      <span>{u.fileName?.replace(/\.[^.]+$/, '') ?? 'UPLOAD'}</span>
                    </div>
                  ))
                ) : (
                  <div className="site00-dw-v3-recent-uploads__thumb">
                    <div aria-hidden />
                    <span>NO UPLOADS YET</span>
                  </div>
                )}
              </div>
            </div>
            <button type="button" className="site00-dw-v3-preset-strip">
              <DesignDwSectionIcon iconId="presets" />
              <div>
                <strong>INSTRUCTION PRESETS</strong>
                <span>QUICK START WITH SAVED INSTRUCTIONS</span>
              </div>
              <span className="site00-dw-v3-preset-strip__chev">▾</span>
            </button>
            <div className="site00-dw-v3-stage__actions">
              <button
                type="button"
                className="site00-dw-v3-btn site00-dw-v3-btn--primary"
                disabled={!job?.sourceUploadIds.length}
                onClick={() => setViewStep('INSTRUCT')}
              >
                CONTINUE →
              </button>
            </div>
          </div>
        );

      case 'INSTRUCT':
        return (
          <div className="site00-dw-v3-stage">
            <header className="site00-dw-v3-stage__head">
              <h2>
                <span className="site00-dw-v3-stage__num">02</span> INSTRUCT
              </h2>
              <p>TELL US WHAT TO EXTRACT, ISOLATE, OR REPLACE.</p>
            </header>
            {uploadPreview ? (
              <div className="site00-dw-v3-asset-preview-card">
                <img src={uploadPreview} alt="" />
                <span className="site00-dw-v3-asset-preview-card__check" aria-hidden>
                  ✓
                </span>
                <div>
                  <strong>{sourceUpload?.fileName?.toUpperCase() ?? 'SCREENSHOT.PNG'}</strong>
                  <span>{sourceMeta}</span>
                </div>
                <button type="button" className="site00-dw-v3-asset-preview-card__trash" aria-label="Remove upload">
                  <Site00TrashIcon size={12} />
                </button>
              </div>
            ) : null}
            <label className="site00-dw-v3-field">
              <span>INSTRUCTION PRESET</span>
              <select value={selectedPresetId} onChange={(e) => handlePresetChange(e.target.value)}>
                {presets.map((p) => (
                  <option key={p.presetId} value={p.presetId}>
                    {p.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            {suggestedPresets.length ? (
              <div className="site00-dw-v3-chip-row">
                <span className="site00-dw-v3-viewport-rail__label">SUGGESTED</span>
                {suggestedPresets.map((p) => (
                  <button key={p.presetId} type="button" className="site00-dw-v3-chip" onClick={() => handlePresetChange(p.presetId)}>
                    {p.name.toUpperCase()}
                  </button>
                ))}
              </div>
            ) : null}
            <label className="site00-dw-v3-field">
              <span>FOUNDER INSTRUCTION</span>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value.toUpperCase())}
                placeholder="EXTRACT HEADER, NAVIGATION, AND HERO ICON..."
                rows={4}
                maxLength={500}
              />
              <em>{instruction.length}/500</em>
            </label>
            <div className="site00-dw-v3-chip-row site00-dw-v3-chip-row--scroll">
              {QUICK_PRESETS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`site00-dw-v3-chip${activeQuickPreset === chip ? ' is-active' : ''}`}
                  onClick={() => {
                    setActiveQuickPreset(chip);
                    setInstruction((prev) => (prev ? `${prev} ${chip}` : chip));
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="site00-dw-v3-stage__actions site00-dw-v3-stage__actions--split">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" disabled={busy || !instruction.trim()} onClick={() => void handleInstructionSubmit()}>
                SAVE INSTRUCTION
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" disabled={!instruction.trim()} onClick={() => void handleSavePreset()}>
                SAVE AS PRESET
              </button>
              <button
                type="button"
                className="site00-dw-v3-btn site00-dw-v3-btn--primary"
                disabled={busy || !instruction.trim()}
                onClick={async () => {
                  await handleInstructionSubmit();
                  if (job?.sourceUploadIds.length) await handleDetect();
                  setViewStep('DETECT');
                }}
              >
                NEXT: DETECT ASSETS →
              </button>
            </div>
          </div>
        );

      case 'DETECT':
        return (
          <div className="site00-dw-v3-stage">
            <header className="site00-dw-v3-stage__head">
              <h2>
                <span className="site00-dw-v3-stage__num">03</span> DETECT ASSETS
              </h2>
              <p>REVIEW WHAT THE SYSTEM FOUND BEFORE CROPPING.</p>
            </header>
            {uploadPreview ? (
              <div className="site00-dw-v3-source-card">
                <img src={uploadPreview} alt="Source screenshot" />
                <div>
                  <strong>SOURCE SCREENSHOT</strong>
                  <span>{sourceUpload?.fileName?.toUpperCase() ?? 'SCREENSHOT.PNG'}</span>
                  <span>{sourceMeta}</span>
                </div>
              </div>
            ) : null}
            <div className="site00-dw-v3-detect-summary">
              <div>
                <strong>{detectedCount}</strong>
                <span>ASSETS FOUND</span>
              </div>
              <div>
                <strong>{job?.multiAsset ? 'MULTI' : 'SINGLE'}</strong>
                <span>{job?.multiAsset ? 'MULTI-ASSET JOB' : 'SINGLE ASSET'}</span>
              </div>
              <div>
                <strong>{detectedCount > 0 ? '✓' : '—'}</strong>
                <span>READY FOR CROP</span>
              </div>
            </div>
            {!job?.detectedRegions.length ? (
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={busy} onClick={() => void handleDetect()}>
                RUN DETECTION
              </button>
            ) : (
              <div className="site00-dw-v3-detect-grid">{job.detectedRegions.map(renderDetectCard)}</div>
            )}
            <div className="site00-dw-v3-chip-row site00-dw-v3-chip-row--scroll">
              {QUICK_PRESETS.slice(0, 3).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`site00-dw-v3-chip${activeQuickPreset === chip ? ' is-active' : ''}`}
                  onClick={() => setActiveQuickPreset(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="site00-dw-v3-stage__actions site00-dw-v3-stage__actions--split">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
                SAVE DETECTION
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" disabled={!instruction.trim()} onClick={() => void handleSavePreset()}>
                SAVE AS PRESET
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={!detectedCount} onClick={() => setViewStep('CONFIRM_CROP')}>
                NEXT: CONFIRM CROPS →
              </button>
            </div>
          </div>
        );

      case 'CONFIRM_CROP':
        return (
          <div className="site00-dw-v3-stage">
            <header className="site00-dw-v3-stage__head">
              <h2>
                <span className="site00-dw-v3-stage__num">04</span> CONFIRM CROPS
              </h2>
              <p>APPROVE EACH CROP BEFORE RECONSTRUCTION.</p>
            </header>
            <div className="site00-dw-v3-crop-progress">
              <span>
                {approvedCropCount} OF {detectedCount || 0} CROPS APPROVED
              </span>
              <div className="site00-dw-v3-crop-progress__bar">
                <div style={{ width: `${detectedCount ? (approvedCropCount / detectedCount) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="site00-dw-v3-crop-queue">
              {job?.detectedRegions.map((c) => (
                <button
                  key={c.candidateId}
                  type="button"
                  className={`site00-dw-v3-crop-tab${(selectedCandidateId ?? job.detectedRegions[0]?.candidateId) === c.candidateId ? ' is-active' : ''}`}
                  onClick={() => setSelectedCandidateId(c.candidateId)}
                >
                  {c.classification.toUpperCase()}
                  <br />
                  1 CROP
                </button>
              ))}
            </div>
            {job?.detectedRegions.length ? (
              <div className="site00-dw-v3-crop-workspace">
                <div className="site00-dw-v3-crop-source">
                  <div className="site00-dw-v3-crop-label">SOURCE IMAGE · {sourceMeta}</div>
                  {uploadPreview ? <img src={uploadPreview} alt="" /> : null}
                </div>
                <div className="site00-dw-v3-crop-preview">
                  <div className="site00-dw-v3-crop-label">
                    CROP PREVIEW ·{' '}
                    {job.detectedRegions.find((c) => c.candidateId === (selectedCandidateId ?? job.detectedRegions[0]?.candidateId))?.classification.toUpperCase() ?? 'ASSET'}
                  </div>
                  <div className="site00-dw-v3-checkerboard">
                    {uploadPreview ? (
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          backgroundImage: `url(${uploadPreview})`,
                          backgroundSize: 'cover',
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <p>RUN DETECTION FIRST.</p>
            )}
            <div className="site00-dw-v3-alternate-crops">
              {(['A', 'B', 'C'] as const).map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`site00-dw-v3-alternate-crops__item${alternateCrop === label ? ' is-active' : ''}`}
                  onClick={() => setAlternateCrop(label)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="site00-dw-v3-stage__actions site00-dw-v3-stage__actions--split">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-v3-btn--compact" disabled={busy} onClick={() => void handleConfirmAllCrops()}>
                APPROVE CROP
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
                ADJUST BOX
              </button>
              <button
                type="button"
                className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
                disabled={!selectedCandidateId && !job?.detectedRegions[0]?.candidateId}
                onClick={() => {
                  const id = selectedCandidateId ?? job?.detectedRegions[0]?.candidateId;
                  if (id) void handleCropAction(id, 'SKIP');
                }}
              >
                SKIP ASSET
              </button>
            </div>
            <p className="site00-dw-v3-safety-note">ⓘ NO GENERATION HAPPENS BEFORE CROP APPROVAL.</p>
            <div className="site00-dw-v3-stage__actions">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={busy || !job?.cropsConfirmed} onClick={() => setViewStep('RECONSTRUCT')}>
                NEXT: RECONSTRUCT →
              </button>
            </div>
          </div>
        );

      case 'RECONSTRUCT':
        return (
          <div className="site00-dw-v3-stage">
            <header className="site00-dw-v3-stage__head">
              <h2>
                <span className="site00-dw-v3-stage__num">05</span> RECONSTRUCT
              </h2>
              <p>REBUILD THE ASSET WITH CONTROLLED PROVIDER DISPATCH.</p>
            </header>
            <div className="site00-dw-v3-reconstruct-previews">
              <div className="site00-dw-v3-preview-pane">
                <div className="site00-dw-v3-preview-pane__label">APPROVED CROP · {sourceMeta}</div>
                <div className="site00-dw-v3-checkerboard">{uploadPreview ? <img src={uploadPreview} alt="Approved crop" /> : null}</div>
              </div>
              <div className="site00-dw-v3-preview-pane">
                <div className="site00-dw-v3-preview-pane__label">OUTPUT · TRANSPARENT</div>
                <div className="site00-dw-v3-checkerboard">
                  {job?.reconstructedVersions[0]?.outputUrl ? (
                    <img src={job.reconstructedVersions[0].outputUrl} alt="Output" />
                  ) : (
                    <span style={{ fontSize: 8 }}>OUTPUT PENDING</span>
                  )}
                </div>
              </div>
            </div>
            <div className="site00-dw-v3-provider-row">
              {['GPT IMAGE 2 EDIT (PRIMARY)', 'IDEOGRAM', 'PIXELCUT', 'FAL AUTO'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`site00-dw-v3-provider-chip${selectedProvider === p ? ' is-active' : ''}`}
                  onClick={() => setSelectedProvider(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="site00-dw-v3-option-chips">
              {['NO BACKGROUND', 'PRESERVE GEOMETRY', 'HIGH FIDELITY'].map((opt) => (
                <span key={opt} className="site00-dw-v3-option-chip">
                  ✓ {opt}
                </span>
              ))}
            </div>
            <label className="site00-dw-v3-field">
              <span>PROMPT</span>
              <textarea
                readOnly
                value={instruction || 'GENERATE THIS ICON BY ITSELF WITH NO BACKGROUND.'}
                rows={2}
              />
              <em>{(instruction || 'GENERATE THIS ICON BY ITSELF WITH NO BACKGROUND.').length}/500</em>
            </label>
            <div className="site00-dw-v3-sub-stepper">
              <span className="is-done">✓ CROP APPROVED</span>
              <span className={job?.reconstructedVersions.length ? 'is-done' : 'is-active'}>
                {job?.reconstructedVersions.length ? '✓' : '◉'} GENERATING
              </span>
              <span>BACKGROUND CHECK</span>
              <span>READY FOR REVIEW</span>
            </div>
            <div className="site00-dw-v3-dispatch-meta">
              <span>DISPATCH COUNT ({job?.dispatchCounts.executed ?? 0} / {job?.dispatchCounts.planned ?? 1})</span>
              <span className="site00-dw-v3-reconstruct-guard">
                <DesignDwSectionIcon iconId="spend-guard" /> SPEND GUARD
              </span>
            </div>
            <div className="site00-dw-v3-job-queue">
              {(job?.detectedRegions.length ? job.detectedRegions : [{ candidateId: 'placeholder' }]).slice(0, 4).map((c, i) => (
                <div key={c.candidateId} className={`site00-dw-v3-job-queue__thumb${i === 0 ? ' is-active' : ''}`}>
                  {uploadPreview ? (
                    <img src={uploadPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </div>
              ))}
            </div>
            <div className="site00-dw-v3-stage__actions site00-dw-v3-stage__actions--split">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" disabled={!instruction.trim()} onClick={() => void handleSavePreset()}>
                SAVE AS PRESET
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
                VIEW FULL QUEUE
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={busy || !job?.cropsConfirmed} onClick={() => void handleReconstruct()}>
                RUN RECONSTRUCTION
              </button>
            </div>
            <div className="site00-dw-v3-stage__actions">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={!job?.reconstructedVersions.length} onClick={() => setViewStep('APPROVE')}>
                NEXT: APPROVE OUTPUT →
              </button>
            </div>
          </div>
        );

      case 'APPROVE':
        return (
          <div className="site00-dw-v3-stage">
            <header className="site00-dw-v3-stage__head">
              <h2>
                <span className="site00-dw-v3-stage__num">06</span> APPROVE OUTPUT
              </h2>
              <p>COMPARE, CHOOSE, AND GREENLIGHT THE FINAL ASSET.</p>
            </header>
            <div className="site00-dw-v3-approve-compare">
              <div className="site00-dw-v3-checkerboard-wrap">
                <div className="site00-dw-v3-checkerboard">{uploadPreview ? <img src={uploadPreview} alt="Source crop" /> : null}</div>
                <span className="site00-dw-v3-checkerboard__dim">{sourceMeta}</span>
              </div>
              <button type="button" className="site00-dw-v3-approve-swap" aria-label="Swap comparison">
                ⇅
              </button>
              <div className="site00-dw-v3-checkerboard-wrap">
                <div className="site00-dw-v3-checkerboard">
                  {job?.reconstructedVersions[0]?.outputUrl ? (
                    <img src={job.reconstructedVersions[0].outputUrl} alt="Final asset" />
                  ) : (
                    <span style={{ fontSize: 8 }}>PENDING</span>
                  )}
                </div>
                <span className="site00-dw-v3-checkerboard__dim">{sourceMeta}</span>
              </div>
            </div>
            <div className="site00-dw-v3-candidates">
              {(['A', 'B', 'C'] as const).map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`site00-dw-v3-candidate${selectedOutputCandidate === label ? ' is-active' : ''}`}
                  onClick={() => setSelectedOutputCandidate(label)}
                >
                  {selectedOutputCandidate === label ? <span className="site00-dw-v3-candidate__badge">{label}</span> : null}
                  {label}
                </button>
              ))}
            </div>
            <div className="site00-dw-v3-quality-list">
              <span style={{ fontSize: 8, marginRight: 4 }}>QUALITY CHECKLIST 4/4</span>
              {['CLEAN EDGES', 'NO BACKGROUND', 'SHAPE MATCH', 'READY TO REPLACE'].map((q) => (
                <span key={q} className="site00-dw-v3-quality-pill">
                  ✓ {q}
                </span>
              ))}
            </div>
            <div className="site00-dw-v3-stage__actions site00-dw-v3-stage__actions--split">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-v3-btn--compact" disabled={busy} onClick={() => void handleApproveAll()}>
                ✓ APPROVE
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" disabled={busy || !job?.cropsConfirmed} onClick={() => void handleReconstruct()}>
                REGENERATE
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={() => setViewStep('CONFIRM_CROP')}>
                ← BACK TO CROP
              </button>
            </div>
            <div className="site00-dw-v3-asset-queue">
              {(job?.detectedRegions.length ? job.detectedRegions : [{ candidateId: 'x', classification: 'ASSET' }]).map((c, i) => (
                <div key={c.candidateId} className={`site00-dw-v3-asset-queue__item${i === 0 ? ' is-approved' : ''}`}>
                  <strong>{c.classification.toUpperCase()}</strong>
                  <span>{i === 0 ? 'APPROVED' : 'PENDING'}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'REPLACE':
        return (
          <div className="site00-dw-v3-stage">
            <header className="site00-dw-v3-stage__head">
              <h2>
                <span className="site00-dw-v3-stage__num">07</span> REPLACE LIVE
              </h2>
              <p>PUBLISH THE APPROVED ASSET INTO THE PAGE SYSTEM.</p>
            </header>
            <div className="site00-dw-v3-live-hero">
              <div className="site00-dw-v3-live-preview">
                {job?.reconstructedVersions[0]?.outputUrl || uploadPreview ? (
                  <img src={job?.reconstructedVersions[0]?.outputUrl ?? uploadPreview ?? ''} alt="" />
                ) : (
                  <div className="site00-dw-v3-checkerboard" style={{ width: 80, height: 80 }} />
                )}
                {job?.reconstructedVersions.some((v) => v.bindState === 'BOUND') ? (
                  <span className="site00-dw-v3-live-badge">✓ LIVE</span>
                ) : null}
              </div>
              <div className="site00-dw-v3-live-tiles">
                <div className="site00-dw-v3-live-tile">
                  <strong>ASSET NAME</strong>
                  {job?.detectedRegions[0]?.classification.toUpperCase() ?? '—'}
                </div>
                <div className="site00-dw-v3-live-tile">
                  <strong>SUPABASE STORED</strong>
                  {job?.reconstructedVersions.some((v) => v.uploadState === 'UPLOADED') ? '✓ YES' : '—'}
                </div>
                <div className="site00-dw-v3-live-tile">
                  <strong>LINKED PAGE</strong>
                  {route.toUpperCase()}
                </div>
                <div className="site00-dw-v3-live-tile">
                  <strong>LAST UPDATED</strong>
                  BY SYSTEM
                </div>
              </div>
            </div>
            <div className="site00-dw-v3-replace-compare">
              <div className="site00-dw-v3-replace-compare__pane">
                <span className="is-before">BEFORE</span>
                <div className="site00-dw-v3-pages__empty-thumb" style={{ maxWidth: 100, margin: '0 auto' }} />
              </div>
              <span aria-hidden>→</span>
              <div className="site00-dw-v3-replace-compare__pane">
                <span className="is-after">AFTER</span>
                <div className="site00-dw-v3-checkerboard" style={{ maxWidth: 100, margin: '0 auto', minHeight: 60 }}>
                  {job?.reconstructedVersions[0]?.outputUrl ? (
                    <img src={job.reconstructedVersions[0].outputUrl} alt="" />
                  ) : null}
                </div>
              </div>
            </div>
            <div className="site00-dw-v3-replacement-map">
              <div className={`site00-dw-v3-replacement-map__row${job?.reconstructedVersions.some((v) => v.bindState === 'BOUND') ? ' is-done' : ''}`}>
                <span>PROJECTS HEADER</span>
                <span>{job?.reconstructedVersions.some((v) => v.bindState === 'BOUND') ? '✓ UPDATED' : 'PENDING'}</span>
              </div>
              <div className="site00-dw-v3-replacement-map__row">
                <span>MOBILE PAGE</span>
                <span>PENDING</span>
              </div>
              <div className="site00-dw-v3-replacement-map__row">
                <span>DESKTOP PAGE</span>
                <span>PENDING</span>
              </div>
            </div>
            <div className="site00-dw-v3-multi-progress">
              <span>
                {approvedCropCount} OF {detectedCount || 1} COMPLETE
              </span>
              <div className="site00-dw-v3-multi-progress__bar">
                <div style={{ width: `${detectedCount ? (approvedCropCount / detectedCount) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="site00-dw-v3-stage__actions site00-dw-v3-stage__actions--split">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
                VIEW LIVE PAGE
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
                OPEN ASSET LIBRARY
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={busy} onClick={() => void handleApproveAll()}>
                REPLACE NEXT ASSET →
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="site00-dw-v3-pipeline" data-design-tab="assets">
      <nav className="site00-dw-v3-stepper" aria-label="Asset pipeline steps">
        {JOB_WORKFLOW_STEPS.map((step, i) => {
          const complete = i < stepIndex;
          const current = viewStep === step;
          const reachable = i <= stepIndex;
          return (
            <button
              key={step}
              type="button"
              className={`site00-dw-v3-stepper__step${complete ? ' is-complete' : ''}${current ? ' is-current' : ''}`}
              disabled={!reachable}
              onClick={() => reachable && setViewStep(step)}
              aria-current={current ? 'step' : undefined}
            >
              <span className="site00-dw-v3-stepper__dot">{complete ? '✓' : String(i + 1).padStart(2, '0')}</span>
              <span className="site00-dw-v3-stepper__label">{ASSET_PIPELINE_STEP_LABELS[step]?.split(' ').slice(1).join(' ') ?? step}</span>
            </button>
          );
        })}
      </nav>

      {blocker ? <p className="site00-dw-v3-blocker">{blocker.toUpperCase()}</p> : null}

      <div className="site00-dw-v3-stage-shell">{renderActiveStage()}</div>

      {(plan || job) && viewStepIndex >= stepIndex ? (
        <details className="site00-dw-v3-inspector">
          <summary>JOB DETAILS</summary>
          <dl className="site00-dw-job-plan">
            <dt>JOB TYPE</dt>
            <dd>{(plan?.jobType ?? job?.jobType)?.toUpperCase()}</dd>
            <dt>EST. DISPATCH</dt>
            <dd>{plan?.estimatedDispatchCount ?? job?.dispatchCounts.planned ?? 0}</dd>
            <dt>CROPS CONFIRMED</dt>
            <dd>{job?.cropsConfirmed ? 'YES' : 'NO'}</dd>
          </dl>
        </details>
      ) : null}
    </section>
  );
}
