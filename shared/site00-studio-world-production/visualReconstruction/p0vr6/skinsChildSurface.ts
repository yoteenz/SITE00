/**
 * SKINS child-surface cohesion QA + failure codes.
 */

export const SKINS_CHILD_FAILURE_CODES = [
  'SKINS_CHILD_SURFACE_VISUAL_DRIFT',
  'SKINS_RAW_FORM_FALLBACK',
  'SKINS_NATIVE_CONTROL_LEAK',
  'SKINS_AUTHORITY_FORM_TEXT_HEAVY',
  'SKINS_CONTEXT_LOST',
  'SKINS_VISUAL_QA_UNDESIGNED',
  'SKINS_COMPARISON_MOBILE_UNUSABLE',
  'SKINS_VERSION_HISTORY_UNDESIGNED',
  'SKINS_CHILD_DESKTOP_MOBILE_TRANSLATION',
] as const;

export type SkinsChildFailureCode = (typeof SKINS_CHILD_FAILURE_CODES)[number];

export type SkinsCohesionCheck = {
  id: string;
  pass: boolean;
};

export function runSkinsWorkspaceCohesionQA(input: {
  usesSkinWorkspaceSheet: boolean;
  hasContextHeader: boolean;
  hasStyledViewportControl: boolean;
  hasLockedAuthorityContract: boolean;
  hasCompactReferenceContract: boolean;
  exposesNativeFileInput: boolean;
  usesMartianMono: boolean;
  usesUppercase: boolean;
}): { pass: boolean; checks: SkinsCohesionCheck[] } {
  const checks: SkinsCohesionCheck[] = [
    { id: 'sheet', pass: input.usesSkinWorkspaceSheet },
    { id: 'context', pass: input.hasContextHeader },
    { id: 'viewport', pass: input.hasStyledViewportControl },
    { id: 'authority_locked', pass: input.hasLockedAuthorityContract },
    { id: 'contract_compact', pass: input.hasCompactReferenceContract },
    { id: 'no_native_file', pass: !input.exposesNativeFileInput },
    { id: 'martian_mono', pass: input.usesMartianMono },
    { id: 'uppercase', pass: input.usesUppercase },
  ];
  return { pass: checks.every((c) => c.pass), checks };
}

export const IMPLEMENTATION_STAGES = [
  'PREPARING',
  'IMPLEMENTING',
  'CAPTURING',
  'VISUAL_QA',
  'CORRECTING',
  'VERIFYING',
] as const;

export type ImplementationStage = (typeof IMPLEMENTATION_STAGES)[number];

export const VISUAL_QA_MODES = ['REFERENCE', 'LIVE', 'OVERLAY', 'DIFF'] as const;
export type VisualQaMode = (typeof VISUAL_QA_MODES)[number];
