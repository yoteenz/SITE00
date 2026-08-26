/**
 * P0.BRIDGE.1 — In-memory store for tests and dev fallback.
 */

import type {
  PrepareRepoChangeInput,
  Site00ChangeOperationRecord,
  Site00ChangeReceiptRecord,
  Site00ChangeRequestRecord,
  Site00ChangeScope,
  Site00ManagedProjectRow,
  Site00RepoBindingRow,
  BlastRadiusSummary,
} from './types.js';

const projects = new Map<string, Site00ManagedProjectRow>();
const bindings = new Map<string, Site00RepoBindingRow>();
const requests = new Map<string, Site00ChangeRequestRecord>();
const operations = new Map<string, Site00ChangeOperationRecord[]>();
const receipts = new Map<string, Site00ChangeReceiptRecord[]>();
const idempotencyIndex = new Map<string, string>();
const propagationChanges = new Map<string, ShellPropagationRecord>();
const propagationMembers = new Map<string, ShellPropagationMemberRecord[]>();
const referenceBindings = new Map<string, ReferenceBindingRecord>();
const snapshotBindings = new Map<string, SnapshotBindingRecord>();

export type ShellPropagationRecord = {
  id: string;
  projectId: string;
  changeRequestId: string;
  shellId?: string | null;
  oldVersion?: number | null;
  newVersion?: number | null;
  scope: Site00ChangeScope;
  founderApproved: boolean;
  createdAt: string;
};

export type ShellPropagationMemberRecord = {
  id: string;
  propagationChangeId: string;
  routeKey?: string | null;
  pageId?: string | null;
  familyId?: string | null;
  componentKey?: string | null;
  included: boolean;
  exceptionReason?: string | null;
};

export type ReferenceBindingRecord = {
  id: string;
  projectId: string;
  referenceId: string;
  stalenessStatus: 'CURRENT' | 'POSSIBLY_STALE';
};

export type SnapshotBindingRecord = {
  id: string;
  projectId: string;
  snapshotId: string;
  stalenessStatus: 'CURRENT' | 'POSSIBLY_STALE';
};

let seq = 0;

function uid(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}-${Date.now()}`;
}

export function seedBridgeMemoryStore(seed?: {
  projects?: Site00ManagedProjectRow[];
  bindings?: Site00RepoBindingRow[];
}): void {
  projects.clear();
  bindings.clear();
  requests.clear();
  operations.clear();
  receipts.clear();
  propagationChanges.clear();
  propagationMembers.clear();
  referenceBindings.clear();
  snapshotBindings.clear();
  seq = 0;

  for (const p of seed?.projects ?? defaultSeedProjects()) {
    projects.set(p.projectKey, p);
  }
  for (const b of seed?.bindings ?? defaultSeedBindings()) {
    bindings.set(b.id, b);
  }
}

function defaultSeedProjects(): Site00ManagedProjectRow[] {
  return [
    {
      id: 'mp-site00',
      projectKey: 'site00',
      displayName: 'SITE 00',
      designAuthority: 'SITE00',
      sourceRepo: null,
      sourceProjectKey: null,
      projectType: 'HOST_PLATFORM',
      runtimeMode: 'SITE00_NATIVE',
      designEnabled: true,
      metadata: {},
    },
    {
      id: 'mp-fsbw-ndx',
      projectKey: 'ndxbook',
      displayName: 'NDXBOOK',
      designAuthority: 'SITE00',
      sourceRepo: 'yoteenz/fsbw',
      sourceProjectKey: 'ndxbook',
      projectType: 'MANAGED_BRAND',
      runtimeMode: 'FSBW_WEBSITE',
      designEnabled: true,
      metadata: {},
    },
    {
      id: 'mp-fsbw-aio',
      projectKey: 'all-in-one-enterprises',
      displayName: 'ALL IN ONE ENTERPRISES',
      designAuthority: 'SITE00',
      sourceRepo: 'yoteenz/fsbw',
      sourceProjectKey: 'all-in-one-enterprises',
      projectType: 'MANAGED_BRAND',
      runtimeMode: 'FSBW_WEBSITE',
      designEnabled: true,
      metadata: {},
    },
    {
      id: 'mp-fsbw-fs',
      projectKey: 'frontal-slayer',
      displayName: 'FRONTAL SLAYER',
      designAuthority: 'SITE00',
      sourceRepo: 'yoteenz/fsbw',
      sourceProjectKey: 'frontal-slayer',
      projectType: 'MANAGED_BRAND',
      runtimeMode: 'FSBW_WEBSITE',
      designEnabled: true,
      metadata: {},
    },
    {
      id: 'mp-fsbw-sw',
      projectKey: 'studio-world',
      displayName: 'STUDIO WORLD WEBSITE',
      designAuthority: 'SITE00',
      sourceRepo: 'yoteenz/fsbw',
      sourceProjectKey: 'studio-world',
      projectType: 'MANAGED_WEBSITE',
      runtimeMode: 'FSBW_WEBSITE',
      designEnabled: true,
      metadata: { websiteScopeOnly: true },
    },
  ];
}

function defaultSeedBindings(): Site00RepoBindingRow[] {
  return [
    {
      id: 'rb-fsbw-ndx',
      projectId: 'mp-fsbw-ndx',
      repoOwner: 'yoteenz',
      repoName: 'fsbw',
      defaultBranch: 'main',
      sourceProjectPath: 'ndxbook',
      adapterType: 'FSBW_WEBSITE',
      runtimeBindingMode: 'HYBRID',
      sourceMaterializationEnabled: true,
      metadata: {},
    },
    {
      id: 'rb-fsbw-aio',
      projectId: 'mp-fsbw-aio',
      repoOwner: 'yoteenz',
      repoName: 'fsbw',
      defaultBranch: 'main',
      sourceProjectPath: 'all-in-one-enterprises',
      adapterType: 'FSBW_WEBSITE',
      runtimeBindingMode: 'HYBRID',
      sourceMaterializationEnabled: true,
      metadata: {},
    },
    {
      id: 'rb-fsbw-fs',
      projectId: 'mp-fsbw-fs',
      repoOwner: 'yoteenz',
      repoName: 'fsbw',
      defaultBranch: 'main',
      sourceProjectPath: 'frontal-slayer',
      adapterType: 'FSBW_WEBSITE',
      runtimeBindingMode: 'HYBRID',
      sourceMaterializationEnabled: true,
      metadata: {},
    },
    {
      id: 'rb-fsbw-sw',
      projectId: 'mp-fsbw-sw',
      repoOwner: 'yoteenz',
      repoName: 'fsbw',
      defaultBranch: 'main',
      sourceProjectPath: 'studio-world',
      adapterType: 'FSBW_STUDIO_WORLD_WEBSITE',
      runtimeBindingMode: 'HYBRID',
      sourceMaterializationEnabled: true,
      metadata: { excludeInternalRoutes: ['/studio/', '/admin/'] },
    },
  ];
}

export function memoryGetManagedProject(projectKey: string): Site00ManagedProjectRow | null {
  return projects.get(projectKey) ?? null;
}

export function memoryListManagedProjects(): Site00ManagedProjectRow[] {
  return [...projects.values()];
}

export function memoryGetRepoBindingForProject(projectKey: string): Site00RepoBindingRow | null {
  const project = projects.get(projectKey);
  if (!project) return null;
  return [...bindings.values()].find((b) => b.projectId === project.id) ?? null;
}

export function memoryGetChangeRequest(id: string): Site00ChangeRequestRecord | null {
  const req = requests.get(id);
  if (!req) return null;
  return { ...req, operations: operations.get(id) ?? [] };
}

export function memoryGetChangeRequestByIdempotency(
  projectKey: string,
  idempotencyKey: string,
): Site00ChangeRequestRecord | null {
  const id = idempotencyIndex.get(`${projectKey}:${idempotencyKey}`);
  return id ? memoryGetChangeRequest(id) : null;
}

export function memorySaveChangeRequest(record: Site00ChangeRequestRecord, ops: Site00ChangeOperationRecord[]): Site00ChangeRequestRecord {
  const id = record.id ?? uid('cr');
  const saved = { ...record, id };
  requests.set(id, saved);
  operations.set(id, ops.map((o, i) => ({ ...o, id: o.id ?? uid('op'), changeRequestId: id, operationOrder: o.operationOrder ?? i + 1 })));
  idempotencyIndex.set(`${record.projectKey ?? record.projectId}:${record.idempotencyKey}`, id);
  return memoryGetChangeRequest(id)!;
}

export function memoryUpdateChangeRequest(id: string, patch: Partial<Site00ChangeRequestRecord>): Site00ChangeRequestRecord | null {
  const existing = requests.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch, version: (existing.version ?? 1) + (patch.version ? 0 : 1) };
  requests.set(id, updated);
  return memoryGetChangeRequest(id);
}

export function memoryAddReceipt(receipt: Site00ChangeReceiptRecord): Site00ChangeReceiptRecord {
  const saved = { ...receipt, id: receipt.id ?? uid('rcpt'), createdAt: receipt.createdAt ?? new Date().toISOString() };
  const list = receipts.get(receipt.changeRequestId) ?? [];
  list.push(saved);
  receipts.set(receipt.changeRequestId, list);
  return saved;
}

export function memoryListReceipts(changeRequestId: string): Site00ChangeReceiptRecord[] {
  return receipts.get(changeRequestId) ?? [];
}

export function memoryListReadyForRepo(repoOwner: string, repoName: string): Site00ChangeRequestRecord[] {
  const bindingIds = new Set(
    [...bindings.values()].filter((b) => b.repoOwner === repoOwner && b.repoName === repoName).map((b) => b.id),
  );
  return [...requests.values()]
    .filter((r) => r.status === 'READY_FOR_REPO' && r.repoBindingId && bindingIds.has(r.repoBindingId))
    .map((r) => memoryGetChangeRequest(r.id!)!);
}

export function memoryCreateShellPropagation(input: {
  projectId: string;
  changeRequestId: string;
  shellId?: string | null;
  oldVersion?: number | null;
  newVersion?: number | null;
  scope: Site00ChangeScope;
  founderApproved?: boolean;
}): ShellPropagationRecord {
  const id = uid('spc');
  const record: ShellPropagationRecord = {
    id,
    projectId: input.projectId,
    changeRequestId: input.changeRequestId,
    shellId: input.shellId ?? null,
    oldVersion: input.oldVersion ?? null,
    newVersion: input.newVersion ?? null,
    scope: input.scope,
    founderApproved: input.founderApproved ?? false,
    createdAt: new Date().toISOString(),
  };
  propagationChanges.set(id, record);
  propagationMembers.set(id, []);
  return record;
}

export function memoryAddPropagationMember(
  propagationChangeId: string,
  member: Omit<ShellPropagationMemberRecord, 'id' | 'propagationChangeId'>,
): ShellPropagationMemberRecord {
  const saved: ShellPropagationMemberRecord = {
    id: uid('spm'),
    propagationChangeId,
    ...member,
  };
  const list = propagationMembers.get(propagationChangeId) ?? [];
  list.push(saved);
  propagationMembers.set(propagationChangeId, list);
  return saved;
}

export function memoryGetShellPropagation(changeRequestId: string): ShellPropagationRecord | null {
  return [...propagationChanges.values()].find((p) => p.changeRequestId === changeRequestId) ?? null;
}

export function memoryListPropagationMembers(propagationChangeId: string): ShellPropagationMemberRecord[] {
  return propagationMembers.get(propagationChangeId) ?? [];
}

export function memoryMarkStalenessFromBlastRadius(
  projectId: string,
  blastRadius: BlastRadiusSummary,
): { references: ReferenceBindingRecord[]; snapshots: SnapshotBindingRecord[] } {
  const refs: ReferenceBindingRecord[] = [];
  const snaps: SnapshotBindingRecord[] = [];
  for (const refKey of blastRadius.referencesPotentiallyStale) {
    const record: ReferenceBindingRecord = {
      id: uid('ref'),
      projectId,
      referenceId: refKey,
      stalenessStatus: 'POSSIBLY_STALE',
    };
    referenceBindings.set(record.id, record);
    refs.push(record);
  }
  for (const snapKey of blastRadius.snapshotsPotentiallyStale) {
    const record: SnapshotBindingRecord = {
      id: uid('snap'),
      projectId,
      snapshotId: snapKey,
      stalenessStatus: 'POSSIBLY_STALE',
    };
    snapshotBindings.set(record.id, record);
    snaps.push(record);
  }
  return { references: refs, snapshots: snaps };
}

export function memoryListReferenceBindings(projectId: string): ReferenceBindingRecord[] {
  return [...referenceBindings.values()].filter((r) => r.projectId === projectId);
}

export function memoryListSnapshotBindings(projectId: string): SnapshotBindingRecord[] {
  return [...snapshotBindings.values()].filter((s) => s.projectId === projectId);
}

export function clearBridgeMemoryStore(): void {
  seedBridgeMemoryStore({ projects: [], bindings: [] });
}

export function buildMemoryPrepareInput(input: PrepareRepoChangeInput): PrepareRepoChangeInput {
  return input;
}
