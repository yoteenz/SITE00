import type { BuildRecommendationLevel, FoundationBuildCredit } from './types.js';

/** General SITE 00 Builder entry (PR #1672 five-tab blueprint). Not the IDNTY foundation intake builder. */
export const FOUNDATION_BUILDER_DEEP_LINK_PATH = '/bldr/studio/blueprint';

export const FOUNDATION_BUILDER_HANDOFF_QUERY = 'dfHandoff';

export type FoundationBuildPathPreference = Extract<
  BuildRecommendationLevel,
  'SIMPLE_BUILD' | 'ADVANCED_BUILD' | 'CUSTOM_BUILD'
>;

export type FoundationBuilderHandoffRecord = {
  handoff_id: string;
  artifact_id: string;
  credit_id: string;
  build_path_preference: FoundationBuildPathPreference | null;
  created_at: string;
  expires_at: string;
  consumed_at: string | null;
  /** Builder intake or project id once the general builder consumes this handoff. */
  consumed_by: string | null;
};

export type FoundationCreditEligibility =
  | { ok: true; credit: FoundationBuildCredit }
  | { ok: false; code: 'NO_CREDIT' | 'CREDIT_NOT_AVAILABLE' | 'CREDIT_EXPIRED' | 'COMPLETION_REQUIRED' };

export function assessFoundationCreditEligibility(input: {
  completion_state: string;
  credit: FoundationBuildCredit | null;
  now?: Date;
}): FoundationCreditEligibility {
  if (input.completion_state !== 'COMPLETE') return { ok: false, code: 'COMPLETION_REQUIRED' };
  const credit = input.credit;
  if (!credit) return { ok: false, code: 'NO_CREDIT' };
  if (credit.status !== 'AVAILABLE') return { ok: false, code: 'CREDIT_NOT_AVAILABLE' };
  const now = input.now ?? new Date();
  if (new Date(credit.expires_at).getTime() < now.getTime()) return { ok: false, code: 'CREDIT_EXPIRED' };
  return { ok: true, credit };
}

export function buildFoundationBuilderDeepLink(handoffId: string, origin = ''): string {
  const base = origin.replace(/\/$/, '');
  const path = `${FOUNDATION_BUILDER_DEEP_LINK_PATH}?${FOUNDATION_BUILDER_HANDOFF_QUERY}=${encodeURIComponent(handoffId)}`;
  return base ? `${base}${path}` : path;
}

export function normalizeBuildPathPreference(
  value: unknown,
  fallback: BuildRecommendationLevel,
): FoundationBuildPathPreference | null {
  if (value === 'SIMPLE_BUILD' || value === 'ADVANCED_BUILD' || value === 'CUSTOM_BUILD') return value;
  if (fallback === 'SIMPLE_BUILD' || fallback === 'ADVANCED_BUILD' || fallback === 'CUSTOM_BUILD') return fallback;
  return null;
}
