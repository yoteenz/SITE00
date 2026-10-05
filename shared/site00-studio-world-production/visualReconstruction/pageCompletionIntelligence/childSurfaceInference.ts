/**
 * ChildSurfaceInferenceEngine — infer required child surfaces from interaction intent.
 */

import type {
  PageInteractionContract,
  PageInteractionTargetType,
  RequiredChildSurface,
  PageVisualInheritanceContract,
} from './types.js';
import { getModuleFunctionalContract } from '../../../site00-brand-lore/projectSkin/brandFamily/functionalContract.js';

export type ChildInferenceInput = {
  contract: PageInteractionContract;
  primaryRoute: string;
  projectId: string;
  moduleScreenType?: string;
  parentAuthorityId?: string | null;
  skinId?: string | null;
  existingRoutes?: string[];
};

function buildInheritance(input: ChildInferenceInput): PageVisualInheritanceContract {
  return {
    parentAuthorityId: input.parentAuthorityId ?? null,
    skinId: input.skinId ?? null,
    hostShellRules: ['INHERIT_SITE00_HOST_SHELL', 'NO_GENERIC_ADMIN_FALLBACK'],
    typographyRules: ['MARTIAN_MONO', 'UPPERCASE_LABELS'],
    colorRules: ['BRAND_ACCENT_RED', 'LIGHT_SURFACE'],
    surfaceRules: ['THIN_BORDER', 'OFF_WHITE_PANEL'],
    spacingRules: ['MATCH_PARENT_DENSITY'],
    componentRules: ['SITE00_BUTTON_LANGUAGE', 'FOUNDER_ACTION_CARDS'],
    allowedVariation: ['COMPOSITION_MAY_DIFFER_FOR_FUNCTION'],
    prohibitedFallbacks: ['GENERIC_ADMIN_UI', 'UNSTYLED_MODAL', 'RAW_PIPELINE_COPY'],
  };
}

const INTENT_TARGET_MAP: Record<string, { targetType: PageInteractionTargetType; suffix: string; label: string }> = {
  OPEN_ADD_AUTHORITY_WORKSPACE: { targetType: 'SHEET', suffix: '/authority/add', label: 'ADD AUTHORITY WORKSPACE' },
  OPEN_SCREEN_DETAIL: { targetType: 'CHILD_ROUTE', suffix: '/:screen', label: 'SCREEN DETAIL' },
  OPEN_COLLECTION_VIEW: { targetType: 'CHILD_ROUTE', suffix: '/collection', label: 'COLLECTION VIEW' },
  OPEN_DETAIL_VIEW: { targetType: 'CHILD_ROUTE', suffix: '/detail', label: 'DETAIL VIEW' },
  OPEN_MANAGEMENT_PANEL: { targetType: 'DRAWER', suffix: '/manage', label: 'MANAGEMENT PANEL' },
  OPEN_CROP_REVIEW: { targetType: 'SHEET', suffix: '/crop-review', label: 'CROP REVIEW' },
  OPEN_GENERATION_PLAN: { targetType: 'SHEET', suffix: '/generation-plan', label: 'GENERATION PLAN' },
  OPEN_UPLOAD_FLOW: { targetType: 'MODAL', suffix: '/upload', label: 'UPLOAD FLOW' },
  OPEN_EDIT_VIEW: { targetType: 'CHILD_ROUTE', suffix: '/edit', label: 'EDIT VIEW' },
  OPEN_COMPARE_VIEW: { targetType: 'MODAL', suffix: '/compare', label: 'COMPARE VIEW' },
  TRIGGER_IMPLEMENTATION: { targetType: 'SUBMIT_MUTATION', suffix: '', label: 'IMPLEMENT' },
  TOGGLE_FILTER_STATE: { targetType: 'FILTER_STATE', suffix: '', label: 'FILTER STATE' },
  TOGGLE_SORT_STATE: { targetType: 'SORT_STATE', suffix: '', label: 'SORT STATE' },
  OPEN_SEARCH: { targetType: 'POPOVER', suffix: '', label: 'SEARCH' },
  TAB_SWITCH: { targetType: 'TAB_STATE', suffix: '', label: 'TAB STATE' },
  TOGGLE_VIEWPORT: { targetType: 'TOGGLE_STATE', suffix: '', label: 'VIEWPORT TOGGLE' },
  PROJECT_SCOPE_SWITCH: { targetType: 'ROUTE', suffix: '', label: 'PROJECT SELECTOR' },
  RETURN: { targetType: 'ROUTE', suffix: '', label: 'RETURN PATH' },
  CONFIRM_DELETE: { targetType: 'MODAL', suffix: '/delete-confirm', label: 'DELETE CONFIRMATION' },
  SUBMIT_MUTATION: { targetType: 'SUBMIT_MUTATION', suffix: '', label: 'SUBMIT' },
  CANCEL_FLOW: { targetType: 'ROUTE', suffix: '', label: 'CANCEL' },
};

export function inferChildSurfaceFromContract(input: ChildInferenceInput): {
  contract: PageInteractionContract;
  childSurface: RequiredChildSurface | null;
  reusedExistingRoute: boolean;
} {
  const mapping = INTENT_TARGET_MAP[input.contract.intent];
  const inheritance = buildInheritance(input);

  if (!mapping) {
    return {
      contract: { ...input.contract, status: 'AMBIGUOUS', confidence: 'LOW' },
      childSurface: null,
      reusedExistingRoute: false,
    };
  }

  const proposedRoute =
    mapping.suffix && input.primaryRoute
      ? `${input.primaryRoute.replace(/\/$/, '')}${mapping.suffix}`
      : input.primaryRoute;

  const existing = input.existingRoutes?.find(
    (r) => r === proposedRoute || r.endsWith(mapping.suffix) || r.includes(mapping.suffix.replace(/^\//, '')),
  );

  const route = existing ?? proposedRoute;
  const reusedExistingRoute = Boolean(existing);

  const childSurfaceId = `child-${input.contract.interactionId}`;

  const updatedContract: PageInteractionContract = {
    ...input.contract,
    targetType: mapping.targetType,
    targetId: childSurfaceId,
    route,
    returnPath: input.primaryRoute,
    childSurfaceRequirement: mapping.label,
    status: reusedExistingRoute ? 'IMPLEMENTED' : mapping.targetType === 'TAB_STATE' ? 'IMPLEMENTED' : 'PLANNED',
    confidence: reusedExistingRoute ? 'HIGH' : 'HIGH',
    mobilePresentation: mapping.targetType === 'SHEET' ? 'SHEET' : 'FULL_ROUTE',
    desktopPresentation: mapping.targetType === 'DRAWER' ? 'PANEL' : mapping.targetType === 'MODAL' ? 'MODAL' : 'FULL_ROUTE',
  };

  const needsPhysicalChild = !['TAB_STATE', 'TOGGLE_STATE', 'FILTER_STATE', 'SORT_STATE', 'SUBMIT_MUTATION', 'NO_OP_INTENTIONAL'].includes(
    mapping.targetType,
  );

  const childSurface: RequiredChildSurface | null = needsPhysicalChild
    ? {
        childSurfaceId,
        label: mapping.label,
        targetType: mapping.targetType,
        route,
        parentInteractionId: input.contract.interactionId,
        inheritance,
        implementationStatus: reusedExistingRoute ? 'IMPLEMENTED' : 'PLANNED',
        hasAuthority: Boolean(input.parentAuthorityId),
      }
    : null;

  if (input.moduleScreenType) {
    getModuleFunctionalContract(input.moduleScreenType);
  }

  return { contract: updatedContract, childSurface, reusedExistingRoute };
}

export function inferChildSurfacesForContracts(
  contracts: PageInteractionContract[],
  ctx: Omit<ChildInferenceInput, 'contract'>,
): { contracts: PageInteractionContract[]; childSurfaces: RequiredChildSurface[] } {
  const childSurfaces: RequiredChildSurface[] = [];
  const updated: PageInteractionContract[] = [];

  for (const contract of contracts) {
    const result = inferChildSurfaceFromContract({ ...ctx, contract });
    updated.push(result.contract);
    if (result.childSurface) childSurfaces.push(result.childSurface);
  }

  return { contracts: updated, childSurfaces };
}
