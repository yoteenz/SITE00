/**
 * B5.9R1 — Client-safe status translation (internal → client-facing).
 */

const CLIENT_STATUS_MAP: Record<string, string> = {
  SEQUENCE_UPDATED_ELSEWHERE: 'THIS ITEM WAS UPDATED — REFRESH TO SEE THE LATEST VERSION',
  DEPLOYMENT_PROVIDER_FAILURE: 'DEPLOYMENT NEEDS ATTENTION',
  INTERNAL_QA_BLOCKED: 'REVIEW IN PROGRESS',
  PROVIDER_SPEND_EXCEEDED: 'SERVICE LIMIT REACHED — CONTACT SUPPORT',
  STALE_PROJECT_CONTENT: 'CONTENT IS BEING REFRESHED',
  CROSS_TAB_STATE_MISMATCH: 'PLEASE REFRESH THIS PAGE',
  FOUNDER_NOTES_PRESENT: 'UPDATES AVAILABLE',
};

export function translateStatusForClient(internalStatus: string): string {
  const normalized = internalStatus.trim().toUpperCase().replace(/\s+/g, '_');
  return CLIENT_STATUS_MAP[normalized] ?? internalStatus.toUpperCase();
}

export function isInternalOnlyStatus(status: string): boolean {
  const internal = [
    'PROVIDER_SPEND',
    'INTERNAL_QA',
    'FOUNDER_NOTES',
    'STUDIO_WORLD',
    'HIDDEN_PROMPT',
    'SYSTEM_INSPECTOR',
  ];
  const upper = status.toUpperCase();
  return internal.some((token) => upper.includes(token));
}

export function filterClientSafeStatuses(statuses: string[]): string[] {
  return statuses
    .filter((s) => !isInternalOnlyStatus(s))
    .map((s) => translateStatusForClient(s));
}
