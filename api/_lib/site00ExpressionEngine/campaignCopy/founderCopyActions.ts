/**
 * C1.8 — Founder copy actions (persisted state mutations).
 */

import type { CopyApprovalState } from '../../../shared/site00-expression-engine/brand-language/types.js';
import type { CampaignCopyPackageOutput } from '../../../shared/site00-expression-engine/campaign-copy/types.js';
import { getCampaignCopyPackage, persistCampaignCopyPackage } from './campaignCopyStore.js';
import { seedCorrectionFromFounderFeedback } from '../seniorCreativeJudgment/creativeIntelligenceStore.js';
import {
  strengthenBrandLanguageFromApprovedEdit,
} from '../brandLanguage/brandLanguageIdentity.js';
import {
  applyApprovedInVoiceLearning,
  rejectOutOfVoiceDraft,
  persistFounderCopyActionRecord,
} from '../brandLanguage/brandLanguageSupabaseStore.js';
import { generateBrandTrueCopy } from './copyReasoningProvider.js';
import { buildCreativeBrainContext } from './creativeBrainContext.js';

export type FounderCopyAction =
  | 'LOVE IT'
  | 'ALT A'
  | 'ALT B'
  | 'EDIT'
  | 'PUSH FURTHER'
  | 'TOO SAFE'
  | 'TOO WORDY'
  | 'TOO EXPLANATORY'
  | 'TOO SALESY'
  | 'NOT MY VOICE';

const rejectedDraftIds = new Set<string>();

export function registerRejectedDraft(draftId: string): void {
  rejectedDraftIds.add(draftId);
}

export function wasDraftRejected(draftId: string): boolean {
  return rejectedDraftIds.has(draftId);
}

function approvalStateFor(action: FounderCopyAction): CopyApprovalState {
  switch (action) {
    case 'LOVE IT':
      return 'APPROVED';
    case 'EDIT':
      return 'FOUNDER_EDITED';
    case 'PUSH FURTHER':
    case 'TOO SAFE':
    case 'TOO WORDY':
    case 'TOO EXPLANATORY':
    case 'TOO SALESY':
    case 'NOT MY VOICE':
      return 'REVISION_REQUESTED';
    default:
      return 'AWAITING_REVIEW';
  }
}

function scopeForNotMyVoice(action: FounderCopyAction, projectId?: string): {
  scope: 'BRAND_METHOD' | 'CAMPAIGN_METHOD' | 'PROJECT_TASTE' | 'CAMPAIGN_TASTE';
  taxonomy: string;
} {
  if (action !== 'NOT MY VOICE') {
    return { scope: 'CAMPAIGN_METHOD', taxonomy: 'COPY_NOT_BRAND_NATIVE' };
  }
  return projectId
    ? { scope: 'PROJECT_TASTE', taxonomy: 'VOICE_DRIFT' }
    : { scope: 'BRAND_METHOD', taxonomy: 'COPY_NOT_BRAND_NATIVE' };
}

export async function applyFounderCopyAction(args: {
  copyPackageId: string;
  unitId: string;
  action: FounderCopyAction;
  editText?: string;
  projectId?: string;
}): Promise<{ ok: boolean; package?: CampaignCopyPackageOutput; brandLanguageStrengthened?: boolean }> {
  const pkg = getCampaignCopyPackage(args.copyPackageId);
  const unit = pkg?.unitCopyDirections.find((u) => u.unitId === args.unitId);
  if (!pkg || !unit) return { ok: false };

  const approvalState = approvalStateFor(args.action);
  unit.copyPackage.copyStatus = approvalState === 'APPROVED' ? 'APPROVED' : 'AWAITING_FOUNDER_REVIEW';
  (unit as { approvalState?: CopyApprovalState }).approvalState = approvalState;

  let newCaption = unit.finalCaption;
  let versionLabel = `V${String(unit.versions.length + 1).padStart(3, '0')}`;
  let source = 'founder_action';

  switch (args.action) {
    case 'LOVE IT':
      newCaption = unit.finalCaption;
      source = 'founder_love_it';
      break;
    case 'ALT A':
      newCaption = unit.altCaptionA;
      unit.copyPackage.activeCopyVersionId = `${unit.copyPackage.copyDirectionId}-alt-a`;
      source = 'founder_alt_a';
      break;
    case 'ALT B':
      newCaption = unit.altCaptionB;
      unit.copyPackage.activeCopyVersionId = `${unit.copyPackage.copyDirectionId}-alt-b`;
      source = 'founder_alt_b';
      break;
    case 'EDIT':
      newCaption = args.editText ?? unit.finalCaption;
      source = 'FOUNDER_EDITED';
      break;
    case 'PUSH FURTHER': {
      const ctx = buildCreativeBrainContext({
        visualDirection: unit.copyPackage.copyNotes,
        postRole: unit.campaignRole,
        platform: unit.medium,
      });
      const revised = await generateBrandTrueCopy({
        ...ctx,
        relevantCorrections: [`PUSH FURTHER: sharpen ${unit.finalCaption.slice(0, 40)}`],
      });
      newCaption = revised.primaryCaption;
      source = 'push_further';
      break;
    }
    default:
      seedCorrectionFromFounderFeedback({
        surfaceFeedback: args.action.toLowerCase().replace(/ /g, '_'),
        taxonomy: scopeForNotMyVoice(args.action, args.projectId).taxonomy as 'VOICE_DRIFT',
        scope: scopeForNotMyVoice(args.action, args.projectId).scope,
        projectId: args.projectId,
      });
      newCaption = unit.finalCaption;
      source = 'founder_feedback';
      break;
  }

  unit.finalCaption = newCaption;
  unit.copyPackage.caption = newCaption;
  unit.copyPackage.copyVersion = versionLabel;
  unit.versions.push({
    versionLabel,
    copyText: { caption: newCaption },
    rhetoricalStrategy: unit.winningTerritory.rhetoricalBehavior,
    cta: unit.copyPackage.cta,
    status: args.action === 'LOVE IT' ? 'APPROVED' : 'AWAITING_FOUNDER_REVIEW',
    founderJudgment: args.action,
    source,
    createdAt: new Date().toISOString(),
  });

  let brandLanguageStrengthened = false;
  if (args.action === 'LOVE IT' || args.action === 'EDIT') {
    const baseIdentity =
      (unit as { brandLanguageIdentity?: import('../../../shared/site00-expression-engine/brand-language/types.js').BrandLanguageIdentity }).brandLanguageIdentity ??
      buildCreativeBrainContext({}).brandLanguageIdentity;
    const strengthened = strengthenBrandLanguageFromApprovedEdit(baseIdentity, newCaption);
    (unit as { brandLanguageIdentity?: typeof strengthened }).brandLanguageIdentity = strengthened;
    await applyApprovedInVoiceLearning(
      strengthened,
      newCaption,
      args.action === 'EDIT' ? 'FOUNDER_EDITED_IN_VOICE' : 'APPROVED_IN_VOICE',
    );
    brandLanguageStrengthened = true;
  }

  if (args.action === 'NOT MY VOICE') {
    registerRejectedDraft(`${args.copyPackageId}:${args.unitId}:${versionLabel}`);
    await rejectOutOfVoiceDraft(
      (unit as { brandLanguageIdentity?: { brandId: string } }).brandLanguageIdentity?.brandId ?? args.projectId ?? 'unknown',
      newCaption,
      args.projectId,
    );
  }

  await persistFounderCopyActionRecord({
    copyPackageId: args.copyPackageId,
    contentUnitId: args.unitId,
    action: args.action,
    versionLabel,
    caption: newCaption,
    projectId: args.projectId,
  });

  await persistCampaignCopyPackage(pkg, args.projectId ?? 'verdant-row');

  return { ok: true, package: pkg, brandLanguageStrengthened };
}

export function isCopyPackageReady(pkg: CampaignCopyPackageOutput): boolean {
  return pkg.unitCopyDirections.every((u) => {
    const state = (u as { approvalState?: CopyApprovalState }).approvalState ?? 'AWAITING_REVIEW';
    const role = u.copyPackage.copyRole;
    if (role === 'NO_CAPTION' || role === 'MINIMAL_CAPTION') return state === 'APPROVED' || state === 'AWAITING_REVIEW';
    return state === 'APPROVED' || state === 'FOUNDER_EDITED';
  });
}
