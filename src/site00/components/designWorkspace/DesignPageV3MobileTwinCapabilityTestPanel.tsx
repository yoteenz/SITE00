import { useMemo, useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { P0_VR_TWIN_V30R7MF3P1_LINEAGE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { requestMobileTwinFal } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/requestMobileTwinFal.js';
import { recordFounderTwinCapabilityDecision } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import { isCapabilityTestFounderReviewReady } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/reconcileMobileTwinPipelineState.js';
import type { FounderTwinCapabilityDecision } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/twinCapabilityTestTypes.js';

type CompareMode = 'ACTUAL_A' | 'ACTUAL_B' | 'A_B';

type Props = {
  session: DesignPageAuthorityReviewSession;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

function resolveImageSrc(uri: string): string {
  if (uri.startsWith('data:') || uri.startsWith('blob:') || uri.startsWith('vitest-fal://')) return uri;
  if (uri.startsWith('http')) return uri;
  const pathPart = uri.startsWith('/') ? uri : `/${uri}`;
  return `${window.location.origin}${pathPart}`;
}

export function DesignPageV3MobileTwinCapabilityTestPanel({ session, onSessionUpdate }: Props) {
  const pipeline = session.mobileTwinPipeline;
  const test = pipeline?.twinCapabilityTest;
  const step2Ready = pipeline ? isCapabilityTestFounderReviewReady(pipeline) : false;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>('ACTUAL_A');

  if (!session.authorityPipeline?.mobileMaster) return null;

  const ref = pipeline?.designReference;
  const actual =
    test?.canonicalActualRenderId ?
      pipeline?.renders.find((r) => r.id === test.canonicalActualRenderId)
    : pipeline?.renders.filter((r) => r.renderImageUri && r.provider === 'FAL').at(-1) ?? null;
  const blueprintA =
    test?.flowABlueprintId ? pipeline?.blueprintTwins.find((b) => b.id === test.flowABlueprintId)
    : pipeline?.blueprintTwins.filter((b) => b.twinImageUri).at(-1) ?? null;
  const blueprintB =
    test?.flowBBlueprintId ? pipeline?.blueprintTwins.find((b) => b.id === test.flowBBlueprintId) : null;

  const panels = useMemo(() => {
    const refSrc = ref ? resolveImageSrc(ref.sourceImageUri) : null;
    const actualSrc = actual ? resolveImageSrc(actual.renderImageUri) : null;
    const aSrc = blueprintA ? resolveImageSrc(blueprintA.twinImageUri) : null;
    const bSrc = blueprintB ? resolveImageSrc(blueprintB.twinImageUri) : null;
    if (compareMode === 'ACTUAL_A') {
      return [
        { label: 'ACTUAL CONTROL', src: actualSrc, testId: 'v3-cap-actual' },
        { label: 'BLUEPRINT A (ATOMIC SIBLING)', src: aSrc, testId: 'v3-cap-blueprint-a' },
      ];
    }
    if (compareMode === 'ACTUAL_B') {
      return [
        { label: 'ACTUAL CONTROL', src: actualSrc, testId: 'v3-cap-actual' },
        { label: 'BLUEPRINT B (ACTUAL→BLUEPRINT)', src: bSrc, testId: 'v3-cap-blueprint-b' },
      ];
    }
    return [
      { label: 'REFERENCE', src: refSrc, testId: 'v3-cap-reference' },
      { label: 'BLUEPRINT A', src: aSrc, testId: 'v3-cap-blueprint-a' },
      { label: 'BLUEPRINT B', src: bSrc, testId: 'v3-cap-blueprint-b' },
    ];
  }, [actual, blueprintA, blueprintB, compareMode, ref]);

  const runTest = (action: Parameters<typeof requestMobileTwinFal>[0]['action']) => {
    setBusy(true);
    setErr(null);
    void requestMobileTwinFal({ session, action, founderConfirmedSpend: true })
      .then(onSessionUpdate)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setBusy(false));
  };

  const pickDecision = (decision: FounderTwinCapabilityDecision) => {
    setErr(null);
    try {
      onSessionUpdate(recordFounderTwinCapabilityDecision(session, decision));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <section
      id="v3-mobile-twin-capability-test"
      className="site00-dw-v3-mobile-twin-capability-test"
      data-testid="v3-mobile-twin-capability-test"
      data-lineage={P0_VR_TWIN_V30R7MF3P1_LINEAGE}
    >
      <header>
        <strong>MOBILE TWIN CAPABILITY TEST</strong>
        <span>A/B provider · Actual control · max 3 FAL images</span>
      </header>
      <ul>
        <li>SNAPSHOT · {test?.snapshot.compositionHash.slice(0, 12) ?? '—'} · {test?.status ?? 'NOT RUN'}</li>
        <li>ACTUAL CONTROL · {test?.actualControlMode ?? '—'}</li>
        <li>STRATEGY · {pipeline?.mobileTwinVisualGenerationStrategy ?? 'UNRESOLVED'}</li>
      </ul>
      <div className="site00-dw-v3-mobile-twin-capability-test__actions">
        <button type="button" data-testid="v3-run-capability-test" disabled={busy} onClick={() => runTest('RUN_MOBILE_TWIN_CAPABILITY_TEST')}>
          RUN MOBILE TWIN CAPABILITY TEST
        </button>
        <button type="button" disabled={busy || !test} onClick={() => runTest('RETRY_CAPABILITY_FLOW_A')}>
          RETRY FLOW A
        </button>
        <button type="button" disabled={busy || !test} onClick={() => runTest('RETRY_CAPABILITY_FLOW_B')}>
          RETRY FLOW B
        </button>
      </div>
      <div className="site00-dw-v3-mobile-twin-capability-test__decisions">
        <p className="site00-dw-v3-mobile-twin-capability-test__step-label">
          STEP 2 · Pick visual strategy (required before provider benchmark)
        </p>
        {!step2Ready ?
          <p className="site00-dw-v3-mobile-twin-capability-test__step-hint" role="status">
            Run Step 1 first — or wait for sync if images already generated (reload after deploy v427).
          </p>
        : null}
        <button
          type="button"
          data-testid="v3-pick-flow-a"
          disabled={!step2Ready}
          onClick={() => pickDecision('FLOW_A_MORE_ACCURATE')}
        >
          FLOW A MORE ACCURATE
        </button>
        <button
          type="button"
          data-testid="v3-pick-flow-b"
          disabled={!step2Ready}
          onClick={() => pickDecision('FLOW_B_MORE_ACCURATE')}
        >
          FLOW B MORE ACCURATE
        </button>
        <button
          type="button"
          disabled={!step2Ready}
          onClick={() => pickDecision('BOTH_ACCEPTABLE')}
        >
          BOTH ACCEPTABLE
        </button>
        <button
          type="button"
          disabled={!step2Ready}
          onClick={() => pickDecision('NEITHER_ACCEPTABLE')}
        >
          NEITHER ACCEPTABLE
        </button>
      </div>
      <div className="site00-dw-v3-mobile-twin-capability-test__compare-tabs">
        <button type="button" className={compareMode === 'ACTUAL_A' ? 'is-active' : undefined} onClick={() => setCompareMode('ACTUAL_A')}>
          ACTUAL ↔ BLUEPRINT A
        </button>
        <button type="button" className={compareMode === 'ACTUAL_B' ? 'is-active' : undefined} onClick={() => setCompareMode('ACTUAL_B')}>
          ACTUAL ↔ BLUEPRINT B
        </button>
        <button type="button" className={compareMode === 'A_B' ? 'is-active' : undefined} onClick={() => setCompareMode('A_B')}>
          A ↔ B
        </button>
      </div>
      <div className="site00-dw-v3-mobile-twin-capability-test__grid">
        {panels.map((p) => (
          <figure key={p.testId} data-testid={p.testId}>
            <figcaption>{p.label}</figcaption>
            {p.src ?
              <img src={p.src} alt={p.label} loading="lazy" />
            : <p>Not generated yet</p>}
          </figure>
        ))}
      </div>
      {err ?
        <p role="alert">{err}</p>
      : null}
    </section>
  );
}
