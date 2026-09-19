/**
 * In-memory store for founder judgments + revision specs (tests + fallback).
 */

import type {
  BrandAssetDispositionRecord,
  FounderCreativeJudgment,
} from '../../../../shared/site00-brand-lore/creativeLineage/founderCreativeJudgmentTypes.js';
import type {
  CreativeRevisionSpec,
  FounderCreativePreferenceEvidence,
  RevisionBranch,
} from '../../../../shared/site00-brand-lore/creativeLineage/revisionTypes.js';

const judgments = new Map<string, FounderCreativeJudgment>();
const dispositions = new Map<string, BrandAssetDispositionRecord>();
const revisionSpecs = new Map<string, CreativeRevisionSpec>();
const branches = new Map<string, RevisionBranch>();
const preferenceEvidence = new Map<string, FounderCreativePreferenceEvidence>();

export function resetFounderJudgmentRevisionMemory(): void {
  judgments.clear();
  dispositions.clear();
  revisionSpecs.clear();
  branches.clear();
  preferenceEvidence.clear();
}

export async function revisionJudgmentTablesExist(): Promise<boolean> {
  return true;
}

function judgmentKey(assetId: string, brandSlug: string): string {
  return `${brandSlug}:${assetId}`;
}

export async function upsertFounderCreativeJudgment(record: FounderCreativeJudgment): Promise<FounderCreativeJudgment> {
  judgments.set(judgmentKey(record.assetId, record.brandSlug), record);
  return record;
}

export async function getFounderCreativeJudgment(
  brandSlug: string,
  assetId: string,
): Promise<FounderCreativeJudgment | null> {
  return judgments.get(judgmentKey(assetId, brandSlug)) ?? null;
}

export async function listFounderCreativeJudgments(brandSlug: string): Promise<FounderCreativeJudgment[]> {
  return [...judgments.values()].filter((j) => j.brandSlug === brandSlug);
}

export async function upsertBrandAssetDisposition(
  record: BrandAssetDispositionRecord,
): Promise<BrandAssetDispositionRecord> {
  dispositions.set(judgmentKey(record.assetId, record.brandSlug), record);
  return record;
}

export async function getBrandAssetDisposition(
  brandSlug: string,
  assetId: string,
): Promise<BrandAssetDispositionRecord | null> {
  return dispositions.get(judgmentKey(assetId, brandSlug)) ?? null;
}

export async function upsertCreativeRevisionSpec(record: CreativeRevisionSpec): Promise<CreativeRevisionSpec> {
  revisionSpecs.set(record.revisionId, record);
  return record;
}

export async function getCreativeRevisionSpec(revisionId: string): Promise<CreativeRevisionSpec | null> {
  return revisionSpecs.get(revisionId) ?? null;
}

export async function listCreativeRevisionSpecs(params: {
  brandSlug: string;
  parentAssetId?: string;
  rootAssetId?: string;
}): Promise<CreativeRevisionSpec[]> {
  return [...revisionSpecs.values()].filter((s) => {
    if (s.brandSlug !== params.brandSlug) return false;
    if (params.parentAssetId && s.parentAssetId !== params.parentAssetId) return false;
    if (params.rootAssetId && s.rootAssetId !== params.rootAssetId) return false;
    return true;
  });
}

export async function upsertRevisionBranch(record: RevisionBranch): Promise<RevisionBranch> {
  branches.set(record.branchId, record);
  return record;
}

export async function getRevisionBranch(branchId: string): Promise<RevisionBranch | null> {
  return branches.get(branchId) ?? null;
}

export async function upsertPreferenceEvidence(
  record: FounderCreativePreferenceEvidence,
): Promise<FounderCreativePreferenceEvidence> {
  preferenceEvidence.set(record.evidenceId, record);
  return record;
}

export async function listPreferenceEvidence(brandSlug: string): Promise<FounderCreativePreferenceEvidence[]> {
  return [...preferenceEvidence.values()].filter((e) => e.brandSlug === brandSlug);
}
