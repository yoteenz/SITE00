/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-FOUNDER-REVIEW-UX-REFINEMENT1
 */

import { describe, expect, it } from 'vitest';

import { buildCgptBriefDigest, buildFounderJourneyRail, buildFounderSummaryMetrics, containsLegacyFounderTerminology, livePromotionVisible, resolveFounderFooterCtaHint, resolveFounderFooterPhase } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderReviewPresentation.js';
import { pageConceptFounderNoticeDisplay } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderNotice.js';
import { buildGpt2MobileSlotPresentations } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import { pageConceptPostRunPrimaryAction, buildPageConceptPostRunActions } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPostRunControls.js';
import type { PageConceptCgptCreativeBrief, PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const brief: PageConceptCgptCreativeBrief = {
  briefId: 'b1',
  version: 'v1',
  contentHash: 'hash',
  projectId: 'p',
  pageId: 'page',
  injectionId: 'inj',
  creativePremise: 'Premise line that should appear in digest.',
  pagePurpose: 'Purpose',
  audienceIntent: 'Audience',
  pageStory: 'Story line for the page.',
  identitySignals: [],
  brandSignals: [],
  skinSignals: [],
  compositionStrategy: 'Comp',
  hierarchyStrategy: 'Hier',
  typographyStrategy: 'Type',
  colorStrategy: 'Color',
  materialStrategy: 'Mat',
  imageryStrategy: 'Imagery',
  interactionCharacter: 'Calm',
  visualTerritory: 'Territory',
  imageStrategy: 'Img',
  pageSurprise: 'Surprise',
  mobileDirection: 'Mobile dir',
  desktopDirection: 'Desktop dir',
  mandatoryBrandSignals: [],
  keyMessages: [],
  requiredContent: [],
  functionalRequirements: ['Fn'],
  creativeLatitude: 'Lat',
  distinctiveMove: 'Distinct move.',
  avoidList: ['Avoid'],
  currentImplementationRole: 'FUNCTIONAL_REFERENCE_ONLY',
  aestheticAuthorityFromCapture: 'NO',
  sourceLineage: {},
  sectionSources: [],
  createdAt: new Date().toISOString(),
};

function canonicalState(partial: Partial<PageConceptGenerationState>): PageConceptGenerationState {
  return {
    projectId: 'ndxbook',
    pageId: 'overview',
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    generationJobs: [],
    pipelineSet: {
      pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
      creativeInjection: { injectionId: 'inj' } as never,
      mobileConcepts: [
        { conceptId: 'c1', slot: 'MOBILE_CONCEPT_A', artifactId: 'a1', imageUri: '/a.png', status: 'READY', createdAt: '' },
        { conceptId: 'c2', slot: 'MOBILE_CONCEPT_B', artifactId: 'a2', imageUri: '/b.png', status: 'READY', createdAt: '' },
        { conceptId: 'c3', slot: 'MOBILE_CONCEPT_C', artifactId: 'a3', imageUri: '/c.png', status: 'READY', createdAt: '' },
      ],
    } as never,
    ...partial,
  } as PageConceptGenerationState;
}

describe('P0.VR.PAGE-CONCEPT-GENERATOR-FOUNDER-REVIEW-UX-REFINEMENT1', () => {
  it('CGPT digest has four excerpts not full brief rows', () => {
    const digest = buildCgptBriefDigest(brief);
    expect(digest.length).toBeLessThanOrEqual(4);
    expect(digest.some((d) => d.label === 'CREATIVE PREMISE')).toBe(true);
    expect(digest.every((d) => d.excerpt.length < brief.creativePremise.length + 200)).toBe(true);
  });

  it('RUN_NOT_FOUND is founder-readable with secondary technical code', () => {
    const d = pageConceptFounderNoticeDisplay('RUN_NOT_FOUND');
    expect(d.headline).toContain('COULD NOT BE RESTORED');
    expect(d.technicalCode).toBe('RUN_NOT_FOUND');
  });

  it('founder journey rail has five grouped steps', () => {
    const rail = buildFounderJourneyRail(canonicalState({}));
    expect(rail).toHaveLength(5);
    expect(rail.map((s) => s.id)).toEqual(['CREATIVE', 'CONCEPT', 'AUTHORITY', 'TWIN', 'PROMOTE']);
  });

  it('mobile slot presentations include gpt2 meta for inspect drawer', () => {
    const state = canonicalState({
      generationJobs: [
        {
          provider: 'GPT2_MOBILE',
          viewport: 'MOBILE',
          renditionSlot: 'RENDITION_A',
          status: 'READY',
          artifactId: 'a1',
          imageUri: '/a.png',
          gpt2MobileDebug: {
            provider: 'GPT2_MOBILE',
            captureInfluenceMode: 'FULL_PAGE_LOWER_CONTEXT_PLUS_BOTTOM_NAV_LOCK',
            pageValidityPass: true,
            screenshotOverreachWarning: false,
            territoryLabel: 'Territory A',
            effectivePromptVersion: 'v-test',
          } as never,
        },
      ],
    });
    const slots = buildGpt2MobileSlotPresentations(state);
    expect(slots[0]?.gpt2Mobile?.pageValidityPass).toBe(true);
    expect(slots[0]?.gpt2Mobile?.captureInfluenceMode).toBe('FULL_PAGE_LOWER_CONTEXT_PLUS_BOTTOM_NAV_LOCK');
  });

  it('footer phase resolves for mobile review and twin handoff', () => {
    expect(resolveFounderFooterPhase(canonicalState({ generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION' }))).toBe('MOBILE_REVIEW');
    expect(resolveFounderFooterCtaHint(canonicalState({ generationStatus: 'TWIN_IMPLEMENTATION_PACKAGE_READY' })).primaryLabel).toContain('TWIN');
  });

  it('live promotion hidden until twin ready for review', () => {
    expect(livePromotionVisible(canonicalState({ generationStatus: 'TWIN_IMPLEMENTATION_PACKAGE_READY' }))).toBe(false);
    expect(livePromotionVisible(canonicalState({ generationStatus: 'TWIN_READY_FOR_REVIEW' }))).toBe(true);
  });

  it('canonical post-run primary action avoids VIEW RENDITIONS label', () => {
    const actions = buildPageConceptPostRunActions(
      canonicalState({ generationStatus: 'READY_FOR_FOUNDER_REVIEW', generationJobs: [{ status: 'READY' } as never] }),
    );
    const primary = pageConceptPostRunPrimaryAction(actions);
    expect(primary?.label).toBe('REVIEW OUTPUTS');
    expect(containsLegacyFounderTerminology(primary?.label ?? '')).toBe(false);
  });

  it('summary metrics use interpretation terminology for viewport', () => {
    const metrics = buildFounderSummaryMetrics(canonicalState({}));
    const viewport = metrics.find((m) => m.id === 'viewport');
    expect(viewport?.count).toContain('TABLET');
    expect(viewport?.count).not.toContain('RENDITION');
  });

  it('legacy terminology detector flags NBP copy', () => {
    expect(containsLegacyFounderTerminology('VIEW RENDITIONS')).toBe(true);
    expect(containsLegacyFounderTerminology('GPT2 MOBILE CONCEPTS')).toBe(false);
  });
});
