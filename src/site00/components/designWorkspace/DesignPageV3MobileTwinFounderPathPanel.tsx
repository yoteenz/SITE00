import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import {
  getMobileTwinPipelineDiagnostics,
  syncFounderMobileTwinSession,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/syncFounderMobileTwinSession.js';

type Props = {
  session: DesignPageAuthorityReviewSession;
  projectId: string;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

type StepState = 'done' | 'active' | 'locked';

function stepState(current: boolean, done: boolean): StepState {
  if (done) return 'done';
  if (current) return 'active';
  return 'locked';
}

export function DesignPageV3MobileTwinFounderPathPanel({ session, projectId, onSessionUpdate }: Props) {
  if (!session.authorityPipeline?.mobileMaster) return null;

  const pipeline = session.mobileTwinPipeline;
  const diagnostics = pipeline ? getMobileTwinPipelineDiagnostics(pipeline) : null;
  const test = pipeline?.twinCapabilityTest;
  const strategy = pipeline?.mobileTwinVisualGenerationStrategy ?? 'UNRESOLVED';
  const bench = pipeline?.providerBenchmark;

  const step1Done =
    test?.status === 'FOUNDER_REVIEW_READY' || test?.status === 'PARTIAL' || test?.status === 'FAILED';
  const step2Done = strategy === 'ATOMIC_SIBLING_FROM_COMPOSITION';
  const step3Done =
    bench?.status === 'FOUNDER_REVIEW_READY' ||
    bench?.status === 'PARTIAL' ||
    (bench?.totalNewJobs ?? 0) >= 6;
  const step4Done = Boolean(pipeline?.mobileTwinProviderStrategy);

  const s1 = stepState(!step1Done, step1Done);
  const s2 = stepState(step1Done && !step2Done, step2Done);
  const s3 = stepState(step2Done && !step3Done, step3Done);
  const s4 = stepState(step3Done && !step4Done, step4Done);

  return (
    <nav
      className="site00-dw-v3-mobile-twin-founder-path"
      data-testid="v3-mobile-twin-founder-path"
      aria-label="Mobile twin founder path"
    >
      <header>
        <strong>MOBILE TWIN FOUNDER PATH</strong>
        <span>R7MF3P1 capability → R7MF3P2 provider benchmark (mobile only)</span>
      </header>
      {diagnostics ?
        <p className="site00-dw-v3-mobile-twin-founder-path__diag" data-testid="v3-mobile-twin-diagnostics">
          SYNC · renders {diagnostics.falRenderCount}/{diagnostics.renderCount} · blueprints {diagnostics.blueprintCount}{' '}
          · FAL jobs {diagnostics.falJobsDispatched} · capability {diagnostics.capabilityStatus} · step2{' '}
          {diagnostics.step2Ready ? 'READY' : 'LOCKED'} · benchmark {diagnostics.benchmarkReady ? 'READY' : 'LOCKED'}
        </p>
      : null}
      <button
        type="button"
        className="site00-dw-v3-mobile-twin-founder-path__sync"
        data-testid="v3-mobile-twin-sync-unlock"
        onClick={() => onSessionUpdate(syncFounderMobileTwinSession(session, projectId))}
      >
        SYNC &amp; UNLOCK FROM SAVED FAL STATE
      </button>
      <ol className="site00-dw-v3-mobile-twin-founder-path__steps">
        <li data-state={s1} id="v3-founder-path-step-1">
          <span className="site00-dw-v3-mobile-twin-founder-path__num">1</span>
          <div>
            <strong>Run capability test</strong>
            <p>
              Tap <a href="#v3-mobile-twin-capability-test">RUN MOBILE TWIN CAPABILITY TEST</a> below (up to 3 FAL
              jobs).
            </p>
          </div>
        </li>
        <li data-state={s2} id="v3-founder-path-step-2">
          <span className="site00-dw-v3-mobile-twin-founder-path__num">2</span>
          <div>
            <strong>Select Method A</strong>
            <p>
              When images appear, tap <strong>FLOW A MORE ACCURATE</strong> (unlocks provider benchmark). Strategy must
              show ATOMIC_SIBLING — not UNRESOLVED.
            </p>
          </div>
        </li>
        <li data-state={s3} id="v3-founder-path-step-3">
          <span className="site00-dw-v3-mobile-twin-founder-path__num">3</span>
          <div>
            <strong>Run provider benchmark</strong>
            <p>
              Scroll to <a href="#v3-mobile-twin-provider-benchmark">MOBILE TWIN PROVIDER BENCHMARK</a> →{' '}
              <strong>RUN PROVIDER BENCHMARK</strong> (6 FAL jobs on Railway).
            </p>
          </div>
        </li>
        <li data-state={s4} id="v3-founder-path-step-4">
          <span className="site00-dw-v3-mobile-twin-founder-path__num">4</span>
          <div>
            <strong>Pick provisional provider</strong>
            <p>Compare all actuals/blueprints, then SELECT a provider or NONE.</p>
          </div>
        </li>
      </ol>
      {!step2Done && step1Done ?
        <p className="site00-dw-v3-mobile-twin-founder-path__hint" role="status">
          Step 2: scroll up slightly — <strong>FLOW A MORE ACCURATE</strong> buttons are in the capability test
          section.
        </p>
      : null}
      {step2Done && !step3Done ?
        <p className="site00-dw-v3-mobile-twin-founder-path__hint" role="status">
          Step 3: provider benchmark section is below capability test — scroll down to{' '}
          <a href="#v3-mobile-twin-provider-benchmark">MOBILE TWIN PROVIDER BENCHMARK</a>.
        </p>
      : null}
    </nav>
  );
}
