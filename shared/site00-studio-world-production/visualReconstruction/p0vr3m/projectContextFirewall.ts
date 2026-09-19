/**
 * P0.VR.8R1 — ProjectContextFirewall — block cross-project data unless explicitly global.
 */

export type ProjectScopedRecord = {
  projectId: string;
  global?: boolean;
};

export type ProjectContextFirewallResult = {
  allowed: boolean;
  reason: string | null;
  failureCode: 'PROJECT_CONTEXT_FIREWALL_BLOCKED' | null;
};

export function assertProjectContextScope(
  record: ProjectScopedRecord,
  activeDesignProjectId: string,
  options?: { allowGlobal?: boolean },
): ProjectContextFirewallResult {
  if (record.global && options?.allowGlobal) {
    return { allowed: true, reason: null, failureCode: null };
  }
  if (record.projectId === activeDesignProjectId) {
    return { allowed: true, reason: null, failureCode: null };
  }
  return {
    allowed: false,
    reason: `Record projectId "${record.projectId}" does not match active "${activeDesignProjectId}"`,
    failureCode: 'PROJECT_CONTEXT_FIREWALL_BLOCKED',
  };
}

export function filterRecordsForActiveProject<T extends ProjectScopedRecord>(
  records: T[],
  activeDesignProjectId: string,
  options?: { includeGlobal?: boolean },
): T[] {
  return records.filter((record) => {
    const result = assertProjectContextScope(record, activeDesignProjectId, {
      allowGlobal: options?.includeGlobal,
    });
    return result.allowed;
  });
}

export function blockIfProjectMismatch(
  recordProjectId: string,
  activeDesignProjectId: string,
): ProjectContextFirewallResult {
  return assertProjectContextScope({ projectId: recordProjectId }, activeDesignProjectId);
}
