/**
 * P0.VR.GPT2-MOBILE-PAGE-AUTHORITY-DECOUPLING-FIX1
 */

import { describe, expect, it } from 'vitest';

import {
  buildPageGpt2MobileConceptRequestPackage,
  mobileConceptTerritoryDirective,
  pageConceptGpt2MobileIdempotencyKey,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileRequestPackage.js';
import {
  PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE,
  PAGE_GPT2_MOBILE_FORBIDDEN_OUTPUT_TYPES,
  PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION,
  PAGE_GPT2_MOBILE_PAGE_STRUCTURE_REQUIREMENTS,
  assertGpt2MobilePackageNotNbpPath,
  gpt2MobileConceptRenditionSlot,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobilePageAuthority.js';
import {
  PAGE_GPT2_MOBILE_FAL_EDIT_MODEL,
  PAGE_NBP_MODEL,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import { isGptImage2Model } from '../shared/site00-visual-generation/falImageModels.js';
import {
  buildGpt2MobileSlotPresentations,
  pageConceptCanonicalGpt2MobileActive,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import { PAGE_GPT2_MOBILE_CONCEPT_SLOT_LABELS } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2AuthorityPackage.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const injection = {
  injectionId: 'inj-1',
  creativeThesis: 'NDXBOOK overview',
  pagePurposeInterpretation: 'Founder overview',
  visualOpportunity: 'Editorial system',
  spatialDirection: 'Vertical register',
  hierarchyDirection: 'Title-led',
  assetStrategy: 'Evidence plates',
  referenceStrategy: 'Archive',
  informationPriority: 'Surprise fold',
  responsiveDirection: 'Thumb reach',
  immutableRequirements: [],
  mobileDirection: 'Single column page',
  desktopDirection: 'Wide grid',
};

const skin = {
  contractId: 'skin-1',
  skinName: 'NDX',
  version: 'v1',
  typography: { displayFont: 'Display', bodyFont: 'Body', monoFont: 'Mono' },
  palette: ['black', 'lime'],
  material: ['matte'],
  composition: ['grid'],
  imagery: ['evidence'],
  componentExpression: ['sharp'],
  brandSignals: ['NDXBOOK'],
  forbiddenDrift: ['generic SaaS'],
};

describe('P0.VR.GPT2-MOBILE-PAGE-AUTHORITY-DECOUPLING-FIX1', () => {
  it('GPT2 mobile slot labels are page-concept specific (not generic mobile concept)', () => {
    expect(PAGE_GPT2_MOBILE_CONCEPT_SLOT_LABELS[0]).toContain('GPT2 MOBILE PAGE CONCEPT');
    expect(PAGE_GPT2_MOBILE_CONCEPT_SLOT_LABELS[0]).not.toMatch(/^MOBILE CONCEPT A$/);
  });

  it('prompt payload includes page validity and poster prohibitions; not NBP stage', () => {
    const pkg = buildPageGpt2MobileConceptRequestPackage({
      runId: 'pcgr-1',
      slot: 'MOBILE_CONCEPT_A',
      conceptId: 'c1',
      projectContext: {
        projectId: 'ndxbook',
        contextVersion: '1',
        brandTruth: 'NDX',
        projectPurpose: 'p',
        audience: 'a',
        tone: 't',
        designLanguage: 'd',
      } as never,
      pageContext: {
        pageId: 'p1',
        projectId: 'ndxbook',
        pageName: 'Overview',
        route: '/overview',
        pageRole: 'overview',
        purpose: 'overview',
        requiredContent: ['hero'],
        functionalRequirements: ['nav'],
        contextVersion: '1',
        creativeLatitude: 'high',
        currentCaptureSummary: 'functional',
      } as never,
      functionContract: { contractId: 'fc', version: '1' } as never,
      injection,
      cgptBrief: null,
      skinContract: skin as never,
      bottomContinuityCaptureBase64: 'aaa',
      bottomContinuityApplied: true,
      pageContextSummary: '{}',
      mobileViewport: { width: 390, height: 844 },
    });

    expect(pkg.inspector.stageContract).toBe('GPT2_MOBILE_PAGE_AUTHORITY');
    expect(pkg.inspector.providerLabel).toBe('GPT2_MOBILE');
    expect(pkg.inspector.captureInfluenceMode).toBe(PAGE_GPT2_MOBILE_CAPTURE_INFLUENCE_MODE);
    expect(pkg.inspector.model).toBe(PAGE_GPT2_MOBILE_FAL_EDIT_MODEL);
    expect(isGptImage2Model(pkg.inspector.model)).toBe(true);
    expect(pkg.inspector.model).not.toBe(PAGE_NBP_MODEL);
    expect(pkg.prompt).toMatch(/NOT NBP/i);
    expect(pkg.prompt).toMatch(/WEBSITE PAGE AUTHORITY/i);
    expect(pkg.prompt).toMatch(/bottom continuity/i);
    for (const req of PAGE_GPT2_MOBILE_PAGE_STRUCTURE_REQUIREMENTS) {
      expect(pkg.prompt).toContain(req.slice(0, 20));
    }
    for (const forbidden of PAGE_GPT2_MOBILE_FORBIDDEN_OUTPUT_TYPES.slice(0, 3)) {
      expect(pkg.prompt).toContain(forbidden);
    }
    expect(() =>
      assertGpt2MobilePackageNotNbpPath({
        promptVersion: 'page-nbp-v1',
        stageContract: 'GPT2_MOBILE_PAGE_AUTHORITY',
        providerLabel: 'GPT2_MOBILE',
      }),
    ).toThrow(/NBP_PATH_LEAK/);
  });

  it('three territories are distinct and map to rendition slots A/B/C', () => {
    const territories = (['MOBILE_CONCEPT_A', 'MOBILE_CONCEPT_B', 'MOBILE_CONCEPT_C'] as const).map((slot) =>
      mobileConceptTerritoryDirective({ slot, injection, brief: null }),
    );
    expect(new Set(territories).size).toBe(3);
    expect(gpt2MobileConceptRenditionSlot('MOBILE_CONCEPT_A')).toBe('RENDITION_A');
    expect(gpt2MobileConceptRenditionSlot('MOBILE_CONCEPT_C')).toBe('RENDITION_C');
    expect(pageConceptGpt2MobileIdempotencyKey('pcgr-x', 'MOBILE_CONCEPT_B')).toBe('pcgr-x:GPT2_MOBILE:B');
  });

  it('canonical GPT2 product mode is active before any generation jobs exist', () => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
    const idle = {
      projectId: 'ndxbook',
      pageId: 'overview',
      generationStatus: 'IDLE',
      generationJobs: [],
      pipelineSet: null,
    } as unknown as PageConceptGenerationState;
    expect(pageConceptCanonicalGpt2MobileActive(idle)).toBe(true);
  });

  it('shell presentations use GPT2 mobile jobs only when canonical active', () => {
    const state = {
      projectId: 'ndxbook',
      pageId: 'overview',
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
      generationJobs: [
        {
          artifactId: 'pcga-MOBILE_CONCEPT_A-MOBILE',
          provider: 'GPT2_MOBILE',
          viewport: 'MOBILE',
          renditionSlot: 'RENDITION_A',
          status: 'READY',
          imageUri: 'https://x/a.png',
        },
      ],
      pipelineSet: { pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE', mobileConcepts: [{ slot: 'MOBILE_CONCEPT_A' }] },
    } as unknown as PageConceptGenerationState;

    expect(pageConceptCanonicalGpt2MobileActive(state)).toBe(true);
    const slots = buildGpt2MobileSlotPresentations(state);
    expect(slots).toHaveLength(3);
    expect(slots[0]?.key).toBe('gpt2.mobile.a');
    expect(slots[0]?.status).toBe('READY');
    expect(PAGE_GPT2_MOBILE_PAGE_CONCEPT_PROMPT_VERSION).toContain('page-gpt2-mobile-page-authority');
  });
});
