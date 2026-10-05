import { DESIGN_WORKSPACE_FEATURE_MANIFEST_V1_ID } from './designWorkspaceFeatureManifestV1.js';
import type { WorkspaceFeatureChangeSet } from './types.js';

export const R5F1_AUTHORITY_SELECTION_CHANGE_SET_ID = 'wcs-r5f1-authority-selection-v1' as const;

export const R5F1_ADDED_FEATURE_IDS = [
  'select_mobile_master_candidate',
  'select_desktop_master_candidate',
  'promote_mobile_viewport_master',
  'promote_desktop_viewport_master',
  'authority_pair_status',
  'replace_viewport_master',
  'review_authority_pair',
  'lock_authority_pair',
  'feature_change_history',
  'master_amendment_status',
] as const;

export function buildR5F1AuthoritySelectionChangeSet(now = new Date().toISOString()): WorkspaceFeatureChangeSet {
  return {
    id: R5F1_AUTHORITY_SELECTION_CHANGE_SET_ID,
    workspaceType: 'DESIGN_PAGE_V3',
    baseManifestVersion: 'design-workspace-v3-r4-implicit',
    resultingManifestVersion: DESIGN_WORKSPACE_FEATURE_MANIFEST_V1_ID,
    changeType: 'ADD_FEATURE',
    affectedFeatureIds: [...R5F1_ADDED_FEATURE_IDS],
    addedFeatures: [...R5F1_ADDED_FEATURE_IDS],
    modifiedFeatures: [],
    removedFeatures: [],
    replacementPairs: [],
    founderIntent: 'Formalize R5 viewport master selection + pair lock in visual authority',
    reason: 'R4 authorities predate R5 feature contract; master amendment required',
    affectedAuthorityRegions: ['AUTHORITY_GALLERY', 'AUTHORITY_PAIR_DOCK', 'PAIR_REVIEW', 'PRIMARY_WORKSPACE'],
    preservationRequirements: [
      'Preserve R4 spatial composition and host/project firewall',
      'Change only regions required for authority-selection workflow',
    ],
    requiresMasterAmendment: true,
    approvedBy: 'founder',
    approvedAt: now,
    status: 'APPLIED',
  };
}
