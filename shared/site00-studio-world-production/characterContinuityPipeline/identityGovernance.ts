/**
 * P0.5E.5 — Identity anchors + variation + negative constraints.
 */

import { randomUUID } from 'node:crypto';
import type {
  CharacterIdentityAnchor,
  CharacterVariationRule,
  NegativeIdentityConstraint,
  VariationClass,
} from './types.js';
import type { AnchorClass } from './types.js';
import { ANCHOR_CLASSES, NEGATIVE_CONSTRAINT_CATEGORIES } from './constants.js';

export function buildEmptyIdentityAnchor(anchorClass: AnchorClass): CharacterIdentityAnchor {
  return {
    anchorId: randomUUID(),
    anchorClass,
    description: 'NOT_APPROVED — awaiting cast',
    authority: 'NOT_APPROVED',
    variability: 'LOCKED',
    mustPreserve: anchorClass === 'FACE_GEOMETRY' || anchorClass === 'SKIN_CHARACTERISTICS',
    providerImportance: anchorClass === 'FACE_GEOMETRY' ? 'HIGH' : 'MEDIUM',
    referenceIds: [],
    confidence: 'UNSET',
  };
}

export function buildDefaultIdentityAnchors(): CharacterIdentityAnchor[] {
  return ANCHOR_CLASSES.map(buildEmptyIdentityAnchor);
}

export function buildVariationRule(target: string, variationClass: VariationClass, rationale: string): CharacterVariationRule {
  return { ruleId: randomUUID(), target, variationClass, rationale };
}

export function buildNegativeConstraint(
  category: (typeof NEGATIVE_CONSTRAINT_CATEGORIES)[number],
  description: string,
): NegativeIdentityConstraint {
  return {
    constraintId: randomUUID(),
    category,
    description,
    compileToNegativePrompt: true,
  };
}

export function buildDefaultNegativeConstraints(): NegativeIdentityConstraint[] {
  return [
    buildNegativeConstraint('FACE_DRIFT', 'Face must not drift from approved identity anchors'),
    buildNegativeConstraint('INFLUENCER_COLLAPSE', 'No generic influencer presentation'),
    buildNegativeConstraint('GENERIC_AI_HOST', 'No AI presenter/host energy'),
  ];
}
