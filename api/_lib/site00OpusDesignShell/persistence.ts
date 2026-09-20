import type {
  ComposerShellImplementationPackage,
  OpusDesignShellPackage,
  OpusDesignShellResult,
  OpusShellEventRecord,
  OpusShellRevision,
} from '../../../shared/site00-opus-design-shell/types.js';

const packages = new Map<string, OpusDesignShellPackage>();
const results = new Map<string, OpusDesignShellResult>();
const revisions = new Map<string, OpusShellRevision>();
const handoffs = new Map<string, ComposerShellImplementationPackage>();
const events: OpusShellEventRecord[] = [];

export function savePackage(pkg: OpusDesignShellPackage): void {
  packages.set(pkg.packageId, pkg);
}

export function getPackage(packageId: string): OpusDesignShellPackage | null {
  return packages.get(packageId) ?? null;
}

export function saveResult(result: OpusDesignShellResult): void {
  results.set(result.shellResultId, result);
}

export function getResult(shellResultId: string): OpusDesignShellResult | null {
  return results.get(shellResultId) ?? null;
}

export function latestResultForPackage(packageId: string): OpusDesignShellResult | null {
  let latest: OpusDesignShellResult | null = null;
  for (const result of results.values()) {
    if (result.packageId !== packageId) continue;
    if (!latest || result.createdAt > latest.createdAt) latest = result;
  }
  return latest;
}

export function saveRevision(revision: OpusShellRevision): void {
  revisions.set(revision.revisionId, revision);
}

export function listRevisionsForResult(shellResultId: string): OpusShellRevision[] {
  return [...revisions.values()]
    .filter((r) => r.shellResultId === shellResultId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function saveHandoff(pkg: ComposerShellImplementationPackage): void {
  handoffs.set(pkg.packageId, pkg);
}

export function getHandoff(packageId: string): ComposerShellImplementationPackage | null {
  return handoffs.get(packageId) ?? null;
}

export function appendEvent(event: OpusShellEventRecord): void {
  events.push(event);
}

export function listEvents(packageId?: string): OpusShellEventRecord[] {
  if (!packageId) return [...events];
  return events.filter((e) => e.packageId === packageId);
}

/** Test / QA reset */
export function clearOpusDesignShellStore(): void {
  packages.clear();
  results.clear();
  revisions.clear();
  handoffs.clear();
  events.length = 0;
}
