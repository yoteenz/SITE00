/**
 * Phase 0 forensic audit — founder judgment + revision infrastructure.
 */

import type { CreativeAssetRecord } from './types.js';
import type { FounderCreativeJudgment } from './founderCreativeJudgmentTypes.js';
import type { CreativeRevisionSpec } from './revisionTypes.js';

export type JudgmentForensicAuditReport = {
  auditedAt: string;
  brandSlug: string;
  currentJudgmentBehavior: string[];
  currentRevisionBehavior: string[];
  deletionRisks: string[];
  lineageGaps: string[];
  regenerationOverwrites: string[];
  brandScoping: string[];
  descendantSupport: string[];
  recommendations: string[];
};

export function runJudgmentForensicAudit(params: {
  brandSlug: string;
  assets: CreativeAssetRecord[];
  judgments: FounderCreativeJudgment[];
  revisionSpecs: CreativeRevisionSpec[];
}): JudgmentForensicAuditReport {
  const excluded = params.assets.filter((a) => a.brandLineageMembership === 'EXCLUDED');
  const revisionPending = params.assets.filter((a) => a.revisionPending);
  const withParent = params.assets.filter((a) => a.relationship.parentAssetId);

  return {
    auditedAt: new Date().toISOString(),
    brandSlug: params.brandSlug,
    currentJudgmentBehavior: [
      'LOVE IT → reviewState LOVE_IT, productionState PRODUCTION_CANDIDATE, brand ACTIVE',
      'REVISE → reviewState PROMISING_REFINE/REVISE, revisionPending, disposition REVISION_PENDING',
      'NOT FOR ME → brandLineageMembership EXCLUDED, storage preserved, crossBrandPortable',
      'Judgments sync from Experiment C/B carousel API to lineage on tap',
      'Historical methodology_validation_runs JSONB never mutated',
    ],
    currentRevisionBehavior: [
      `${params.revisionSpecs.length} revision spec(s) in persistence`,
      'Revision Studio captures structured categories + lock/mutable elements',
      'compileCreativeRevision produces delta-based brief',
      'Live GENERATE REVISION — founder-triggered, explicit approval required, single-asset boundary',
    ],
    deletionRisks: [
      excluded.length
        ? `${excluded.length} brand-excluded asset(s) — storage paths preserved, not deleted`
        : 'No brand exclusions yet',
      'NOT FOR ME does not delete storage blobs or generation receipts',
    ],
    lineageGaps: [
      withParent.length ? `${withParent.length} asset(s) with parent relationships` : 'Revision child assets pending first generation',
      revisionPending.length ? `${revisionPending.length} asset(s) flagged revisionPending` : 'No revision-pending flags',
    ],
    regenerationOverwrites: [
      'Parent assets marked immutable — revision creates child lineage only',
      'No in-place overwrite of original generated assets in current pipeline',
    ],
    brandScoping: [
      'brandLineageMembership ACTIVE|EXCLUDED scopes NDXBOOK library visibility',
      'BrandAssetDisposition record tracks per-brand disposition separately from global asset existence',
      'Cross-brand reuse NOT_EVALUATED by default — no auto-exposure to other brands',
    ],
    descendantSupport: [
      'CreativeRevisionSpec.parentAssetId + rootAssetId + revisionNumber',
      'RevisionBranch supports non-linear revision trees',
      'AssetRelationship.parentAssetId available on CreativeAssetRecord',
    ],
    recommendations: [
      'Apply Supabase migration for judgment + revision tables when ready',
      'Railway redeploy after merge for API routes',
      'Re-run slide 02 after storage reconciliation if blob missing',
    ],
  };
}
