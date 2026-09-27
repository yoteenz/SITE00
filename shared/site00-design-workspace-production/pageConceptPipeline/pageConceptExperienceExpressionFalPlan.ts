/**
 * P0.VR.EXPERIENCE-EXPRESSION-FAL-GENERATION-REVIEW-AND-HANDOFF1
 */

import type { PageConceptCgptCreativeBrief, PageCreativeInjection, PageFunctionContract } from './types.js';
import type { ExperienceExpressionVisualState } from './experienceExpressionAuthority.js';

export const PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION = 'page-experience-expression-fal-v1';

export type ExperienceExpressionFalTarget = {
  stateId: string;
  label: string;
  patternType: ExperienceExpressionVisualState['patternType'];
  prompt: string;
};

const MAX_FAL_EXPRESSION_IMAGES = 4;

function behaviorBlob(functionContract: PageFunctionContract): string {
  return [...functionContract.regions, ...functionContract.interactions, ...functionContract.immutableBehaviors]
    .join(' ')
    .toLowerCase();
}

export function buildExperienceExpressionFalTargets(input: {
  functionContract: PageFunctionContract;
  cgptBrief: PageConceptCgptCreativeBrief;
  injection: PageCreativeInjection;
  routeLabel: string;
}): readonly ExperienceExpressionFalTarget[] {
  const blob = behaviorBlob(input.functionContract);
  const character = input.injection.interactionCharacter ?? input.cgptBrief.interactionCharacter;
  const premise = input.cgptBrief.creativePremise.slice(0, 400);

  const targets: ExperienceExpressionFalTarget[] = [];

  const push = (stateId: string, label: string, patternType: ExperienceExpressionVisualState['patternType'], task: string) => {
    targets.push({
      stateId,
      label,
      patternType,
      prompt: [
        'SITE 00 — EXPERIENCE EXPRESSION (same page, approved mobile authority as visual anchor)',
        `Route: ${input.routeLabel}`,
        `Interaction character: ${character}`,
        `Creative premise: ${premise}`,
        '',
        'CRITICAL: Edit the reference mobile authority — do NOT redesign the page territory.',
        'Preserve typography, materials, color logic, and layout hierarchy from the reference.',
        '',
        task,
        '',
        'Output: single mobile portrait screen, production-quality UI, no device chrome, no browser frame.',
      ].join('\n'),
    });
  };

  if (/menu|nav|dropdown/.test(blob)) {
    push(
      'menu',
      'MENU / EXPANDED NAV',
      'MENU',
      'Show this same page with primary navigation or menu expanded — clearly the same design system.',
    );
  }
  if (/drawer|sheet|panel|slide/.test(blob)) {
    push(
      'drawer',
      'PANEL / DRAWER',
      'DRAWER',
      'Show contextual panel or bottom/side drawer open on this page — same approved concept, readable content.',
    );
  }
  if (/modal|dialog|popup|overlay/.test(blob)) {
    push(
      'overlay',
      'MODAL / OVERLAY',
      'MODAL',
      'Show focused modal or overlay state on this page with editorial scrim — same visual authority.',
    );
  }

  if (targets.length === 0) {
    push(
      'combined',
      'COMBINED EXPERIENCE',
      'EXPANDED_PANEL',
      'Show one representative expanded/interactive state (panel or overlay) for this page without changing the core design direction.',
    );
  }

  if (targets.length >= 2 && targets.length < MAX_FAL_EXPRESSION_IMAGES) {
    const hasMenu = targets.some((t) => t.stateId === 'menu');
    const hasDrawer = targets.some((t) => t.stateId === 'drawer');
    if (hasMenu && hasDrawer && !targets.some((t) => t.stateId === 'combined')) {
      targets.push({
        stateId: 'combined',
        label: 'COMBINED EXPERIENCE',
        patternType: 'EXPANDED_PANEL',
        prompt: [
          'SITE 00 — COMBINED EXPERIENCE STATE',
          `Route: ${input.routeLabel}`,
          'Same approved mobile page with menu/navigation expanded AND a supporting panel visible if readable.',
          'Do not redesign — extend the approved authority concept only.',
        ].join('\n'),
      });
    }
  }

  return targets.slice(0, MAX_FAL_EXPRESSION_IMAGES);
}

export function experienceExpressionOutputCount(visualStates: readonly ExperienceExpressionVisualState[]): number {
  return visualStates.filter((v) => v.previewImageUri).length;
}
