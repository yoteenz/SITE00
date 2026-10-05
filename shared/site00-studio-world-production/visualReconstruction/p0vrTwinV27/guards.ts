import { INVENTION_BUDGET_NONE, TWIN_V27_FAILURE_CODES } from './constants.js';
import type { BlueprintObjectCodeBinding, SurgicalBlueprintObject } from './types.js';

export function assertBlueprintNotPostHocOnly(input: {
  compositionStateCreatedAt: string;
  blueprintCreatedAt: string;
  authorityImageReceivedAt: string | null;
  blueprintSource: 'COMPOSITION_STATE' | 'POSTHOC_VISION';
}): void {
  if (input.blueprintSource === 'POSTHOC_VISION') {
    throw new Error(TWIN_V27_FAILURE_CODES[0]);
  }
  if (input.authorityImageReceivedAt && input.blueprintCreatedAt > input.authorityImageReceivedAt) {
    if (input.compositionStateCreatedAt > input.authorityImageReceivedAt) {
      throw new Error(TWIN_V27_FAILURE_CODES[0]);
    }
  }
}

export function assertAuthorityRuntimeFirewall(sourceSnippet: string): { pass: boolean; violations: string[] } {
  const forbidden = [
    'authority-ghost',
    'fullPageConceptImage',
    'backgroundImage: visualAuthority',
    'TwinV2ExecutionClientCanvasFrame',
    'data-authority-substrate',
  ];
  const violations = forbidden.filter((p) => sourceSnippet.includes(p));
  return { pass: violations.length === 0, violations };
}

export function assertAuthorityHashGuard(runtimeSnippet: string, authorityHash: string): void {
  if (authorityHash && runtimeSnippet.includes(authorityHash)) {
    throw new Error('TWIN_V2_AUTHORITY_RUNTIME_DEPENDENCY');
  }
}

export function runParallelVisualObjectGuard(input: {
  blueprintObjects: SurgicalBlueprintObject[];
  proposedNewControls: { role: string; functionKey: string }[];
}): { pass: boolean; code: string | null } {
  for (const ctrl of input.proposedNewControls) {
    const match = input.blueprintObjects.find(
      (o) =>
        o.functionBindingTarget === ctrl.functionKey ||
        (o.type === 'NAV_ITEM' && ctrl.role.toLowerCase().includes('nav')),
    );
    if (match) {
      return { pass: false, code: 'TWIN_V2_PARALLEL_FUNCTION_UI' };
    }
  }
  return { pass: true, code: null };
}

export function assertFunctionVisualTargetMissing(
  functionTargets: { objectId: string; functionKey: string }[],
  blueprintObjectIds: Set<string>,
): void {
  for (const t of functionTargets) {
    if (!blueprintObjectIds.has(t.objectId)) {
      throw new Error(`FUNCTION_VISUAL_TARGET_MISSING:${t.objectId}`);
    }
  }
}

export function assertTranslationInventionBudget(stage: string): void {
  if (stage === 'BLUEPRINT_TO_CODE' && INVENTION_BUDGET_NONE !== 'NONE') {
    throw new Error('TRANSLATION_INVENTION_VIOLATION');
  }
}

export function assertBlueprintTranslationGap(gaps: { objectId: string; property: string; reason: string }[]): void {
  if (gaps.length > 0) {
    const first = gaps[0]!;
    throw new Error(`BLUEPRINT_TRANSLATION_GAP:${first.objectId}:${first.property}:${first.reason}`);
  }
}

export function assertNoUnboundPrimaryObject(bindings: BlueprintObjectCodeBinding[]): string[] {
  const primaryPrefixes = ['masthead', 'sectionNav', 'hero', 'progress', 'metrics', 'focus', 'milestone', 'activity'];
  return primaryPrefixes.filter(
    (p) => !bindings.some((b) => b.objectId.startsWith(p) && b.status === 'BOUND'),
  );
}
