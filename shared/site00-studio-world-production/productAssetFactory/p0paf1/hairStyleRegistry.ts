/**
 * P0.PAF.1 — Frontal Slayer hair style registry.
 */

export type HairStyleEntry = {
  styleId: string;
  displayName: string;
  promptDescription: string;
  referenceAssets: string[];
  compatibleTextures: string[];
  compatibleLengths: string[];
  status: 'ACTIVE' | 'INACTIVE';
};

export const FRONTAL_SLAYER_HAIR_STYLE_REGISTRY: HairStyleEntry[] = [
  { styleId: 'straight', displayName: 'STRAIGHT', promptDescription: 'sleek straight styling', referenceAssets: [], compatibleTextures: ['straight'], compatibleLengths: ['16', '18', '20', '22', '24'], status: 'ACTIVE' },
  { styleId: 'body-wave', displayName: 'BODY WAVE', promptDescription: 'soft body wave pattern', referenceAssets: [], compatibleTextures: ['wavy'], compatibleLengths: ['18', '20', '22', '24'], status: 'ACTIVE' },
  { styleId: 'loose-wave', displayName: 'LOOSE WAVE', promptDescription: 'loose flowing waves', referenceAssets: [], compatibleTextures: ['wavy'], compatibleLengths: ['18', '20', '22', '24'], status: 'ACTIVE' },
  { styleId: 'deep-curl', displayName: 'DEEP CURL', promptDescription: 'defined deep curl pattern', referenceAssets: [], compatibleTextures: ['curly'], compatibleLengths: ['16', '18', '20'], status: 'ACTIVE' },
];

export const FRONTAL_SLAYER_TEXTURE_REGISTRY = [
  { textureId: 'straight', displayName: 'STRAIGHT', promptDescription: 'straight hair texture' },
  { textureId: 'wavy', displayName: 'WAVY', promptDescription: 'wavy hair texture' },
  { textureId: 'curly', displayName: 'CURLY', promptDescription: 'curly hair texture' },
] as const;

export const FRONTAL_SLAYER_PART_REGISTRY = [
  { partId: 'middle', displayName: 'MIDDLE PART', promptDescription: 'center middle part' },
  { partId: 'side', displayName: 'SIDE PART', promptDescription: 'side part' },
  { partId: 'free-part', displayName: 'FREE PART', promptDescription: 'versatile free part' },
] as const;

export const FRONTAL_SLAYER_LENGTH_REGISTRY = [
  { lengthId: '16', displayName: '16"', promptDescription: '16 inch length' },
  { lengthId: '18', displayName: '18"', promptDescription: '18 inch length' },
  { lengthId: '20', displayName: '20"', promptDescription: '20 inch length' },
  { lengthId: '22', displayName: '22"', promptDescription: '22 inch length' },
  { lengthId: '24', displayName: '24"', promptDescription: '24 inch length' },
] as const;

export const FRONTAL_SLAYER_FINISH_REGISTRY = [
  { finishId: 'natural', displayName: 'NATURAL', promptDescription: 'natural finish' },
  { finishId: 'silky', displayName: 'SILKY', promptDescription: 'silky high-shine finish' },
  { finishId: 'matte', displayName: 'MATTE', promptDescription: 'matte finish' },
] as const;

export function getActiveHairStyles(): HairStyleEntry[] {
  return FRONTAL_SLAYER_HAIR_STYLE_REGISTRY.filter((s) => s.status === 'ACTIVE');
}

export function getHairStyleById(styleId: string): HairStyleEntry | null {
  return FRONTAL_SLAYER_HAIR_STYLE_REGISTRY.find((s) => s.styleId === styleId) ?? null;
}

export function listHairStyleOptions(): { id: string; label: string }[] {
  return getActiveHairStyles().map((s) => ({ id: s.styleId, label: s.displayName }));
}
