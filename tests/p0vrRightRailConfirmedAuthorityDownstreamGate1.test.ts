/**
 * P0.VR.RIGHT-RAIL-CONFIRMED-AUTHORITY-DOWNSTREAM-GATE1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildGpt2ViewportFamilyHeroRailStages,
  findGpt2HeroRailAction,
  GPT2_HERO_RAIL_DOWNSTREAM_ACTION_IDS,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import {
  pageConceptConfirmMobileAuthority,
  pageConceptSelectMobileConcept,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyOrchestration.js';
import type { PageConceptPipelineSet } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

function baseFamily(overrides: Record<string, unknown> = {}) {
  return {
    familyId: 'fam-1',
    cgptBriefId: 'b',
    cgptBriefVersion: '1',
    selectedMobileConceptId: null,
    selectedMobileVersion: null,
    mobileArtifactId: null,
    mobileAuthorityStatus: 'NONE',
    confirmedMobileConceptId: null,
    confirmedMobileArtifactId: null,
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
    status: 'PENDING',
    viewportFamilyApprovalId: null,
    familyLockId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function pipelineWithFamily(family: ReturnType<typeof baseFamily>): PageConceptPipelineSet {
  return {
    pipelineSetId: 'ps-1',
    projectId: 'ndxbook',
    pageId: 'page-overview',
    targetType: 'PAGE',
    captureSetId: 'cap',
    functionContractId: 'fc',
    creativeInjection: null,
    gpt2AuthorityConcept: null,
    renditions: [],
    pipelineLineage: 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE',
    mobileConcepts: [
      {
        conceptId: 'mc-a',
        slot: 'MOBILE_CONCEPT_A',
        artifactId: 'art-a',
        imageUri: null,
        status: 'READY',
        createdAt: new Date().toISOString(),
      },
    ],
    viewportAuthorityFamily: family as never,
    createdAt: new Date().toISOString(),
  };
}

function railForPipeline(pipeline: PageConceptPipelineSet | null, galleryId: string | null = 'mc-a') {
  return buildGpt2ViewportFamilyHeroRailStages({
    pipelineSet: pipeline,
    selectedMobileConceptId: pipeline?.viewportAuthorityFamily?.selectedMobileConceptId ?? null,
    selectedGalleryCandidateId: galleryId,
    selectedGalleryCandidateSlotLabel: 'CONCEPT A',
    generating: false,
    generationJobs: [],
    activeViewport: 'MOBILE',
    tabletInterpretationActive: false,
    desktopInterpretationActive: false,
  });
}

describe('P0.VR.RIGHT-RAIL-CONFIRMED-AUTHORITY-DOWNSTREAM-GATE1', () => {
  it('select-only keeps all downstream actions disabled but visible', () => {
    const stages = railForPipeline(
      pipelineWithFamily(
        baseFamily({
          selectedMobileConceptId: 'mc-a',
          mobileArtifactId: 'art-a',
          mobileAuthorityStatus: 'SELECTED',
          status: 'MOBILE_SELECTED',
        }),
      ),
    );

    for (const id of GPT2_HERO_RAIL_DOWNSTREAM_ACTION_IDS) {
      const action = findGpt2HeroRailAction(stages, id)!;
      expect(action.disabled).toBe(true);
      expect(action.label.length).toBeGreaterThan(0);
    }

    const confirm = findGpt2HeroRailAction(stages, 'vf-confirm-mobile')!;
    expect(confirm.disabled).toBe(false);

    const select = findGpt2HeroRailAction(stages, 'vf-select-mobile')!;
    expect(select.disabled).toBe(false);
  });

  it('select-only does not unlock expression, desktop, tablet, or pair review', () => {
    const stages = railForPipeline(
      pipelineWithFamily(
        baseFamily({
          selectedMobileConceptId: 'mc-a',
          mobileArtifactId: 'art-a',
          mobileAuthorityStatus: 'SELECTED',
        }),
      ),
    );
    expect(findGpt2HeroRailAction(stages, 'vf-expression')!.disabled).toBe(true);
    expect(findGpt2HeroRailAction(stages, 'vf-run-desktop')!.disabled).toBe(true);
    expect(findGpt2HeroRailAction(stages, 'vf-run-tablet')!.disabled).toBe(true);
    expect(findGpt2HeroRailAction(stages, 'vf-pair-review')!.disabled).toBe(true);
  });

  it('mobile confirm unlocks expression only (desktop/tablet still experience-gated)', () => {
    const stages = railForPipeline(
      pipelineWithFamily(
        baseFamily({
          selectedMobileConceptId: 'mc-a',
          confirmedMobileConceptId: 'mc-a',
          mobileArtifactId: 'art-a',
          mobileAuthorityStatus: 'CONFIRMED',
          status: 'MOBILE_AUTHORITY_CONFIRMED',
        }),
      ),
    );
    expect(findGpt2HeroRailAction(stages, 'vf-expression')!.disabled).toBe(false);
    expect(findGpt2HeroRailAction(stages, 'vf-run-desktop')!.disabled).toBe(true);
    expect(findGpt2HeroRailAction(stages, 'vf-run-tablet')!.disabled).toBe(true);
    expect(findGpt2HeroRailAction(stages, 'vf-pair-review')!.disabled).toBe(true);
  });

  it('shows SELECTED · NOT CONFIRMED status before confirmation', () => {
    const mobile = railForPipeline(
      pipelineWithFamily(
        baseFamily({
          selectedMobileConceptId: 'mc-a',
          mobileArtifactId: 'art-a',
          mobileAuthorityStatus: 'SELECTED',
        }),
      ),
    ).find((s) => s.id === 'mobile-authority')!;
    expect(mobile.statusLabel).toBe('SELECTED · NOT CONFIRMED');
  });

  it('downstream disabled reasons reference confirm-first helper copy', () => {
    const expr = findGpt2HeroRailAction(
      railForPipeline(
        pipelineWithFamily(
          baseFamily({
            selectedMobileConceptId: 'mc-a',
            mobileAuthorityStatus: 'SELECTED',
          }),
        ),
      ),
      'vf-expression',
    )!;
    expect(expr.disabledReason).toMatch(/CONFIRM MOBILE AUTHORITY FIRST/i);
  });

  it('pair review stays disabled until desktop and tablet exist after experience approval', () => {
    const stages = railForPipeline({
      ...pipelineWithFamily(
        baseFamily({
          selectedMobileConceptId: 'mc-a',
          confirmedMobileConceptId: 'mc-a',
          mobileAuthorityStatus: 'CONFIRMED',
          desktopArtifactId: 'd-art',
          tabletArtifactId: 't-art',
        }),
      ),
      experienceExpressionAuthority: {
        id: 'ee-1',
        projectId: 'ndxbook',
        pageId: 'page-overview',
        sourceMobileAuthorityId: 'mc-a',
        sourceMobileArtifactId: 'art-a',
        sourceConceptId: 'mc-a',
        status: 'APPROVED',
        patterns: [],
        behaviorContract: 'x',
        visualStateContract: 'y',
        responsiveRules: [],
        visualStates: [],
        generatedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      },
    });
    expect(findGpt2HeroRailAction(stages, 'vf-pair-review')!.disabled).toBe(false);
  });

  it('changing confirmed authority invalidates downstream readiness in orchestration', () => {
    const cataloged = {
      projectId: 'ndxbook',
      pageId: 'page-overview',
      pipelineSet: pipelineWithFamily(
        baseFamily({
          selectedMobileConceptId: 'mc-a',
          confirmedMobileConceptId: 'mc-a',
          mobileArtifactId: 'art-a',
          mobileAuthorityStatus: 'CONFIRMED',
          experienceExpressionContractId: 'eec-1',
          desktopArtifactId: 'd1',
          tabletArtifactId: 't1',
        }),
      ),
      generationStatus: 'IDLE' as const,
      generationJobs: [],
    };
    const afterSelect = pageConceptSelectMobileConcept(cataloged as never, 'mc-a');
    expect(afterSelect.state.pipelineSet?.viewportAuthorityFamily?.mobileAuthorityStatus).toBe('SELECTED');
    expect(afterSelect.state.pipelineSet?.viewportAuthorityFamily?.confirmedMobileConceptId).toBeNull();
    expect(afterSelect.state.pipelineSet?.experienceExpressionAuthority).toBeNull();
  });

  it('workspace handlers guard downstream actions on CONFIRMED state', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts'),
      'utf8',
    );
    expect(src).toContain('if (!mobileConfirmed) return;');
    expect(src).toContain("case 'vf-expression':");
    expect(src).toMatch(/vf-run-desktop[\s\S]*?if \(!mobileConfirmed \|\| !experienceApproved\) return;/);
  });
});
