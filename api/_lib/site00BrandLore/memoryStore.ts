/**
 * Brand Lore profile store — memory backend for tests; Supabase table when configured.
 */

import type { BrandLoreProfile } from '../../../shared/site00-brand-lore/types.js';

const profiles = new Map<string, BrandLoreProfile>();
const byIntake = new Map<string, string>();

export function resetBrandLoreMemoryStore(): void {
  profiles.clear();
  byIntake.clear();
}

export async function saveBrandLoreProfile(profile: BrandLoreProfile): Promise<BrandLoreProfile> {
  profiles.set(profile.id, { ...profile, updatedAt: new Date().toISOString() });
  if (profile.sourceIntakeId) {
    byIntake.set(`${profile.sourceIntakeType}:${profile.sourceIntakeId}`, profile.id);
  }
  return profiles.get(profile.id)!;
}

export async function getBrandLoreProfileById(id: string): Promise<BrandLoreProfile | null> {
  return profiles.get(id) ?? null;
}

export async function getBrandLoreProfileByIntake(
  intakeType: 'IDENTITY' | 'BUILDER',
  intakeId: string,
): Promise<BrandLoreProfile | null> {
  const pid = byIntake.get(`${intakeType}:${intakeId}`);
  if (!pid) return null;
  return profiles.get(pid) ?? null;
}

export async function confirmLoreField(
  profileId: string,
  fieldKey: keyof BrandLoreProfile,
): Promise<BrandLoreProfile | null> {
  const profile = profiles.get(profileId);
  if (!profile) return null;
  const field = profile[fieldKey];
  if (!field || typeof field !== 'object' || !('founderConfirmationState' in field)) return profile;
  (field as { founderConfirmationState: string }).founderConfirmationState = 'CONFIRMED';
  (field as { classification: string }).classification = 'FOUNDER_CONFIRMED';
  profile.updatedAt = new Date().toISOString();
  profiles.set(profileId, profile);
  return profile;
}
