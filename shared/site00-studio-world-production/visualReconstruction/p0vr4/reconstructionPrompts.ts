/**
 * P0.VR.4 — Canonical reconstruction prompts + type-specific variants.
 */

import type { DesignReconstructionAssetType } from './types.js';

export const RECONSTRUCTION_PROMPT_VERSION = 1;

const TYPE_LABELS: Record<DesignReconstructionAssetType, string> = {
  ICON: 'ICON',
  NAV_ICON: 'NAV ICON',
  HERO_OBJECT: 'OBJECT',
  DECORATIVE_OBJECT: 'OBJECT',
  PROJECT_VISUAL: 'PROJECT VISUAL',
  ILLUSTRATION: 'ILLUSTRATION',
  LOGO_MARK: 'LOGO MARK',
  BADGE: 'BADGE',
  TEXTURE: 'TEXTURE',
  BACKGROUND_ELEMENT: 'OBJECT',
  PRODUCT_VISUAL: 'PRODUCT VISUAL',
  OTHER: 'OBJECT',
};

export function buildCanonicalReconstructionPrompt(assetType: DesignReconstructionAssetType): string {
  const label = TYPE_LABELS[assetType];
  const base = [
    `RECREATE THIS ${label} BY ITSELF.`,
    '',
    'THE PROVIDED REFERENCE CROP IS THE DESIGN AUTHORITY.',
    '',
    'PRESERVE THE EXACT:',
    '- VISUAL DESIGN',
    '- SILHOUETTE',
    '- PROPORTIONS',
    '- MATERIALS',
    '- COLOR',
    '- LIGHTING',
    '- ORIENTATION',
    '- GEOMETRY',
    '- DETAIL',
    '- VISUAL WEIGHT',
    '',
    'REMOVE ALL SURROUNDING UI.',
    'REMOVE ALL TEXT UNLESS TEXT IS INTRINSIC TO THE ASSET.',
    'DO NOT REDESIGN THE OBJECT.',
    'DO NOT ADD NEW OBJECTS.',
    'NO SCENE.',
    'NO CARD.',
    'NO DEVICE MOCKUP.',
    'NO DECORATIVE BACKDROP.',
    '',
    'OUTPUT ONLY THE RECREATED ASSET.',
    '',
    'PREFER A TRANSPARENT BACKGROUND.',
  ].join('\n');

  return `${base}\n\n${buildTypeSpecificPromptVariant(assetType)}`.trim();
}

export function buildTypeSpecificPromptVariant(assetType: DesignReconstructionAssetType): string {
  switch (assetType) {
    case 'ICON':
      return 'GENERATE THIS ICON BY ITSELF WITH NO BACKGROUND.';
    case 'NAV_ICON':
      return 'PRESERVE SIMPLE SCALE LEGIBILITY AND EDGE CLEANLINESS.';
    case 'HERO_OBJECT':
      return 'PRESERVE CINEMATIC MATERIALS, LIGHTING, DEPTH, AND 3D FORM.';
    case 'LOGO_MARK':
      return 'PRESERVE LOGO GEOMETRY EXACTLY. DO NOT RESTYLE.';
    case 'PROJECT_VISUAL':
      return 'PRESERVE THE PROJECT-SPECIFIC IDENTITY WHILE ISOLATING THE OBJECT.';
    default:
      return '';
  }
}

export function buildTargetedRevisionPrompt(params: {
  diagnosis: string;
  assetType: DesignReconstructionAssetType;
}): string {
  const label = TYPE_LABELS[params.assetType];
  return [
    `KEEP THE CURRENT ${label} BUT CORRECT ONLY: ${params.diagnosis.toUpperCase()}.`,
    'DO NOT RANDOMLY REGENERATE THE WHOLE OBJECT.',
    'MATCH THE REFERENCE CROP EXACTLY FOR THE CORRECTED ATTRIBUTE.',
    buildTypeSpecificPromptVariant(params.assetType),
  ]
    .filter(Boolean)
    .join('\n');
}

export function promptIncludesNoBackgroundInstruction(prompt: string): boolean {
  return (
    prompt.includes('NO BACKGROUND') ||
    prompt.includes('TRANSPARENT BACKGROUND') ||
    prompt.includes('WITH NO BACKGROUND')
  );
}
