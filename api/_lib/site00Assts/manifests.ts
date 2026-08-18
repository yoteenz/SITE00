import type { Site00BatchManifest } from './types.js';

/** Active environment production batch — canonical reference test. */
export const ACTIVE_ASSTS_ENV_BATCH_KEY = 'BATCH-ASSTS-ENV-003';
export const LEGACY_ASSTS_ENV_BATCH_KEY = 'BATCH-ASSTS-ENV-001';
export const VAULT_LINEAGE_ENV_BATCH_KEY = 'BATCH-ASSTS-ENV-002';

/** Shared REVIEW_ENVIRONMENT / ASSTS master — ONE canonical Asset Vault digital twin. */
export const ASSTS_MASTER_ENVIRONMENT_PROMPT = `CANONICAL SITE 00 ASSET VAULT — ONE physical virtual facility. Photorealistic luxury architectural visualization.

MONUMENTAL repeating rounded white marble arches. Extremely bright crisp white illumination — no gray cast, no beige/yellow lighting. White marble and pale stone construction. Polished reflective flooring with physically believable reflections. Deep symmetrical perspective. Subtle integrated architectural illumination. Transparent glass and acrylic details. Extremely restrained chrome/silver accents. Tiny controlled Site 00 red wayfinding accents only. Museum / archive / futuristic institutional quality. Monumental scale. Spatial depth. Immersive virtual-world quality.

NOT: normal office, retail store, generic gallery, residential interior, random white hallway, template website background, warehouse, server room, cyberpunk, gaming UI, sci-fi HUD, generic minimalism, random furniture, people.

Mobile vertical framing (~9:16). Environment photography ONLY.
NO text. NO typography. NO icons. NO buttons. NO cards. NO dashboard. NO navigation. NO labels. NO device frame. NO fake UI. NO fake thumbnails. NO watermark.`;

export const BATCH_ASSTS_ENV_001: Site00BatchManifest = {
  batchKey: LEGACY_ASSTS_ENV_BATCH_KEY,
  displayName: 'ASSTS / MOBILE ENVIRONMENTS (LEGACY)',
  description: 'Superseded — generic interiors. See BATCH-ASSTS-ENV-002.',
  category: 'ASSTS / REVIEW ENVIRONMENT',
  masterPrompt: ASSTS_MASTER_ENVIRONMENT_PROMPT,
  promptVersion: 'v1.1',
  aspectRatio: '9:16',
  outputFormat: 'webp',
  model: 'fal-ai/nano-banana-pro',
  assets: [
    {
      assetKey: 's00_env_assts_library_mobile',
      displayName: 'ASSTS / LIBRARY',
      semanticSlotKey: 'assts.library.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.library',
      environmentRole: 'library',
      environmentRoleLabel: 'LIBRARY',
      environmentRoleSublabel: 'VAULT ENTRANCE',
      generationOrder: 1,
      compositionPrompt: `Legacy batch — superseded by ENV-002.`,
      required: true,
      variant: 'mobile',
      view: 'library',
    },
    {
      assetKey: 's00_env_assts_batch_mobile',
      displayName: 'ASSTS / BATCH REVIEW',
      semanticSlotKey: 'assts.batch.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.batchReview',
      environmentRole: 'batchReview',
      environmentRoleLabel: 'BATCH REVIEW',
      environmentRoleSublabel: 'PRODUCTION GALLERY',
      generationOrder: 2,
      requiresVaultReference: true,
      compositionPrompt: `Legacy batch — superseded by ENV-002.`,
      required: true,
      variant: 'mobile',
      view: 'batch',
    },
    {
      assetKey: 's00_env_assts_inspection_mobile',
      displayName: 'ASSTS / ASSET INSPECTION',
      semanticSlotKey: 'assts.inspection.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.inspection',
      environmentRole: 'inspection',
      environmentRoleLabel: 'ASSET INSPECTION',
      environmentRoleSublabel: 'INSPECTION CHAMBER',
      generationOrder: 3,
      requiresVaultReference: true,
      compositionPrompt: `Legacy batch — superseded by ENV-002.`,
      required: true,
      variant: 'mobile',
      view: 'inspection',
    },
  ],
};

export const BATCH_ASSTS_ENV_002: Site00BatchManifest = {
  batchKey: VAULT_LINEAGE_ENV_BATCH_KEY,
  displayName: 'ASSTS / MOBILE ENVIRONMENTS (VAULT LINEAGE v2)',
  description: 'Canonical Asset Vault digital twin — monumental arch lineage with reference-conditioned child zones.',
  category: 'ASSTS / REVIEW ENVIRONMENT',
  masterPrompt: ASSTS_MASTER_ENVIRONMENT_PROMPT,
  promptVersion: 'v2.0',
  aspectRatio: '9:16',
  outputFormat: 'webp',
  model: 'fal-ai/nano-banana-pro',
  useVaultLineage: true,
  forceNewVersion: true,
  replacementBatch: true,
  assets: [
    {
      assetKey: 's00_env_assts_library_mobile',
      displayName: 'ASSTS / LIBRARY',
      semanticSlotKey: 'assts.library.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.library',
      environmentRole: 'library',
      environmentRoleLabel: 'LIBRARY',
      environmentRoleSublabel: 'VAULT ENTRANCE',
      generationOrder: 1,
      compositionPrompt: `ENVIRONMENT 01 — VAULT ENTRANCE / LIBRARY (MASTER).
Vertical mobile 9:16. Viewer on the monumental entrance axis. Strong symmetrical central perspective. Architecture extends deeply.
Breathtaking sequence of repeating monumental white marble rounded arches forming a futuristic archival corridor. Large sculptural side bays suggest assets and collections throughout the architecture.
Establish the CANONICAL Asset Vault architecture — this image is the master reference for all other Asset Vault zones.
UI-safe breathing room in upper title, metric, review, and dock regions — do NOT place critical architecture under persistent UI zones.`,
      required: true,
      variant: 'mobile',
      view: 'library',
    },
    {
      assetKey: 's00_env_assts_batch_mobile',
      displayName: 'ASSTS / BATCH REVIEW',
      semanticSlotKey: 'assts.batch.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.batchReview',
      environmentRole: 'batchReview',
      environmentRoleLabel: 'BATCH REVIEW',
      environmentRoleSublabel: 'PRODUCTION GALLERY',
      generationOrder: 2,
      requiresVaultReference: true,
      compositionPrompt: `ENVIRONMENT 02 — PRODUCTION GALLERY / BATCH REVIEW.
Camera traveled deeper into the SAME Asset Vault — identical marble arch language and materials.
Production gallery with architectural display bays and illuminated archival niches. Generated assets are organized and reviewed here.
Recessed illuminated display bays, glass/acrylic presentation architecture, repeating vault modules, controlled red status illumination, deep perspective, same polished reflective marble floor.
Central image-safe wall region for a two-column asset grid — NO drawn assets or cards.`,
      required: true,
      variant: 'mobile',
      view: 'batch',
    },
    {
      assetKey: 's00_env_assts_inspection_mobile',
      displayName: 'ASSTS / ASSET INSPECTION',
      semanticSlotKey: 'assts.inspection.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.inspection',
      environmentRole: 'inspection',
      environmentRoleLabel: 'ASSET INSPECTION',
      environmentRoleSublabel: 'INSPECTION CHAMBER',
      generationOrder: 3,
      requiresVaultReference: true,
      compositionPrompt: `ENVIRONMENT 03 — INSPECTION CHAMBER.
Continue deeper into the SAME Asset Vault. Quieter, more focused, unmistakably the same facility.
Monumental centered inspection bay. Sculptural marble framing. Transparent glass/acrylic presentation enclosure. Subtle integrated lighting. Strong central composition. Controlled architectural red accents. Polished reflective floor.
High-end futuristic museum inspection chamber — object will be placed by the application. Do NOT permanently render an asset inside.`,
      required: true,
      variant: 'mobile',
      view: 'inspection',
    },
  ],
};

export const BATCH_ASSTS_ENV_003: Site00BatchManifest = {
  batchKey: ACTIVE_ASSTS_ENV_BATCH_KEY,
  displayName: 'ASSTS / MOBILE ENVIRONMENTS (CANONICAL REF v3)',
  description: 'Canonical-reference-conditioned derivatives — founder master PNG as world source.',
  category: 'ASSTS / REVIEW ENVIRONMENT',
  masterPrompt: `CANONICAL REFERENCE ENVIRONMENT DERIVATIVE — controlled camera view of the SAME Asset Vault.`,
  promptVersion: 'v3.0',
  aspectRatio: '9:16',
  outputFormat: 'webp',
  model: 'fal-ai/nano-banana-pro/edit',
  useCanonicalReference: true,
  worldIdentity: 'ASSTS_ASSET_VAULT_V1',
  forceNewVersion: true,
  replacementBatch: true,
  assets: [
    {
      assetKey: 's00_env_assts_library_mobile',
      displayName: 'ASSTS / LIBRARY',
      semanticSlotKey: 'assts.library.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.library',
      environmentRole: 'library',
      environmentRoleLabel: 'LIBRARY',
      environmentRoleSublabel: 'VAULT ENTRANCE',
      viewType: 'libraryHero',
      generationOrder: 1,
      requiresCanonicalReference: true,
      compositionPrompt: `LIBRARY HERO — preserve the canonical master almost exactly.
Centered perfect one-point perspective. Eye-level architectural camera. Large foreground central arch. Long sequence of nested illuminated arches toward the bright central vanishing point. Left and right display bays visible. Circular luminous ceiling feature partially visible above. Reflective marble floor extending toward camera.
Closest match to the canonical master — same composition, not a reinterpretation. UI-safe breathing room in upper regions.`,
      required: true,
      variant: 'mobile',
      view: 'library',
    },
    {
      assetKey: 's00_env_assts_batch_mobile',
      displayName: 'ASSTS / BATCH REVIEW',
      semanticSlotKey: 'assts.batch.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.batchReview',
      environmentRole: 'batchReview',
      environmentRoleLabel: 'BATCH REVIEW',
      environmentRoleSublabel: 'PRODUCTION GALLERY',
      viewType: 'batchReview',
      generationOrder: 2,
      requiresCanonicalReference: true,
      compositionPrompt: `BATCH REVIEW — camera moved several steps FORWARD into the SAME corridor on the exact central axis.
Maintain nested arches, same marble, same lighting, same ceiling system, same niches, same red alignment markers, same proportions. Slightly more immersive foreground — physically deeper inside the Vault. NOT a new room.`,
      required: true,
      variant: 'mobile',
      view: 'batch',
    },
    {
      assetKey: 's00_env_assts_inspection_mobile',
      displayName: 'ASSTS / ASSET INSPECTION',
      semanticSlotKey: 'assts.inspection.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.inspection',
      environmentRole: 'inspection',
      environmentRoleLabel: 'ASSET INSPECTION',
      environmentRoleSublabel: 'INSPECTION CHAMBER',
      viewType: 'inspectionBay',
      generationOrder: 3,
      requiresCanonicalReference: true,
      compositionPrompt: `ASSET INSPECTION — remain inside the SAME Asset Vault. Shift camera subtly toward ONE recessed display niche while retaining enough central corridor for spatial orientation.
"I walked down the Vault and approached one inspection/display bay." Display architecture derives from canonical side niches. NOT a circular room, glass office, or different gallery.`,
      required: true,
      variant: 'mobile',
      view: 'inspection',
    },
  ],
};

export function getBatchManifestByKey(batchKey: string): Site00BatchManifest | null {
  if (batchKey === BATCH_ASSTS_ENV_003.batchKey) return BATCH_ASSTS_ENV_003;
  if (batchKey === BATCH_ASSTS_ENV_002.batchKey) return BATCH_ASSTS_ENV_002;
  if (batchKey === BATCH_ASSTS_ENV_001.batchKey) return BATCH_ASSTS_ENV_001;
  return null;
}

export function getActiveAsstsEnvBatchKey(): string {
  return ACTIVE_ASSTS_ENV_BATCH_KEY;
}
