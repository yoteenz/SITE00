/**
 * P0.VR.8R3R5R1 — Skins wizard (one step at a time).
 */

import { useCallback, useEffect, useState } from 'react';
import { DesignTaskWizardShell } from './wizard/DesignTaskWizardShell';
import { SkinFamilyThumb } from './skins/SkinFamilyThumb.js';
import { SkinFamilyName } from './skins/SkinFamilyName.js';
import { DesignDwSectionIcon } from './DesignDwSectionIcon.js';
import { SKINS_SCREEN_SLOTS, useDesignSkinsState } from './useDesignSkinsState.js';
import { useSkinsReferenceAssets } from './useSkinsReferenceAssets.js';
import { useDesignReconstructionWorkflow } from './useDesignReconstructionWorkflow.js';
import { DesignReconstructionWorkflowPanel } from './DesignReconstructionWorkflowPanel.js';
import {
  SKINS_WIZARD_STEPS,
  normalizeSkinsWizardStep,
  skinsWizardStepLabel,
  type SkinsWizardStep,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3r1/designWizardSteps.js';

type Props = {
  projectId: string;
  onOpenScreen?: (screenType: string) => void;
  onMatchReference?: () => void;
  skinsStep?: string;
  onSkinsStepChange?: (step: SkinsWizardStep) => void;
};

export function DesignSkinsWizard({
  projectId,
  onOpenScreen,
  onMatchReference,
  skinsStep: skinsStepProp,
  onSkinsStepChange,
}: Props) {
  const [localStep, setLocalStep] = useState<SkinsWizardStep>('family');
  const activeStep = skinsStepProp ? normalizeSkinsWizardStep(skinsStepProp) : localStep;
  const stepIndex = SKINS_WIZARD_STEPS.indexOf(activeStep) + 1;

  const state = useDesignSkinsState(projectId);
  const { families, activeFamily, activeFamilyKey, activeScreenType, setActiveScreenType, selectFamily, packCounts } = state;
  const mobileAssets = useSkinsReferenceAssets('MOBILE');
  const workflow = useDesignReconstructionWorkflow();

  const goTo = useCallback(
    (step: SkinsWizardStep) => {
      setLocalStep(step);
      onSkinsStepChange?.(step);
    },
    [onSkinsStepChange],
  );

  useEffect(() => {
    if (skinsStepProp) setLocalStep(normalizeSkinsWizardStep(skinsStepProp));
  }, [skinsStepProp]);

  if (workflow.state?.workflowView && workflow.state) {
    return (
      <section className="site00-dw-wizard-host" data-design-tab="skins">
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

  const prevStep = stepIndex > 1 ? SKINS_WIZARD_STEPS[stepIndex - 2] : null;
  const nextStep = stepIndex < SKINS_WIZARD_STEPS.length ? SKINS_WIZARD_STEPS[stepIndex] : null;
  const slotMeta = SKINS_SCREEN_SLOTS.find((s) => s.packScreenType === activeScreenType);
  const previewUrl = mobileAssets.previewForActive(activeScreenType, state.authorityForActive(activeScreenType, 'MOBILE')).url;

  const familyVisual =
    activeStep === 'family' ? (
      <div className="site00-dw-skins-wizard__family-grid">
        {families.map((family) => {
          const thumb = mobileAssets.familyThumbnailFor(family.brandKey);
          return (
            <button
              key={family.brandKey}
              type="button"
              className={`site00-dw-skins__family-card${family.brandKey === activeFamilyKey ? ' is-active' : ''}`}
              onClick={() => selectFamily(family.brandKey)}
            >
              <SkinFamilyThumb
                imageUrl={thumb.url}
                alt={family.name}
                approvedVisualAssetExists={thumb.approvedVisualAssetExists}
                fallbackColor={thumb.colorSwatchFallback && !thumb.approvedVisualAssetExists ? family.primaryColor : null}
              />
              <SkinFamilyName brandKey={family.brandKey} fallbackName={family.name} lineBreaks={mobileAssets.familyLineBreaks} />
            </button>
          );
        })}
      </div>
    ) : activeStep === 'screen' ? (
      <div className="site00-dw-skins__screen-grid site00-dw-skins-wizard__screen-grid">
        {SKINS_SCREEN_SLOTS.map((slot) => (
          <button
            key={slot.packScreenType}
            type="button"
            className={`site00-dw-skins__screen-tile${slot.packScreenType === activeScreenType ? ' is-active' : ''}`}
            onClick={() => setActiveScreenType(slot.packScreenType)}
          >
            <span className="site00-dw-skins__screen-num">{slot.num}</span>
            <span className="site00-dw-skins__screen-label">{slot.shortLabel}</span>
          </button>
        ))}
      </div>
    ) : previewUrl ? (
      <img src={previewUrl} alt="" className="site00-dw-wizard__skin-preview" />
    ) : (
      <div className="site00-dw-wizard__visual-icon is-attention">▢</div>
    );

  return (
    <section className="site00-dw-wizard-host site00-dw-wizard-skins" data-design-tab="skins" data-skins-step={activeStep}>
      <DesignTaskWizardShell
        stepCurrent={stepIndex}
        stepTotal={SKINS_WIZARD_STEPS.length}
        stepTitle={skinsWizardStepLabel(activeStep)}
        headline={activeFamily?.name.toUpperCase() ?? 'EXPERIENCE SKINS'}
        support={
          activeStep === 'family'
            ? 'Choose a brand family to rebuild.'
            : activeStep === 'screen'
              ? `${packCounts.total} screens in pack`
              : slotMeta?.shortLabel ?? 'Review skin authority'
        }
        visualState="ready"
        visual={familyVisual}
        onBack={prevStep ? () => goTo(prevStep) : undefined}
        primaryAction={{
          label:
            activeStep === 'apply'
              ? 'APPLY SKIN'
              : nextStep
                ? `CONTINUE TO ${skinsWizardStepLabel(nextStep)}`
                : 'OPEN SCREEN',
          onClick: () => {
            if (activeStep === 'apply') onMatchReference?.();
            else if (nextStep) goTo(nextStep);
            else onOpenScreen?.(activeScreenType);
          },
        }}
        secondaryAction={
          activeStep === 'compare' || activeStep === 'review'
            ? { label: 'OPEN SCREEN', onClick: () => onOpenScreen?.(activeScreenType) }
            : undefined
        }
        transitionKey={activeStep}
      >
        {activeStep === 'rebuild' ? (
          <p className="site00-dw-wizard__support-inline">
            <DesignDwSectionIcon iconId="eye" /> Rebuild uses existing skin authority pipeline — intelligence outputs stay in details.
          </p>
        ) : null}
      </DesignTaskWizardShell>
    </section>
  );
}
