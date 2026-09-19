/**
 * P0.CGO.1 — Product-body relationship mapping.
 */

import type { ProductBodyRelationship, ProductCategory } from './types.js';

const RELATIONSHIPS: Record<ProductCategory, ProductBodyRelationship> = {
  JEWELRY: {
    productCategory: 'JEWELRY',
    bodySurfaces: ['FINGERS', 'WRISTS', 'NECK', 'EARS', 'HANDS'],
    interactionModes: ['GESTURE', 'TOUCH', 'STACKING', 'ADJUSTING', 'GAMEPLAY'],
    ritualContexts: ['GETTING READY', 'MIRROR CHECK', 'SOCIAL REVEAL', 'RISK MOMENT'],
  },
  HAIR: {
    productCategory: 'HAIR',
    bodySurfaces: ['HEAD', 'HAIRLINE', 'MOVEMENT', 'SILHOUETTE', 'REFLECTION'],
    interactionModes: ['STYLING', 'MOTION', 'WIND', 'TOUCH', 'TRANSFORMATION'],
    ritualContexts: ['MORNING ROUTINE', 'PRE-EVENT', 'STREET MOMENT', 'STUDIO PREP'],
  },
  FRAGRANCE: {
    productCategory: 'FRAGRANCE',
    bodySurfaces: ['WRIST', 'NECK', 'HAND', 'COLLARBONE'],
    interactionModes: ['APPLICATION', 'INHALATION', 'VANITY RITUAL', 'GIFTING'],
    ritualContexts: ['VANITY TABLE', 'DEPARTURE', 'INTIMATE MOMENT', 'TRAVEL'],
  },
  FASHION: {
    productCategory: 'FASHION',
    bodySurfaces: ['FULL BODY', 'MOVEMENT', 'SILHOUETTE', 'TEXTURE ON SKIN'],
    interactionModes: ['WALKING', 'SITTING', 'LAYERING', 'ADJUSTING', 'ENVIRONMENT INTERACTION'],
    ritualContexts: ['STREET', 'EVENT', 'TRAVEL', 'WORKSPACE'],
  },
  GENERAL: {
    productCategory: 'GENERAL',
    bodySurfaces: ['HANDS', 'FACE', 'FULL BODY'],
    interactionModes: ['USE', 'DISCOVERY', 'RITUAL'],
    ritualContexts: ['DAILY ROUTINE', 'SOCIAL', 'WORK'],
  },
};

export function resolveProductBodyRelationship(category: ProductCategory): ProductBodyRelationship {
  return RELATIONSHIPS[category];
}
