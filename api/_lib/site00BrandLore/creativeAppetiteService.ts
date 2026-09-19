/**
 * Founder Creative Appetite — persistence and inspector orchestration.
 */

import type { BrandLoreProfile } from '../../../shared/site00-brand-lore/types.js';
import { synthesizeFounderCreativeAppetiteProfile } from '../../../shared/site00-brand-lore/founderCreativeAppetite/synthesis.js';
import {
  buildCreativeAppetiteAvailabilityRecord,
  buildIntelligenceInspectorView,
} from '../../../shared/site00-brand-lore/founderCreativeAppetite/intelligenceInspector.js';
import { computeCreativeAppetiteFingerprint } from '../../../shared/site00-brand-lore/founderCreativeAppetite/fingerprint.js';
import { getOrReconcileBrandLoreForOrg } from './loreService.js';
import * as store from './storeAdapter.js';

export async function submitOrgCreativeAppetite(params: {
  orgId: string;
  orgSlug: string;
  appetiteAnswers: Record<string, string | string[]>;
}): Promise<BrandLoreProfile> {
  const existing = await getOrReconcileBrandLoreForOrg(params.orgId, params.orgSlug);
  const mergedAnswers = {
    ...(existing?.founderCreativeAppetite?.rawAnswers ?? {}),
    ...params.appetiteAnswers,
  };

  const appetite = synthesizeFounderCreativeAppetiteProfile({
    organizationId: params.orgId,
    projectId: existing?.projectId ?? null,
    appetiteAnswers: mergedAnswers,
    existing: existing?.founderCreativeAppetite ?? null,
  });

  if (!existing) {
    throw new Error('Brand Lore profile required before Creative Appetite can be saved');
  }

  existing.founderCreativeAppetite = appetite;
  existing.updatedAt = new Date().toISOString();
  return store.saveBrandLoreProfile(existing);
}

export async function getCreativeAppetiteInspectorPayload(orgSlug: string, orgId: string) {
  const profile = await getOrReconcileBrandLoreForOrg(orgId, orgSlug);
  const appetite = profile?.founderCreativeAppetite ?? null;
  return {
    intelligenceInspector: buildIntelligenceInspectorView({ profile, orgSlug }),
    creativeAppetiteAnswers: appetite?.rawAnswers ?? {},
    creativeAppetiteAvailability: buildCreativeAppetiteAvailabilityRecord(appetite),
    creativeAppetiteFingerprint: computeCreativeAppetiteFingerprint(appetite),
  };
}
