import { DESIGN_CHILD_SURFACE_PLACEMENT } from '../../../../../shared/site00-design-workspace-production/childSurfacePresentation.js';
import { DesignChildSurfaceFrame } from '../production/DesignChildSurfaceFrame';
import {
  AmendmentDetailPanel,
  CompareConceptsPanel,
  ContractVersionsPanel,
  CreativeContextPanel,
  FullscreenArtifactOverlay,
  InspectCandidatePanel,
  PairReviewPanel,
  ProvenancePanel,
  ReadinessReceiptPanel,
  ReviewAuthorityPanel,
  SpendConfirmPanel,
  StructuredArtifactPanel,
} from '../production/designProductionOverlayPanels';
import { DesignProjectModuleNavPanel } from '../production/DesignProjectModuleNavPanel';
import { readDesignPageTarget } from '../production/designProductionPageTarget';
import type { TwinOpusDirectProduction } from './useTwinOpusDirectProduction';

type Props = {
  projectSlug: string;
  production: TwinOpusDirectProduction;
};

function placementMode(overlayId: string) {
  return DESIGN_CHILD_SURFACE_PLACEMENT[overlayId]?.mode ?? 'DRAWER';
}

function ProductionErrorToast({
  message,
  onDismiss,
  onRetry,
}: {
  message: string;
  onDismiss: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="tod-dcs-toast tod-dcs-toast--compact" role="status" data-testid="tod-production-error">
      <span>{message}</span>
      <span className="tod-dcs-toast__actions">
        <button type="button" className="tod-dcs__ghost" onClick={onRetry}>
          RETRY
        </button>
        <button type="button" className="tod-dcs__ghost" onClick={onDismiss}>
          DISMISS
        </button>
      </span>
    </div>
  );
}

export function TwinOpusDirectOverlays({ projectSlug, production }: Props) {
  const { overlay, actions, projection, pendingSpend, productionError } = production;
  const toast =
    productionError ?
      <ProductionErrorToast
        message={productionError}
        onDismiss={() => actions.dismissProductionError()}
        onRetry={() => production.refresh()}
      />
    : null;

  if (!overlay) {
    return toast;
  }

  const slug = projectSlug.toLowerCase();
  const close = () => {
    actions.clearUiPayload();
    actions.setOverlay(null);
  };

  return (
    <>
      {toast}
      <div className="tod-dcs-layer" data-testid="design-child-surface-layer">
        {overlay === 'OV-OVERFLOW-MENU' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-OVERFLOW-MENU')}
            title="WORKSPACE"
            overlayId="OV-OVERFLOW-MENU"
            onClose={close}
          >
            <div className="tod-dcs-stackActions">
              <button type="button" className="tod-dcs__primary" onClick={actions.openCreativeContext}>
                PROJECT CREATIVE CONTEXT
              </button>
              <button type="button" className="tod-dcs__primary" onClick={actions.openReadinessReceipt}>
                READINESS RECEIPT
              </button>
              <button type="button" className="tod-dcs__ghost" onClick={actions.openContractVersions}>
                CONTRACT VERSIONS
              </button>
            </div>
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-READINESS-RECEIPT' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-READINESS-RECEIPT')}
            title="READINESS RECEIPT"
            subtitle={`${projection.receipt.passedGates} / ${projection.receipt.applicableGates} gates`}
            overlayId="OV-READINESS-RECEIPT"
            onClose={close}
          >
            <ReadinessReceiptPanel production={production} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-CONTRACT-VERSIONS' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-CONTRACT-VERSIONS')}
            title="CONTRACT VERSIONS"
            overlayId="OV-CONTRACT-VERSIONS"
            onClose={close}
          >
            <ContractVersionsPanel production={production} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-CREATIVE-CONTEXT' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-CREATIVE-CONTEXT')}
            title="PROJECT CREATIVE CONTEXT"
            subtitle="Read-only project intelligence for this design target."
            overlayId="OV-CREATIVE-CONTEXT"
            onClose={close}
          >
            <CreativeContextPanel projectSlug={slug} pageId={readDesignPageTarget(slug)?.pageId ?? null} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-PROVENANCE' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-PROVENANCE')}
            title="SOURCE / PROVENANCE"
            subtitle="Where this design target came from."
            overlayId="OV-PROVENANCE"
            onClose={close}
          >
            <ProvenancePanel production={production} projectSlug={slug} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-HOST-MODULE-NAV' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-HOST-MODULE-NAV')}
            title="PROJECTS MODULE NAV"
            subtitle="DESIGN is a module inside PROJECTS — switch module or active project."
            overlayId="OV-HOST-MODULE-NAV"
            onClose={close}
          >
            <DesignProjectModuleNavPanel activeProjectSlug={slug} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-PAIR-REVIEW' ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-PAIR-REVIEW')}
            title="PAIR REVIEW"
            overlayId="OV-PAIR-REVIEW"
            onClose={close}
          >
            <PairReviewPanel production={production} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-SPEND-CONFIRM' && pendingSpend ?
          <DesignChildSurfaceFrame
            mode={placementMode('OV-SPEND-CONFIRM')}
            title="CONFIRM SPEND"
            overlayId="OV-SPEND-CONFIRM"
            onClose={actions.cancelPendingSpend}
          >
            <SpendConfirmPanel production={production} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-REVIEW-AUTHORITY' ?
          <DesignChildSurfaceFrame
            mode="MODAL"
            title="REVIEW AUTHORITY"
            overlayId="OV-REVIEW-AUTHORITY"
            onClose={close}
          >
            <ReviewAuthorityPanel production={production} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-INSPECT-CANDIDATE' && production.uiPayload.inspectCandidateId ?
          <DesignChildSurfaceFrame
            mode="INSPECTOR"
            title="INSPECT CANDIDATE"
            overlayId="OV-INSPECT-CANDIDATE"
            onClose={close}
          >
            <InspectCandidatePanel
              production={production}
              candidateId={production.uiPayload.inspectCandidateId}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-COMPARE-CONCEPTS' && production.uiPayload.compareCandidateIds ?
          <DesignChildSurfaceFrame
            mode="WORKSPACE"
            title="COMPARE CONCEPTS"
            overlayId="OV-COMPARE-CONCEPTS"
            onClose={close}
          >
            <CompareConceptsPanel
              production={production}
              leftId={production.uiPayload.compareCandidateIds[0]}
              rightId={production.uiPayload.compareCandidateIds[1]}
            />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-STRUCTURED-ARTIFACT' && production.uiPayload.structuredColumnId ?
          <DesignChildSurfaceFrame
            mode="DRAWER"
            title="STRUCTURED ARTIFACT"
            overlayId="OV-STRUCTURED-ARTIFACT"
            onClose={close}
          >
            <StructuredArtifactPanel columnId={production.uiPayload.structuredColumnId} />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-AMENDMENT-DETAIL' ?
          <DesignChildSurfaceFrame
            mode="DRAWER"
            title="VIEW AMENDMENT"
            overlayId="OV-AMENDMENT-DETAIL"
            onClose={close}
          >
            <AmendmentDetailPanel />
          </DesignChildSurfaceFrame>
        : null}

        {overlay === 'OV-FULLSCREEN-ARTIFACT' && production.uiPayload.artifact ?
          <>
            <button type="button" className="tod-dcs-backdrop" aria-label="Close fullscreen" onClick={close} />
            <FullscreenArtifactOverlay production={production} />
          </>
        : null}
      </div>
    </>
  );
}
