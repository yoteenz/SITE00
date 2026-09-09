/**
 * BrandExpressionFingerprint — expand BrandLanguageIdentity.
 */

import type { BrandLanguageIdentity } from '../../../../shared/site00-expression-engine/brand-language/types.js';
import type { BrandExpressionFingerprint } from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';
import { deriveBrandLanguageIdentity } from '../brandLanguage/brandLanguageIdentity.js';

export function buildBrandExpressionFingerprint(brandId: string): BrandExpressionFingerprint {
  const identity = deriveBrandLanguageIdentity({ brandId, brandName: brandId.replace(/-/g, ' ').toUpperCase() });
  const isNdx = brandId === 'ndxbook';
  return {
    brandId,
    syntax: identity.sentenceRhythm,
    sentenceLength: identity.sentenceLength,
    humorStyle: identity.humorStyle,
    abstractionTolerance: isNdx ? 'high editorial abstraction' : identity.mysteryLevel === 'high' ? 'moderate' : 'concrete',
    visualDensity: isNdx ? 'editorial sparse with receipt objects' : 'brand-typical',
    emotionalTemperature: identity.emotionalTemperature,
    culturalPosture: identity.socialPosture,
    metaphorPreference: isNdx ? 'cultural mechanism metaphors' : 'literal-diagnostic',
    pacing: isNdx ? 'slow reveal with interjection punch' : 'conversational beats',
    directness: identity.directness,
    wit: identity.witStyle,
    polarizationTolerance: isNdx ? 'moderate-high' : 'low-moderate',
    rawness: isNdx ? 'editorial rawness allowed' : identity.earnestness,
    specificity: isNdx ? 'high cultural specificity' : 'accessible specificity',
    tabooLanguage: identity.forbiddenLanguage ?? [],
    forbiddenCliches: identity.antiBrandPhrases ?? [],
    favoredMaterials: identity.signatureLanguage ?? [],
    imageGrammar: isNdx ? 'threshold, receipt, mirror, door' : 'product-truth, confession, leaf',
    compositionBehavior: isNdx ? 'spatial zoning reveals' : 'diagnostic framing',
    motionBehavior: isNdx ? 'camera discovers complicity' : 'gentle instructional motion',
    interjectionBehavior: isNdx ? 'compressed editorial indictment' : 'confessional question',
    copyRhythm: identity.rhetoricalSignature?.description ?? identity.sentenceRhythm,
    whatTheBrandWouldNeverDo: [
      ...(identity.antiBrandPhrases ?? []),
      ...(isNdx ? [] : ['cultural receipt rhetoric', 'NDX interjection grammar']),
    ],
    sourceIdentity: identity,
  };
}
