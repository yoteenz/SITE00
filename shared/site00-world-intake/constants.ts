/**
 * World-class client guest intake — methodology constants (brand-agnostic).
 */

export const WORLD_INTAKE_TYPE = 'WORLD_DISCOVERY' as const;

export const WORLD_INTAKE_METHODOLOGY_VERSION = 'WORLD_INTAKE_V1' as const;

export const WORLD_READINESS_PROFILE_VERSION = 1;

export const BUSINESS_OFFERING_MAP_VERSION = 1;

export const WORLD_INTELLIGENCE_SNAPSHOT_VERSION = 1;

export const PROJECT_EXPERIENCE_CLASSES = [
  'SITE',
  'APPLICATION',
  'IMMERSIVE_SITE',
  'WORLD',
  'UNRESOLVED',
] as const;

export type ProjectExperienceClass = (typeof PROJECT_EXPERIENCE_CLASSES)[number];

/** Admin UI maps IMMERSIVE → IMMERSIVE_SITE */
export const ADMIN_EXPERIENCE_AMBITIONS = [
  'SITE',
  'APPLICATION',
  'IMMERSIVE',
  'WORLD',
  'UNSURE',
] as const;

export type AdminExperienceAmbition = (typeof ADMIN_EXPERIENCE_AMBITIONS)[number];

export function adminAmbitionToExperienceClass(ambition: AdminExperienceAmbition): ProjectExperienceClass {
  if (ambition === 'IMMERSIVE') return 'IMMERSIVE_SITE';
  if (ambition === 'UNSURE') return 'UNRESOLVED';
  return ambition;
}

export const INTAKE_INVITE_STATUSES = [
  'CREATED',
  'ACTIVE',
  'STARTED',
  'COMPLETED',
  'EXPIRED',
  'REVOKED',
] as const;

export type IntakeInviteStatus = (typeof INTAKE_INVITE_STATUSES)[number];

export const WORLD_FORMATION_READINESS_STATES = [
  'WORLD_INTAKE_INCOMPLETE',
  'WORLD_INTAKE_PARTIAL',
  'WORLD_FORMATION_READY',
] as const;

export type WorldFormationReadinessState = (typeof WORLD_FORMATION_READINESS_STATES)[number];

export const FOUNDER_WORLD_HYPOTHESIS_CLASSIFICATION = 'FOUNDER_PROPOSED_CONCEPT' as const;

export const WORLD_INTAKE_SECTIONS = [
  'BUSINESS',
  'AUDIENCE',
  'OFFERINGS',
  'BRAND_LORE',
  'PERSONALITY',
  'EXPERIENCE',
  'CREATIVE_APPETITE',
  'WORLD_READINESS',
  'REVIEW',
] as const;

export type WorldIntakeSection = (typeof WORLD_INTAKE_SECTIONS)[number];

export const DEFAULT_INVITE_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export function worldIntakePublicBaseUrl(): string {
  const configured =
    process.env.SITE00_PUBLIC_INTAKE_BASE_URL?.trim() ||
    process.env.VITE_SITE00_CANONICAL_ORIGIN?.trim() ||
    process.env.VITE_API_BASE?.trim() ||
    'https://site00.com';
  return configured.replace(/\/$/, '');
}

export function worldIntakeGuestUrl(rawToken: string): string {
  return `${worldIntakePublicBaseUrl()}/intake/${rawToken}`;
}
