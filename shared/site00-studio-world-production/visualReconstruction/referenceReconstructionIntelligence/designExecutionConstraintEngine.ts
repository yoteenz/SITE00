/**
 * Layer 3 — Design Execution Constraint Engine
 */

import type { ExecutionStyleConflict, ReferenceGeometrySpec, RriFailureCode } from './types.js';

export type ExecutionAuditInput = {
  cssSources: string[];
  componentDefaults?: Array<{ component: string; property: string; value: string }>;
  authorityGeometry: ReferenceGeometrySpec[];
};

export function auditExecutionStyleConflicts(input: ExecutionAuditInput): ExecutionStyleConflict[] {
  const conflicts: ExecutionStyleConflict[] = [];
  const css = input.cssSources.join('\n');

  if (/min-height:\s*120px/i.test(css)) {
    const cardSpec = input.authorityGeometry.find((g) => g.regionId.includes('card') || g.regionId.includes('family'));
    if (cardSpec && cardSpec.height < 120) {
      conflicts.push({
        selector: '.shared-card',
        property: 'min-height',
        currentValue: '120px',
        authorityValue: `${Math.round(cardSpec.height)}px`,
        scope: 'SCREEN',
        severity: 'MAJOR',
        failureCode: 'REFERENCE_GLOBAL_CSS_CONTAMINATION',
      });
    }
  }

  if (/input\[type=.?file.?\]/i.test(css) && !/appearance:\s*none/i.test(css)) {
    conflicts.push({
      selector: 'input[type=file]',
      property: 'appearance',
      currentValue: 'native',
      authorityValue: 'custom',
      scope: 'SCREEN',
      severity: 'MAJOR',
      failureCode: 'REFERENCE_NATIVE_CONTROL_LEAK',
    });
  }

  if (/\.site00-dw-skins__family-thumb--fallback/i.test(css) && !/load-failed/i.test(css)) {
    conflicts.push({
      selector: '.site00-dw-skins__family-card',
      property: 'background',
      currentValue: 'primaryColor fallback',
      authorityValue: 'canonical image',
      scope: 'SKINS',
      severity: 'MAJOR',
      failureCode: 'REFERENCE_GLOBAL_CSS_CONTAMINATION',
    });
  }

  return conflicts;
}

export function auditBoxModel(input: { boxSizing: string; usesBorderBox: boolean }): RriFailureCode | null {
  if (!input.usesBorderBox && input.boxSizing !== 'border-box') {
    return 'REFERENCE_BOX_MODEL_DRIFT';
  }
  return null;
}

export function allowLegacyWrapperReplacement(blocking: boolean): boolean {
  return blocking;
}
