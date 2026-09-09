/**
 * SKINS reference asset reconstruction jobs — multi-asset discovery + founder gates.
 * P0.VR.6R6
 */

import { useMemo, useState } from 'react';
import {
  buildMultiAssetReconstructionPlan,
  buildSkinsMobileMultiAssetReconstructionJob,
  getJobProgressSummary,
  approveAllCrops,
  type ReferenceMultiAssetReconstructionJob,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/index.js';
import { RECONSTRUCT_REFERENCE_ASSET_PRESET } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/referenceAssetPipeline.js';

type Props = {
  viewport?: 'MOBILE' | 'DESKTOP';
};

export function DesignSkinsReferenceAssetJobs({ viewport = 'MOBILE' }: Props) {
  const initialJob = useMemo(
    () =>
      buildSkinsMobileMultiAssetReconstructionJob({
        liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
      }),
    [viewport],
  );

  const [job, setJob] = useState<ReferenceMultiAssetReconstructionJob | null>(initialJob);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cropsApproved, setCropsApproved] = useState(false);
  const [generationApproved, setGenerationApproved] = useState(false);

  const progress = job ? getJobProgressSummary(job) : null;
  const plan = job && cropsApproved ? buildMultiAssetReconstructionPlan(job) : null;
  const active = job?.candidateAssets[activeIndex];

  if (!job) {
    return (
      <section className="site00-dw-ref-skins-jobs" data-panel="skins-reference-asset-jobs">
        <p>NO MULTI-ASSET JOB — AUTHORITY NOT REGISTERED</p>
      </section>
    );
  }

  function handleApproveCrop() {
    if (!job) return;
    const updated = approveAllCrops(job);
    setJob(updated);
    setCropsApproved(true);
  }

  return (
    <section className="site00-dw-ref-skins-jobs" data-panel="skins-reference-asset-jobs">
      <header className="site00-dw-ref-skins-jobs__head">
        <h3>REFERENCE RECONSTRUCTION JOB</h3>
        <p>SCREEN: SKINS {viewport}</p>
        <span className="site00-dw-ref-skins-jobs__count">{job.candidateAssets.length} ASSETS FOUND</span>
      </header>

      <dl className="site00-dw-ref-skins-jobs__progress">
        <div>
          <dt>DETECT</dt>
          <dd>{progress?.detect}</dd>
        </div>
        <div>
          <dt>CROPS</dt>
          <dd>{progress?.crops}</dd>
        </div>
        <div>
          <dt>GENERATION</dt>
          <dd>{progress?.generation}</dd>
        </div>
        <div>
          <dt>OUTPUTS</dt>
          <dd>{progress?.outputs}</dd>
        </div>
        <div>
          <dt>BOUND</dt>
          <dd>{progress?.bound}</dd>
        </div>
      </dl>

      <nav className="site00-dw-ref-skins-jobs__queue" aria-label="Asset crop queue">
        {job.candidateAssets.map((c, i) => (
          <button
            key={c.candidateId}
            type="button"
            className={`site00-dw-ref-skins-jobs__candidate${i === activeIndex ? ' is-active' : ''}${c.mismatchType !== 'MATCHED' ? ' is-mismatch' : ''}`}
            onClick={() => setActiveIndex(i)}
          >
            {String(i + 1).padStart(2, '0')} {c.brandKey.replace(/_/g, ' ')}
          </button>
        ))}
      </nav>

      {active ? (
        <article className="site00-dw-ref-skins-jobs__detail">
          <h4>
            {String(activeIndex + 1).padStart(2, '0')} / {String(job.candidateAssets.length).padStart(2, '0')} —{' '}
            {active.brandKey.replace(/_/g, ' ')} FAMILY VISUAL
          </h4>
          <dl className="site00-dw-ref-skins-jobs__plan">
            <div>
              <dt>MISMATCH</dt>
              <dd>{active.mismatchType.replace(/_/g, ' ')}</dd>
            </div>
            <div>
              <dt>TARGET SLOT</dt>
              <dd>{active.semanticSlot}</dd>
            </div>
            <div>
              <dt>CROP STATUS</dt>
              <dd>{cropsApproved ? 'APPROVED' : active.cropStatus}</dd>
            </div>
            <div>
              <dt>GENERATION</dt>
              <dd>{generationApproved ? 'AUTHORIZED' : 'BLOCKED — AWAITING CROP + GENERATION APPROVAL'}</dd>
            </div>
          </dl>

          <div className="site00-dw-ref-skins-jobs__compare">
            <div className="site00-dw-ref-skins-jobs__pane">
              <span>REFERENCE CROP (NOT FINAL)</span>
              <img src={active.sourceCrop.sourceCropUrl} alt="" />
              <em>SOURCE CROP ≠ CANONICAL</em>
            </div>
            <div className="site00-dw-ref-skins-jobs__pane site00-dw-ref-skins-jobs__pane--output">
              <span>RECONSTRUCTED OUTPUT</span>
              <div className="site00-dw-ref-skins-jobs__empty">AWAITING FOUNDER REVIEW</div>
            </div>
          </div>

          <details className="site00-dw-ref-skins-jobs__prompt">
            <summary>PROVIDER PROMPT PREVIEW</summary>
            <pre>{active.generatedPrompt}</pre>
          </details>

          {!cropsApproved ? (
            <div className="site00-dw-ref-skins-jobs__gate">
              <p>GATE A — CROP APPROVAL REQUIRED BEFORE ANY GENERATION</p>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={handleApproveCrop}>
                APPROVE ALL VALID CROPS ({job.candidateAssets.length})
              </button>
            </div>
          ) : !generationApproved ? (
            <div className="site00-dw-ref-skins-jobs__gate">
              <p>GATE B — GENERATION APPROVAL (CROP APPROVAL ≠ GENERATION APPROVAL)</p>
              {plan ? (
                <p className="site00-dw-ref-skins-jobs__dispatch">
                  {plan.totalDispatches} ASSETS · {plan.totalDispatches} PROVIDER DISPATCHES MAX
                </p>
              ) : null}
              <button
                type="button"
                className="site00-dw-v3-btn site00-dw-v3-btn--primary"
                onClick={() => setGenerationApproved(true)}
              >
                APPROVE {job.candidateAssets.length} GENERATIONS
              </button>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" disabled>
                REVIEW PROMPTS
              </button>
            </div>
          ) : (
            <div className="site00-dw-ref-skins-jobs__gate">
              <p>GATE C — OUTPUT REVIEW (NO AUTO-BIND · NO AUTO-REGENERATE)</p>
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled>
                FOUNDER GENERATE (DISPATCH BLOCKED UNTIL API WIRED)
              </button>
            </div>
          )}

          <p className="site00-dw-ref-skins-jobs__guard">
            {RECONSTRUCT_REFERENCE_ASSET_PRESET.intent} · NO REGENERATION WITHOUT EXPLICIT FOUNDER APPROVAL
          </p>
        </article>
      ) : null}
    </section>
  );
}
