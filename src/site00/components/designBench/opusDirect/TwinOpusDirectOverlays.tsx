import { DESIGN_CHILD_SURFACE_PLACEMENT } from '../../../../../shared/site00-design-workspace-production/childSurfacePresentation.js';
import { DesignChildSurfaceFrame } from '../production/DesignChildSurfaceFrame';
import {
  ContractVersionsPanel,
  CreativeContextPanel,
  PairReviewPanel,
  ProvenancePanel,
  ReadinessReceiptPanel,
  SpendConfirmPanel,
} from '../production/designProductionOverlayPanels';
import type { TwinOpusDirectProduction } from './useTwinOpusDirectProduction';

type Props = {
  projectSlug: string;
  production: TwinOpusDirectProduction;
};

function placementMode(overlayId: string) {
  return DESIGN_CHILD_SURFACE_PLACEMENT[overlayId]?.mode ?? 'DRAWER';
}

export function TwinOpusDirectOverlays({ projectSlug, production }: Props) {
  const { overlay, actions, projection, pendingSpend, productionError } = production;
  if (!overlay && !productionError) return null;

  const slug = projectSlug.toLowerCase();
  const close = () => actions.setOverlay(null);

  return (
    <div className="tod-dcs-layer" data-testid="design-child-surface-layer">
      {productionError ?
        <div className="tod-dcs-toast" role="status" data-testid="tod-production-error">
          {productionError}
          <button type="button" className="tod-dcs__ghost" onClick={() => production.refresh()}>
            DISMISS
          </button>
        </div>
      : null}

      {overlay === 'OV-OVERFLOW-MENU' ?
        <DesignChildSurfaceFrame
          mode={placementMode('OV-OVERFLOW-MENU')}
          title="WORKSPACE"
          overlayId="OV-OVERFLOW-MENU"
          onClose={close}
        >
          <div className="tod-dcs-stackActions">
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
          <CreativeContextPanel projectSlug={slug} />
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
          title="PROJECT MODULES"
          subtitle="Host-level navigation — not DESIGN section tabs."
          overlayId="OV-HOST-MODULE-NAV"
          onClose={close}
        >
          <nav className="tod-dcs-nav">
            <a href={`/projects/${slug}`}>PROJECT HUB</a>
            <a href={`/projects/${slug}/design`}>DESIGN · PRODUCTION WORKSPACE</a>
          </nav>
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
    </div>
  );
}
