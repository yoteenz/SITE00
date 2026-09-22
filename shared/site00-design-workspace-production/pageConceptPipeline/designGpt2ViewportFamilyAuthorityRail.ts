/**
 * P0.VR.DESIGN-WORKSPACE-CONCEPT-GALLERY-AND-GENERATOR-ENTRY-FIX1 — canonical GPT2 viewport-family rail.
 */

import type { PageConceptPipelineSet } from './types.js';

export type Gpt2ViewportFamilyAuthorityRailRow = {
  id: string;
  label: string;
  value: string;
  status: 'PENDING' | 'READY' | 'APPROVED' | 'LOCKED';
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
  return pipelineSet?.pipelineLineage === 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE';
}
