/**
 * P0.R.1 — ASTRAL_WORLD_AVATAR_MASTER_CONTRACT
 * Canonical visual rules for curated + custom Astral World avatars.
 */

export const ASTRAL_WORLD_AVATAR_MASTER_CONTRACT = {
  contractId: 'ASTRAL_WORLD_AVATAR_MASTER_CONTRACT',
  version: 'v1',
  visualRules: [
    'cinematic editorial portrait',
    'contemporary real person elevated into Astral World',
    'warm believable presence',
    'Astral World lighting — midnight, amber, antique-gold atmosphere',
    'subtle destination relationship when contextually relevant',
    'realistic skin and material behavior',
    'strong facial clarity for small circular avatar crops',
    'clean silhouette compatible with scene character layers',
  ],
  avoid: [
    'stock photography',
    'corporate headshots',
    'fantasy cosplay and witch costume defaults',
    'RPG character art',
    'anime',
    'generic AI influencer faces',
    'overly perfect identical faces',
    'visible generated text or UI chrome',
    'tarot cosplay unless explicitly selected',
    'purple crystal aesthetic clichés',
  ],
  outputRequirements: {
    masterPortrait: { aspectRatio: '3:4', minWidth: 768 },
    profilePortrait: { aspectRatio: '1:1', minWidth: 512 },
    circleAvatar: { aspectRatio: '1:1', minWidth: 256, focalPoint: 'face_center' },
    sceneCutout: { aspectRatio: '2:3', transparentBackgroundPreferred: true },
  },
  customAvatarRules: [
    'recognizably based on supplied reference person',
    'translated into Astral World cinematic visual language',
    'do not dramatically modify identity',
    'no fantasy costuming unless user explicitly selects',
    'reference photos are generation inputs — not public profile images by default',
  ],
} as const;

export function compileAvatarLibraryPrompt(input: {
  avatarId: string;
  presentation: string;
  displayLabel: string;
  aestheticNotes?: string;
}): string {
  const c = ASTRAL_WORLD_AVATAR_MASTER_CONTRACT;
  return `Create a canonical Astral World inhabitant portrait for curated avatar library slot ${input.avatarId}.

Presentation: ${input.presentation}
Character note: ${input.aestheticNotes ?? input.displayLabel}

${c.visualRules.join('. ')}.

Contemporary person who belongs in ONE cohesive Astral World — not cosplay, not stock photo, not fantasy sorcerer.

${c.avoid.join('. ')}.

Output: editorial portrait, face-forward clarity, circular-crop safe, warm midnight-amber-gold atmosphere.`;
}

export function compileCustomAstralAvatarPrompt(input: {
  presentationPreferences?: string;
  destination?: string;
}): string {
  const c = ASTRAL_WORLD_AVATAR_MASTER_CONTRACT;
  return `Create a premium CUSTOM_ASTRAL_AVATAR for an Astral World Reader.

${c.customAvatarRules.join('. ')}.

Presentation preferences: ${input.presentationPreferences ?? 'Contemporary, warm, distinctive'}
Primary destination context: ${input.destination ?? 'Astréa district'}

${c.visualRules.join('. ')}.

${c.avoid.join('. ')}.`;
}
