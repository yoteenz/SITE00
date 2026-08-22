/**
 * SITE 00 EVOLVE — Foundation ↔ canonical-intelligence qualification.
 *
 * Server/domain-side determination of whether an organization already has
 * enough canonical brand intelligence (Content Brain + marketing profile) for
 * EVOLVE Foundation to be waived — e.g. because a SITE 00 Identity engagement
 * (or any other prior canonical intake) already produced it. This intentionally
 * never trusts frontend state and never duplicates the underlying intelligence —
 * it only reads what already exists via the canonical EVOLVE store adapter.
 */

import { getContentBrainByOrgId, getProfileByOrgId } from '../storeAdapter.js';
import { orgIdFromSlug } from '../orgRegistry.js';
import type { EvolveFoundationQualification } from '../../../../shared/site00-evolve-commercial/types.js';

type RequiredIntelligenceCategory = {
  key: 'positioning' | 'audience' | 'brand_voice' | 'primary_objective';
  label: string;
};

/** Mirrors the intelligence Foundation is scoped to establish (see catalog EVOLVE_FOUNDATION.features). */
const REQUIRED_INTELLIGENCE_CATEGORIES: RequiredIntelligenceCategory[] = [
  { key: 'positioning', label: 'Positioning' },
  { key: 'audience', label: 'Audience intelligence' },
  { key: 'brand_voice', label: 'Brand voice' },
  { key: 'primary_objective', label: 'Objectives' },
];

function isCanonicalEntry(entry: Record<string, unknown>): boolean {
  const meta = (entry.metadata as Record<string, unknown>) ?? {};
  return meta.entry_class === 'CANONICAL' || (entry as { entry_class?: string }).entry_class === 'CANONICAL';
}

function hasBrandVoiceEntry(canonicalEntries: Array<Record<string, unknown>>): boolean {
  return canonicalEntries.some((entry) => {
    const entryType = (entry as { entry_type?: string }).entry_type;
    const meta = (entry.metadata as Record<string, unknown>) ?? {};
    const importKey = String(meta.import_key ?? '');
    return entryType === 'brand_voice' || importKey === 'voice' || importKey.includes('voice');
  });
}

/**
 * Truthfully resolves Foundation status for an organization. Never returns
 * FOUNDATION_COMPLETED/WAIVED unless the underlying canonical data actually
 * satisfies the requirement — if intelligence is only partially present, the
 * `missing` list names exactly what remains incomplete.
 */
export async function resolveEvolveFoundationQualification(orgSlug: string): Promise<EvolveFoundationQualification> {
  const orgId = orgIdFromSlug(orgSlug);
  if (!orgId) {
    return {
      status: 'FOUNDATION_REQUIRED',
      missing: REQUIRED_INTELLIGENCE_CATEGORIES.map((c) => c.label),
      satisfiedBy: 'NONE',
      explanation: 'Unknown organization — no canonical intelligence indexed.',
    };
  }

  const profile = await getProfileByOrgId(orgId);
  const commercialMeta = ((profile?.metadata ?? {}) as Record<string, unknown>).commercial as Record<string, unknown> | undefined;
  const foundationCompletedAt = commercialMeta?.foundationCompletedAt;
  if (typeof foundationCompletedAt === 'string' && foundationCompletedAt.length > 0) {
    return {
      status: 'FOUNDATION_COMPLETED',
      missing: [],
      satisfiedBy: 'EXPLICIT_FOUNDATION_COMPLETION',
      explanation: `EVOLVE Foundation completed ${foundationCompletedAt}.`,
    };
  }

  const entries = await getContentBrainByOrgId(orgId);
  const canonicalEntries = entries.filter(isCanonicalEntry);

  const missing: string[] = [];
  for (const category of REQUIRED_INTELLIGENCE_CATEGORIES) {
    const satisfied =
      category.key === 'positioning'
        ? Boolean(profile?.positioning_summary)
        : category.key === 'audience'
          ? Boolean(profile?.audience_summary)
          : category.key === 'primary_objective'
            ? Boolean(profile?.primary_objective)
            : hasBrandVoiceEntry(canonicalEntries);
    if (!satisfied) missing.push(category.label);
  }

  if (missing.length === 0) {
    return {
      status: 'FOUNDATION_WAIVED_WITH_CANONICAL_INTELLIGENCE',
      missing: [],
      satisfiedBy: 'CONTENT_BRAIN_CANONICAL_INTELLIGENCE',
      explanation:
        'Canonical brand intelligence already exists for this organization (positioning, audience, voice, objectives) — EVOLVE Foundation is not required.',
    };
  }

  return {
    status: 'FOUNDATION_REQUIRED',
    missing,
    satisfiedBy: 'NONE',
    explanation:
      missing.length === REQUIRED_INTELLIGENCE_CATEGORIES.length
        ? 'No canonical brand intelligence indexed yet — EVOLVE Foundation is required to activate this client.'
        : `Canonical intelligence is incomplete — still missing: ${missing.join(', ')}.`,
  };
}
