/**
 * B5.10 — Client-safe technical status translation.
 */

export function translateTechnicalStatusForClient(internal: string): string {
  const upper = internal.toUpperCase();
  if (upper.includes('TYPECHECK') && upper.includes('FAIL')) {
    return 'SITE UPDATE NEEDS TECHNICAL ATTENTION';
  }
  if (upper.includes('ENV VAR') || upper.includes('MISSING')) {
    return 'PRODUCTION SETUP IS INCOMPLETE';
  }
  if (upper.includes('BUILD') && upper.includes('FAIL')) {
    return 'UPDATE IN PROGRESS — TECHNICAL REVIEW REQUIRED';
  }
  if (upper.includes('SECURITY')) {
    return 'SECURITY REVIEW IN PROGRESS';
  }
  if (upper.includes('DEPLOY')) {
    return 'DEPLOYMENT STATUS BEING VERIFIED';
  }
  return internal.toUpperCase();
}

export function sanitizeTechnicalIntelligenceForClient<T extends { repositoryConnection?: { repositoryUrl?: string | null }; notes?: Array<{ internalOnly: boolean; clientVisible: boolean }> }>(
  payload: T,
): T {
  const copy = { ...payload };
  if (copy.repositoryConnection) {
    copy.repositoryConnection = {
      ...copy.repositoryConnection,
      repositoryUrl: null,
    };
  }
  if (copy.notes) {
    copy.notes = copy.notes.filter((n) => n.clientVisible && !n.internalOnly);
  }
  return copy;
}
