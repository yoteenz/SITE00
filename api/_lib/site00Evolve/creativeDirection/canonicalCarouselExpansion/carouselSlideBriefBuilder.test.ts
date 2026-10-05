/**
 * Carousel slide brief builder — ensures V2 compiler receives complete inputs.
 */

import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';
import { buildSharedCarouselTopicContext } from '../../../../../shared/site00-brand-lore/canonicalCarouselTopic.js';
import {
  buildDirectionCarouselWorldBible,
  deriveCarouselSlidePlan,
} from '../../../../../shared/site00-brand-lore/canonicalCarouselWorldBible.js';
import { compileIdentityNativeV2VisualBrief } from '../creativeIntelligence/identityNativeVisualBriefV2Compiler.js';
import {
  buildCarouselSlideArtDirection,
  buildCarouselSlideCreativeExpression,
  buildCarouselSlideHeroConcept,
  carouselSlideCopyQualityScores,
} from './carouselSlideBriefBuilder.js';

describe('carouselSlideBriefBuilder', () => {
  it('builds complete V2 brief for slide 02 without throwing', () => {
    const topic = buildSharedCarouselTopicContext();
    const cover = {
      comparisonIndex: 1,
      directionId: randomUUID(),
      directionName: CANONICAL_NDXBOOK_DIRECTION_NAMES[0]!,
      existingHeroStoragePath: 'site00/validation/ndxbook/canonical-creative-range/01/hero.webp',
      preservedAt: new Date().toISOString(),
    };
    const dna = {
      directionId: cover.directionId,
      canonicalName: cover.directionName,
      comparisonIndex: 1,
      centralThesis: 'Marked-up copy thesis',
      creativePremise: 'premise',
      personalityTranslation: 'assured voice',
      emotionalTerritory: 'curiosity',
      socialBehavior: 'reveal',
      contentBehavior: 'deepen',
      visualWorld: 'marked document world',
      visualGrammar: 'margin strike grammar',
      compositionLogic: 'editorial grid',
      typographicAttitude: 'UPPERCASE EDITORIAL',
      typographyRoleBehavior: 'display hierarchy',
      typographySelectionSource: 'direction',
      typographySelectionReason: 'native',
      typographyDerivedFromDirection: true,
      hostTypographyExcluded: true as const,
      palette: 'ink paper accent',
      dominantColor: 'INK',
      supportingColors: 'PAPER',
      accentColors: 'RED STRIKE',
      colorHierarchy: 'dominant secondary accent',
      colorBehavior: 'direction palette',
      paletteSource: 'direction',
      paletteReason: 'native',
      paletteDerivedFromDirection: true,
      materialLanguage: 'paper artifact',
      imageLanguage: 'editorial document',
      annotationLanguage: 'margin strike',
      motionLanguage: 'swipe',
      nativeFormat: 'CAROUSEL_SLIDE',
      nativeFormatBehavior: 'sequence',
      signatureDevices: ['STRIKE', 'MARGIN NOTE'],
      antiPatterns: ['generic template'],
      mustNotResemble: ['stock infographic'],
      personalityLineage: ['assured'],
      formatLineage: ['carousel'],
      directionLineage: [cover.directionName],
    };
    const worldBible = buildDirectionCarouselWorldBible({ cover, dna, topic });
    const slides = deriveCarouselSlidePlan({ cover, worldBible, dna, topic });
    const slide = slides.find((s) => s.slideNumber === 2)!;
    const direction = {
      comparisonIndex: 1,
      directionId: cover.directionId,
      directionName: cover.directionName,
      cover,
      worldBible,
      slides,
      dnaEnvelope: dna,
      compositionModesUsed: [],
      paletteRecognitionTest: 'NOT_EVALUATED' as const,
      founderVerdict: null,
      founderNote: null,
      rangeAnalysis: null,
    };

    const brief = compileIdentityNativeV2VisualBrief({
      artDirection: buildCarouselSlideArtDirection({ direction, slide }),
      creativeExpression: buildCarouselSlideCreativeExpression({ direction, slide }),
      heroConcept: buildCarouselSlideHeroConcept({ direction, slide, topic }),
      copyQualityScores: carouselSlideCopyQualityScores(),
      role: 'SOCIAL_APPLICATION_SUBSTRATE',
      topic: topic.topicName,
    });

    expect(brief.compiledPrompt.length).toBeGreaterThan(200);
    expect(brief.compiledPrompt).toContain('CREATIVE EXPRESSION LAYER');
    expect(brief.compiledPrompt.toLowerCase()).not.toContain('martian mono');
  });
});
