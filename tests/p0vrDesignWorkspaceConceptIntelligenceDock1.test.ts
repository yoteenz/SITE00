/**
 * P0.VR.DESIGN-WORKSPACE-CONCEPT-INTELLIGENCE-DOCK1
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { TWIN_OPUS_DIRECT_CONCEPT_TABS } from '../src/site00/components/designBench/opusDirect/twinOpusDirectContent.js';
import {
  buildDesignConceptIntelligenceDockModel,
  conceptIntelligenceDockHandoffMatchesRail,
  conceptIntelligenceDockLegacyMetadataAbsent,
  CONCEPT_INTELLIGENCE_DOCK_TABS,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/designConceptIntelligenceDock.js';
import { buildGpt2ViewportFamilyHeroRailStages } from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';

const repo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

describe('P0.VR.DESIGN-WORKSPACE-CONCEPT-INTELLIGENCE-DOCK1', () => {
  it('replaces legacy concept record tabs with intelligence dock tabs', () => {
    expect(TWIN_OPUS_DIRECT_CONCEPT_TABS).toEqual([...CONCEPT_INTELLIGENCE_DOCK_TABS]);
    expect(TWIN_OPUS_DIRECT_CONCEPT_TABS).not.toContain('CONCEPT DATA');
    expect(TWIN_OPUS_DIRECT_CONCEPT_TABS).not.toContain('AMENDMENT');
  });

  it('removes legacy Entry001 / signal cover from canonical and list dock renderers', () => {
    const canonical = repo('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
    const list = repo('src/site00/components/designBench/opusDirect/TwinOpusDirectListView.tsx');
    const dock = repo('src/site00/components/designBench/opusDirect/DesignConceptIntelligenceDock.tsx');
    expect(canonical).toContain('DesignConceptIntelligenceDock');
    expect(list).toContain('DesignConceptIntelligenceDock');
    expect(canonical).not.toContain('tod-concept__thumbCopy');
    expect(list).not.toContain('tod-lv-concept');
    expect(dock).toContain('concept-intelligence-dock-preview');
    expect(dock).not.toContain('THE SIGNAL');
  });

  it('binds dock model from live generation state (no legacy default metadata)', () => {
    const model = buildDesignConceptIntelligenceDockModel({
      projectId: 'ndxbook',
      pageId: 'overview',
      viewport: 'MOBILE',
      targetRouteLabel: 'PROJECTS > NDXBOOK > OVERVIEW',
      selectedCandidate: {
        id: 'concept-a-1',
        slotLabel: 'A',
        version: 'A V1',
        previewSrc: 'https://example.com/a.webp',
        runId: 'run-abc-123456',
        territoryLabel: 'TERRITORY ALPHA',
        artifactStatus: 'READY',
        runGroup: 'CURRENT',
      },
      inspectedConcept: null,
      selectedMobileConceptId: null,
      generationState: null,
      currentRunId: 'run-abc-123456',
      galleryCurrent: [],
      galleryHistory: [],
      viewportFamilyHeroRailStages: buildGpt2ViewportFamilyHeroRailStages({
        pipelineSet: null,
        selectedMobileConceptId: null,
        selectedGalleryCandidateId: 'concept-a-1',
        selectedGalleryCandidateSlotLabel: 'CONCEPT A',
        generating: false,
        generationJobs: [],
        activeViewport: 'MOBILE',
        tabletInterpretationActive: false,
        desktopInterpretationActive: false,
      }),
      productionHistory: [],
    });
    expect(model.concept.conceptLetter).toBe('A');
    expect(model.concept.previewSrc).toContain('example.com');
    expect(conceptIntelligenceDockLegacyMetadataAbsent(model)).toBe(true);
    expect(model.handoff.nextAction).toBe('SELECT MOBILE AUTHORITY');
  });

  it('syncs handoff pipeline with hero rail stages', () => {
    const stages = buildGpt2ViewportFamilyHeroRailStages({
      pipelineSet: null,
      selectedMobileConceptId: 'mobile-1',
      selectedGalleryCandidateId: 'mobile-1',
      selectedGalleryCandidateSlotLabel: 'CONCEPT B',
      generating: false,
      generationJobs: [],
      activeViewport: 'MOBILE',
      tabletInterpretationActive: false,
      desktopInterpretationActive: false,
    });
    const model = buildDesignConceptIntelligenceDockModel({
      projectId: 'ndxbook',
      pageId: 'overview',
      viewport: 'MOBILE',
      targetRouteLabel: 'PROJECTS > NDXBOOK > OVERVIEW',
      selectedCandidate: {
        id: 'mobile-1',
        slotLabel: 'B',
        version: 'B V1',
        previewSrc: '/img.webp',
      },
      inspectedConcept: null,
      selectedMobileConceptId: 'mobile-1',
      generationState: null,
      currentRunId: null,
      galleryCurrent: [],
      galleryHistory: [],
      viewportFamilyHeroRailStages: stages,
      productionHistory: [],
    });
    expect(conceptIntelligenceDockHandoffMatchesRail(model, stages)).toBe(true);
  });

  it('caps mobile dock scroll height (no endless scroll)', () => {
    const listCss = repo('src/site00/styles/site00-twin-opus-list.css');
    expect(listCss).toContain('.tod-lv-record .tod-cid__stack');
    expect(listCss).toMatch(/max-height:\s*360px/);
  });

  it('exposes single conceptIntelligenceDock on workspace data', () => {
    const workspace = repo('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
    expect(workspace).toContain('conceptIntelligenceDock: buildDesignConceptIntelligenceDockModel');
  });
});
