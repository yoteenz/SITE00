import fs from 'node:fs';
import path from 'node:path';
import { familyKey } from '../site00-production-guardrails/familyEnvironmentDistinctness.js';
import type { BlockedReason } from '../site00-production-guardrails/types.js';

const MATRIX_PATH = 'JURNL/MANIFEST/JURNL_FAMILY_EXPRESSION_MATRIX.json';

export type DistinctnessGateResult =
  | { status: 'PASS' }
  | { status: 'BLOCKED'; blockedReason: Extract<BlockedReason, 'FAMILY_EXPRESSION_GATE_FAILED'>; detail: string };

/** Blocks canonical final parent work when family distinctness is FAIL (exploration may pass). */
export function validateJurnlDistinctnessForCanonicalFinal(
  repoRoot: string,
  familyId: string,
  options: { canonicalFinal: boolean; role: string },
): DistinctnessGateResult {
  if (!options.canonicalFinal) return { status: 'PASS' };
  if (options.role !== 'FULL_PAGE_AUTHORITY' && options.role !== 'ENVIRONMENT_PLATE_DERIVATION') {
    return { status: 'PASS' };
  }
  const key = familyKey(familyId);
  const matrixFile = path.join(repoRoot, MATRIX_PATH);
  if (!fs.existsSync(matrixFile)) return { status: 'PASS' };
  const matrix = JSON.parse(fs.readFileSync(matrixFile, 'utf8')) as {
    families?: Record<string, { brief_json?: string }>;
  };
  const briefRel = matrix.families?.[key]?.brief_json;
  if (!briefRel) return { status: 'PASS' };
  const briefFile = path.join(repoRoot, briefRel);
  if (!fs.existsSync(briefFile)) return { status: 'PASS' };
  const brief = JSON.parse(fs.readFileSync(briefFile, 'utf8')) as {
    current_mount_distinctness?: string;
  };
  if (String(brief.current_mount_distinctness ?? '').toUpperCase() === 'FAIL') {
    return {
      status: 'BLOCKED',
      blockedReason: 'FAMILY_EXPRESSION_GATE_FAILED',
      detail: `${key} distinctness FAIL — canonical final blocked until correction (exploration may use canonicalFinal=false)`,
    };
  }
  return { status: 'PASS' };
}
