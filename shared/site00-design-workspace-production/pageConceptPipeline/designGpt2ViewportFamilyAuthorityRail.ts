/**
 * Canonical GPT2 viewport-family hero rail (full vertical stack beside CURRENT/CONCEPT).
 */

import type { PageConceptGeneratedArtifact, PageConceptPipelineSet } from './types.js';
import { pageConceptCanonicalNbpDisabled } from './pageConceptCanonicalPipeline.js';
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

function slotLabelFromConceptId(
  pipelineSet: PageConceptPipelineSet | null,
  conceptId: string | null,
): string | null {
  if (!conceptId || !pipelineSet?.mobileConcepts?.length) return null;
  const row = pipelineSet.mobileConcepts.find((c) => c.conceptId === conceptId);
  if (!row) return null;
  if (row.slot === 'MOBILE_CONCEPT_A') return 'CONCEPT A';
  if (row.slot === 'MOBILE_CONCEPT_B') return 'CONCEPT B';
  return 'CONCEPT C';
}

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
  const mobileConfirmed = Boolean(family?.selectedMobileConceptId);
  const mobileSlotLabel =
    slotLabelFromConceptId(input.pipelineSet, family?.selectedMobileConceptId ?? null) ??
    input.selectedGalleryCandidateSlotLabel;
  const experienceApproved = Boolean(family?.experienceExpressionContractId);
  const experienceReady = mobileConfirmed && !experienceApproved;
  const tabletReady = Boolean(family?.tabletArtifactId);
  const desktopReady = Boolean(family?.desktopArtifactId);
  const tabletGenerating = jobRunning(input.generationJobs, 'GPT2_TABLET');
  const desktopGenerating = jobRunning(input.generationJobs, 'GPT2_DESKTOP');
  const familyStatus = family?.status ?? null;
  const familyLocked = familyStatus === 'LOCKED';
  const familyApproved = familyStatus === 'APPROVED' || familyLocked;
  const familyReviewReady =
    tabletReady && desktopReady && (familyStatus === 'AWAITING_FOUNDER_FAMILY_REVIEW' || familyStatus === 'DESKTOP_READY');

  const stages: Gpt2ViewportFamilyHeroRailStage[] = [];

  // 1 — MOBILE AUTHORITY
  {
    const mobileActions: Gpt2ViewportFamilyAuthorityRailAction[] = [];
    if (!mobileConfirmed) {
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
    } else {
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
          label: 'CHANGE SELECTION',
          tone: 'ghost',
          disabled: input.generating || familyLocked,
          disabledReason: familyLocked ? 'Viewport family locked.' : null,
          secondary: true,
        }),
      );
    }
    stages.push({
      id: 'mobile-authority',
      label: 'MOBILE AUTHORITY',
      valueLine: mobileConfirmed && mobileSlotLabel ? `${mobileSlotLabel} · SELECTED` : 'NOT SELECTED',
      statusLabel: mobileConfirmed ? 'SELECTED' : 'NOT SELECTED',
      statusTone: mobileConfirmed ? 'active' : 'pending',
      emphasized: input.activeViewport === 'MOBILE',
      actions: mobileActions,
    });
  }

  // 2 — EXPERIENCE
  {
    const experienceActions: Gpt2ViewportFamilyAuthorityRailAction[] = [];
    if (mobileConfirmed && !experienceApproved) {
      experienceActions.push(
        action({
          id: 'vf-review-experience',
          label: 'REVIEW EXPERIENCE',
          tone: 'ghost',
          disabled: input.generating,
          disabledReason: input.generating ? 'Generation in progress.' : null,
        }),
        action({
          id: 'vf-approve-experience',
          label: 'APPROVE EXPERIENCE',
          tone: 'lime',
          disabled: input.generating,
          disabledReason: input.generating ? 'Generation in progress.' : null,
        }),
      );
    }
    stages.push({
      id: 'experience',
      label: 'EXPERIENCE',
      valueLine:
        experienceApproved ? 'APPROVED'
        : experienceReady ? 'READY FOR REVIEW'
        : 'PENDING',
      statusLabel:
        experienceApproved ? 'APPROVED'
        : experienceReady ? 'READY FOR REVIEW'
        : 'PENDING',
      statusTone: experienceApproved ? 'approved' : experienceReady ? 'ready' : 'pending',
      emphasized: input.activeViewport === 'MOBILE',
      actions: experienceActions,
    });
  }

  // 3 — TABLET
  {
    const tabletActions: Gpt2ViewportFamilyAuthorityRailAction[] = [];
    if (!mobileConfirmed) {
      /* locked — no actions */
    } else if (tabletGenerating || input.generating) {
      /* generating — no primary until complete */
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
        !mobileConfirmed ? 'LOCKED'
        : tabletGenerating ? 'GENERATING'
        : tabletReady ? (family?.tabletVersion ?? 'READY')
        : 'PENDING',
      statusLabel:
        !mobileConfirmed ? 'LOCKED'
        : tabletGenerating ? 'GENERATING'
        : input.tabletInterpretationActive ? 'ACTIVE'
        : tabletReady ? 'READY'
        : 'PENDING',
      statusTone:
        !mobileConfirmed ? 'locked'
        : tabletGenerating ? 'generating'
        : input.tabletInterpretationActive ? 'active'
        : tabletReady ? 'ready'
        : 'pending',
      emphasized: input.activeViewport === 'TABLET',
      actions: tabletActions,
    });
  }

  // 4 — DESKTOP
  {
    const desktopActions: Gpt2ViewportFamilyAuthorityRailAction[] = [];
    if (!mobileConfirmed) {
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
        !mobileConfirmed ? 'LOCKED'
        : desktopGenerating ? 'GENERATING'
        : desktopReady ? (family?.desktopVersion ?? 'READY')
        : 'PENDING',
      statusLabel:
        !mobileConfirmed ? 'LOCKED'
        : desktopGenerating ? 'GENERATING'
        : input.desktopInterpretationActive ? 'ACTIVE'
        : desktopReady ? 'READY'
        : 'PENDING',
      statusTone:
        !mobileConfirmed ? 'locked'
        : desktopGenerating ? 'generating'
        : input.desktopInterpretationActive ? 'active'
        : desktopReady ? 'ready'
        : 'pending',
      emphasized: input.activeViewport === 'DESKTOP',
      actions: desktopActions,
    });
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
