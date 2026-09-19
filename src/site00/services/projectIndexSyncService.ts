/**
 * B5.9R2 — Project index sync + state version.
 */

type IndexListener = () => void;

let projectIndexStateVersion = 1;
const listeners = new Set<IndexListener>();

export function getProjectIndexStateVersion(): number {
  return projectIndexStateVersion;
}

export function bumpProjectIndexStateVersion(): number {
  projectIndexStateVersion += 1;
  for (const listener of listeners) listener();
  return projectIndexStateVersion;
}

export function subscribeProjectIndexState(listener: IndexListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const ProjectIndexSyncService = {
  getVersion: getProjectIndexStateVersion,
  bump: bumpProjectIndexStateVersion,
  subscribe: subscribeProjectIndexState,
};
