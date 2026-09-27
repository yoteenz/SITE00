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

  // 1 — MOBILE AUTHORITY
  {
    const mobileActions: Gpt2ViewportFamilyAuthorityRailAction[] = [];
    if (!mobileSelected) {
      mobileActions.push(
        action({
          id: 'vf-select-mobile',
          label: 'SELECT MOBILE CONCEPT',
          tone: 'lime',
          disabled: !input.selectedGalleryCandidateId || input.generating,
          disabledReason:
            !input.selectedGalleryCandidateId ? 'Select a concept in the gallery first.'
            : input.generating ? 'Generation in progress.'
            : null,
        }),
      );
    } else if (!mobileConfirmed) {
      mobileActions.push(
        action({
          id: 'vf-confirm-mobile',
          label: 'CONFIRM MOBILE AUTHORITY',
          tone: 'lime',
          disabled: input.generating,
          disabledReason: input.generating ? 'Generation in progress.' : null,
        }),
        action({
          id: 'vf-change-mobile',
          label: 'CHANGE AUTHORITY',
          tone: 'ghost',
          disabled: input.generating || familyLocked,
          disabledReason: familyLocked ? 'Viewport family locked.' : null,
          secondary: true,
        }),
      );
    } else {
      mobileActions.push(
        action({
          id: 'vf-change-mobile',
          label: 'CHANGE AUTHORITY',
          tone: 'ghost',
          disabled: input.generating || familyLocked || experienceApproved,
          disabledReason:
            familyLocked ? 'Viewport family locked.'
            : experienceApproved ? 'Experience approved — change invalidates downstream.'
            : null,
          secondary: true,
        }),
      );
    }
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

  // 2 — EXPERIENCE
  {
    const experienceActions: Gpt2ViewportFamilyAuthorityRailAction[] = [];
    if (mobileConfirmed && experienceNotStarted) {
      experienceActions.push(
        action({
          id: 'vf-create-experience',
          label: 'CREATE EXPERIENCE',
          tone: 'lime',
          disabled: input.generating,
          disabledReason: input.generating ? 'Generation in progress.' : null,
        }),
      );
    } else if (mobileConfirmed && experienceGenerating) {
      experienceActions.push(
        action({
          id: 'vf-review-experience',
          label: 'VIEW PROGRESS',
          tone: 'ghost',
          disabled: false,
          disabledReason: null,
        }),
      );
    } else if (mobileConfirmed && experienceReady) {
      experienceActions.push(
        action({
          id: 'vf-review-experience',
          label: 'REVIEW EXPERIENCE',
          tone: 'lime',
          disabled: input.generating,
          disabledReason: input.generating ? 'Generation in progress.' : null,
        }),
        action({
          id: 'vf-approve-experience',
          label: 'APPROVE EXPERIENCE',
          tone: 'ghost',
          disabled: input.generating,
          disabledReason: input.generating ? 'Generation in progress.' : null,
        }),
      );
    } else if (mobileConfirmed && experienceApproved) {
      experienceActions.push(
        action({
          id: 'vf-review-experience',
          label: 'VIEW APPROVED EXPERIENCE',
          tone: 'ghost',
          disabled: false,
          disabledReason: null,
        }),
      );
    }
    stages.push({
      id: 'experience',
      label: 'EXPERIENCE',
      valueLine:
        !mobileConfirmed ? 'LOCKED'
        : experienceApproved ? 'APPROVED'
        : experienceGenerating ? 'GENERATING'
        : experienceReady ? 'READY FOR REVIEW'
        : 'READY TO GENERATE',
      statusLabel:
        !mobileConfirmed ? 'LOCKED'
        : experienceApproved ? 'APPROVED'
        : experienceGenerating ? 'GENERATING'
        : experienceReady ? 'READY FOR REVIEW'
        : 'NOT STARTED',
      statusTone:
        !mobileConfirmed ? 'locked'
        : experienceApproved ? 'approved'
        : experienceGenerating ? 'generating'
        : experienceReady ? 'ready'
        : 'pending',
      emphasized: input.activeViewport === 'MOBILE',
      actions: experienceActions,
    });
  }

  // 3 — TABLET
  {
    const tabletActions: Gpt2ViewportFamilyAuthorityRailAction[] = [];
    if (!tabletUnlocked) {
      /* locked */
    } else if (tabletGenerating || input.generating) {
      /* generating */
    } else if (!tabletReady) {
      tabletActions.push(
        action({
          id: 'vf-run-tablet',
          label: 'GENERATE TABLET',
          tone: 'lime',
          disabled: input.generating,
          disabledReason: input.generating ? 'Generation in progress.' : null,
        }),
      );
    } else {
      tabletActions.push(
        action({
          id: 'vf-review-tablet',
          label: 'REVIEW TABLET',
          tone: 'ghost',
          disabled: false,
          disabledReason: null,
        }),
        action({
          id: 'vf-regenerate-tablet',
          label: 'REGENERATE TABLET',
          tone: 'ink',
          disabled: input.generating,
          disabledReason: input.generating ? 'Generation in progress.' : null,
        }),
        action({
          id: 'vf-use-tablet',
          label: 'USE THIS TABLET VERSION',
          tone: 'lime',
          disabled: input.tabletInterpretationActive,
          disabledReason: input.tabletInterpretationActive ? 'Already active in gallery.' : null,
          secondary: true,
        }),
      );
    }
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
    if (!tabletUnlocked && mobileConfirmed && !experienceApproved) {
      stages[stages.length - 1]!.actions = [
        action({
          id: 'vf-run-tablet',
          label: 'GENERATE TABLET',
          tone: 'lime',
          disabled: true,
          disabledReason: 'APPROVE EXPERIENCE FIRST',
        }),
      ];
    }
  }

  // 4 — DESKTOP
  {
    const desktopActions: Gpt2ViewportFamilyAuthorityRailAction[] = [];
    if (!desktopUnlocked) {
      /* locked */
    } else if (desktopGenerating || input.generating) {
      /* generating */
    } else if (!desktopReady) {
      desktopActions.push(
        action({
          id: 'vf-run-desktop',
          label: 'GENERATE DESKTOP',
          tone: 'lime',
          disabled: input.generating,
          disabledReason: input.generating ? 'Generation in progress.' : null,
        }),
      );
    } else {
      desktopActions.push(
        action({
          id: 'vf-review-desktop',
          label: 'REVIEW DESKTOP',
          tone: 'ghost',
          disabled: false,
          disabledReason: null,
        }),
        action({
          id: 'vf-regenerate-desktop',
          label: 'REGENERATE DESKTOP',
          tone: 'ink',
          disabled: input.generating,
          disabledReason: input.generating ? 'Generation in progress.' : null,
        }),
        action({
          id: 'vf-use-desktop',
          label: 'USE THIS DESKTOP VERSION',
          tone: 'lime',
          disabled: input.desktopInterpretationActive,
          disabledReason: input.desktopInterpretationActive ? 'Already active in gallery.' : null,
          secondary: true,
        }),
      );
    }
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
    if (!desktopUnlocked && mobileConfirmed && !experienceApproved) {
      stages[stages.length - 1]!.actions = [
        action({
          id: 'vf-run-desktop',
          label: 'GENERATE DESKTOP',
          tone: 'lime',
          disabled: true,
          disabledReason: 'APPROVE EXPERIENCE FIRST',
        }),
      ];
    }
  }

  // 5 — VIEWPORT FAMILY
  {
    const familyActions: Gpt2ViewportFamilyAuthorityRailAction[] = [];
    if (familyReviewReady && !familyApproved) {
      familyActions.push(
        action({
          id: 'vf-review-family',
          label: 'REVIEW FAMILY',
          tone: 'ghost',
          disabled: false,
          disabledReason: null,
        }),
        action({
          id: 'vf-approve-family',
          label: 'APPROVE FAMILY',
          tone: 'lime',
          disabled: input.generating,
          disabledReason: input.generating ? 'Generation in progress.' : null,
        }),
      );
    } else if (mobileConfirmed && !tabletReady) {
      familyActions.push(
        action({
          id: 'vf-review-family',
          label: 'REVIEW FAMILY',
          tone: 'ghost',
          disabled: true,
          disabledReason: 'Complete tablet and desktop interpretations first.',
        }),
      );
    }
    if (familyStatus === 'APPROVED' && !familyLocked) {
      familyActions.push(
        action({
          id: 'vf-lock-family',
          label: 'LOCK VIEWPORT FAMILY',
          tone: 'ink',
          disabled: input.generating,
          disabledReason: input.generating ? 'Generation in progress.' : null,
          lock: true,
        }),
      );
    }
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
