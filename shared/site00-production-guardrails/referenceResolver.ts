import { checkReferenceFileHealth, resolveRepoAbsolutePath } from './referenceFileHealth.js';
import { listRegistryForProject, SITE00_REFERENCE_REGISTRY } from './projectReferenceRegistry.js';
import type {
  AuthorityStatus,
  GenerationRequest,
  ReferenceRegistryEntry,
  ResolvedReference,
  SessionReferenceOutput,
} from './types.js';

const STATUS_RANK: Record<AuthorityStatus, number> = {
  CANONICAL: 0,
  APPROVED: 1,
  IN_REVIEW: 2,
  PROVISIONAL_DERIVED: 3,
  REFERENCE_ONLY: 4,
  SUPERSEDED: 99,
  INVALID: 100,
};

export type ReferenceResolverContext = {
  repoRoot: string;
  extraRegistry?: readonly ReferenceRegistryEntry[];
};

function firstHealthyPath(repoRoot: string, paths: readonly string[]): string | null {
  for (const p of paths) {
    const abs = resolveRepoAbsolutePath(repoRoot, p);
    if (checkReferenceFileHealth(abs).ok) return abs;
  }
  return null;
}

/** When no healthy path exists, still bind the first on-disk path so precheck can emit REFERENCE_FILE_CORRUPT. */
function firstExistingPath(repoRoot: string, paths: readonly string[]): string | null {
  for (const p of paths) {
    const abs = resolveRepoAbsolutePath(repoRoot, p);
    if (checkReferenceFileHealth(abs).exists) return abs;
  }
  return null;
}

function entryMatchesHint(entry: ReferenceRegistryEntry, hint: string | null | undefined): boolean {
  if (!hint) return true;
  return entry.authorityId === hint || entry.authorityId.includes(hint) || hint.includes(entry.authorityId);
}

function pickBestReference(
  candidates: ReferenceRegistryEntry[],
  repoRoot: string,
  request: GenerationRequest,
): ResolvedReference | null {
  const viable = candidates
    .filter((c) => c.status !== 'INVALID' && c.status !== 'SUPERSEDED')
    .filter((c) => entryMatchesHint(c, request.referenceAuthorityIdHint))
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);

  for (const entry of viable) {
    const referencePath = firstHealthyPath(repoRoot, entry.paths) ?? firstExistingPath(repoRoot, entry.paths);
    if (!referencePath) continue;
    return {
      referenceAuthorityId: entry.authorityId,
      referencePath,
      referenceStatus: entry.status,
      referenceLineage: [entry.authorityId],
      projectId: entry.projectId,
      sharedGlobal: Boolean(entry.sharedGlobal),
      referenceFound: true,
    };
  }
  return null;
}

function sessionReference(
  session: readonly SessionReferenceOutput[] | undefined,
  request: GenerationRequest,
  repoRoot: string,
): ResolvedReference | null {
  if (!session?.length) return null;
  const match = session.find(
    (s) =>
      s.projectId.toUpperCase() === request.projectId.toUpperCase() &&
      s.familyId.toUpperCase() === request.familyId.toUpperCase() &&
      (request.screenId ? s.visualId.includes(request.screenId) : true),
  );
  if (!match) return null;
  const abs = resolveRepoAbsolutePath(repoRoot, match.path);
  if (!checkReferenceFileHealth(abs).ok) return null;
  return {
    referenceAuthorityId: match.authorityId,
    referencePath: abs,
    referenceStatus: match.status,
    referenceLineage: [match.authorityId],
    projectId: match.projectId,
    sharedGlobal: false,
    referenceFound: true,
  };
}

/** Standard reference resolver — project-scoped, authority-priority ordered. */
export function resolveGenerationReference(
  ctx: ReferenceResolverContext,
  request: GenerationRequest,
): ResolvedReference | null {
  const projectId = request.projectId.toUpperCase();
  const registry = [...listRegistryForProject(projectId), ...(ctx.extraRegistry ?? [])];

  const fromSession = sessionReference(request.sessionReferences, request, ctx.repoRoot);
  if (fromSession) return fromSession;

  const scoped = registry.filter((e) => {
    if (e.projectId.toUpperCase() !== projectId && !e.sharedGlobal) return false;
    if (e.familyId && request.familyId && e.familyId.toUpperCase() !== request.familyId.toUpperCase()) {
      if (!request.referenceAuthorityIdHint?.includes(e.authorityId)) return false;
    }
    if (request.screenId && e.screenId && e.screenId !== request.screenId) {
      if (!request.referenceAuthorityIdHint) return false;
    }
    return true;
  });

  const byHint = request.referenceAuthorityIdHint
    ? scoped.filter((e) => entryMatchesHint(e, request.referenceAuthorityIdHint))
    : scoped;

  const resolved = pickBestReference(byHint.length ? byHint : scoped, ctx.repoRoot, request);
  if (resolved) return resolved;

  if (request.referenceAuthorityIdHint) {
    const globalHit = SITE00_REFERENCE_REGISTRY.find((e) => e.authorityId === request.referenceAuthorityIdHint);
    if (globalHit && globalHit.projectId.toUpperCase() !== projectId && !globalHit.sharedGlobal) {
      return null;
    }
  }

  return null;
}

export function assertProjectFirewall(
  requestProjectId: string,
  resolved: ResolvedReference | null,
): 'OK' | 'CROSS_PROJECT_REFERENCE_DENIED' {
  if (!resolved) return 'OK';
  if (resolved.sharedGlobal) return 'OK';
  if (resolved.projectId.toUpperCase() !== requestProjectId.toUpperCase()) {
    return 'CROSS_PROJECT_REFERENCE_DENIED';
  }
  return 'OK';
}

/** When a superseded hint is requested but a higher authority exists for the same family screen. */
export function rejectSupersededWhenCanonicalExists(
  ctx: ReferenceResolverContext,
  request: GenerationRequest,
  resolved: ResolvedReference | null,
): boolean {
  if (!resolved || resolved.referenceStatus !== 'SUPERSEDED') return false;
  const retry = resolveGenerationReference(ctx, { ...request, referenceAuthorityIdHint: null });
  return retry != null && retry.referenceStatus !== 'SUPERSEDED';
}

export function registryHasApprovedReference(projectId: string, repoRoot: string): boolean {
  const entries = listRegistryForProject(projectId);
  return entries.some((e) => e.status !== 'SUPERSEDED' && e.status !== 'INVALID' && firstHealthyPath(repoRoot, e.paths));
}
