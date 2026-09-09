/**
 * SKINS reference asset reconstruction jobs — SOURCE → CROP → RECONSTRUCT → … → LIVE.
 */

import { useMemo, useState } from 'react';
import {
  buildSkinsFamilyMultiAssetJob,
  EXTENDED_PIPELINE_STAGES,
  RECONSTRUCT_REFERENCE_ASSET_PRESET,
  type ExtendedPipelineStage,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/referenceAssetPipeline.js';

const STAGE_LABELS: Record<ExtendedPipelineStage, string> = {
  SOURCE: 'SOURCE',
  CROP: 'CROP',
  RECONSTRUCT: 'RECONSTRUCT',
  BACKGROUND: 'BACKGROUND',
  QA: 'QA',
  APPROVE: 'APPROVE',
  LIVE: 'LIVE',
};

type Props = {
  viewport?: 'MOBILE' | 'DESKTOP';
};

export function DesignSkinsReferenceAssetJobs({ viewport = 'MOBILE' }: Props) {
  const job = useMemo(() => buildSkinsFamilyMultiAssetJob(viewport), [viewport]);
  const [activeCandidateId, setActiveCandidateId] = useState(job.candidates[0]?.candidateId ?? '');
  const active = job.candidates.find((c) => c.candidateId === activeCandidateId) ?? job.candidates[0];

  return (
    <section className="site00-dw-ref-skins-jobs" data-panel="skins-reference-asset-jobs">
      <header className="site00-dw-ref-skins-jobs__head">
        <h3>SKINS REFERENCE ASSET JOB</h3>
        <p>{RECONSTRUCT_REFERENCE_ASSET_PRESET.intent}</p>
        <span className="site00-dw-ref-skins-jobs__preset">{RECONSTRUCT_REFERENCE_ASSET_PRESET.label}</span>
      </header>

      <nav className="site00-dw-ref-skins-jobs__stages" aria-label="Reference asset pipeline">
        {EXTENDED_PIPELINE_STAGES.map((stage, i) => {
          const activeIndex = active ? EXTENDED_PIPELINE_STAGES.indexOf(active.stage) : 0;
          const isCurrent = stage === active?.stage;
          const isComplete = i < activeIndex;
          return (
            <span
              key={stage}
              className={`site00-dw-ref-skins-jobs__stage${isCurrent ? ' is-current' : ''}${isComplete ? ' is-complete' : ''}`}
            >
              {STAGE_LABELS[stage]}
            </span>
          );
        })}
      </nav>

      <div className="site00-dw-ref-skins-jobs__candidates">
        {job.candidates.map((c) => (
          <button
            key={c.candidateId}
            type="button"
            className={`site00-dw-ref-skins-jobs__candidate${c.candidateId === activeCandidateId ? ' is-active' : ''}`}
            onClick={() => setActiveCandidateId(c.candidateId)}
          >
            {c.brandKey.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {active ? (
        <article className="site00-dw-ref-skins-jobs__detail">
          <h4>{active.brandKey.replace(/_/g, ' ')} FAMILY VISUAL</h4>
          <dl className="site00-dw-ref-skins-jobs__plan">
            <div>
              <dt>TYPE</dt>
              <dd>{active.treatmentPlan.assetType}</dd>
            </div>
            <div>
              <dt>SOURCE</dt>
              <dd>SKINS {active.viewport} AUTHORITY</dd>
            </div>
            <div>
              <dt>CROP</dt>
              <dd>{active.source.sourceStatus === 'CROP_CONFIRMED' ? 'CONFIRMED' : 'PENDING'}</dd>
            </div>
            <div>
              <dt>RECONSTRUCTION</dt>
              <dd>{active.treatmentPlan.reconstructionRequired ? 'REQUIRED' : 'OPTIONAL'}</dd>
            </div>
            <div>
              <dt>BACKGROUND</dt>
              <dd>{active.treatmentPlan.backgroundPolicy.replace(/_/g, ' ')}</dd>
            </div>
            <div>
              <dt>BIND TO</dt>
              <dd>SKINS → {active.brandKey} → FAMILY THUMBNAIL</dd>
            </div>
          </dl>

          <div className="site00-dw-ref-skins-jobs__compare">
            <div className="site00-dw-ref-skins-jobs__pane">
              <span>SOURCE CROP (NOT FINAL)</span>
              <img src={active.source.sourceCropUrl} alt="" />
              <em>SOURCE CROP ≠ CANONICAL</em>
            </div>
            <div className="site00-dw-ref-skins-jobs__pane site00-dw-ref-skins-jobs__pane--output">
              <span>RECONSTRUCTED OUTPUT</span>
              <div className="site00-dw-ref-skins-jobs__empty">AWAITING FOUNDER GENERATE</div>
            </div>
          </div>

          <details className="site00-dw-ref-skins-jobs__prompt" open>
            <summary>PROVIDER PROMPT PREVIEW</summary>
            <pre>{active.prompt}</pre>
          </details>

          <div className="site00-dw-ref-skins-jobs__actions">
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" disabled>
              EDIT PROMPT
            </button>
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled>
              FOUNDER GENERATE (1 DISPATCH)
            </button>
          </div>
          <p className="site00-dw-ref-skins-jobs__guard">
            SOURCE CROP CANNOT BE CANONICAL · PAID RECONSTRUCTION REQUIRES FOUNDER APPROVAL
          </p>
        </article>
      ) : null}
    </section>
  );
}
