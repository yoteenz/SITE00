/**
 * B5.7 — Client-side project state version + invalidation.
 */

type Listener = () => void;

let projectStateVersion = 0;
const listeners = new Set<Listener>();

export function getProjectStateVersion(): number {
  return projectStateVersion;
}

export function bumpProjectStateVersion(): number {
  projectStateVersion += 1;
  listeners.forEach((l) => l());
  return projectStateVersion;
}

export function subscribeProjectStateVersion(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const ProjectModuleSyncService = {
  getVersion: getProjectStateVersion,
  bump: bumpProjectStateVersion,
  subscribe: subscribeProjectStateVersion,
};
