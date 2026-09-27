/**
 * P0.VR.EXPERIENCE-REVIEW-PANEL-DESIGN-SYSTEM-ALIGNMENT-AND-READABILITY1
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildExperienceReviewPackageStatus,
  EXPERIENCE_REVIEW_SHELL_LINEAGE,
  resolveExperienceReviewPanelMode,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceReviewPresentation.js';

const PCG_CSS = readFileSync(resolve('src/site00/styles/site00-page-concept-generator.css'), 'utf8');
const PANEL_TSX = readFileSync(
  resolve('src/site00/components/designBench/pageConceptGenerator/experienceReview/ExperienceReviewPanel.tsx'),
  'utf8',
);
const SECTIONS_TSX = readFileSync(
  resolve('src/site00/components/designBench/pageConceptGenerator/experienceReview/ExperienceReviewSections.tsx'),
  'utf8',
);
const OVERLAY_TSX = readFileSync(
  resolve('src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx'),
  'utf8',
);
const WRAPPER_TSX = readFileSync(
  resolve('src/site00/components/designBench/pageConceptGenerator/PageConceptExperienceExpressionReviewPanel.tsx'),
  'utf8',
);

describe('P0.VR.EXPERIENCE-REVIEW-PANEL-DESIGN-SYSTEM-ALIGNMENT-AND-READABILITY1', () => {
  it('opens opaque review panel shell aligned with generation layer', () => {
    expect(OVERLAY_TSX).toContain('s00-pcg-layer__scrollBody');
    expect(OVERLAY_TSX).toContain('ExperienceReviewPanel');
    expect(PANEL_TSX).toContain('s00-pcg s00-exp-review');
    expect(PANEL_TSX).toContain('data-review-shell-lineage={EXPERIENCE_REVIEW_SHELL_LINEAGE}');
    expect(PCG_CSS).toContain('.s00-pcg__scrim--experience');
    expect(PCG_CSS).toMatch(/rgb\(8 8 8 \/ 78%\)/);
  });

  it('renders empty state inside panel shell with generate action', () => {
    expect(SECTIONS_TSX).toContain('ExperienceReviewEmptyState');
    expect(SECTIONS_TSX).toContain('data-testid="page-concept-experience-review-empty"');
    expect(SECTIONS_TSX).toContain('GENERATE EXPERIENCE PACKAGE');
    expect(PANEL_TSX).toContain("mode === 'EMPTY'");
  });

  it('renders ready state with output nav, preview stage, and action bar', () => {
    expect(SECTIONS_TSX).toContain('ExperienceReviewOutputNav');
    expect(SECTIONS_TSX).toContain('ExperienceReviewPreviewStage');
    expect(SECTIONS_TSX).toContain('ExperienceReviewActionBar');
    expect(PANEL_TSX).toContain('ExperienceReviewDetails');
  });

  it('shows generating counts in loading state', () => {
    expect(SECTIONS_TSX).toContain('ExperienceReviewLoadingState');
    expect(SECTIONS_TSX).toContain('data-testid="experience-review-loading-state"');
    expect(resolveExperienceReviewPanelMode({ status: 'GENERATING', visualStates: [] } as never)).toBe('GENERATING');
  });

  it('shows failed state retry affordance', () => {
    expect(SECTIONS_TSX).toContain('ExperienceReviewErrorState');
    expect(SECTIONS_TSX).toContain('data-testid="experience-review-retry-package"');
    expect(resolveExperienceReviewPanelMode({ status: 'FAILED' } as never)).toBe('FAILED');
  });

  it('gates approve when package is not reviewable', () => {
    expect(PANEL_TSX).toContain('approveDisabled');
    expect(PANEL_TSX).toContain("mode === 'GENERATING'");
    expect(PANEL_TSX).toContain("mode === 'EMPTY'");
  });

  it('uses canonical filled button background treatments', () => {
    expect(PCG_CSS).toContain('.s00-exp-review__btn--black');
    expect(PCG_CSS).toContain('.s00-exp-review__btn--lime');
    expect(PCG_CSS).toContain('.s00-exp-review__btn--white');
    expect(SECTIONS_TSX).toContain('s00-exp-review__btn--lime');
  });

  it('keeps mobile-readable high-contrast typography and status strip', () => {
    expect(PCG_CSS).toContain('.s00-exp-review__statusStrip');
    expect(PCG_CSS).toContain('min-height: 44px');
    expect(PCG_CSS).toContain('--pcg-ink');
    expect(SECTIONS_TSX).toContain('ExperienceReviewStatusStrip');
  });

  it('shares review-shell lineage with generation panel family', () => {
    expect(EXPERIENCE_REVIEW_SHELL_LINEAGE).toBe('generation-panel');
    expect(SECTIONS_TSX).toContain('s00-pcg__head');
    expect(SECTIONS_TSX).toContain('s00-pcg__title');
    expect(WRAPPER_TSX).toContain('ExperienceReviewPanel');
  });

  it('foreground panel uses solid surfaces over dimmed scrim', () => {
    expect(PCG_CSS).toContain('.s00-exp-review');
    expect(PCG_CSS).toContain('background: var(--pcg-paper)');
    expect(PCG_CSS).toContain('.s00-exp-review__previewFrame');
  });
});
