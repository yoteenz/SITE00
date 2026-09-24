/**
 * P0.VR.DESIGN-WORKSPACE-CONCEPT-GALLERY-AND-GENERATOR-ENTRY-FIX1 — canonical GPT2 viewport-family rail.
 */

import type { PageConceptPipelineSet } from './types.js';
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

export function buildGpt2ViewportFamilyAuthorityRail(input: {
  pipelineSet: PageConceptPipelineSet | null;
  selectedMobileConceptLabel: string | null;
  activeViewport?: 'MOBILE' | 'TABLET' | 'DESKTOP';
}): readonly Gpt2ViewportFamilyAuthorityRailRow[] {
  const activeViewport = input.activeViewport ?? 'MOBILE';
  const family = input.pipelineSet?.viewportAuthorityFamily ?? null;
  const status = family?.status ?? null;
  const mobileSelected = Boolean(family?.selectedMobileConceptId);
  const experienceApproved = Boolean(family?.experienceExpressionContractId);
  const tabletReady = Boolean(family?.tabletArtifactId);
  const desktopReady = Boolean(family?.desktopArtifactId);
  const familyApproved = status === 'APPROVED' || status === 'LOCKED';
  const familyLocked = status === 'LOCKED';

  const rows: Gpt2ViewportFamilyAuthorityRailRow[] = [
    {
      id: 'mobile-authority',
      label: 'MOBILE AUTHORITY',
      value: mobileSelected ? (input.selectedMobileConceptLabel ?? 'SELECTED') : 'NOT SELECTED',
      status: mobileSelected ? 'READY' : 'PENDING',
    },
    {
      id: 'experience',
      label: 'EXPERIENCE',
      value: experienceApproved ? 'APPROVED' : mobileSelected ? 'PENDING' : 'PENDING',
      status: experienceApproved ? 'APPROVED' : 'PENDING',
    },
    {
      id: 'tablet',
      label: 'TABLET INTERPRETATION',
      value: tabletReady ? (family?.tabletVersion ?? 'READY') : 'PENDING',
      status: tabletReady ? 'READY' : 'PENDING',
    },
    {
      id: 'desktop',
      label: 'DESKTOP INTERPRETATION',
      value: desktopReady ? (family?.desktopVersion ?? 'READY') : 'PENDING',
      status: desktopReady ? 'READY' : 'PENDING',
    },
    {
      id: 'viewport-family',
      label: 'VIEWPORT FAMILY',
      value: familyLocked ? 'LOCKED' : familyApproved ? 'APPROVED' : tabletReady && desktopReady ? 'READY' : 'PENDING',
      status: familyLocked ? 'LOCKED' : familyApproved ? 'APPROVED' : tabletReady && desktopReady ? 'READY' : 'PENDING',
    },
  ];
  if (activeViewport === 'TABLET') {
    return rows.filter((r) => r.id === 'tablet' || r.id === 'viewport-family');
  }
  if (activeViewport === 'DESKTOP') {
    return rows.filter((r) => r.id === 'desktop' || r.id === 'viewport-family');
  }
  return rows.filter((r) => r.id === 'mobile-authority' || r.id === 'experience' || r.id === 'viewport-family');
}

export function isCanonicalGpt2ViewportFamilyPipeline(pipelineSet: PageConceptPipelineSet | null): boolean {
  if (pageConceptCanonicalNbpDisabled()) return true;
  return pipelineSet?.pipelineLineage === 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE';
}

export function buildGpt2ViewportFamilyAuthorityRailActions(input: {
  pipelineSet: PageConceptPipelineSet | null;
  selectedMobileConceptId: string | null;
  selectedGalleryCandidateId: string | null;
  generating: boolean;
  activeViewport?: 'MOBILE' | 'TABLET' | 'DESKTOP';
}): readonly Gpt2ViewportFamilyAuthorityRailAction[] {
  const activeViewport = input.activeViewport ?? 'MOBILE';
  const family = input.pipelineSet?.viewportAuthorityFamily ?? null;
  const mobileSelected = Boolean(family?.selectedMobileConceptId);
  const experienceApproved = Boolean(family?.experienceExpressionContractId);
  const tabletReady = Boolean(family?.tabletArtifactId);
  const desktopReady = Boolean(family?.desktopArtifactId);
  const familyLocked = family?.status === 'LOCKED';

  const actions: Gpt2ViewportFamilyAuthorityRailAction[] = [];

  if (activeViewport === 'MOBILE') {
    if (!mobileSelected) {
      actions.push({
        id: 'vf-select-mobile',
        label: 'SELECT MOBILE CONCEPT',
        tone: 'lime',
        disabled: !input.selectedGalleryCandidateId || input.generating,
        disabledReason:
          !input.selectedGalleryCandidateId ? 'Select a concept in the gallery first.'
          : input.generating ? 'Generation in progress.'
          : null,
      });
    } else {
      actions.push({
        id: 'vf-confirm-mobile',
        label: 'CONFIRM MOBILE AUTHORITY',
        tone: 'lime',
        disabled: input.generating,
        disabledReason: input.generating ? 'Generation in progress.' : null,
      });
      actions.push({
        id: 'vf-change-mobile',
        label: 'CHANGE',
        tone: 'ghost',
        disabled: input.generating || familyLocked,
        disabledReason: familyLocked ? 'Viewport family locked.' : null,
        secondary: true,
      });
    }
    if (mobileSelected && !experienceApproved) {
      actions.push({
        id: 'vf-review-experience',
        label: 'REVIEW EXPERIENCE',
        tone: 'ink',
        disabled: input.generating,
        disabledReason: input.generating ? 'Generation in progress.' : null,
      });
    }
  }

  if (activeViewport === 'TABLET') {
    actions.push({
      id: tabletReady ? 'vf-regenerate-tablet' : 'vf-run-tablet',
      label: tabletReady ? 'REGENERATE TABLET' : 'GENERATE TABLET',
      tone: 'lime',
      disabled: !mobileSelected || input.generating,
      disabledReason: !mobileSelected ? 'Confirm mobile authority first.' : input.generating ? 'Busy.' : null,
    });
  }

  if (activeViewport === 'DESKTOP') {
    actions.push({
      id: desktopReady ? 'vf-regenerate-desktop' : 'vf-run-desktop',
      label: desktopReady ? 'REGENERATE DESKTOP' : 'GENERATE DESKTOP',
      tone: 'lime',
      disabled: !mobileSelected || input.generating,
      disabledReason: !mobileSelected ? 'Confirm mobile authority first.' : input.generating ? 'Busy.' : null,
    });
  }

  if (tabletReady && desktopReady && family?.status !== 'APPROVED' && family?.status !== 'LOCKED') {
    actions.push({
      id: 'vf-approve-family',
      label: 'APPROVE FAMILY',
      tone: 'lime',
      disabled: input.generating,
      disabledReason: input.generating ? 'Generation in progress.' : null,
    });
  } else if (mobileSelected && !tabletReady && activeViewport === 'MOBILE') {
    actions.push({
      id: 'vf-review-family',
      label: 'REVIEW FAMILY',
      tone: 'ghost',
      disabled: true,
      disabledReason: 'Complete tablet and desktop interpretations first.',
      secondary: true,
    });
  }

  if (family?.status === 'APPROVED' && !familyLocked) {
    actions.push({
      id: 'vf-lock-family',
      label: 'LOCK VIEWPORT FAMILY',
      tone: 'ink',
      disabled: input.generating,
      disabledReason: input.generating ? 'Generation in progress.' : null,
      lock: true,
    });
  }

  return actions;
}
