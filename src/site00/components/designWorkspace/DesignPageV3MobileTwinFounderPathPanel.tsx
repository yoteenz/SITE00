import { useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { founderManualUnlockMobileTwinPath } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/founderManualUnlockMobileTwinPath.js';
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
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!session.authorityPipeline?.mobileMaster) return null;

  const pipeline = session.mobileTwinPipeline;
  const diagnostics = pipeline ? getMobileTwinPipelineDiagnostics(pipeline) : null;
  const manualUnlock = Boolean(pipeline?.founderManualTwinPathUnlock);
  const test = pipeline?.twinCapabilityTest;
  const strategy = pipeline?.mobileTwinVisualGenerationStrategy ?? 'UNRESOLVED';
  const bench = pipeline?.providerBenchmark;

  const step1Done =
    manualUnlock ||
    test?.status === 'FOUNDER_REVIEW_READY' ||
    test?.status === 'PARTIAL' ||
    test?.status === 'FAILED';
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

  const runManualUnlock = () => {
    setStatusMsg(null);
    const next = founderManualUnlockMobileTwinPath(session);
    onSessionUpdate(next);
    setStatusMsg(
      'UNLOCKED: Method A locked · Step 2 + provider benchmark enabled. RUN PROVIDER BENCHMARK will create GPT-2 baseline on Railway if needed.',
    );
  };

  const runSync = () => {
    setStatusMsg(null);
    const next = syncFounderMobileTwinSession(session, projectId);
    onSessionUpdate(next);
    const d = next.mobileTwinPipeline ? getMobileTwinPipelineDiagnostics(next.mobileTwinPipeline) : null;
    setStatusMsg(
      d ?
        `SYNC done · FAL renders ${d.falRenderCount} · step2 ${d.step2Ready ? 'READY' : 'LOCKED'}`
      : 'SYNC done · no mobile twin pipeline on session',
    );
  };

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
          · FAL jobs {diagnostics.falJobsDispatched}
          {manualUnlock ? ' · FOUNDER OVERRIDE ON' : ''} · capability {diagnostics.capabilityStatus} · step2{' '}
          {diagnostics.step2Ready ? 'READY' : 'LOCKED'} · benchmark {diagnostics.benchmarkReady ? 'READY' : 'LOCKED'}
        </p>
      : null}
      <button
        type="button"
        className="site00-dw-v3-mobile-twin-founder-path__override"
        data-testid="v3-mobile-twin-founder-override-unlock"
        onClick={runManualUnlock}
      >
        FOUNDER OVERRIDE — UNLOCK METHOD A + BENCHMARK
      </button>
      <button
        type="button"
        className="site00-dw-v3-mobile-twin-founder-path__sync"
        data-testid="v3-mobile-twin-sync-unlock"
        onClick={runSync}
      >
        SYNC FROM SAVED FAL STATE (if any)
      </button>
      {statusMsg ?
        <p className="site00-dw-v3-mobile-twin-founder-path__status" role="status" data-testid="v3-mobile-twin-path-status">
          {statusMsg}
        </p>
      : null}
      <ol className="site00-dw-v3-mobile-twin-founder-path__steps">
        <li data-state={s1} id="v3-founder-path-step-1">
          <span className="site00-dw-v3-mobile-twin-founder-path__num">1</span>
          <div>
            <strong>Run capability test</strong>
            <p>
              Tap <a href="#v3-mobile-twin-capability-test">RUN MOBILE TWIN CAPABILITY TEST</a> below — or use{' '}
              <strong>FOUNDER OVERRIDE</strong> above to skip the gate.
            </p>
          </div>
        </li>
        <li data-state={s2} id="v3-founder-path-step-2">
          <span className="site00-dw-v3-mobile-twin-founder-path__num">2</span>
          <div>
            <strong>Select Method A</strong>
            <p>Override already sets Method A. Otherwise tap <strong>FLOW A MORE ACCURATE</strong>.</p>
          </div>
        </li>
        <li data-state={s3} id="v3-founder-path-step-3">
          <span className="site00-dw-v3-mobile-twin-founder-path__num">3</span>
          <div>
            <strong>Run provider benchmark</strong>
            <p>
              <a href="#v3-mobile-twin-provider-benchmark">RUN PROVIDER BENCHMARK</a> (6 challenger jobs; +2 GPT-2
              baseline if missing).
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
    </nav>
  );
}
