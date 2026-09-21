/**
 * P0.VR.PAGE-CONCEPT-DUAL-RENDER-ENGINE-TEST1 — founder A/B comparison surface.
 */

import type { PageConceptDualRenderTestRun, PageConceptGeneratedArtifact } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { dualRenderTestArtifactId } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptDualRenderTest.js';

function jobFor(
  jobs: readonly PageConceptGeneratedArtifact[],
  lane: 'GPT2_DIRECT' | 'NBP',
  viewport: 'MOBILE' | 'DESKTOP',
): PageConceptGeneratedArtifact | undefined {
  return jobs.find((j) => j.artifactId === dualRenderTestArtifactId(lane, viewport));
}

function statusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

function RenderCard({
  title,
  job,
}: {
  title: string;
  job: PageConceptGeneratedArtifact | undefined;
}) {
  const grounding = job?.renderGrounding;
  return (
    <article className="s00-pcg__dualCard" data-testid={`dual-render-card-${job?.provider ?? 'missing'}-${job?.viewport ?? 'na'}`}>
      <header className="s00-pcg__dualCardHead">{title}</header>
      <p className="s00-pcg__dualCardMeta">
        {job ? `${job.provider} · ${job.status} · ${job.artifactId}` : 'PENDING'}
      </p>
      {job?.imageUri ?
        <img className="s00-pcg__dualImg" src={job.imageUri} alt={title} />
      : <div className="s00-pcg__dualPlaceholder">{job?.status ?? 'PENDING'}</div>}
      {grounding ?
        <ul className="s00-pcg__dualGrounding" data-testid="dual-render-grounding-meta">
          <li>AUTHORITY PRIORITY: {grounding.authorityPriorityUsed ? 'YES' : 'NO'}</li>
          <li>CAPTURE ROLE: {grounding.implementationCaptureRole}</li>
          <li>SKIN: {grounding.skinGroundingPresent ? 'YES' : 'NO'}</li>
          <li>IDENTITY: {grounding.identityGroundingPresent ? 'YES' : 'NO'}</li>
          <li>FUNCTION: {grounding.functionContractPresent ? 'YES' : 'NO'}</li>
          <li>DRIFT RULES: {grounding.forbiddenDriftApplied ? 'YES' : 'NO'}</li>
        </ul>
      : null}
    </article>
  );
}

export type PageConceptDualRenderReviewPanelProps = {
  authorityImageUri: string | null;
  jobs: readonly PageConceptGeneratedArtifact[];
  dualRun: PageConceptDualRenderTestRun | null | undefined;
  onRegenerateGpt2Lane?: () => void;
  onRegenerateNbpLane?: () => void;
  onRunFullNbp?: () => void;
  onSelectGpt2?: () => void;
  onSelectNbp?: () => void;
  onKeepBoth?: () => void;
};

export function PageConceptDualRenderReviewPanel(props: PageConceptDualRenderReviewPanelProps) {
  const run = props.dualRun;
  return (
    <div className="s00-pcg__dualReview" data-testid="page-concept-dual-render-review">
      <h4 className="s00-pcg__dualTitle">DUAL RENDER TEST</h4>
      <p className="s00-pcg__dualSub">
        Authority source: approved GPT2 concept · mode {run?.renderMode ?? 'DUAL_RENDER_TEST'}
      </p>

      <section className="s00-pcg__dualSection" data-testid="dual-render-authority-section">
        <h5>AUTHORITY</h5>
        {props.authorityImageUri ?
          <img className="s00-pcg__dualAuthority" src={props.authorityImageUri} alt="Approved GPT2 authority" />
        : <p>Authority image pending</p>}
      </section>

      {run ?
        <section className="s00-pcg__dualLanes" data-testid="dual-render-lane-status">
          <div>
            <strong>GPT2 LANE</strong> — {statusLabel(run.gpt2Lane.status)}
            <div>Mobile: {run.gpt2Lane.mobile.status}</div>
            <div>Desktop: {run.gpt2Lane.desktop.status}</div>
          </div>
          <div>
            <strong>NBP LANE</strong> — {statusLabel(run.nbpLane.status)}
            <div>Mobile: {run.nbpLane.mobile.status}</div>
            <div>Desktop: {run.nbpLane.desktop.status}</div>
          </div>
        </section>
      : null}

      <section className="s00-pcg__dualSection" data-testid="dual-render-mobile-compare">
        <h5>MOBILE COMPARISON</h5>
        <div className="s00-pcg__dualPair">
          <RenderCard title="GPT2 MOBILE A" job={jobFor(props.jobs, 'GPT2_DIRECT', 'MOBILE')} />
          <RenderCard title="NBP MOBILE A" job={jobFor(props.jobs, 'NBP', 'MOBILE')} />
        </div>
      </section>

      <section className="s00-pcg__dualSection" data-testid="dual-render-desktop-compare">
        <h5>DESKTOP COMPARISON</h5>
        <div className="s00-pcg__dualPair">
          <RenderCard title="GPT2 DESKTOP A" job={jobFor(props.jobs, 'GPT2_DIRECT', 'DESKTOP')} />
          <RenderCard title="NBP DESKTOP A" job={jobFor(props.jobs, 'NBP', 'DESKTOP')} />
        </div>
      </section>

      <section className="s00-pcg__dualActions" data-testid="dual-render-founder-decision">
        <button type="button" data-testid="dual-render-select-gpt2" onClick={() => props.onSelectGpt2?.()}>
          SELECT GPT2 RENDERER
        </button>
        <button type="button" data-testid="dual-render-select-nbp" onClick={() => props.onSelectNbp?.()}>
          SELECT NBP RENDERER
        </button>
        <button type="button" data-testid="dual-render-keep-both" onClick={() => props.onKeepBoth?.()}>
          KEEP BOTH
        </button>
        <button type="button" data-testid="dual-render-regen-gpt2-lane" onClick={() => props.onRegenerateGpt2Lane?.()}>
          REGENERATE GPT2 LANE
        </button>
        <button type="button" data-testid="dual-render-regen-nbp-lane" onClick={() => props.onRegenerateNbpLane?.()}>
          REGENERATE NBP LANE
        </button>
        <button type="button" data-testid="dual-render-run-full-nbp" onClick={() => props.onRunFullNbp?.()}>
          RUN FULL NBP SET
        </button>
      </section>
    </div>
  );
}
