/** Shared OAuth state memory store for tests + memory mode */

export const memOAuthStates = new Map<string, Record<string, unknown>>();

export function resetOAuthStateStore(): void {
  memOAuthStates.clear();
}

export function consumeOAuthStateRecord(stateToken: string): void {
  const row = memOAuthStates.get(stateToken);
  if (row) row.consumed_at = new Date().toISOString();
}
