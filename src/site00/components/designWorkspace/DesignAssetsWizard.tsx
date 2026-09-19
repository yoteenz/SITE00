/**
 * P0.VR.8R3R5R1 — Assets wizard (one pipeline step at a time).
 */

import { useCallback, useEffect, useState } from 'react';
import { DesignTaskWizardShell } from './wizard/DesignTaskWizardShell';
import { DesignAssetJobWorkspace } from './DesignAssetJobWorkspace';
import { useDesignReconstructionWorkflow } from './useDesignReconstructionWorkflow.js';
import { DesignReconstructionWorkflowPanel } from './DesignReconstructionWorkflowPanel.js';
import { DesignFounderActionAlertZone } from './DesignFounderActionAlertZone.js';
import { useDesignFounderActionNotifications } from './useDesignFounderActionNotifications.js';
import {
  ASSETS_WIZARD_STEPS,
  assetsWizardStepLabel,
  normalizeAssetsWizardStep,
  type AssetsWizardStep,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3r1/designWizardSteps.js';
import type { ApprovedScreenshotSource } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/client.js';

type Props = {
  projectId: string;
  pageId: string;
  route: string;
  referenceUrl: string | null;
  screenshotSource: ApprovedScreenshotSource | null;
  onRefresh?: () => void;
  assetStep?: string;
  onAssetStepChange?: (step: AssetsWizardStep) => void;
};

export function DesignAssetsWizard({
  projectId,
  pageId,
  route,
  referenceUrl,
  screenshotSource: _screenshotSource,
  onRefresh,
  assetStep: assetStepProp,
  onAssetStepChange,
}: Props) {
  const [localStep, setLocalStep] = useState<AssetsWizardStep>('UPLOAD');
  const activeStep = assetStepProp ? normalizeAssetsWizardStep(assetStepProp) : localStep;
  const stepIndex = ASSETS_WIZARD_STEPS.indexOf(activeStep) + 1;
  const workflow = useDesignReconstructionWorkflow();
  const founderAlerts = useDesignFounderActionNotifications();

  const goTo = useCallback(
    (step: AssetsWizardStep) => {
      setLocalStep(step);
      onAssetStepChange?.(step);
    },
    [onAssetStepChange],
  );

  useEffect(() => {
    if (assetStepProp) setLocalStep(normalizeAssetsWizardStep(assetStepProp));
  }, [assetStepProp]);

  if (workflow.state?.workflowView && workflow.state) {
    return (
      <section className="site00-dw-wizard-host" data-design-tab="assets">
        <DesignReconstructionWorkflowPanel
          state={workflow.state}
          view={workflow.state.workflowView}
          onApproveCrop={workflow.approveCrop}
          onApproveAllCrops={workflow.approveAllCrops}
          onApproveGeneration={() => void workflow.approveGeneration()}
          onApproveOutput={workflow.approveOutput}
          onClose={workflow.closeWorkflow}
          onSetCandidateIndex={workflow.setCandidateIndex}
          onUpdateCropReview={workflow.updateCropReview}
        />
      </section>
    );
  }

  if (founderAlerts.alertActions.length > 0) {
    return (
      <section className="site00-dw-wizard-host" data-design-tab="assets">
        <DesignFounderActionAlertZone
          actions={founderAlerts.alertActions}
          totalPending={workflow.assetsActionCount}
          onPrimary={(action) => workflow.openAction(action.deepLink)}
          onViewJob={(action) => workflow.openAction(action.deepLink)}
        />
      </section>
    );
  }

  const prevStep = stepIndex > 1 ? ASSETS_WIZARD_STEPS[stepIndex - 2] : null;
  const nextStep = stepIndex < ASSETS_WIZARD_STEPS.length ? ASSETS_WIZARD_STEPS[stepIndex] : null;

  return (
    <section className="site00-dw-wizard-host site00-dw-wizard-assets" data-design-tab="assets" data-asset-step={activeStep}>
      <DesignTaskWizardShell
        stepCurrent={stepIndex}
        stepTotal={ASSETS_WIZARD_STEPS.length}
        stepTitle={assetsWizardStepLabel(activeStep)}
        headline={assetsWizardStepLabel(activeStep)}
        support={`Step ${stepIndex} of ${ASSETS_WIZARD_STEPS.length} in the asset pipeline`}
        visualState="ready"
        onBack={prevStep ? () => goTo(prevStep) : undefined}
        primaryAction={
          nextStep
            ? {
                label: `CONTINUE TO ${assetsWizardStepLabel(nextStep)}`,
                onClick: () => goTo(nextStep),
              }
            : undefined
        }
        transitionKey={activeStep}
      >
        <div className="site00-dw-wizard-assets__workspace">
          <DesignAssetJobWorkspace
            projectId={projectId}
            pageId={pageId}
            route={route}
            referenceUrl={referenceUrl}
            sourcePage={pageId}
            wizardStep={activeStep}
            onWizardStepChange={(step) => goTo(normalizeAssetsWizardStep(step))}
            onRefresh={onRefresh}
          />
        </div>
      </DesignTaskWizardShell>
    </section>
  );
}
