import type { GlobalIconSemantic } from './iconTypes';

/** Global Studio OS semantics — meaning only, not client visuals. */
export const GLOBAL_ICON_SEMANTICS: GlobalIconSemantic[] = [
  { semantic_id: 'SEM_ADD', canonical_name: 'ADD', meaning: 'Add item or step', default_category: 'ACTION' },
  { semantic_id: 'SEM_REMOVE', canonical_name: 'REMOVE', meaning: 'Remove item', default_category: 'ACTION' },
  { semantic_id: 'SEM_EDIT', canonical_name: 'EDIT', meaning: 'Edit content', default_category: 'ACTION' },
  { semantic_id: 'SEM_SAVE', canonical_name: 'SAVE', meaning: 'Save progress', default_category: 'ACTION' },
  { semantic_id: 'SEM_UPLOAD', canonical_name: 'UPLOAD', meaning: 'Upload file', default_category: 'ACTION' },
  { semantic_id: 'SEM_DOWNLOAD', canonical_name: 'DOWNLOAD', meaning: 'Download file', default_category: 'ACTION' },
  { semantic_id: 'SEM_SHARE', canonical_name: 'SHARE', meaning: 'Share externally', default_category: 'SOCIAL_SHARE' },
  { semantic_id: 'SEM_SEARCH', canonical_name: 'SEARCH', meaning: 'Search content', default_category: 'ACTION' },
  { semantic_id: 'SEM_FILTER', canonical_name: 'FILTER', meaning: 'Filter list', default_category: 'ACTION' },
  { semantic_id: 'SEM_BACK', canonical_name: 'BACK', meaning: 'Navigate back', default_category: 'NAVIGATION' },
  { semantic_id: 'SEM_FORWARD', canonical_name: 'FORWARD', meaning: 'Navigate forward', default_category: 'NAVIGATION' },
  { semantic_id: 'SEM_EXPAND', canonical_name: 'EXPAND', meaning: 'Expand panel', default_category: 'NAVIGATION' },
  { semantic_id: 'SEM_COLLAPSE', canonical_name: 'COLLAPSE', meaning: 'Collapse panel', default_category: 'NAVIGATION' },
  { semantic_id: 'SEM_LOCK', canonical_name: 'LOCK', meaning: 'Locked state', default_category: 'AUTH_ACCOUNT' },
  { semantic_id: 'SEM_UNLOCK', canonical_name: 'UNLOCK', meaning: 'Unlocked state', default_category: 'AUTH_ACCOUNT' },
  { semantic_id: 'SEM_APPROVED', canonical_name: 'APPROVED', meaning: 'Approved status', default_category: 'STATUS' },
  { semantic_id: 'SEM_PENDING', canonical_name: 'PENDING', meaning: 'Pending status', default_category: 'STATUS' },
  { semantic_id: 'SEM_WARNING', canonical_name: 'WARNING', meaning: 'Warning alert', default_category: 'STATUS' },
  { semantic_id: 'SEM_ERROR', canonical_name: 'ERROR', meaning: 'Error state', default_category: 'STATUS' },
  { semantic_id: 'SEM_COMPLETE', canonical_name: 'COMPLETE', meaning: 'Complete step', default_category: 'STATUS' },
  { semantic_id: 'SEM_VERIFY', canonical_name: 'VERIFY', meaning: 'Verification action', default_category: 'VERIFICATION' },
  { semantic_id: 'SEM_REVIEW', canonical_name: 'REVIEW', meaning: 'Review content', default_category: 'ACTION' },
  { semantic_id: 'SEM_CONFIGURE', canonical_name: 'CONFIGURE', meaning: 'Configuration', default_category: 'CONFIGURATION' },
  { semantic_id: 'SEM_DIAGNOSE', canonical_name: 'DIAGNOSE', meaning: 'Diagnostic action', default_category: 'DIAGNOSTIC' },
  { semantic_id: 'SEM_REPAIR', canonical_name: 'REPAIR', meaning: 'Repair workflow', default_category: 'DIAGNOSTIC' },
  { semantic_id: 'SEM_INSTALL', canonical_name: 'INSTALL', meaning: 'Install capability', default_category: 'CAPABILITY' },
  { semantic_id: 'SEM_DEPLOY', canonical_name: 'DEPLOY', meaning: 'Deploy release', default_category: 'SYSTEM_UTILITY' },
  { semantic_id: 'SEM_RESET', canonical_name: 'RESET', meaning: 'Reset configuration', default_category: 'CONFIGURATION' },
  { semantic_id: 'SEM_PREVIEW', canonical_name: 'PREVIEW', meaning: 'Preview output', default_category: 'ACTION' },
  { semantic_id: 'SEM_CONFIRM', canonical_name: 'CONFIRM', meaning: 'Confirm action', default_category: 'ACTION' },
  { semantic_id: 'SEM_ROTATE', canonical_name: 'ROTATE', meaning: 'Rotate view', default_category: 'CONFIGURATION' },
  { semantic_id: 'SEM_SELECT', canonical_name: 'SELECT', meaning: 'Select option', default_category: 'ACTION' },
];

export function getGlobalSemantic(id: string): GlobalIconSemantic | undefined {
  return GLOBAL_ICON_SEMANTICS.find((s) => s.semantic_id === id);
}
