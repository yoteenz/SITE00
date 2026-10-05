/**
 * Canonical GPT2 hero rail — mobile authority + viewport base generation + viewport expressions (8 controls).
 */

import type { PageConceptGeneratedArtifact, PageConceptPipelineSet } from './types.js';
import { pageConceptCanonicalNbpDisabled } from './pageConceptCanonicalPipeline.js';
import {
  experienceArtifactReadyForReview,
  resolveExperienceExpressionStatus,
  resolveMobileAuthorityStatus,
  slotLabelFromConceptId,
} from './pageConceptViewportFamilyState.js';
import {
  isViewportExpressionApproved,
  resolveViewportBaseAuthorityStatus,
  viewportExpressionPackageExists,
} from './pageConceptViewportExpressionAuthority.js';

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
  /** Active viewport toggle — subtle emphasis only. */
  emphasized: boolean;
  actions: readonly Gpt2ViewportFamilyAuthorityRailAction[];
};

/** Permanent hero-rail workflow slots (Mobile×2 + Mobile exp×1 + Desktop×2 + Tablet×2 + Pair×1). */
export const CANONICAL_GPT2_HERO_RAIL_BUTTON_COUNT = 8;

export const OBSOLETE_GPT2_HERO_RAIL_ACTION_IDS = [
  'vf-change-mobile',
  'vf-create-experience',
  'vf-review-experience',
  'vf-approve-experience',
  'vf-review-tablet',
  'vf-regenerate-tablet',
  'vf-use-tablet',
  'vf-review-desktop',
  'vf-regenerate-desktop',
  'vf-use-desktop',
  'vf-review-family',
  'vf-approve-family',
  'vf-lock-family',
] as const;

export function countGpt2HeroRailActions(stages: readonly Gpt2ViewportFamilyHeroRailStage[]): number {
  return stages.reduce((n, stage) => n + stage.actions.length, 0);
}

export function listGpt2HeroRailActionIds(stages: readonly Gpt2ViewportFamilyHeroRailStage[]): string[] {
  return stages.flatMap((stage) => stage.actions.map((action) => action.id));
}

/** Downstream hero-rail controls that require explicit mobile authority confirmation (not selection alone). */
export const GPT2_HERO_RAIL_DOWNSTREAM_ACTION_IDS = [
  'vf-expression',
  'vf-run-desktop',
  'vf-desktop-expression',
  'vf-run-tablet',
  'vf-tablet-expression',
  'vf-pair-review',
] as const;

export type Gpt2HeroRailDownstreamActionId = (typeof GPT2_HERO_RAIL_DOWNSTREAM_ACTION_IDS)[number];

const CONFIRM_MOBILE_FIRST = 'CONFIRM MOBILE AUTHORITY FIRST';

export function findGpt2HeroRailAction(
  stages: readonly Gpt2ViewportFamilyHeroRailStage[],
  actionId: string,
): Gpt2ViewportFamilyAuthorityRailAction | undefined {
  for (const stage of stages) {
    const hit = stage.actions.find((a) => a.id === actionId);
    if (hit) return hit;
  }
  return undefined;
}

function jobRunning(jobs: readonly PageConceptGeneratedArtifact[], provider: 'GPT2_TABLET' | 'GPT2_DESKTOP'): boolean {
  return jobs.some((j) => j.provider === provider && j.status === 'RUNNING');
}

function action(
  partial: Gpt2ViewportFamilyAuthorityRailAction,
): Gpt2ViewportFamilyAuthorityRailAction {
  return partial;
}

/** @deprecated Prefer buildGpt2ViewportFamilyHeroRailStages — four stages, six canonical buttons. */
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
  const mobileConfirmed = mobileAuthority === 'CONFIRMED';
  const mobileSelectedNotConfirmed = mobileAuthority === 'SELECTED';
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
  const viewportBaseUnlocked = mobileConfirmed && experienceApproved;
  const desktopBaseReady = resolveViewportBaseAuthorityStatus(family, 'DESKTOP') === 'READY';
  const tabletBaseReady = resolveViewportBaseAuthorityStatus(family, 'TABLET') === 'READY';
  const desktopExpressionExists = viewportExpressionPackageExists(input.pipelineSet, 'DESKTOP');
  const tabletExpressionExists = viewportExpressionPackageExists(input.pipelineSet, 'TABLET');
  const desktopExpressionApproved = isViewportExpressionApproved(input.pipelineSet, 'DESKTOP');
  const tabletExpressionApproved = isViewportExpressionApproved(input.pipelineSet, 'TABLET');

  const hasExperiencePackage = !experienceNotStarted;
  const viewportFamilyConfirmed = familyLocked || familyApproved;

  const stages: Gpt2ViewportFamilyHeroRailStage[] = [];

  // 1 — MOBILE AUTHORITY (two canonical controls)
  {
    const selectDisabled = mobileConfirmed || !input.selectedGalleryCandidateId || input.generating;
    const selectDisabledReason =
      mobileConfirmed ? 'Mobile authority confirmed.'
      : !input.selectedGalleryCandidateId ? 'Select a concept in the gallery first.'
      : input.generating ? 'Generation in progress.'
      : null;

    const confirmDisabled = !mobileSelectedNotConfirmed || mobileConfirmed || input.generating;
    const confirmDisabledReason =
      mobileConfirmed ? 'Mobile authority confirmed.'
      : !mobileSelectedNotConfirmed ? 'Select a mobile concept first.'
      : input.generating ? 'Generation in progress.'
      : null;

    const selectLabel =
      mobileSelectedNotConfirmed ? 'SELECTED MOBILE ✓'
      : 'SELECT MOBILE CONCEPT';

    stages.push({
      id: 'mobile-authority',
      label: mobileConfirmed ? 'MOBILE AUTHORITY ✓ CONFIRMED' : 'MOBILE AUTHORITY',
      valueLine:
        mobileConfirmed && mobileSlotLabel ?
          `${mobileSlotLabel} · AUTHORITY LOCKED`
        : mobileSelectedNotConfirmed && mobileSlotLabel ?
          `${mobileSlotLabel} · SELECTED · NOT CONFIRMED`
        : 'NOT SELECTED',
      statusLabel:
        mobileConfirmed ? 'CONFIRMED'
        : mobileSelectedNotConfirmed ? 'SELECTED · NOT CONFIRMED'
        : 'NOT SELECTED',
      statusTone: mobileConfirmed ? 'approved' : mobileSelected ? 'active' : 'pending',
      emphasized: input.activeViewport === 'MOBILE',
      actions: [
        action({
          id: 'vf-select-mobile',
          label: selectLabel,
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
      ],
    });
  }

  // 2 — EXPERIENCE (single mutating control)
  {
    const expressionEnabled =
      mobileConfirmed && (!input.generating || experienceGenerating || hasExperiencePackage);
    const expressionDisabledReason =
      !mobileConfirmed ? CONFIRM_MOBILE_FIRST
      : input.generating && !experienceGenerating && !hasExperiencePackage ? 'Generation in progress.'
      : null;

    stages.push({
      id: 'experience',
      label: 'MOBILE EXPERIENCE',
      valueLine:
        !mobileConfirmed ? 'LOCKED'
        : experienceApproved ? 'APPROVED'
        : experienceGenerating ? 'GENERATING'
        : experiencePartial ? 'PARTIAL'
        : experienceReady ? 'READY FOR REVIEW'
        : 'NOT CREATED',
      statusLabel:
        !mobileConfirmed ? 'LOCKED'
        : experienceApproved ? 'APPROVED'
        : experienceGenerating ? 'GENERATING'
        : experiencePartial ? 'PARTIAL'
        : experienceReady ? 'READY FOR REVIEW'
        : 'NOT CREATED',
      statusTone:
        !mobileConfirmed ? 'locked'
        : experienceApproved ? 'approved'
        : experienceGenerating ? 'generating'
        : experiencePartial ? 'ready'
        : experienceReady ? 'ready'
        : 'pending',
      emphasized: input.activeViewport === 'MOBILE',
      actions: [
        action({
          id: 'vf-expression',
          label: hasExperiencePackage ? 'VIEW EXPRESSION' : 'CREATE EXPRESSION',
          tone: hasExperiencePackage ? 'ink' : 'lime',
          disabled: !expressionEnabled,
          disabledReason: expressionDisabledReason,
        }),
      ],
    });
  }

  // 3 — DESKTOP (base screen + expressions)
  {
    const blocked =
      !mobileConfirmed ? CONFIRM_MOBILE_FIRST
      : !experienceApproved ? 'Approve mobile experience package first.'
      : input.generating ? 'Generation in progress.'
      : null;

    const generateDesktopEnabled =
      viewportBaseUnlocked && !desktopReady && !desktopGenerating && !input.generating;
    const desktopExpressionEnabled =
      mobileConfirmed &&
      experienceApproved &&
      desktopBaseReady &&
      (!input.generating || desktopExpressionExists);

    stages.push({
      id: 'desktop',
      label: 'DESKTOP',
      valueLine:
        !mobileConfirmed || !experienceApproved ? 'DERIVED · NOT GENERATED'
        : desktopGenerating ? 'GENERATING BASE SCREEN'
        : desktopBaseReady ? '✓ BASE READY'
        : 'DERIVED · NOT GENERATED',
      statusLabel:
        !mobileConfirmed || !experienceApproved ? 'LOCKED'
        : desktopBaseReady ? 'READY'
        : desktopGenerating ? 'GENERATING'
        : 'PENDING',
      statusTone:
        !mobileConfirmed || !experienceApproved ? 'locked'
        : desktopBaseReady ? 'ready'
        : desktopGenerating ? 'generating'
        : 'pending',
      emphasized: input.activeViewport === 'DESKTOP',
      actions: [
        action({
          id: 'vf-run-desktop',
          label: desktopReady ? 'VIEW DESKTOP' : 'GENERATE DESKTOP',
          tone: 'lime',
          disabled: desktopReady ? false : !generateDesktopEnabled,
          disabledReason:
            desktopReady ? null
            : generateDesktopEnabled ? null
            : blocked ?? (desktopGenerating ? 'Desktop base screen generating.' : 'Not available yet.'),
        }),
        action({
          id: 'vf-desktop-expression',
          label: desktopExpressionExists ? 'VIEW DESKTOP EXPRESSION' : 'CREATE DESKTOP EXPRESSION',
          tone: 'ink',
          disabled: !desktopExpressionEnabled || (!desktopBaseReady && !desktopExpressionExists),
          disabledReason:
            !mobileConfirmed ? CONFIRM_MOBILE_FIRST
            : !experienceApproved ? 'Approve mobile experience package first.'
            : !desktopBaseReady ? 'Generate desktop base screen first.'
            : input.generating && !desktopExpressionExists ? 'Generation in progress.'
            : null,
        }),
      ],
    });
  }

  // 4 — TABLET (base screen + expressions)
  {
    const blocked =
      !mobileConfirmed ? CONFIRM_MOBILE_FIRST
      : !experienceApproved ? 'Approve mobile experience package first.'
      : input.generating ? 'Generation in progress.'
      : null;

    const generateTabletEnabled =
      viewportBaseUnlocked && !tabletReady && !tabletGenerating && !input.generating;
    const tabletExpressionEnabled =
      mobileConfirmed &&
      experienceApproved &&
      tabletBaseReady &&
      (!input.generating || tabletExpressionExists);

    stages.push({
      id: 'tablet',
      label: 'TABLET',
      valueLine:
        !mobileConfirmed || !experienceApproved ? 'DERIVED · NOT GENERATED'
        : tabletGenerating ? 'GENERATING BASE SCREEN'
        : tabletBaseReady ? '✓ BASE READY'
        : 'DERIVED · NOT GENERATED',
      statusLabel:
        !mobileConfirmed || !experienceApproved ? 'LOCKED'
        : tabletBaseReady ? 'READY'
        : tabletGenerating ? 'GENERATING'
        : 'PENDING',
      statusTone:
        !mobileConfirmed || !experienceApproved ? 'locked'
        : tabletBaseReady ? 'ready'
        : tabletGenerating ? 'generating'
        : 'pending',
      emphasized: input.activeViewport === 'TABLET',
      actions: [
        action({
          id: 'vf-run-tablet',
          label: tabletReady ? 'VIEW TABLET' : 'GENERATE TABLET',
          tone: 'lime',
          disabled: tabletReady ? false : !generateTabletEnabled,
          disabledReason:
            tabletReady ? null
            : generateTabletEnabled ? null
            : blocked ?? (tabletGenerating ? 'Tablet base screen generating.' : 'Not available yet.'),
        }),
        action({
          id: 'vf-tablet-expression',
          label: tabletExpressionExists ? 'VIEW TABLET EXPRESSION' : 'CREATE TABLET EXPRESSION',
          tone: 'ink',
          disabled: !tabletExpressionEnabled || (!tabletBaseReady && !tabletExpressionExists),
          disabledReason:
            !mobileConfirmed ? CONFIRM_MOBILE_FIRST
            : !experienceApproved ? 'Approve mobile experience package first.'
            : !tabletBaseReady ? 'Generate tablet base screen first.'
            : input.generating && !tabletExpressionExists ? 'Generation in progress.'
            : null,
        }),
      ],
    });
  }

  // 5 — PAIR (final rail control)
  {
    const pairReviewReady =
      mobileConfirmed &&
      experienceApproved &&
      desktopReady &&
      tabletReady &&
      desktopExpressionApproved &&
      tabletExpressionApproved &&
      !viewportFamilyConfirmed;
    const pairReviewEnabled = pairReviewReady && !input.generating;

    stages.push({
      id: 'pair',
      label: 'PAIR',
      valueLine:
        viewportFamilyConfirmed ? 'VIEWPORT FAMILY CONFIRMED'
        : pairReviewReady ? 'READY FOR PAIR REVIEW'
        : 'PENDING INPUTS',
      statusLabel:
        viewportFamilyConfirmed ? 'CONFIRMED'
        : pairReviewReady ? 'READY'
        : 'PENDING',
      statusTone:
        viewportFamilyConfirmed ? 'approved'
        : pairReviewReady ? 'ready'
        : 'pending',
      emphasized: true,
      actions: [
        action({
          id: 'vf-pair-review',
          label: 'PAIR REVIEW',
          tone: 'ghost',
          disabled: !pairReviewEnabled && !viewportFamilyConfirmed,
          disabledReason:
            viewportFamilyConfirmed ? 'Viewport family confirmed.'
            : pairReviewEnabled ? null
            : !mobileConfirmed ? CONFIRM_MOBILE_FIRST
            : !experienceApproved ? 'Approve experience package first.'
            : !desktopReady ? 'Generate desktop base screen first.'
            : !tabletReady ? 'Generate tablet base screen first.'
            : !desktopExpressionApproved ? 'Approve desktop expression package first.'
            : !tabletExpressionApproved ? 'Approve tablet expression package first.'
            : input.generating ? 'Generation in progress.'
            : 'Complete required workflow steps first.',
        }),
      ],
    });
  }

  return stages;
}

export function isCanonicalGpt2ViewportFamilyPipeline(pipelineSet: PageConceptPipelineSet | null): boolean {
  if (pageConceptCanonicalNbpDisabled()) return true;
  return pipelineSet?.pipelineLineage === 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE';
}
