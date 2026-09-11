/**
 * P0.VR.UPGRADE.1 — Reconstruction plan derived from visual diagnosis (not a proposed render).
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { PageVisualDiagnosis, VisualDiagnosisDimension } from './pageVisualDiagnosis.js';

export type ReconstructionPlanChange = {
  id: string;
  label: string;
  sourceDimension: VisualDiagnosisDimension;
  category:
    | 'geometry'
    | 'typography'
    | 'component'
    | 'asset'
    | 'spacing'
    | 'interaction'
    | 'responsive';
};

export type ReconstructionPlan = {
  planId: string;
  pageId: string;
  pagePurpose: string;
  viewport: DesignViewportClass;
  authorityVersionId: string | null;
  captureId: string;
  goal: string;
  geometryChanges: ReconstructionPlanChange[];
  typographyChanges: ReconstructionPlanChange[];
  componentChanges: ReconstructionPlanChange[];
  assetChanges: ReconstructionPlanChange[];
  spacingChanges: ReconstructionPlanChange[];
  interactionPreservation: string[];
  responsiveChanges: ReconstructionPlanChange[];
  functionPreservation: string[];
  rootPreservation: string[];
  risks: string[];
  status: 'DRAFT' | 'APPROVED';
};

const ROOT_PRESERVATION = [
  'Root navigation',
  'Project switching',
  'Founder / client mode',
  'Project status surfaces',
  'Entry and campaign links',
  'Live data bindings',
] as const;

const FUNCTION_PRESERVATION = [
  'Routing',
  'Auth',
  'Permissions',
  'Forms',
  'Data fetching',
  'Business logic',
  'State',
  'Actions',
  'Links',
  'Navigation behavior',
] as const;

function planChange(
  id: string,
  label: string,
  dimension: VisualDiagnosisDimension,
  category: ReconstructionPlanChange['category'],
): ReconstructionPlanChange {
  return { id, label, sourceDimension: dimension, category };
}

export function buildReconstructionPlan(input: {
  pageId: string;
  viewport: DesignViewportClass;
  authorityVersionId: string | null;
  captureId: string;
  route: string;
  pagePurpose: string;
  isRootPage?: boolean;
  diagnosis: PageVisualDiagnosis;
}): ReconstructionPlan {
  const isRoot = input.isRootPage ?? false;
  const goal = isRoot
    ? `Match the approved ${input.pagePurpose} design while preserving live function.`
    : `Move ${input.route} toward approved design authority without breaking page function.`;

  const geometryChanges: ReconstructionPlanChange[] = [];
  const typographyChanges: ReconstructionPlanChange[] = [];
  const componentChanges: ReconstructionPlanChange[] = [];
  const assetChanges: ReconstructionPlanChange[] = [];
  const spacingChanges: ReconstructionPlanChange[] = [];
  const responsiveChanges: ReconstructionPlanChange[] = [];

  for (const f of input.diagnosis.findings) {
    const change = planChange(
      `plan-${f.dimension.toLowerCase()}`,
      f.label,
      f.dimension,
      f.dimension === 'TYPOGRAPHY'
        ? 'typography'
        : f.dimension === 'SPACING' || f.dimension === 'CONTENT_DENSITY'
          ? 'spacing'
          : f.dimension === 'ASSET_PLACEMENT'
            ? 'asset'
            : f.dimension === 'RESPONSIVE_COMPOSITION'
              ? 'responsive'
              : f.dimension === 'NAVIGATION' || f.dimension === 'CONTROLS'
                ? 'component'
                : 'geometry',
    );
    if (change.category === 'geometry') geometryChanges.push(change);
    else if (change.category === 'typography') typographyChanges.push(change);
    else if (change.category === 'asset') assetChanges.push(change);
    else if (change.category === 'spacing') spacingChanges.push(change);
    else if (change.category === 'responsive') responsiveChanges.push(change);
    else componentChanges.push(change);
  }

  return {
    planId: `plan_${input.pageId.replace(/[:/]/g, '_')}_${input.viewport}`,
    pageId: input.pageId,
    pagePurpose: input.pagePurpose,
    viewport: input.viewport,
    authorityVersionId: input.authorityVersionId,
    captureId: input.captureId,
    goal,
    geometryChanges,
    typographyChanges,
    componentChanges,
    assetChanges,
    spacingChanges,
    interactionPreservation: ['Preserve tap targets', 'Preserve nav behavior', 'Preserve form submit flows'],
    responsiveChanges,
    functionPreservation: [...FUNCTION_PRESERVATION],
    rootPreservation: isRoot ? [...ROOT_PRESERVATION] : [],
    risks: ['Authority asset may require reconstruction before full visual match'],
    status: 'DRAFT',
  };
}
