/**
 * P0.VR.MOF.R2 — Capture child page (human-first summary + test wizard + details drawer).
 */

import { useCallback, useEffect, useState } from 'react';
import type { CaptureOrchestrationInspectorState } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/browserClient.js';
import type { CaptureTransportHealth } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureTransportReceipt.js';
import { captureApiFetch, PAGE_MIRROR_PATH } from '../../../services/captureApiFetch';
import { checkCaptureTransportHealth } from '../../../services/checkCaptureTransportHealth';
import type { ProjectCaptureRefreshState } from '../usePageMirror';
import { MoreToolPageShell } from './MoreToolPageShell';
import { MoreSummaryGrid, MoreSummaryTile } from './MoreSummaryTile';
import { CaptureTestWorkerFlow } from './CaptureTestWorkerFlow';
import { DesignCaptureDetailsContent } from './DesignCaptureDetailsContent';
import {
  captureHeadline,
  captureNeedsAttention,
  captureSupportText,
  captureVisualState,
  humanBoolReady,
  humanConnection,
  humanWorkerStatus,
} from './moreStatus';

type Props = {
  projectId: string;
  onBack: () => void;
  captureRefresh?: ProjectCaptureRefreshState;
  onTestWorker?: () => void | Promise<boolean | void>;
  onGoToPages?: () => void;
};

type ViewMode = 'summary' | 'testing' | 'success' | 'failure';

export function DesignMoreCapturePage({
  projectId,
  onBack,
  captureRefresh,
  onTestWorker,
  onGoToPages,
}: Props) {
  const [inspector, setInspector] = useState<CaptureOrchestrationInspectorState | null>(null);
  const [transport, setTransport] = useState<CaptureTransportHealth | null>(captureRefresh?.transportHealth ?? null);
  const [viewMode, setViewMode] = useState<ViewMode>('summary');

  const loadDetails = useCallback(async () => {
    const [orch, transportResult] = await Promise.all([
      captureApiFetch<CaptureOrchestrationInspectorState>(
        `${PAGE_MIRROR_PATH}?projectId=${encodeURIComponent(projectId)}&view=capture-orchestration`,
      ),
      checkCaptureTransportHealth(projectId),
    ]);
    setInspector(orch.ok ? orch.data : null);
    setTransport(transportResult.health ?? captureRefresh?.transportHealth ?? null);
  }, [projectId, captureRefresh?.transportHealth]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  useEffect(() => {
    if (captureRefresh?.transportHealth) setTransport(captureRefresh.transportHealth);
  }, [captureRefresh?.transportHealth]);

  useEffect(() => {
    if (captureRefresh?.testingWorker) {
      setViewMode('testing');
      return;
    }
    if (captureRefresh?.testWorkerProgress === 'COMPLETE' && captureRefresh.testJobPassed) {
      setViewMode('success');
      return;
    }
    if (captureRefresh?.testWorkerFailed) {
      setViewMode('failure');
      return;
    }
    setViewMode('summary');
  }, [
    captureRefresh?.testingWorker,
    captureRefresh?.testWorkerProgress,
    captureRefresh?.testJobPassed,
    captureRefresh?.testWorkerFailed,
  ]);

  const needsAttention = captureNeedsAttention(captureRefresh);
  const visualState = captureVisualState(captureRefresh);
  const detailsContent = <DesignCaptureDetailsContent inspector={inspector} transport={transport} />;

  const handleTestWorker = () => {
    setViewMode('testing');
    void onTestWorker?.();
  };

  const handleRetryConnection = () => {
    void loadDetails();
  };

  const primaryLabel = !transport?.apiReachable ? 'RETRY CONNECTION' : needsAttention ? 'TEST WORKER' : 'CAPTURE MULTIPLE PAGES';
  const primaryHandler = !transport?.apiReachable ? handleRetryConnection : handleTestWorker;

  if (viewMode === 'testing') {
    return (
      <MoreToolPageShell
        title="CAPTURE"
        headline="TESTING CAPTURE WORKER"
        visualState="progress"
        onBack={onBack}
        transitionKey="more-capture-test"
        hideDefaultHero
        detailsContent={detailsContent}
      >
        <CaptureTestWorkerFlow
          currentStep={captureRefresh?.testWorkerProgress ?? 'CONNECTING'}
          failed={false}
          mode="testing"
        />
      </MoreToolPageShell>
    );
  }

  if (viewMode === 'success') {
    return (
      <MoreToolPageShell
        title="CAPTURE"
        visualState="success"
        statusBadge="WORKER READY ✓"
        headline="WORKER READY ✓"
        support="Browser ready · test capture complete."
        onBack={onBack}
        transitionKey="more-capture-success"
        primaryAction={{ label: 'RETURN TO PAGES', onClick: () => (onGoToPages ?? onBack)() }}
        secondaryAction={{ label: 'VIEW TEST RESULT', onClick: () => {}, variant: 'outline' }}
        detailsContent={detailsContent}
        detailsTitle="TEST RESULT"
      />
    );
  }

  if (viewMode === 'failure') {
    return (
      <MoreToolPageShell
        title="CAPTURE"
        visualState="attention"
        statusBadge="NEEDS ATTENTION"
        headline="WORKER NEEDS ATTENTION"
        support="The worker is online, but the browser could not start."
        onBack={onBack}
        transitionKey="more-capture-failure"
        primaryAction={{ label: 'RETRY TEST', onClick: handleTestWorker }}
        secondaryAction={{ label: 'VIEW DETAILS', onClick: () => {}, variant: 'outline' }}
        detailsContent={detailsContent}
      >
        <p className="site00-dw-more-tool__test-code">WORKER_TEST_FAILED</p>
      </MoreToolPageShell>
    );
  }

  return (
    <MoreToolPageShell
      title="CAPTURE"
      description="Advanced capture — system health and optional batch audit. Normal page work uses CAPTURE NOW in PAGES."
      visualState={visualState}
      statusBadge={captureHeadline(captureRefresh)}
      headline="SERVICE STATUS"
      support={captureSupportText(captureRefresh)}
      onBack={onBack}
      transitionKey="more-capture"
      primaryAction={{ label: primaryLabel, onClick: primaryHandler }}
      secondaryAction={{ label: 'VIEW DETAILS', onClick: () => {}, variant: 'outline' }}
      detailsContent={detailsContent}
      summary={
        <MoreSummaryGrid>
          <MoreSummaryTile
            label="API"
            value={humanConnection(transport?.apiReachable)}
            tone={transport?.apiReachable ? 'ready' : 'attention'}
          />
          <MoreSummaryTile
            label="WORKER"
            value={humanWorkerStatus(transport?.workerStatus)}
            tone={transport?.workerStatus === 'HEALTHY' ? 'ready' : 'attention'}
          />
          <MoreSummaryTile
            label="BROWSER"
            value={humanBoolReady(transport?.browserReady)}
            tone={transport?.browserReady ? 'ready' : 'attention'}
          />
          <MoreSummaryTile
            label="PLAYWRIGHT"
            value={humanBoolReady(transport?.playwrightReady)}
            tone={transport?.playwrightReady ? 'ready' : 'neutral'}
          />
        </MoreSummaryGrid>
      }
    />
  );
}
