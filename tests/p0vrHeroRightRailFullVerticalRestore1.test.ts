/**
 * P0.VR.HERO-RIGHT-RAIL-FULL-VERTICAL-RESTORE1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildGpt2ViewportFamilyHeroRailStages,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';

const root = join(process.cwd());

function readSrc(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('P0.VR hero right rail full vertical restore', () => {
  it('renders full vertical rail layout beside hero', () => {
    const rail = readSrc('src/site00/components/designBench/opusDirect/DesignViewportFamilyHeroRail.tsx');
    expect(rail).toContain('data-rail-layout="full-vertical"');
    expect(rail).toContain('__vfFullVertical');
    expect(rail).toContain('__vfStage');
    const css = readSrc('src/site00/styles/site00-twin-opus-direct.css');
    expect(css).toContain('.tod-rail--heroWorkflow');
    expect(css).toContain('flex-direction: column');
    const canonical = readSrc('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
    expect(canonical).toContain('tod-rail--heroWorkflow');
    expect(canonical).toContain('viewportFamilyHeroRailStages');
  });

  it('keeps rail on mobile as fixed-width column (not accordion)', () => {
    const listCss = readSrc('src/site00/styles/site00-twin-opus-list.css');
    expect(listCss).toContain('.tod-lv-rail--heroWorkflow');
    expect(listCss).toMatch(/\.tod-lv-herorow[\s\S]*flex-direction: row/);
    expect(listCss).not.toContain('accordion');
    const directCss = readSrc('src/site00/styles/site00-twin-opus-direct.css');
    expect(directCss).toContain('min-width: var(--tod-rail-w)');
  });

  it('exposes all five canonical stages regardless of viewport', () => {
    const mobile = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: null,
      selectedMobileConceptId: null,
      selectedGalleryCandidateId: 'c-a',
      selectedGalleryCandidateSlotLabel: 'CONCEPT A',
      generating: false,
      generationJobs: [],
      activeViewport: 'MOBILE',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    });
    expect(mobile.map((s) => s.id)).toEqual([
      'mobile-authority',
      'experience',
      'tablet',
      'desktop',
      'viewport-family',
    ]);

    const tablet = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: null,
      selectedMobileConceptId: null,
      selectedGalleryCandidateId: null,
      selectedGalleryCandidateSlotLabel: null,
      generating: false,
      generationJobs: [],
      activeViewport: 'TABLET',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    });
    expect(tablet).toHaveLength(5);
    expect(tablet.some((s) => s.id === 'tablet' && s.emphasized)).toBe(true);
  });

  it('includes mobile authority select action and omits legacy authority pair copy', () => {
    const stages = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: null,
      selectedMobileConceptId: null,
      selectedGalleryCandidateId: 'c-a',
      selectedGalleryCandidateSlotLabel: 'CONCEPT A',
      generating: false,
      generationJobs: [],
      activeViewport: 'MOBILE',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    });
    const mobile = stages.find((s) => s.id === 'mobile-authority')!;
    expect(mobile.actions.some((a) => a.label === 'SELECT MOBILE CONCEPT')).toBe(true);
    const src = [
      readSrc('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx'),
      readSrc('src/site00/components/designBench/opusDirect/DesignViewportFamilyHeroRail.tsx'),
    ].join('\n');
    expect(src).not.toContain('AUTHORITY PAIR');
    expect(src).not.toContain('PROMOTE MOBILE');
    expect(src).not.toContain('PAIR REVIEW');
    expect(src).not.toContain('SELECT FOR DESKTOP');
  });

  it('binds stages from shared pipeline set fields', () => {
    const stages = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: {
        pipelineSetId: 'ps-1',
        projectId: 'p',
        pageId: 'page',
        targetType: 'PAGE',
        captureSetId: 'c',
        functionContractId: 'f',
        creativeInjection: null,
        gpt2AuthorityConcept: null,
        renditions: [],
        pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
        mobileConcepts: [
          {
            conceptId: 'mc-b',
            slot: 'MOBILE_CONCEPT_B',
            artifactId: 'art-b',
            imageUri: null,
            status: 'READY',
            createdAt: new Date().toISOString(),
          },
        ],
        viewportAuthorityFamily: {
          familyId: 'fam',
          cgptBriefId: 'b',
          cgptBriefVersion: '1',
          selectedMobileConceptId: 'mc-b',
          selectedMobileVersion: 'v1',
          mobileArtifactId: 'art-b',
          tabletArtifactId: null,
          desktopArtifactId: null,
          tabletInterpretationId: null,
          tabletVersion: null,
          desktopInterpretationId: null,
          desktopVersion: null,
          experienceExpressionContractId: null,
          experienceExpressionVersion: null,
          skinContractVersion: '1',
          skinContractId: null,
          status: 'MOBILE_SELECTED',
          viewportFamilyApprovalId: null,
          familyLockId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      },
      selectedMobileConceptId: 'mc-b',
      selectedGalleryCandidateId: 'mc-b',
      selectedGalleryCandidateSlotLabel: 'CONCEPT B',
      generating: false,
      generationJobs: [],
      activeViewport: 'MOBILE',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    });
    expect(stages.find((s) => s.id === 'mobile-authority')?.valueLine).toContain('CONCEPT B');
    expect(stages.find((s) => s.id === 'tablet')?.statusLabel).toBe('PENDING');
  });
});
