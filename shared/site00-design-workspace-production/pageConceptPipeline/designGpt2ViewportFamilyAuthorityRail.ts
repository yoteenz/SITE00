/**
 * Canonical GPT2 viewport-family hero rail (full vertical stack beside CURRENT/CONCEPT).
 */

import type { PageConceptGeneratedArtifact, PageConceptPipelineSet } from './types.js';
import { pageConceptCanonicalNbpDisabled } from './pageConceptCanonicalPipeline.js';
import {
  experienceArtifactReadyForReview,
  isMobileAuthorityConfirmed,
  resolveExperienceExpressionStatus,
  resolveMobileAuthorityStatus,
  slotLabelFromConceptId,
} from './pageConceptViewportFamilyState.js';

export type Gpt2ViewportFamilyAuthorityRailRow = {
  id: string;
  label: string;
  value: string;
  status: 'PENDING' | 'READY' | 'APPROVED' | 'LOCKED' | 'GENERATING' | 'ACTIVE';
};

export type Gpt2ViewportFamilyAuthorityRailAction = {
  id: string;
  label: string;
  tone: 'lime' | 'ghost' | 'ink';
  disabled: boolean;
  disabledReason: string | null;
  secondary?: boolean;
  lock?: boolean;
};

export type Gpt2ViewportFamilyHeroRailStage = {
  id: string;
  label: string;
  valueLine: string;
  statusLabel: string;
  statusTone: 'pending' | 'ready' | 'approved' | 'locked' | 'generating' | 'active';
  /** Active viewport toggle — subtle emphasis only; full stack always visible. */
  emphasized: boolean;
  actions: readonly Gpt2ViewportFamilyAuthorityRailAction[];
};

function jobRunning(jobs: readonly PageConceptGeneratedArtifact[], provider: 'GPT2_TABLET' | 'GPT2_DESKTOP'): boolean {
  return jobs.some((j) => j.provider === provider && j.status === 'RUNNING');
}

function action(
  partial: Gpt2ViewportFamilyAuthorityRailAction,
): Gpt2ViewportFamilyAuthorityRailAction {
  return partial;
}

/** @deprecated Prefer buildGpt2ViewportFamilyHeroRailStages — always returns all five stages. */
export function buildGpt2ViewportFamilyAuthorityRail(input: {
  pipelineSet: PageConceptPipelineSet | null;
  selectedMobileConceptLabel: string | null;
  activeViewport?: 'MOBILE' | 'TABLET' | 'DESKTOP';
}): readonly Gpt2ViewportFamilyAuthorityRailRow[] {
  return buildGpt2ViewportFamilyHeroRailStages({
    pipelineSet: input.pipelineSet,
    selectedMobileConceptId: input.pipelineSet?.viewportAuthorityFamily?.selectedMobileConceptId ?? null,
    selectedGalleryCandidateId: null,
    selectedGalleryCandidateSlotLabel: null,
    generating: false,
    generationJobs: [],
    activeViewport: input.activeViewport ?? 'MOBILE',
    tabletInterpretationActive: false,
    desktopInterpretationActive: false,
  }).map((stage) => ({
    id: stage.id,
    label: stage.label,
    value: stage.valueLine,
    status:
      stage.statusTone === 'approved' ? 'APPROVED'
      : stage.statusTone === 'locked' ? 'LOCKED'
      : stage.statusTone === 'generating' ? 'GENERATING'
      : stage.statusTone === 'active' ? 'ACTIVE'
      : stage.statusTone === 'ready' ? 'READY'
      : 'PENDING',
  }));
}

/** @deprecated Prefer per-stage actions on buildGpt2ViewportFamilyHeroRailStages. */
export function buildGpt2ViewportFamilyAuthorityRailActions(input: {
  pipelineSet: PageConceptPipelineSet | null;
  selectedMobileConceptId: string | null;
  selectedGalleryCandidateId: string | null;
  generating: boolean;
  activeViewport?: 'MOBILE' | 'TABLET' | 'DESKTOP';
}): readonly Gpt2ViewportFamilyAuthorityRailAction[] {
  return buildGpt2ViewportFamilyHeroRailStages({
    pipelineSet: input.pipelineSet,
    selectedMobileConceptId: input.selectedMobileConceptId,
    selectedGalleryCandidateId: input.selectedGalleryCandidateId,
    selectedGalleryCandidateSlotLabel: slotLabelFromConceptId(input.pipelineSet, input.selectedGalleryCandidateId),
    generating: input.generating,
    generationJobs: [],
    activeViewport: input.activeViewport ?? 'MOBILE',
    tabletInterpretationActive: false,
    desktopInterpretationActive: false,
  }).flatMap((s) => s.actions);
}

export function buildGpt2ViewportFamilyHeroRailStages(input: {
  pipelineSet: PageConceptPipelineSet | null;
  selectedMobileConceptId: string | null;
  selectedGalleryCandidateId: string | null;
  selectedGalleryCandidateSlotLabel: string | null;
  generating: boolean;
  generationJobs: readonly PageConceptGeneratedArtifact[];
  activeViewport: 'MOBILE' | 'TABLET' | 'DESKTOP';
  tabletInterpretationActive: boolean;
  desktopInterpretationActive: boolean;
}): readonly Gpt2ViewportFamilyHeroRailStage[] {
  const family = input.pipelineSet?.viewportAuthorityFamily ?? null;
  const mobileAuthority = resolveMobileAuthorityStatus(family);
  const mobileConfirmed = isMobileAuthorityConfirmed(family);
  const mobileSelected = mobileAuthority !== 'NONE';
  const confirmedConceptId = family?.confirmedMobileConceptId ?? family?.selectedMobileConceptId ?? null;
  const mobileSlotLabel =
    slotLabelFromConceptId(input.pipelineSet, confirmedConceptId) ?? input.selectedGalleryCandidateSlotLabel;

  const experienceStatus = resolveExperienceExpressionStatus(input.pipelineSet);
  const experienceApproved = experienceStatus === 'APPROVED';
  const experienceReady = experienceArtifactReadyForReview(input.pipelineSet) && !experienceApproved;
  const experienceNotStarted = experienceStatus === 'NOT_STARTED' || experienceStatus === 'SUPERSEDED';
  const experienceGenerating = experienceStatus === 'GENERATING';
  const experiencePartial = experienceStatus === 'PARTIAL_FAILURE';

  const tabletReady = Boolean(family?.tabletArtifactId);
  const desktopReady = Boolean(family?.desktopArtifactId);
  const tabletGenerating = jobRunning(input.generationJobs, 'GPT2_TABLET');
  const desktopGenerating = jobRunning(input.generationJobs, 'GPT2_DESKTOP');
  const familyStatus = family?.status ?? null;
  const familyLocked = familyStatus === 'LOCKED';
  const familyApproved = familyStatus === 'APPROVED' || familyLocked;
  const familyReviewReady =
    tabletReady && desktopReady && (familyStatus === 'AWAITING_FOUNDER_FAMILY_REVIEW' || familyStatus === 'DESKTOP_READY');

  const tabletUnlocked = mobileConfirmed && experienceApproved;
  const desktopUnlocked = tabletUnlocked;

  const stages: Gpt2ViewportFamilyHeroRailStage[] = [];

  // 1 — MOBILE AUTHORITY (full stack always visible)
  {
    const selectDisabled =
      mobileConfirmed ||
      (mobileSelected && !mobileConfirmed) ||
      !input.selectedGalleryCandidateId ||
      input.generating;
    const selectDisabledReason =
      mobileConfirmed ? 'Mobile authority confirmed.'
      : mobileSelected && !mobileConfirmed ? 'Concept selected — confirm mobile authority.'
      : !input.selectedGalleryCandidateId ? 'Select a concept in the gallery first.'
      : input.generating ? 'Generation in progress.'
      : null;

    const confirmDisabled = !mobileSelected || mobileConfirmed || input.generating;
    const confirmDisabledReason =
      !mobileSelected ? 'Select a mobile concept first.'
      : mobileConfirmed ? 'Mobile authority confirmed.'
      : input.generating ? 'Generation in progress.'
      : null;

    const changeDisabled =
      !mobileSelected || input.generating || familyLocked || (mobileConfirmed && experienceApproved);
    const changeDisabledReason =
      !mobileSelected ? 'Select a mobile concept first.'
      : familyLocked ? 'Viewport family locked.'
      : mobileConfirmed && experienceApproved ? 'Experience approved — change invalidates downstream.'
      : input.generating ? 'Generation in progress.'
      : null;

    const mobileActions: Gpt2ViewportFamilyAuthorityRailAction[] = [
      action({
        id: 'vf-select-mobile',
        label: 'SELECT MOBILE CONCEPT',
        tone: 'lime',
        disabled: selectDisabled,
        disabledReason: selectDisabledReason,
      }),
      action({
        id: 'vf-confirm-mobile',
        label: 'CONFIRM MOBILE AUTHORITY',
        tone: 'ink',
        disabled: confirmDisabled,
        disabledReason: confirmDisabledReason,
      }),
      action({
        id: 'vf-change-mobile',
        label: 'CHANGE SELECTION',
        tone: 'ghost',
        disabled: changeDisabled,
        disabledReason: changeDisabledReason,
        secondary: true,
      }),
    ];
    stages.push({
      id: 'mobile-authority',
      label: 'MOBILE AUTHORITY',
      valueLine:
        mobileConfirmed && mobileSlotLabel ?
          `${mobileSlotLabel} · LOCKED FOR EXPERIENCE`
        : mobileSelected && mobileSlotLabel ?
          `${mobileSlotLabel} · SELECTED`
        : 'NOT SELECTED',
      statusLabel: mobileConfirmed ? 'CONFIRMED' : mobileSelected ? 'SELECTED' : 'NOT SELECTED',
      statusTone: mobileConfirmed ? 'approved' : mobileSelected ? 'active' : 'pending',
      emphasized: input.activeViewport === 'MOBILE',
      actions: mobileActions,
    });
  }

  // 2 — EXPERIENCE (full stack always visible)
  {
    const openEnabled = mobileConfirmed && experienceNotStarted && !input.generating;
    const reviewEnabled =
      mobileConfirmed &&
      (experienceGenerating || experienceReady || experiencePartial || experienceApproved) &&
      (!input.generating || experienceGenerating);
    const approveEnabled =
      mobileConfirmed && (experienceReady || experiencePartial) && !experienceApproved && !input.generating;

    const experienceActions: Gpt2ViewportFamilyAuthorityRailAction[] = [
      action({
        id: 'vf-create-experience',
        label: 'OPEN EXPERIENCE',
        tone: 'lime',
        disabled: !openEnabled,
        disabledReason:
          !mobileConfirmed ? 'Confirm mobile authority first.'
          : !experienceNotStarted ? 'Experience already in progress or complete.'
          : input.generating ? 'Generation in progress.'
          : null,
      }),
      action({
        id: 'vf-review-experience',
        label: experienceApproved ? 'VIEW APPROVED EXPERIENCE' : 'REVIEW EXPERIENCE',
        tone: 'ink',
        disabled: !reviewEnabled,
        disabledReason:
          !mobileConfirmed ? 'Confirm mobile authority first.'
          : experienceNotStarted ? 'Open experience to generate package.'
          : input.generating ? 'Generation in progress.'
          : null,
      }),
      action({
        id: 'vf-approve-experience',
        label: 'APPROVE EXPERIENCE',
        tone: 'lime',
        disabled: !approveEnabled,
        disabledReason:
          !mobileConfirmed ? 'Confirm mobile authority first.'
          : experienceApproved ? 'Experience approved.'
          : !(experienceReady || experiencePartial) ? 'Approve when experience package is ready for review.'
          : input.generating ? 'Generation in progress.'
          : null,
      }),
    ];
    stages.push({
      id: 'experience',
      label: 'EXPERIENCE',
      valueLine:
        !mobileConfirmed ? 'LOCKED'
        : experienceApproved ? 'APPROVED'
        : experienceGenerating ? 'GENERATING'
        : experiencePartial ? 'PARTIAL — REVIEW'
        : experienceReady ? 'READY FOR REVIEW'
        : 'OPEN PANEL TO GENERATE',
      statusLabel:
        !mobileConfirmed ? 'LOCKED'
        : experienceApproved ? 'APPROVED'
        : experienceGenerating ? 'GENERATING'
        : experiencePartial ? 'PARTIAL — REVIEW'
        : experienceReady ? 'READY FOR REVIEW'
        : 'NOT STARTED',
      statusTone:
        !mobileConfirmed ? 'locked'
        : experienceApproved ? 'approved'
        : experienceGenerating ? 'generating'
        : experiencePartial ? 'ready'
        : experienceReady ? 'ready'
        : 'pending',
      emphasized: input.activeViewport === 'MOBILE',
      actions: experienceActions,
    });
  }

  // 3 — TABLET (full stack always visible)
  {
    const generateTabletEnabled =
      tabletUnlocked && !tabletReady && !tabletGenerating && !input.generating;
    const reviewTabletEnabled = tabletUnlocked && tabletReady && !input.generating;
    const regenerateTabletEnabled = tabletUnlocked && tabletReady && !input.generating;
    const useTabletEnabled = tabletUnlocked && tabletReady && !input.tabletInterpretationActive;

    const tabletBlockedReason =
      !mobileConfirmed ? 'Confirm mobile authority first.'
      : !experienceApproved ? 'Approve experience first.'
      : tabletGenerating ? 'Tablet interpretation generating.'
      : input.generating ? 'Generation in progress.'
      : null;

    const tabletActions: Gpt2ViewportFamilyAuthorityRailAction[] = [
      action({
        id: 'vf-run-tablet',
        label: 'GENERATE TABLET',
        tone: 'lime',
        disabled: !generateTabletEnabled,
        disabledReason: generateTabletEnabled ? null : tabletBlockedReason ?? 'Not available yet.',
      }),
      action({
        id: 'vf-review-tablet',
        label: 'REVIEW TABLET',
        tone: 'ink',
        disabled: !reviewTabletEnabled,
        disabledReason:
          reviewTabletEnabled ? null
          : !tabletUnlocked ? (tabletBlockedReason ?? 'Locked.')
          : 'Generate tablet interpretation first.',
      }),
      action({
        id: 'vf-regenerate-tablet',
        label: 'REGENERATE TABLET',
        tone: 'ghost',
        disabled: !regenerateTabletEnabled,
        disabledReason:
          regenerateTabletEnabled ? null
          : !tabletUnlocked ? (tabletBlockedReason ?? 'Locked.')
          : 'Generate tablet interpretation first.',
        secondary: true,
      }),
      action({
        id: 'vf-use-tablet',
        label: 'USE THIS TABLET VERSION',
        tone: 'ghost',
        disabled: !useTabletEnabled,
        disabledReason:
          useTabletEnabled ? null
          : input.tabletInterpretationActive ? 'Already active in gallery.'
          : 'Generate tablet interpretation first.',
        secondary: true,
      }),
    ];
    stages.push({
      id: 'tablet',
      label: 'TABLET INTERPRETATION',
      valueLine:
        !tabletUnlocked ? 'LOCKED'
        : tabletGenerating ? 'GENERATING'
        : tabletReady ? (family?.tabletVersion ?? 'READY')
        : 'PENDING',
      statusLabel:
        !tabletUnlocked ? 'LOCKED'
        : tabletGenerating ? 'GENERATING'
        : input.tabletInterpretationActive ? 'ACTIVE'
        : tabletReady ? 'READY'
        : 'PENDING',
      statusTone:
        !tabletUnlocked ? 'locked'
        : tabletGenerating ? 'generating'
        : input.tabletInterpretationActive ? 'active'
        : tabletReady ? 'ready'
        : 'pending',
      emphasized: input.activeViewport === 'TABLET',
      actions: tabletActions,
    });
  }

  // 4 — DESKTOP (full stack always visible)
  {
    const generateDesktopEnabled =
      desktopUnlocked && !desktopReady && !desktopGenerating && !input.generating;
    const reviewDesktopEnabled = desktopUnlocked && desktopReady && !input.generating;
    const regenerateDesktopEnabled = desktopUnlocked && desktopReady && !input.generating;
    const useDesktopEnabled = desktopUnlocked && desktopReady && !input.desktopInterpretationActive;

    const desktopBlockedReason =
      !mobileConfirmed ? 'Confirm mobile authority first.'
      : !experienceApproved ? 'Approve experience first.'
      : desktopGenerating ? 'Desktop interpretation generating.'
      : input.generating ? 'Generation in progress.'
      : null;

    const desktopActions: Gpt2ViewportFamilyAuthorityRailAction[] = [
      action({
        id: 'vf-run-desktop',
        label: 'GENERATE DESKTOP',
        tone: 'lime',
        disabled: !generateDesktopEnabled,
        disabledReason: generateDesktopEnabled ? null : desktopBlockedReason ?? 'Not available yet.',
      }),
      action({
        id: 'vf-review-desktop',
        label: 'REVIEW DESKTOP',
        tone: 'ink',
        disabled: !reviewDesktopEnabled,
        disabledReason:
          reviewDesktopEnabled ? null
          : !desktopUnlocked ? (desktopBlockedReason ?? 'Locked.')
          : 'Generate desktop interpretation first.',
      }),
      action({
        id: 'vf-regenerate-desktop',
        label: 'REGENERATE DESKTOP',
        tone: 'ghost',
        disabled: !regenerateDesktopEnabled,
        disabledReason:
          regenerateDesktopEnabled ? null
          : !desktopUnlocked ? (desktopBlockedReason ?? 'Locked.')
          : 'Generate desktop interpretation first.',
        secondary: true,
      }),
      action({
        id: 'vf-use-desktop',
        label: 'USE THIS DESKTOP VERSION',
        tone: 'ghost',
        disabled: !useDesktopEnabled,
        disabledReason:
          useDesktopEnabled ? null
          : input.desktopInterpretationActive ? 'Already active in gallery.'
          : 'Generate desktop interpretation first.',
        secondary: true,
      }),
    ];
    stages.push({
      id: 'desktop',
      label: 'DESKTOP INTERPRETATION',
      valueLine:
        !desktopUnlocked ? 'LOCKED'
        : desktopGenerating ? 'GENERATING'
        : desktopReady ? (family?.desktopVersion ?? 'READY')
        : 'PENDING',
      statusLabel:
        !desktopUnlocked ? 'LOCKED'
        : desktopGenerating ? 'GENERATING'
        : input.desktopInterpretationActive ? 'ACTIVE'
        : desktopReady ? 'READY'
        : 'PENDING',
      statusTone:
        !desktopUnlocked ? 'locked'
        : desktopGenerating ? 'generating'
        : input.desktopInterpretationActive ? 'active'
        : desktopReady ? 'ready'
        : 'pending',
      emphasized: input.activeViewport === 'DESKTOP',
      actions: desktopActions,
    });
  }

  // 5 — VIEWPORT FAMILY (full stack always visible)
  {
    const reviewFamilyEnabled = familyReviewReady && !input.generating;
    const approveFamilyEnabled = familyReviewReady && !familyApproved && !input.generating;
    const lockFamilyEnabled = familyStatus === 'APPROVED' && !familyLocked && !input.generating;

    const familyActions: Gpt2ViewportFamilyAuthorityRailAction[] = [
      action({
        id: 'vf-review-family',
        label: 'REVIEW FAMILY',
        tone: 'ink',
        disabled: !reviewFamilyEnabled,
        disabledReason:
          reviewFamilyEnabled ? null
          : familyLocked ? 'Viewport family locked.'
          : familyApproved ? 'Family approved.'
          : 'Complete tablet and desktop interpretations first.',
      }),
      action({
        id: 'vf-approve-family',
        label: 'APPROVE FAMILY',
        tone: 'lime',
        disabled: !approveFamilyEnabled,
        disabledReason:
          approveFamilyEnabled ? null
          : familyApproved ? 'Family approved.'
          : 'Review family when tablet and desktop are ready.',
      }),
      action({
        id: 'vf-lock-family',
        label: 'LOCK VIEWPORT FAMILY',
        tone: 'ghost',
        disabled: !lockFamilyEnabled,
        disabledReason:
          lockFamilyEnabled ? null
          : familyLocked ? 'Viewport family locked.'
          : 'Approve viewport family first.',
        lock: true,
        secondary: true,
      }),
    ];
    stages.push({
      id: 'viewport-family',
      label: 'VIEWPORT FAMILY',
      valueLine:
        familyLocked ? 'LOCKED'
        : familyApproved ? 'APPROVED'
        : familyReviewReady ? 'READY FOR REVIEW'
        : 'PENDING',
      statusLabel:
        familyLocked ? 'LOCKED'
        : familyApproved ? 'APPROVED'
        : familyReviewReady ? 'READY FOR REVIEW'
        : 'PENDING',
      statusTone:
        familyLocked ? 'locked'
        : familyApproved ? 'approved'
        : familyReviewReady ? 'ready'
        : 'pending',
      emphasized: true,
      actions: familyActions,
    });
  }

  return stages;
}

export function isCanonicalGpt2ViewportFamilyPipeline(pipelineSet: PageConceptPipelineSet | null): boolean {
  if (pageConceptCanonicalNbpDisabled()) return true;
  return pipelineSet?.pipelineLineage === 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE';
}
