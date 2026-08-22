/** Map creative intake form state → MarketingIntakeRecord (API contract preserved) */

import type { MarketingIntakeRecord } from '../types.js';

export function formStateToIntakeRecord(form: Record<string, string | string[]>): MarketingIntakeRecord {
  const platforms = form.platforms;
  const platformList = Array.isArray(platforms)
    ? platforms
    : typeof platforms === 'string' && platforms.trim()
      ? platforms.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  const deliverables = form.deliverableTypes;
  const deliverableList = Array.isArray(deliverables)
    ? deliverables
    : typeof deliverables === 'string' && deliverables.trim()
      ? deliverables.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  return {
    businessName: str(form.businessName),
    campaignObjective: str(form.campaignObjective),
    makingWhat: str(form.makingWhat),
    targetAudience: str(form.targetAudience),
    platforms: platformList.length ? platformList : undefined,
    deliverableTypes: deliverableList.length ? deliverableList : undefined,
    quantityCadence: str(form.quantityCadence),
    deadline: str(form.deadline),
    launchDate: str(form.launchDate),
    productService: str(form.productService),
    copyMessaging: str(form.copyMessaging),
    restrictions: str(form.restrictions),
    approvalContact: str(form.approvalContact),
    additionalNotes: str(form.additionalNotes),
  };
}

function str(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s || undefined;
}

export function intakeRecordToFormState(intake: MarketingIntakeRecord): Record<string, string | string[]> {
  return {
    businessName: intake.businessName ?? '',
    campaignObjective: intake.campaignObjective ?? '',
    makingWhat: intake.makingWhat ?? '',
    targetAudience: intake.targetAudience ?? '',
    platforms: intake.platforms ?? [],
    deliverableTypes: intake.deliverableTypes ?? [],
    quantityCadence: intake.quantityCadence ?? '',
    deadline: intake.deadline ?? '',
    launchDate: intake.launchDate ?? '',
    productService: intake.productService ?? '',
    copyMessaging: intake.copyMessaging ?? '',
    restrictions: intake.restrictions ?? '',
    approvalContact: intake.approvalContact ?? '',
    additionalNotes: intake.additionalNotes ?? '',
  };
}
