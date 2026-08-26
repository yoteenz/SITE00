/**
 * P0.R.1 — Astral World reader account + canonical avatar identity types.
 */

import type { DestinationSlug, ReaderPresenceState } from '../types.js';

export const ASTRAL_ACCOUNT_ROLES = ['SEEKER', 'READER'] as const;
export type AstralAccountRole = (typeof ASTRAL_ACCOUNT_ROLES)[number];

export const READER_ONBOARDING_STEPS = [
  'WELCOME',
  'IDENTITY',
  'SPECIALTIES',
  'DESTINATION',
  'AVATAR',
  'AVAILABILITY',
  'CLIENT_CONNECTIONS',
  'PROFILE_PREVIEW',
  'COMPLETE',
] as const;
export type ReaderOnboardingStep = (typeof READER_ONBOARDING_STEPS)[number];

export const READER_SPECIALTY_IDS = [
  'TAROT',
  'LOVE',
  'CAREER',
  'INTUITIVE',
  'ENERGY',
  'SPIRIT_GUIDE',
  'LIFE_PATH',
  'CLARITY',
] as const;
export type ReaderSpecialtyId = (typeof READER_SPECIALTY_IDS)[number];

export const CUSTOM_AVATAR_ENTITLEMENT_STATES = [
  'NOT_PURCHASED',
  'PURCHASED',
  'GENERATION_PENDING',
  'READY_FOR_SELECTION',
  'ACTIVE',
  'REGENERATION_PURCHASE_REQUIRED',
] as const;
export type CustomAvatarEntitlementState = (typeof CUSTOM_AVATAR_ENTITLEMENT_STATES)[number];

export const AVATAR_LIBRARY_APPROVAL_STATES = [
  'PENDING_GENERATION',
  'GENERATED',
  'FOUNDER_REVIEW',
  'APPROVED_LIBRARY_ASSET',
  'ASSIGNED',
  'RETIRED',
] as const;
export type AvatarLibraryApprovalState = (typeof AVATAR_LIBRARY_APPROVAL_STATES)[number];

export const CUSTOM_AVATAR_GENERATION_STATES = [
  'GENERATED',
  'READY_FOR_USER_SELECTION',
  'SELECTED',
  'ACTIVE',
  'SUPERSEDED',
] as const;
export type CustomAvatarGenerationState = (typeof CUSTOM_AVATAR_GENERATION_STATES)[number];

export const AVATAR_DERIVATIVE_KINDS = [
  'AVATAR_PORTRAIT',
  'AVATAR_THUMBNAIL',
  'AVATAR_SCENE_CUTOUT',
  'AVATAR_SCENE_SEATED',
  'AVATAR_SCENE_STANDING',
] as const;
export type AvatarDerivativeKind = (typeof AVATAR_DERIVATIVE_KINDS)[number];

export type ReaderAlertPreferenceKey =
  | 'CLIENT_ENTERED_WORLD'
  | 'CLIENT_ENTERED_DESTINATION'
  | 'CLIENT_REQUESTED_ME'
  | 'NEW_READING_REQUEST'
  | 'NEW_FAVORITE_FOLLOW'
  | 'TABLE_INVITATION';

export type ReaderAlertPreferences = Record<ReaderAlertPreferenceKey, boolean>;

export type CanonicalAvatarRecord = {
  avatarId: string;
  projectId: 'astral-world';
  presentation: 'feminine' | 'masculine' | 'androgynous';
  displayLabel: string;
  masterAssetSlot: string;
  portraitAssetSlot: string;
  thumbnailAssetSlot: string;
  circleSafeCrop: { xPercent: number; yPercent: number; sizePercent: number };
  approvalState: AvatarLibraryApprovalState;
  promptVersion: string;
  assignedUserId: string | null;
  version: number;
  pilotBatch?: boolean;
};

export type ReaderAccountProfile = {
  readerId: string;
  userId: string;
  accountRole: 'READER';
  displayName: string;
  introduction: string;
  experienceNotes: string;
  specialties: ReaderSpecialtyId[];
  primaryDestination: DestinationSlug;
  avatarId: string | null;
  customAvatarId: string | null;
  customAvatarEntitlement: CustomAvatarEntitlementState;
  presence: ReaderPresenceState;
  currentDestination: DestinationSlug | null;
  currentRoomId: string | null;
  onboardingStep: ReaderOnboardingStep;
  onboardingComplete: boolean;
  alertPreferences: ReaderAlertPreferences;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomAvatarGenerationRecord = {
  customAvatarId: string;
  userId: string;
  readerId: string;
  entitlementState: CustomAvatarEntitlementState;
  generationState: CustomAvatarGenerationState;
  referenceImageStoragePath: string | null;
  referenceImageIsPrivate: boolean;
  presentationPreferences: string | null;
  promptVersion: string;
  model: string | null;
  provider: string | null;
  requestId: string | null;
  candidateAssetUrls: string[];
  selectedCandidateIndex: number | null;
  activeAvatarId: string | null;
  regenerationCreditsRemaining: number;
  costMetadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type ResolvedAvatarAssets = {
  avatarId: string;
  portraitUrl: string | null;
  thumbnailUrl: string | null;
  circleStyle: {
    backgroundImage?: string;
    backgroundPosition?: string;
    backgroundSize?: string;
    backgroundRepeat?: 'no-repeat';
  } | null;
  sceneCutoutSlot: string | null;
  source: 'LIBRARY' | 'CUSTOM' | 'FAL_ACTIVE' | 'ISOLATED_REFERENCE' | 'INITIALS';
};
