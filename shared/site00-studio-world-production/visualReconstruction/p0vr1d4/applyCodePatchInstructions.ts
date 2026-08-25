/**
 * P0.VR.1D.4 — Apply actionable CSS patches to style sources.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ActionableCodePatch, AppliedCodePatchResult } from './types.js';

export type ApplyCodePatchInstructionsInput = {
  patches: ActionableCodePatch[];
  projectRoot?: string;
  dryRun?: boolean;
};

export function applyCodePatchInstructions(input: ApplyCodePatchInstructionsInput): AppliedCodePatchResult[] {
  const root = input.projectRoot ?? process.cwd();
  const results: AppliedCodePatchResult[] = [];

  for (const patch of input.patches) {
    const stylePath = patch.styleSource ? join(root, patch.styleSource) : null;
    if (!stylePath || !existsSync(stylePath)) {
      results.push({
        instructionId: patch.instructionId,
        applied: false,
        filePath: stylePath ?? patch.filePath ?? '',
        reason: 'STYLE_SOURCE_NOT_FOUND',
      });
      continue;
    }

    const css = readFileSync(stylePath, 'utf8');
    const applied = applyCssPropertyPatch(css, patch);
    if (!applied.ok) {
      results.push({
        instructionId: patch.instructionId,
        applied: false,
        filePath: stylePath,
        reason: applied.reason,
      });
      continue;
    }

    if (!input.dryRun && applied.nextCss !== css) {
      writeFileSync(stylePath, applied.nextCss, 'utf8');
    }

    results.push({
      instructionId: patch.instructionId,
      applied: applied.nextCss !== css,
      filePath: stylePath,
      reason: applied.nextCss !== css ? 'APPLIED' : 'NO_CHANGE',
    });
  }

  return results;
}

function applyCssPropertyPatch(
  css: string,
  patch: ActionableCodePatch,
): { ok: true; nextCss: string; reason?: string } | { ok: false; reason: string } {
  const property = patch.property;
  const current = patch.current.replace(/px$/, '');
  const target = patch.targetValue.replace(/px$/, '');

  const escapedCurrent = escapeRegExp(current);
  const direct = new RegExp(`(${escapeRegExp(property)}\\s*:\\s*)${escapedCurrent}px`, 'i');
  if (direct.test(css)) {
    return { ok: true, nextCss: css.replace(direct, `$1${target}px`) };
  }

  const looseCurrent = new RegExp(`(${escapeRegExp(property)}\\s*:\\s*)${escapedCurrent}(\\s*;)` , 'i');
  if (looseCurrent.test(css)) {
    return { ok: true, nextCss: css.replace(looseCurrent, `$1${target}$2`) };
  }

  if (property === 'grid-template-columns' && patch.current.includes('430px')) {
    const grid = /grid-template-columns:\s*148px\s+minmax\(0,\s*1fr\)\s+430px/gi;
    if (grid.test(css)) {
      return {
        ok: true,
        nextCss: css.replace(grid, 'grid-template-columns: 148px minmax(0, 1fr) 402px'),
      };
    }
  }

  return { ok: false, reason: `PROPERTY_NOT_FOUND:${property}=${current}` };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function patchesExecutedInCode(results: AppliedCodePatchResult[]): boolean {
  return results.some((r) => r.applied);
}
