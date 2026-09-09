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
  type ReconstructedAssetVersion,
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
      }
    } finally {
      setBusy(false);
    }
  }, [referenceUrl, ensureJob, pageId, route, sourcePage]);

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

  const renderCandidate = (candidate: DetectedAssetCandidate) => (
    <article key={candidate.candidateId} className="site00-dw-job-candidate">
      <div className="site00-dw-job-candidate__preview">
        {uploadPreview ? (
          <div
            className="site00-dw-job-candidate__crop-frame"
            style={{
              backgroundImage: `url(${uploadPreview})`,
              backgroundPosition: `-${candidate.boundingBox.x}px -${candidate.boundingBox.y}px`,
              backgroundSize: `${job?.sourceUploads[0]?.imageWidth ?? 946}px ${job?.sourceUploads[0]?.imageHeight ?? 667}px`,
              width: Math.min(candidate.boundingBox.width, 120),
              height: Math.min(candidate.boundingBox.height, 120),
            }}
          />
        ) : (
          <span>CROP {candidate.orderIndex + 1}</span>
        )}
      </div>
      <div className="site00-dw-job-candidate__meta">
        <strong>{candidate.classification}</strong>
        <span>SEQ {candidate.orderIndex + 1}</span>
        <span>CONF {(candidate.confidence * 100).toFixed(0)}%</span>
        <span>{candidate.founderDecision}</span>
        {candidate.lowConfidenceBlock ? <span className="site00-dw-job-candidate__warn">LOW CONF</span> : null}
      </div>
      <div className="site00-dw-job-candidate__actions">
        <button type="button" onClick={() => void handleCropAction(candidate.candidateId, 'CONFIRM')}>
          CONFIRM
        </button>
        <button type="button" onClick={() => void handleCropAction(candidate.candidateId, 'REJECT')}>
          REJECT
        </button>
        <button type="button" onClick={() => void handleCropAction(candidate.candidateId, 'SKIP')}>
          SKIP
        </button>
      </div>
    </article>
  );

  const renderVersion = (version: ReconstructedAssetVersion) => (
    <article key={version.versionId} className="site00-dw-job-output">
      <div className="site00-dw-job-output__thumb">
        {version.outputUrl ? <img src={version.outputUrl} alt="" /> : <span>PENDING</span>}
      </div>
      <div className="site00-dw-job-output__meta">
        <span>{version.provider}</span>
        <span>{version.approvalState}</span>
        <span>{version.uploadState}</span>
        <span>{version.bindState}</span>
      </div>
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
                🖼
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
            {uploadPreview ? (
              <div className="site00-dw-v3-upload-preview">
                <img src={uploadPreview} alt="Uploaded reference" />
              </div>
            ) : null}
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
                <div>
                  <strong>{job?.sourceUploads[0]?.fileName?.toUpperCase() ?? 'SCREENSHOT.PNG'}</strong>
                  <span>
                    {job?.sourceUploads[0]?.imageWidth ?? '—'} × {job?.sourceUploads[0]?.imageHeight ?? '—'}
                  </span>
                </div>
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
            <div className="site00-dw-v3-chip-row">
              {QUICK_PRESETS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`site00-dw-v3-chip${instruction.includes(chip) ? ' is-active' : ''}`}
                  onClick={() => setInstruction((prev) => (prev ? `${prev} ${chip}` : chip))}
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="site00-dw-v3-stage__actions site00-dw-v3-stage__actions--split">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" disabled={busy || !instruction.trim()} onClick={() => void handleInstructionSubmit()}>
                SAVE INSTRUCTION
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" disabled={!instruction.trim()} onClick={() => void handleSavePreset()}>
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
                <span>SOURCE SCREENSHOT</span>
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
                <strong>{detectedCount > 0 ? 'READY' : '—'}</strong>
                <span>FOR CROP</span>
              </div>
            </div>
            {!job?.detectedRegions.length ? (
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={busy} onClick={() => void handleDetect()}>
                RUN DETECTION
              </button>
            ) : (
              <div className="site00-dw-v3-detect-grid">{job.detectedRegions.map(renderCandidate)}</div>
            )}
            <div className="site00-dw-v3-stage__actions">
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
            <p className="site00-dw-v3-crop-progress">
              {approvedCropCount} OF {detectedCount || 0} CROPS APPROVED
            </p>
            <div className="site00-dw-v3-crop-queue">
              {job?.detectedRegions.map((c) => (
                <button
                  key={c.candidateId}
                  type="button"
                  className={`site00-dw-v3-crop-tab${selectedCandidateId === c.candidateId ? ' is-active' : ''}`}
                  onClick={() => setSelectedCandidateId(c.candidateId)}
                >
                  {c.classification.toUpperCase()}
                </button>
              ))}
            </div>
            {job?.detectedRegions.length ? (
              <div className="site00-dw-v3-crop-workspace">
                <div className="site00-dw-v3-crop-source">{uploadPreview ? <img src={uploadPreview} alt="" /> : null}</div>
                <div className="site00-dw-v3-crop-preview site00-dw-v3-checkerboard">
                  {job.detectedRegions
                    .filter((c) => !selectedCandidateId || c.candidateId === selectedCandidateId)
                    .slice(0, 1)
                    .map(renderCandidate)}
                </div>
              </div>
            ) : (
              <p>RUN DETECTION FIRST.</p>
            )}
            <p className="site00-dw-v3-safety-note">ⓘ NO GENERATION HAPPENS BEFORE CROP APPROVAL.</p>
            <div className="site00-dw-v3-stage__actions site00-dw-v3-stage__actions--split">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={busy} onClick={() => void handleConfirmAllCrops()}>
                APPROVE CROP
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" disabled={busy || !job?.cropsConfirmed} onClick={() => void handleReconstruct()}>
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
              <div className="site00-dw-v3-checkerboard">{uploadPreview ? <img src={uploadPreview} alt="Approved crop" /> : null}</div>
              <div className="site00-dw-v3-checkerboard">
                {job?.reconstructedVersions[0]?.outputUrl ? (
                  <img src={job.reconstructedVersions[0].outputUrl} alt="Output" />
                ) : (
                  <span>OUTPUT PENDING</span>
                )}
              </div>
            </div>
            <div className="site00-dw-v3-dispatch-meta">
              <span>DISPATCH COUNT: {job?.dispatchCounts.executed ?? 0} / {job?.dispatchCounts.planned ?? 1}</span>
              <span>SPEND GUARD: 1 PRIMARY DISPATCH MAX</span>
            </div>
            <div className="site00-dw-v3-stage__actions">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={busy || !job?.cropsConfirmed} onClick={() => void handleReconstruct()}>
                RUN RECONSTRUCTION
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" disabled={!job?.reconstructedVersions.length} onClick={() => setViewStep('APPROVE')}>
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
            <div className="site00-dw-v3-reconstruct-previews">
              <div className="site00-dw-v3-checkerboard">{uploadPreview ? <img src={uploadPreview} alt="Source crop" /> : null}</div>
              <div className="site00-dw-v3-checkerboard">
                {job?.reconstructedVersions.map(renderVersion)}
              </div>
            </div>
            <div className="site00-dw-v3-stage__actions site00-dw-v3-stage__actions--split">
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={busy} onClick={() => void handleApproveAll()}>
                APPROVE
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" disabled={busy || !job?.cropsConfirmed} onClick={() => void handleReconstruct()}>
                REGENERATE
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={() => setViewStep('CONFIRM_CROP')}>
                BACK TO CROP
              </button>
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
            <div className="site00-dw-v3-live-grid">
              {job?.reconstructedVersions.filter((v) => v.bindState === 'BOUND').length ? (
                job.reconstructedVersions.filter((v) => v.bindState === 'BOUND').map(renderVersion)
              ) : (
                <p>APPROVE AND BIND ASSETS TO GO LIVE.</p>
              )}
            </div>
            <div className="site00-dw-v3-stage__actions">
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
