/**
 * GENERATED FILE — do not hand-edit. Produced by scripts/site00-email-intake-assets/upload.mjs.
 * Public Supabase Storage URLs for the approved Intake Access email production assets
 * (see shared/site00-email/production/intake-access-manifest.ts for the full decomposition).
 * These are intentionally public URLs (public "live-preview" bucket, world-readable email assets) —
 * not secrets. pragma: allowlist secret
 */
export const INTAKE_ACCESS_ASSET_URLS = {
  builderBlueprintDesktop: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/derived/site00-email-intake-builder-blueprint-desktop.png", // pragma: allowlist secret
  builderBlueprintMobile: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/derived/site00-email-intake-builder-blueprint-mobile.png", // pragma: allowlist secret
  identityEvidenceDesktop: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/derived/site00-email-intake-identity-evidence-desktop.png", // pragma: allowlist secret
  identityEvidenceMobile: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/derived/site00-email-intake-identity-evidence-mobile.png", // pragma: allowlist secret
} as const;

/**
 * Production LINEAGE reference URLs (masters / isolation masters / composition masters) — not
 * consumed by the live email render (which only uses INTAKE_ACCESS_ASSET_URLS above), but kept
 * resolvable for the manifest's generationMaster/isolationMaster/compositionMaster metadata so
 * every stage of the reference->production pipeline stays independently inspectable.
 */
export const INTAKE_ACCESS_LINEAGE_URLS = {
  builderBlueprintMaster: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/master/site00-email-intake-builder-blueprint-master.png", // pragma: allowlist secret
  identityPortraitMaster: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/master/site00-email-intake-identity-portrait-master-v2.png", // pragma: allowlist secret
  identityArchivalNoteMaster: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/master/site00-email-intake-identity-archival-note-v3.png", // pragma: allowlist secret
  identityFingerprintMaster: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/master/site00-email-intake-identity-fingerprint-v3.png", // pragma: allowlist secret
  identitySealMaster: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/master/site00-email-intake-identity-seal-base.png", // pragma: allowlist secret
  identityArchivalNoteIsolated: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/isolation/site00-email-intake-identity-archival-note-isolated.png", // pragma: allowlist secret
  identityFingerprintIsolated: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/isolation/site00-email-intake-identity-fingerprint-isolated.png", // pragma: allowlist secret
  identitySealIsolated: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/isolation/site00-email-intake-identity-seal-isolated.png", // pragma: allowlist secret
  identityEvidenceDesktopCompositionMaster: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/composition/site00-email-intake-identity-evidence-desktop-composition-master.png", // pragma: allowlist secret
  identityEvidenceMobileCompositionMaster: "https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/site00/email/intake-access/composition/site00-email-intake-identity-evidence-mobile-composition-master.png", // pragma: allowlist secret
} as const;
