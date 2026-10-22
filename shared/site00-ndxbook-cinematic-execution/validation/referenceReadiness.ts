import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { KLING4_PROVIDER_LIMITS } from '../capability/kling4CapabilityMatrix.js';
import type {
  ReferenceBindingManifest,
  ReferenceReadinessFailure,
  ReferenceReadinessResult,
} from '../types/schemas.js';

export type ReferenceReadinessOptions = {
  repoRoot: string;
  /** When set, references must match these hashes exactly. */
  expectedHashes?: Record<string, string>;
  maxReferences?: number;
  requireFounderApproved?: boolean;
};

function sha256File(absPath: string): string | null {
  try {
    const buf = fs.readFileSync(absPath);
    return crypto.createHash('sha256').update(buf).digest('hex');
  } catch {
    return null;
  }
}

function fail(
  blockedReason: ReferenceReadinessFailure,
  detail: string,
  assetId?: string,
): ReferenceReadinessResult {
  return { ok: false, blockedReason, detail, assetId };
}

export function hashReferenceManifest(manifest: ReferenceBindingManifest): string {
  const stable = JSON.stringify({
    v: manifest.manifestVersion,
    entryId: manifest.entryId,
    shotId: manifest.shotId,
    refs: manifest.references.map((r) => ({
      assetId: r.assetId,
      role: r.referenceRole,
      hash: r.contentHash,
      approval: r.approvalStatus,
    })),
  });
  return crypto.createHash('sha256').update(stable).digest('hex');
}

export function validateReferenceReadiness(
  manifest: ReferenceBindingManifest,
  options: ReferenceReadinessOptions,
): ReferenceReadinessResult {
  const maxRefs = options.maxReferences ?? KLING4_PROVIDER_LIMITS.maxTotalReferences;
  if (manifest.references.length > maxRefs) {
    return fail('EXCESS_REFERENCE_COUNT', `Reference count ${manifest.references.length} exceeds limit ${maxRefs}`);
  }

  for (const ref of manifest.references) {
    if (options.requireFounderApproved !== false && ref.approvalStatus !== 'FOUNDER_APPROVED') {
      return fail('REFERENCE_UNAPPROVED', `Asset ${ref.assetId} approval=${ref.approvalStatus}`, ref.assetId);
    }

    const rel = ref.fileLocation.replace(/^public\//, '');
    const abs = path.isAbsolute(ref.fileLocation)
      ? ref.fileLocation
      : path.join(options.repoRoot, 'public', rel.startsWith('/') ? rel.slice(1) : rel);

    if (!fs.existsSync(abs)) {
      return fail('REFERENCE_MISSING', `Missing file for ${ref.assetId}: ${abs}`, ref.assetId);
    }

    const hash = sha256File(abs);
    if (!hash) {
      return fail('REFERENCE_UNDELIVERABLE', `Could not read hash for ${ref.assetId}`, ref.assetId);
    }

    if (ref.contentHash && ref.contentHash !== hash) {
      return fail('REFERENCE_HASH_MISMATCH', `Hash mismatch for ${ref.assetId}`, ref.assetId);
    }

    const expected = options.expectedHashes?.[ref.assetId];
    if (expected && expected !== hash) {
      return fail('REFERENCE_HASH_MISMATCH', `Expected hash mismatch for ${ref.assetId}`, ref.assetId);
    }

    if (ref.mediaType === 'unknown') {
      return fail('UNSUPPORTED_MEDIA_TYPE', `Unknown media type for ${ref.assetId}`, ref.assetId);
    }

    if (ref.providerUploadStatus === 'FAILED') {
      return fail('PROVIDER_UPLOAD_FAILURE', `Provider upload failed for ${ref.assetId}`, ref.assetId);
    }

    if (ref.validatedDeliveryStatus === 'FAILED') {
      return fail('REFERENCE_UNDELIVERABLE', `Delivery validation failed for ${ref.assetId}`, ref.assetId);
    }
  }

  const manifestHash = hashReferenceManifest(manifest);
  return { ok: true, manifestHash };
}
