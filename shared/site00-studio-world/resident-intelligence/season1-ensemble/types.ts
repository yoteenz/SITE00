/**
 * Production-facing projection of FSBW Studio World Season 1 Core Ensemble canon.
 * SITE00 is not authoritative over resident identity — see sourceAuthority on each dossier.
 */

export type ResidentSourceAuthority = {
  repo: 'fsbw';
  canon: 'STUDIO_WORLD_SEASON1_CORE_ENSEMBLE';
  residentId: string;
  version: 'season1-v1';
  /** Originating paths on FSBW (reference only — not vendored in SITE00). */
  fsbwPaths: readonly string[];
};

export type ResidentCastingEligibility = 'AVAILABLE' | 'LIMITED' | 'ROLE_RESTRICTED' | 'UNAVAILABLE' | 'UNSET';

export type ProtectedOpenField =
  | 'evSexuality'
  | 'evPartner'
  | 'marloweHusbandIdentity'
  | 'zuriPartnerIdentity'
  | 'noaFamilyIdentities'
  | 'ionaFutureRelationship'
  | 'ettaCurrentPartner'
  | 'caspianCurrentPartner';

export type StudioWorldResidentDossier = {
  sourceResidentId: string;
  sourceSystem: 'STUDIO_WORLD';
  canonicalName: string;
  aliases: readonly string[];
  studioWorldRole: string;
  productionCapabilities: readonly string[];
  personalitySummary: string;
  visualIdentitySummary: string;
  naturalWardrobeSummary: string;
  cameraBehavior: string;
  castingNotes: string;
  identityConstraints: readonly string[];
  antiFlatteningRules: readonly string[];
  protectedOpenFields: readonly ProtectedOpenField[];
  canonVersion: 'season1-v1';
  sourceAuthority: ResidentSourceAuthority;
  /** Astrology / identity context (production intelligence — not cast-role mutable). */
  sunSign: string;
  moonSign: string;
  risingSign: string;
  presentation: 'WOMAN' | 'MAN' | 'NONBINARY';
  agePresentation?: string;
  sexuality?: string;
  culturalContext?: readonly string[];
  castingEligibility: ResidentCastingEligibility;
  /** Optional visual asset hooks — null = pending, never substitute generic stock. */
  visualAssetManifestRef: string | null;
};

export type ResidentRelationshipEdge = {
  id: string;
  fromResidentId: string;
  toResidentId: string;
  label: string;
  productionNote: string;
};
