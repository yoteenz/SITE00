import type { GenerationClass, GenerationIntent, GenerationMode } from '../site00-production-guardrails/types.js';

/** Conceptual roles mapped to repo `GenerationClass` values. */
export type JurnlGenerationRole =
  | 'FULL_PAGE_AUTHORITY'
  | 'ENVIRONMENT_PLATE_DERIVATION'
  | 'SIDEKICK_ASSET'
  | 'SCREEN_CHILD'
  | 'SCREEN_GRANDCHILD'
  | 'STATE_AUTHORITY'
  | 'INTERACTION_AUTHORITY'
  | 'CONCEPT_EXPLORATION';

export function jurnlRoleToGenerationClass(role: JurnlGenerationRole): GenerationClass {
  switch (role) {
    case 'FULL_PAGE_AUTHORITY':
      return 'SCREEN_PARENT';
    case 'ENVIRONMENT_PLATE_DERIVATION':
      return 'ENVIRONMENT_PLATE';
    case 'SIDEKICK_ASSET':
      return 'SIDEKICK_DERIVED';
    case 'SCREEN_CHILD':
      return 'SCREEN_CHILD';
    case 'SCREEN_GRANDCHILD':
      return 'SCREEN_GRANDCHILD';
    case 'STATE_AUTHORITY':
      return 'STATE_AUTHORITY';
    case 'INTERACTION_AUTHORITY':
      return 'INTERACTION_AUTHORITY';
    case 'CONCEPT_EXPLORATION':
      return 'ENVIRONMENT_PLATE';
    default:
      return 'SCREEN_PARENT';
  }
}

export type JurnlUiOccupancyContract = {
  primary_ui_zone: string;
  secondary_ui_zone: string;
  environment_focal_zone: string;
  protected_negative_space: string;
  occlusion_allowed_zone: string;
  drawer_overlay_zone: string;
  text_density_zone: string;
  screen_exposure_class?: 'ENVIRONMENT_DEPENDENT' | 'ENVIRONMENT_SUPPORTIVE' | 'ENVIRONMENT_MOSTLY_OCCLUDED' | 'ENVIRONMENT_MINIMAL';
};

export type JurnlProductionDispatchInput = {
  requestId: string;
  familyId: string;
  visualId: string;
  screenId?: string | null;
  assetId?: string | null;
  role: JurnlGenerationRole;
  generationIntent: GenerationIntent;
  generationMode: GenerationMode;
  provider?: string;
  model?: string;
  referenceAuthorityIdHint?: string | null;
  /** Resolved absolute path — gateway verifies health; sets referenceInputAttached. */
  referenceAbsolutePath?: string | null;
  derivationSourceType?: 'FULL_PAGE' | null;
  spendAuthorizationId: string;
  requestedBy: string;
  purpose?: string;
  estimatedCostCredits?: number | null;
  lineageParent?: string | null;
  sourceAuthorityId?: string | null;
  plateAuthorityId?: string | null;
  /** When true (default), blocks families with distinctness FAIL for canonical parent work. */
  canonicalFinal?: boolean;
  dryRun?: boolean;
  retryCount?: number;
  repairCount?: number;
  repairReason?: string | null;
  idempotencyKey?: string | null;
};

export type JurnlDispatchTicket = {
  mode: 'DRY_RUN' | 'MANUAL_OPENART_REQUIRED';
  openArtProjectId: string;
  openArtProjectName: string;
  repoFolder: string;
  referencePath: string | null;
  referenceAuthorityId: string | null;
  precheckPass: true;
};

export type JurnlLineageRecord = {
  requestId: string;
  receiptId: string | null;
  projectId: 'JURNL';
  familyId: string;
  visualId: string;
  screenId: string | null;
  assetId: string | null;
  generationClass: GenerationClass;
  role: JurnlGenerationRole;
  parentAuthorityId: string | null;
  referenceAuthorityId: string | null;
  plateAuthorityId: string | null;
  environmentPlateOrigin?: 'DERIVED_FROM_AUTHORITY' | 'CONCEPT_EXPLORATION';
  provider: string;
  model: string;
  generationMode: GenerationMode;
  outputPath: string | null;
  outputAssetId: string | null;
  status: 'READY_FOR_FOUNDER_REVIEW' | 'BLOCKED' | 'DRY_RUN' | 'ORPHANED_OUTPUT' | 'LATE_RESULT';
  createdAt: string;
  costReceiptId: string | null;
  spendAuthorizationId: string | null;
};
