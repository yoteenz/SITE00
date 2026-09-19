import type { ClientProjectCapability, ClientProjectRole } from './types.js';

export const SITE00_DEFAULT_ACCENT = '#E8192C';

export const CLIENT_VIEW_CAPABILITIES: ClientProjectCapability[] = [
  'CAN_VIEW_PROJECT',
  'CAN_VIEW_PROGRESS',
  'CAN_VIEW_CURRENT_MOMENT',
  'CAN_VIEW_REVIEWS',
  'CAN_VIEW_LIBRARY',
  'CAN_VIEW_ACTIVITY',
  'CAN_VIEW_MESSAGES',
];

export const CLIENT_OWNER_CAPABILITIES: ClientProjectCapability[] = [
  ...CLIENT_VIEW_CAPABILITIES,
  'CAN_COMMENT',
  'CAN_REVIEW',
  'CAN_APPROVE',
  'CAN_REQUEST_REVISION',
  'CAN_VIEW_VERSION_HISTORY',
  'CAN_DOWNLOAD_APPROVED',
];

export const CLIENT_COLLABORATOR_CAPABILITIES: ClientProjectCapability[] = [
  ...CLIENT_VIEW_CAPABILITIES,
  'CAN_COMMENT',
  'CAN_REVIEW',
  'CAN_REQUEST_REVISION',
  'CAN_VIEW_VERSION_HISTORY',
];

export const CLIENT_VIEWER_CAPABILITIES: ClientProjectCapability[] = [...CLIENT_VIEW_CAPABILITIES];

export const ADMIN_ONLY_CAPABILITIES: ClientProjectCapability[] = [
  'CAN_GENERATE',
  'CAN_REGENERATE',
  'CAN_CAPTURE',
  'CAN_MUTATE_CANON',
  'CAN_PROPAGATE',
  'CAN_PREPARE_SOURCE_CHANGE',
  'CAN_APPLY_SOURCE_CHANGE',
  'CAN_VIEW_INTERNAL_QA',
  'CAN_VIEW_PROVIDER_DATA',
  'CAN_VIEW_REPO_DATA',
  'CAN_VIEW_INTERNAL_NOTES',
];

export function capabilitiesForRole(role: ClientProjectRole): ClientProjectCapability[] {
  switch (role) {
    case 'CLIENT_OWNER':
      return CLIENT_OWNER_CAPABILITIES;
    case 'CLIENT_COLLABORATOR':
      return CLIENT_COLLABORATOR_CAPABILITIES;
    case 'CLIENT_VIEWER':
    default:
      return CLIENT_VIEWER_CAPABILITIES;
  }
}

export function clientHasCapability(
  permissions: ClientProjectCapability[],
  capability: ClientProjectCapability,
): boolean {
  return permissions.includes(capability);
}

export function stripAdminCapabilities(permissions: ClientProjectCapability[]): ClientProjectCapability[] {
  const adminSet = new Set(ADMIN_ONLY_CAPABILITIES);
  return permissions.filter((p) => !adminSet.has(p));
}
