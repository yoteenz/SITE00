/**
 * CharacterAssemblyManifest — canonical recipe to reconstruct a digital human in Unreal.
 * SITE00 owns this; Unreal projects it. Not a render output.
 */

export const CHARACTER_ASSEMBLY_MANIFEST_SCHEMA = 1 as const;

export type AssemblyApprovalState = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'LOCKED';

export type CharacterAssemblyManifest = {
  schema: typeof CHARACTER_ASSEMBLY_MANIFEST_SCHEMA;
  characterId: string;
  actorId: string;
  projectId: string;
  entryId: string;
  /** Working draft vs approved authority label, e.g. "2.2-draft" or "2.1" */
  assemblyVersion: string;
  /** IMMUTABLE approved snapshot id when authority frozen; null while drafting */
  approvedAuthorityId: string | null;

  identityAuthorityId: string;
  bodyAuthorityId: string;

  appearance: {
    hairAuthorityId: string | null;
    makeupAuthorityId: string | null;
    skinAuthorityId: string | null;
  };

  wardrobe: {
    topAuthorityId: string | null;
    bottomAuthorityId: string | null;
    outerwearAuthorityId: string | null;
    footwearAuthorityId: string | null;
    accessories: readonly string[];
  };

  performance: {
    rigAuthorityId: string | null;
    idleMotionId: string | null;
    walkMotionId: string | null;
    voiceAuthorityId: string | null;
    facialProfileId: string | null;
  };

  behavior: {
    behaviorProfileId: string | null;
  };

  runtime: {
    engine: 'unreal' | 'none';
    runtimeCharacterId: string | null;
    assemblyStatus: 'NOT_LOADED' | 'LOADING' | 'READY' | 'SYNCING' | 'ERROR';
  };

  authority: {
    approvalState: AssemblyApprovalState;
    approvedAt: string | null;
    approvedBy: string | null;
  };

  lineage: {
    parentAssemblyVersion: string | null;
    manifestRevision: number;
  };
};

export type ManifestValidationIssue = { path: string; message: string };

export function validateCharacterAssemblyManifest(m: unknown): { ok: true; manifest: CharacterAssemblyManifest } | { ok: false; issues: ManifestValidationIssue[] } {
  const issues: ManifestValidationIssue[] = [];
  if (!m || typeof m !== 'object') return { ok: false, issues: [{ path: '', message: 'manifest must be an object' }] };
  const o = m as Record<string, unknown>;
  if (o.schema !== CHARACTER_ASSEMBLY_MANIFEST_SCHEMA) issues.push({ path: 'schema', message: 'unsupported schema' });
  for (const key of ['characterId', 'actorId', 'projectId', 'entryId', 'assemblyVersion', 'identityAuthorityId', 'bodyAuthorityId'] as const) {
    if (typeof o[key] !== 'string' || !(o[key] as string).length) issues.push({ path: key, message: 'required string' });
  }
  if (issues.length) return { ok: false, issues };
  return { ok: true, manifest: o as CharacterAssemblyManifest };
}

/** Deterministic fingerprint for sync verification (not cryptographic proof). */
export function manifestFingerprint(manifest: CharacterAssemblyManifest): string {
  const stable = {
    characterId: manifest.characterId,
    actorId: manifest.actorId,
    assemblyVersion: manifest.assemblyVersion,
    identityAuthorityId: manifest.identityAuthorityId,
    bodyAuthorityId: manifest.bodyAuthorityId,
    appearance: manifest.appearance,
    wardrobe: manifest.wardrobe,
    performance: manifest.performance,
    behavior: manifest.behavior,
    lineage: manifest.lineage,
  };
  const s = JSON.stringify(stable);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `mf-${(h >>> 0).toString(16).padStart(8, '0')}`;
}

export function isApprovedAssembly(manifest: CharacterAssemblyManifest): boolean {
  return manifest.authority.approvalState === 'APPROVED' || manifest.authority.approvalState === 'LOCKED';
}

/** Approved versions must not mutate in place — bump assemblyVersion for changes. */
export function assertWorkingDraft(manifest: CharacterAssemblyManifest): void {
  if (isApprovedAssembly(manifest)) {
    throw new Error(`Assembly ${manifest.characterId}@${manifest.assemblyVersion} is approved and immutable`);
  }
}
