/**
 * Purpose-gated interface visual slots — real content roles, not methodology codenames.
 */

export type InterfaceContentCategory =
  | 'VISUAL_ASSET'
  | 'UI_BEHAVIOR'
  | 'LAYOUT_BEHAVIOR'
  | 'MATERIAL_STYLE'
  | 'REFERENCE_INPUT'
  | 'DATA_CONTENT'
  | 'INTERACTION';

export type InterfaceSemanticRole =
  | 'CURRENT_PROJECT_VISUAL'
  | 'PROJECT_THUMBNAIL'
  | 'REVIEWABLE_ARTIFACT'
  | 'HISTORICAL_ARTIFACT_PREVIEW'
  | 'CLIENT_LOGO'
  | 'CLIENT_EXPRESSIVE_ARTWORK'
  | 'ENVIRONMENT_PLATE'
  | 'DECORATIVE_ARTWORK'
  | 'INFORMATION_VISUALIZATION'
  | 'SECONDARY_PROJECT_VISUAL'
  | 'WORK_HISTORY_PREVIEW'
  | 'PROJECT_IDENTITY_MARK';

export type GenerationPolicy =
  | 'NEVER_GENERATE'
  | 'EXISTING_ONLY'
  | 'PREFER_EXISTING'
  | 'GENERATE_IF_JUSTIFIED'
  | 'GENERATE_WHEN_EMPTY';

export type SlotResolutionStatus =
  | 'FOUND'
  | 'ELIGIBLE'
  | 'REVIEW_REQUIRED'
  | 'REJECTED'
  | 'MISSING'
  | 'NO_ASSET_REQUIRED';

export type InterfaceVisualSlot = {
  slotId: string;
  surfaceId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
  familyId: string;
  purpose: string;
  semanticRole: InterfaceSemanticRole;
  contentCategory: InterfaceContentCategory;
  contentSourcePreference: string[];
  generationPolicy: GenerationPolicy;
  required: boolean;
  projectScope: string | null;
  clientScope: string | null;
  responsiveBehavior: 'DESKTOP' | 'MOBILE' | 'BOTH';
  fallbackPolicy: 'EMPTY_STATE' | 'PLACEHOLDER_TEXT' | 'HIDE';
  visualImportance: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  interactionRelationship: string;
  /** Legacy methodology roles this slot replaces (if any). */
  replacesLegacyRoles?: string[];
};

export type ResolvedSlotMaterial = {
  slotId: string;
  status: SlotResolutionStatus;
  sourceType:
    | 'PROJECT_ARTIFACT'
    | 'APPROVED_PRODUCTION_ASSET'
    | 'CLIENT_ASSET'
    | 'VISUAL_DEVELOPMENT_ASSET'
    | 'HOST_CANON'
    | 'GENERATED'
    | 'EMPTY_STATE'
    | 'NONE';
  assetId: string | null;
  storagePath: string | null;
  publicUrl: string | null;
  projectSlug: string | null;
  eligibilityReason: string | null;
  rejectionReason: string | null;
  generationRequired: boolean;
  generationJustification: AssetGenerationJustification | null;
};

export type AssetGenerationJustification = {
  slotId: string;
  whyAssetNeeded: string;
  userValue: string;
  functionalOrExpressivePurpose: string;
  existingCandidatesChecked: number;
  whyExistingCandidatesInsufficient: string;
  generationType: 'EXPRESSIVE_ARTWORK' | 'PROJECT_SPECIMEN' | 'FUNCTIONAL_VISUAL' | 'NONE';
  brandOwner: 'SITE00' | 'CLIENT';
  hostOwner: boolean;
  intendedSurface: string;
  expectedReuse: string;
  approvalRequired: boolean;
};

export type InterfaceSlotResolutionSummary = {
  slotCount: number;
  found: number;
  eligible: number;
  reviewRequired: number;
  rejected: number;
  missing: number;
  generationRequired: number;
  estimatedFalCalls: number;
  estimatedCostUsd: number;
};

export type InterfaceSlotResolutionResult = {
  slots: InterfaceVisualSlot[];
  resolved: ResolvedSlotMaterial[];
  summary: InterfaceSlotResolutionSummary;
  obsoleteGeneratedAssets: ObsoleteAssetClassification[];
};

export type ObsoleteAssetClassification = {
  requirementId: string;
  storagePath: string | null;
  classification: 'NOT_SURFACE_APPROPRIATE' | 'METHODOLOGY_OBSOLETE' | 'NEGATIVE_STYLE_EVIDENCE';
  productionEligible: false;
  reusable: false;
  preserved: true;
};

/** Non-asset methodology terms — must never become FAL requirements. */
export const NON_ASSET_METHODOLOGY_ROLES = new Set([
  'DOSSIER_DEPTH_LAYER',
  'HOST_INTEGRATION_REFERENCE',
  'WORKBENCH_STRUCTURE',
  'DOSSIER_DEPTH',
]);

export const LEGACY_METHODOLOGY_ASSET_ROLES = [
  'HOST_ENVIRONMENT',
  'WORKBENCH_FOCAL_ARTIFACT',
  'DOSSIER_DEPTH_LAYER',
  'PROJECT_SPECIMEN_GRAPHIC',
  'HOST_INTEGRATION_REFERENCE',
] as const;

export function compileProjectsWorkspaceVisualSlots(projectSlug = 'ndxbook'): InterfaceVisualSlot[] {
  return [
    {
      slotId: 'current-project-visual',
      surfaceId: 'SITE00_PROJECTS_INDEX',
      familyId: 'ACTIVE_WORK',
      purpose: 'Dominant visual for the current active project work area',
      semanticRole: 'CURRENT_PROJECT_VISUAL',
      contentCategory: 'VISUAL_ASSET',
      contentSourcePreference: [
        'LIVE_PROJECT_ARTIFACT',
        'APPROVED_PRODUCTION_ASSET',
        'CLIENT_ARTWORK',
        'VISUAL_DEVELOPMENT_PROOF',
      ],
      generationPolicy: 'GENERATE_IF_JUSTIFIED',
      required: true,
      projectScope: projectSlug,
      clientScope: projectSlug,
      responsiveBehavior: 'BOTH',
      fallbackPolicy: 'EMPTY_STATE',
      visualImportance: 'PRIMARY',
      interactionRelationship: 'ACTIVE_PIECE_FOCAL',
      replacesLegacyRoles: ['WORKBENCH_FOCAL_ARTIFACT'],
    },
    {
      slotId: 'review-tray-artifacts',
      surfaceId: 'SITE00_PROJECTS_INDEX',
      familyId: 'REVIEW',
      purpose: 'Actual artifacts awaiting founder/client judgment',
      semanticRole: 'REVIEWABLE_ARTIFACT',
      contentCategory: 'DATA_CONTENT',
      contentSourcePreference: ['PENDING_REVIEW_ASSET', 'FOUNDER_JUDGMENT_ASSET'],
      generationPolicy: 'EXISTING_ONLY',
      required: false,
      projectScope: null,
      clientScope: null,
      responsiveBehavior: 'BOTH',
      fallbackPolicy: 'EMPTY_STATE',
      visualImportance: 'SECONDARY',
      interactionRelationship: 'REVIEW_TRAY',
      replacesLegacyRoles: ['DOSSIER_DEPTH_LAYER'],
    },
    {
      slotId: 'work-history-previews',
      surfaceId: 'SITE00_PROJECTS_INDEX',
      familyId: 'HISTORY',
      purpose: 'Real historical project evidence in work history',
      semanticRole: 'WORK_HISTORY_PREVIEW',
      contentCategory: 'DATA_CONTENT',
      contentSourcePreference: ['HISTORICAL_PRODUCTION_ASSET', 'ARCHIVED_PROJECT_ARTIFACT'],
      generationPolicy: 'EXISTING_ONLY',
      required: false,
      projectScope: null,
      clientScope: null,
      responsiveBehavior: 'BOTH',
      fallbackPolicy: 'EMPTY_STATE',
      visualImportance: 'TERTIARY',
      interactionRelationship: 'WORK_HISTORY',
    },
    {
      slotId: 'project-index-thumbnails',
      surfaceId: 'SITE00_PROJECTS_INDEX',
      familyId: 'INDEX',
      purpose: 'Project expression marks for index entries',
      semanticRole: 'PROJECT_THUMBNAIL',
      contentCategory: 'VISUAL_ASSET',
      contentSourcePreference: ['PROJECT_IDENTITY_ASSET', 'CLIENT_LOGO', 'APPROVED_THUMBNAIL'],
      generationPolicy: 'PREFER_EXISTING',
      required: false,
      projectScope: null,
      clientScope: null,
      responsiveBehavior: 'BOTH',
      fallbackPolicy: 'PLACEHOLDER_TEXT',
      visualImportance: 'SECONDARY',
      interactionRelationship: 'PROJECT_INDEX',
      replacesLegacyRoles: ['PROJECT_SPECIMEN_GRAPHIC'],
    },
    {
      slotId: 'host-environment-plate',
      surfaceId: 'SITE00_PROJECTS_INDEX',
      familyId: 'HOST',
      purpose: 'SITE 00 host environment from existing canon — not regenerated',
      semanticRole: 'ENVIRONMENT_PLATE',
      contentCategory: 'REFERENCE_INPUT',
      contentSourcePreference: ['EXISTING_HOST_CANON', 'HOST_REFERENCE_CAPTURE'],
      generationPolicy: 'NEVER_GENERATE',
      required: false,
      projectScope: null,
      clientScope: null,
      responsiveBehavior: 'DESKTOP',
      fallbackPolicy: 'HIDE',
      visualImportance: 'TERTIARY',
      interactionRelationship: 'HOST_SHELL',
      replacesLegacyRoles: ['HOST_ENVIRONMENT', 'HOST_INTEGRATION_REFERENCE'],
    },
  ];
}
