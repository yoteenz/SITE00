/**
 * P0.VR.5 — Founder-facing multi-asset deconstruction job workspace.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
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

const STEP_LABELS: Record<string, string> = {
  UPLOAD: '01 UPLOAD',
  INSTRUCT: '02 INSTRUCT',
  DETECT: '03 DETECT',
  CONFIRM_CROP: '04 CONFIRM CROP',
  RECONSTRUCT: '05 RECONSTRUCT',
  APPROVE: '06 APPROVE',
  REPLACE: '07 REPLACE',
};

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

  return (
    <section className="site00-dw-job-workspace">
      <header className="site00-dw-job-workspace__header">
        <h2>ASSET DECONSTRUCTION PIPELINE</h2>
        <p className="site00-body">UPLOAD → INSTRUCT → DETECT → CONFIRM CROP → RECONSTRUCT → APPROVE → REPLACE</p>
      </header>

      <nav className="site00-dw-job-workspace__steps" aria-label="Pipeline steps">
        {JOB_WORKFLOW_STEPS.map((step, i) => (
          <span
            key={step}
            className={`site00-dw-job-step${i <= stepIndex ? ' site00-dw-job-step--active' : ''}${i === stepIndex ? ' site00-dw-job-step--current' : ''}`}
          >
            {STEP_LABELS[step] ?? step}
          </span>
        ))}
      </nav>

      {blocker ? <p className="site00-dw-ref-assets__warn">{blocker}</p> : null}

      <div className="site00-dw-job-workspace__grid">
        <div className="site00-dw-job-panel">
          <h3>UPLOAD + INSTRUCTION</h3>
          <div className="site00-dw-job-upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => void handleFileUpload(e.target.files?.[0] ?? null)}
              aria-label="Upload screenshot"
            />
            {referenceUrl ? (
              <button type="button" disabled={busy} onClick={() => void handleUseReference()}>
                USE APPROVED REFERENCE
              </button>
            ) : null}
            {uploadPreview ? (
              <div className="site00-dw-job-upload__thumb">
                <img src={uploadPreview} alt="Source screenshot" />
              </div>
            ) : null}
            {job?.sourceUploads[0] ? (
              <p className="site00-dw-job-upload__source">
                SOURCE: {job.sourceUploads[0].sourcePage ?? pageId} · {job.sourceUploads[0].sourceRoute ?? route}
              </p>
            ) : null}
          </div>

          <label className="site00-dw-job-instruction__preset">
            INSTRUCTION PRESET
            <select value={selectedPresetId} onChange={(e) => handlePresetChange(e.target.value)}>
              {presets.map((p) => (
                <option key={p.presetId} value={p.presetId}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          {suggestedPresets.length ? (
            <div className="site00-dw-job-suggested">
              <span>SUGGESTED PRESET</span>
              {suggestedPresets.map((p) => (
                <button key={p.presetId} type="button" onClick={() => handlePresetChange(p.presetId)}>
                  {p.name}
                </button>
              ))}
            </div>
          ) : null}

          <label className="site00-dw-job-instruction">
            FOUNDER INSTRUCTION
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value.toUpperCase())}
              placeholder="DESCRIBE WHAT TO EXTRACT, ISOLATE, OR REPLACE…"
              rows={4}
            />
          </label>

          <div className="site00-dw-job-panel__actions">
            <button type="button" disabled={busy || !instruction.trim()} onClick={() => void handleInstructionSubmit()}>
              SAVE INSTRUCTION
            </button>
            <button type="button" disabled={busy || !job?.sourceUploadIds.length} onClick={() => void handleDetect()}>
              RUN DETECTION
            </button>
            <button type="button" disabled={!instruction.trim()} onClick={() => void handleSavePreset()}>
              SAVE AS PRESET
            </button>
          </div>
        </div>

        <div className="site00-dw-job-panel">
          <h3>JOB PLAN</h3>
          {plan || job ? (
            <dl className="site00-dw-job-plan">
              <dt>JOB TYPE</dt>
              <dd>{plan?.jobType ?? job?.jobType}</dd>
              <dt>TARGET ASSET TYPE</dt>
              <dd>{plan?.targetAssetType ?? job?.targetAssetTypes.join(', ')}</dd>
              <dt>SINGLE OR MULTI</dt>
              <dd>{plan?.singleOrMulti ?? (job?.multiAsset ? 'MULTI' : 'SINGLE')}</dd>
              <dt>DETECTED COUNT</dt>
              <dd>{plan?.detectedCount ?? job?.detectionCount ?? 0}</dd>
              <dt>EXPECTED OUTPUTS</dt>
              <dd>{plan?.expectedOutputs ?? 0}</dd>
              <dt>BACKGROUND POLICY</dt>
              <dd>{plan?.backgroundPolicy ?? job?.backgroundPolicy}</dd>
              <dt>REPLACEMENT TARGET</dt>
              <dd>{plan?.replacementTarget ?? job?.replacementMapping?.replacementTargetScope ?? 'NONE'}</dd>
              <dt>COST RISK</dt>
              <dd>{plan?.costRiskLevel ?? job?.costRiskLevel}</dd>
              <dt>EST. DISPATCH COUNT</dt>
              <dd>{plan?.estimatedDispatchCount ?? job?.dispatchCounts.planned ?? 0}</dd>
              <dt>CONFIRMATION REQUIRED</dt>
              <dd>{plan?.founderConfirmationRequired ?? !job?.cropsConfirmed ? 'YES' : 'NO'}</dd>
            </dl>
          ) : (
            <p>ADD UPLOAD + INSTRUCTION TO GENERATE JOB PLAN.</p>
          )}
          <ul className="site00-dw-job-plan__providers">
            {(plan?.generationProviderPlan ?? job?.generationProviderPlan ?? []).map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="site00-dw-job-panel site00-dw-job-panel--wide">
          <h3>CROP CANDIDATES</h3>
          {!job?.detectedRegions.length ? (
            <p>RUN DETECTION TO PROPOSE CROP REGIONS. NO GENERATION BEFORE CROP APPROVAL.</p>
          ) : (
            <>
              <div className="site00-dw-job-candidates">{job.detectedRegions.map(renderCandidate)}</div>
              <div className="site00-dw-job-panel__actions">
                <button type="button" disabled={busy} onClick={() => void handleConfirmAllCrops()}>
                  CONFIRM ALL CROPS
                </button>
                <button
                  type="button"
                  disabled={busy || !job.cropsConfirmed}
                  onClick={() => void handleReconstruct()}
                >
                  RECONSTRUCT APPROVED
                </button>
              </div>
            </>
          )}
        </div>

        <div className="site00-dw-job-panel site00-dw-job-panel--wide">
          <h3>OUTPUTS + REPLACE</h3>
          {!job?.reconstructedVersions.length ? (
            <p>APPROVE CROPS THEN RECONSTRUCT. DISPATCH COUNT: {job?.dispatchCounts.executed ?? 0}</p>
          ) : (
            <>
              <div className="site00-dw-job-outputs">{job.reconstructedVersions.map(renderVersion)}</div>
              <div className="site00-dw-job-panel__actions">
                <button type="button" disabled={busy} onClick={() => void handleApproveAll()}>
                  APPROVE · UPLOAD · BIND
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
