/**
 * P0.VR.8R3R5R1 — Design workspace wizard step routing (browser-safe).
 */

import type { CaptureFounderGuidanceInput } from '../p0vr8r3/captureFounderGuidance.js';
import { resolveDefaultPagesStep } from '../../pageFamilyWorkspace/pagesWorkspaceController.js';

export const P0_VR_8R3R5R1_BUILD = 'v264' as const;

export const PAGES_WIZARD_STEPS = [
  'family',
  'landing',
  'service-check',
  'test-worker',
  'test-worker-ready',
  'capture-setup',
  'capture-running',
  'capture-results',
  'library',
  'detail',
  'compare',
] as const;

export type PagesWizardStep = (typeof PAGES_WIZARD_STEPS)[number];

export const ASSETS_WIZARD_STEPS = [
  'UPLOAD',
  'INSTRUCT',
  'DETECT',
  'CONFIRM_CROP',
  'RECONSTRUCT',
  'APPROVE',
  'REPLACE',
] as const;

export type AssetsWizardStep = (typeof ASSETS_WIZARD_STEPS)[number];

export const SKINS_WIZARD_STEPS = [
  'family',
  'screen',
  'compare',
  'rebuild',
  'review',
  'apply',
] as const;

export type SkinsWizardStep = (typeof SKINS_WIZARD_STEPS)[number];

export const MORE_CATEGORIES = [
  'landing',
  'system',
  'providers',
  'capture',
  'route-audit',
  'storage',
  'automation',
  'presets',
] as const;

export type MoreCategory = (typeof MORE_CATEGORIES)[number];

export const PAGES_CAPTURE_FLOW_STEPS: PagesWizardStep[] = [
  'service-check',
  'test-worker',
  'test-worker-ready',
  'capture-setup',
  'capture-running',
  'capture-results',
];

export function normalizePagesWizardStep(raw: string | undefined | null): PagesWizardStep {
  const key = (raw ?? 'family').toLowerCase();
  if (PAGES_WIZARD_STEPS.includes(key as PagesWizardStep)) return key as PagesWizardStep;
  return 'family';
}

export function normalizeAssetsWizardStep(raw: string | undefined | null): AssetsWizardStep {
  const key = (raw ?? 'UPLOAD').toUpperCase();
  if (ASSETS_WIZARD_STEPS.includes(key as AssetsWizardStep)) return key as AssetsWizardStep;
  return 'UPLOAD';
}

export function normalizeSkinsWizardStep(raw: string | undefined | null): SkinsWizardStep {
  const key = (raw ?? 'family').toLowerCase();
  if (SKINS_WIZARD_STEPS.includes(key as SkinsWizardStep)) return key as SkinsWizardStep;
  return 'family';
}

export function normalizeMoreCategory(raw: string | undefined | null): MoreCategory {
  const key = (raw ?? 'landing').toLowerCase();
  if (MORE_CATEGORIES.includes(key as MoreCategory)) return key as MoreCategory;
  return 'landing';
}

export function pagesWizardStepIndex(step: PagesWizardStep): number | null {
  const flow = ['service-check', 'test-worker', 'capture-setup', 'capture-results'] as const;
  if (step === 'test-worker-ready') return 2;
  if (step === 'capture-running') return 3;
  const idx = flow.indexOf(step as (typeof flow)[number]);
  return idx >= 0 ? idx + 1 : null;
}

export function pagesWizardStepTitle(step: PagesWizardStep): string {
  const titles: Record<PagesWizardStep, string> = {
    family: 'PAGE FAMILY',
    landing: 'PAGE CAPTURE',
    'service-check': 'SERVICE CHECK',
    'test-worker': 'TEST WORKER',
    'test-worker-ready': 'WORKER READY',
    'capture-setup': 'CAPTURE PROJECT',
    'capture-running': 'CAPTURE RUNNING',
    'capture-results': 'CAPTURE COMPLETE',
    library: 'PAGE LIBRARY',
    detail: 'PAGE DETAIL',
    compare: 'COMPARE',
  };
  return titles[step];
}

export function resolvePagesWizardResumeStep(
  urlStep: string | undefined,
  input: CaptureFounderGuidanceInput & {
    testWorkerJustPassed?: boolean;
  },
): PagesWizardStep {
  return resolveDefaultPagesStep(urlStep, input);
}

export function assetsWizardStepLabel(step: AssetsWizardStep): string {
  const labels: Record<AssetsWizardStep, string> = {
    UPLOAD: 'UPLOAD',
    INSTRUCT: 'INSTRUCT',
    DETECT: 'DETECT',
    CONFIRM_CROP: 'CROP',
    RECONSTRUCT: 'RECONSTRUCT',
    APPROVE: 'APPROVE',
    REPLACE: 'LIVE',
  };
  return labels[step];
}

export function skinsWizardStepLabel(step: SkinsWizardStep): string {
  const labels: Record<SkinsWizardStep, string> = {
    family: 'CHOOSE FAMILY',
    screen: 'CHOOSE SCREEN',
    compare: 'COMPARE',
    rebuild: 'REBUILD',
    review: 'REVIEW',
    apply: 'APPLY',
  };
  return labels[step];
}

export function moreCategoryLabel(category: MoreCategory): string {
  const labels: Record<MoreCategory, string> = {
    landing: 'MORE',
    system: 'SYSTEM',
    providers: 'PROVIDERS',
    capture: 'CAPTURE',
    'route-audit': 'ROUTE AUDIT',
    storage: 'STORAGE',
    automation: 'AUTOMATION',
    presets: 'PRESETS',
  };
  return labels[category];
}
