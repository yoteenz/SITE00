/**
 * P0.VR.EXPERIENCE-MENU-REGEN-MATERIALIZATION-AND-REVIEW-TAB-LAYOUT-FIX1
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { reconcileExistingExperienceArtifacts } from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceLegacyFalArtifactReconciliation.js';
import {
  assertExperiencePreviewArtifactSync,
  buildExperiencePreviewImageSrc,
  MENU_NESTED_NAV_REFINEMENT_MARKER,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceMenuRegeneration.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const PANEL_TSX = readFileSync(
  resolve('src/site00/components/designBench/pageConceptGenerator/experienceReview/ExperienceReviewPanel.tsx'),
  'utf8',
);
const SECTIONS_TSX = readFileSync(
  resolve('src/site00/components/designBench/pageConceptGenerator/experienceReview/ExperienceReviewSections.tsx'),
  'utf8',
);
const CSS = readFileSync(resolve('src/site00/styles/site00-page-concept-generator.css'), 'utf8');

describe('P0.VR.EXPERIENCE-MENU-REGEN-MATERIALIZATION-AND-REVIEW-TAB-LAYOUT-FIX1', () => {
  it('cache-busts preview src when artifact id changes', () => {
    const uri = 'https://cdn.example/a.png';
    expect(buildExperiencePreviewImageSrc(uri, 'pcga-EXP-MENU-abc-R1')).toContain('v=pcga-EXP-MENU-abc-R1');
    expect(buildExperiencePreviewImageSrc('data:image/png;base64,xx', 'id1')).toContain('#id1');
  });

  it('legacy recovery does not overwrite newer regenerated menu artifact', () => {
    const authority = {
      id: 'peea-x',
      projectId: 'ndxbook',
      pageId: 'p1',
      sourceMobileAuthorityId: 'm',
      sourceMobileArtifactId: 'm',
      sourceConceptId: 'c1',
      status: 'READY_FOR_REVIEW' as const,
      patterns: [],
      behaviorContract: '',
      visualStateContract: '',
      responsiveRules: [],
      visualStates: [
        {
          stateId: 'base',
          label: 'Base',
          patternType: 'BASE_PAGE' as const,
          previewImageUri: 'data:base',
          caption: '',
          sourceProvider: 'INHERITED_MOBILE' as const,
          materializationStatus: 'INHERITED' as const,
        },
        {
          stateId: 'menu',
          label: 'Menu',
          patternType: 'MENU' as const,
          previewImageUri: 'data:menu-new',
          caption: 'regen',
          sourceProvider: 'FAL_EXPERIENCE' as const,
          generatedArtifactId: 'pcga-EXP-MENU-tail-R999',
          materializationStatus: 'READY' as const,
        },
      ],
      generationJobs: [
        {
          jobId: 'j-regen',
          experiencePackageId: 'peea-x',
          expressionType: 'MENU_EXPANDED_NAV',
          stateId: 'menu',
          sourceAuthorityId: 'm',
          promptId: null,
          provider: 'FAL_EXPERIENCE',
          providerRequestId: 'fal-1',
          status: 'READY',
          artifactId: 'pcga-EXP-MENU-tail-R999',
          error: null,
          regeneratedAt: new Date().toISOString(),
          regenerationReason: 'MENU_HIERARCHY_REFINEMENT',
        },
      ],
      menuRegenerationReceipt: {
        previousMenuArtifactId: 'pcga-EXP-MENU-tail',
        newMenuArtifactId: 'pcga-EXP-MENU-tail-R999',
        providerRequestId: 'fal-1',
        promptVersion: 'v1',
        hierarchyDirectiveVersion: 'ndxbook-menu-nested-nav-v2',
        regeneratedAt: new Date().toISOString(),
        menuRefinementDirectiveRequired: 'PASS',
        existingMenuUsedAsRefinementReference: 'PASS',
        activeMenuSlotUpdated: 'PASS',
        cacheBustKey: 'pcga-EXP-MENU-tail-R999',
        readyForFounderVisualQa: 'YES',
      },
    };

    const state = {
      projectId: 'ndxbook',
      pageId: 'p1',
      generationJobs: [
        {
          artifactId: 'pcga-EXP-MENU-tail',
          projectId: 'ndxbook',
          pageId: 'p1',
          renditionSlot: 'RENDITION_A',
          viewport: 'MOBILE',
          captureSetId: 'c',
          projectContextVersion: '1',
          pageContextVersion: '1',
          functionContractId: 'fc',
          creativeInjectionId: 'ci',
          gpt2AuthorityConceptId: 'c1',
          renditionId: 'r1',
          provider: 'FAL_EXPERIENCE',
          model: 'm',
          providerJobId: 'old',
          promptVersion: 'legacy',
          createdAt: '2020-01-01T00:00:00.000Z',
          status: 'READY',
          artifactPath: null,
          imageUri: 'data:menu-old',
          width: 1,
          height: 1,
          displayTitle: 'MENU EXPANDED NAV',
        },
      ],
      functionContract: { route: '/projects/design/ndxbook/overview', regions: [], interactions: [], immutableBehaviors: [] },
    } as unknown as PageConceptGenerationState;

    const { authority: reconciled } = reconcileExistingExperienceArtifacts({ authority, state: state as PageConceptGenerationState });
    const menu = reconciled.visualStates.find((s) => s.stateId === 'menu');
    expect(menu?.generatedArtifactId).toBe('pcga-EXP-MENU-tail-R999');
    expect(menu?.previewImageUri).toBe('data:menu-new');
  });

  it('experience review layout keeps output nav outside scroll body and removes duplicate menu regen', () => {
    expect(PANEL_TSX).toContain('s00-exp-review__outputNavRegion');
    expect(PANEL_TSX).not.toContain('onRegenerateMenu');
    expect(SECTIONS_TSX).not.toContain('onRegenerateMenu');
    expect(SECTIONS_TSX).toContain('experience-output-tab-label');
    expect(SECTIONS_TSX).toContain('ENTRY DETAIL');
    expect(SECTIONS_TSX).toContain('PROJECT ACCESS');
    expect(SECTIONS_TSX).toContain('ExperienceReviewPendingStage');
    expect(CSS).toContain('.s00-exp-review__outputNavRegion');
    expect(CSS).toContain('border-top-color: var(--pcg-black)');
  });

  it('assertExperiencePreviewArtifactSync passes when menu artifact ids agree', () => {
    expect(() =>
      assertExperiencePreviewArtifactSync({
        selectedOutputType: 'menu',
        activeArtifactId: 'a1',
        previewArtifactId: 'a1',
        currentPackageArtifactId: 'a1',
      }),
    ).not.toThrow();
  });

  it('menu refinement marker is defined for prompt guard', () => {
    expect(MENU_NESTED_NAV_REFINEMENT_MARKER).toBe('NESTED_NAV_REFINEMENT');
  });
});
