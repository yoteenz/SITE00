import { buildR5F1AuthoritySelectionChangeSet, R5F1_AUTHORITY_SELECTION_CHANGE_SET_ID } from './r5f1ChangeSet.js';
import type { MasterAuthorityAmendment, MasterEvolutionMode } from './types.js';

export function buildR5F1MasterAuthorityAmendment(input?: {
  viewport?: 'MOBILE' | 'DESKTOP' | 'PAIR';
  evolutionMode?: MasterEvolutionMode;
}): MasterAuthorityAmendment {
  const changeSet = buildR5F1AuthoritySelectionChangeSet();
  return {
    id: 'maa-r5f1-authority-selection-v1',
    baseAuthorityId: null,
    baseAuthorityPairId: null,
    featureChangeSetId: R5F1_AUTHORITY_SELECTION_CHANGE_SET_ID,
    viewport: input?.viewport ?? 'PAIR',
    amendmentType: 'FEATURE_ADDITION',
    affectedFeatureIds: changeSet.addedFeatures,
    affectedRegions: changeSet.affectedAuthorityRegions,
    preservationZones: [
      'HOST_HEADER_PAGE_FRAME',
      'PRIMARY_WORKSPACE_PANEL',
      'PROJECT_ARTIFACT_HERO',
    ],
    mutableZones: ['AUTHORITY_GALLERY', 'AUTHORITY_PAIR_DOCK', 'DECISION_BAR_ACTION_BAND', 'PAIR_REVIEW'],
    visualChangeInstructions: [
      'Integrate SELECT FOR MOBILE / SELECT FOR DESKTOP near hero artifact review',
      'Show compact AUTHORITY PAIR dock with MOBILE MASTER + DESKTOP MASTER slots',
      'Expose PROMOTE and LOCK MOBILE + DESKTOP AUTHORITY PAIR as explicit founder actions',
      'Do not add separate admin dashboard for authority management',
    ],
    parentAuthorityHash: null,
    resultingAuthorityId: null,
    resultingAuthorityHash: null,
    status: 'APPROVED',
    version: 1,
    evolutionMode: input?.evolutionMode ?? 'MASTER_AMENDMENT',
  };
}
