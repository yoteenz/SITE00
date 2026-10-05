import fs from 'node:fs';
import path from 'node:path';
import { familyKey } from './familyEnvironmentDistinctness.js';
import type { BlockedReason, GenerationRequest } from './types.js';

export const FAMILY_EXPRESSION_BRIEF_FIELDS = [
  'family_id',
  'family_name',
  'product_job',
  'user_question_answered',
  'emotional_role',
  'spatial_metaphor',
  'architectural_character',
  'lighting_character',
  'material_emphasis',
  'environmental_focal_point',
  'object_language',
  'botanical_role',
  'negative_space_strategy',
  'composition_bias',
  'information_density',
  'panel_behavior',
  'data_visualization_character',
  'interaction_character',
  'motion_character',
  'typographic_character',
  'relationship_to_previous_family',
  'relationship_to_next_family',
  'global_jurnl_traits_preserved',
  'family_specific_traits',
  'cross_family_plate_reuse_allowed',
  'cross_family_reuse_reason',
  'distinctness_risks',
] as const;

const MATRIX_PATH = 'JURNL/MANIFEST/JURNL_FAMILY_EXPRESSION_MATRIX.json';

export type ExpressionCheck =
  | { status: 'PASS' }
  | {
      status: 'BLOCKED';
      blockedReason: Extract<BlockedReason, 'FAMILY_EXPRESSION_BRIEF_REQUIRED' | 'FAMILY_EXPRESSION_GATE_FAILED'>;
    };

type BriefGate = {
  brief?: string;
  distinctness_test?: string;
  repetition_audit?: string;
  cross_family_reuse?: string;
  generation_allowed?: boolean;
};

function present(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
}

/** Paid JURNL work needs a ready expression brief. Other projects are unchanged. */
export function validateFamilyExpressionBrief(request: GenerationRequest, repoRoot: string): ExpressionCheck {
  if (request.projectId !== 'JURNL') return { status: 'PASS' };
  const key = familyKey(request.familyId);
  if (!/^F\d+$/.test(key)) return { status: 'PASS' };

  const matrixFile = path.join(repoRoot, MATRIX_PATH);
  if (!fs.existsSync(matrixFile)) return { status: 'BLOCKED', blockedReason: 'FAMILY_EXPRESSION_BRIEF_REQUIRED' };
  const matrix = readJson(matrixFile) as { families?: Record<string, { brief_json?: string }> };
  const briefRel = matrix.families?.[key]?.brief_json;
  if (!briefRel) return { status: 'BLOCKED', blockedReason: 'FAMILY_EXPRESSION_BRIEF_REQUIRED' };
  const briefFile = path.join(repoRoot, briefRel);
  const markdown = briefFile.replace(/\.json$/, '.md');
  if (!fs.existsSync(briefFile) || !fs.existsSync(markdown)) {
    return { status: 'BLOCKED', blockedReason: 'FAMILY_EXPRESSION_BRIEF_REQUIRED' };
  }

  const brief = readJson(briefFile) as Record<string, unknown>;
  const missing = FAMILY_EXPRESSION_BRIEF_FIELDS.filter((field) => !present(brief[field]));
  if (missing.length) return { status: 'BLOCKED', blockedReason: 'FAMILY_EXPRESSION_BRIEF_REQUIRED' };

  const gate = brief.founder_gate as BriefGate | undefined;
  const reuse = String(brief.cross_family_plate_reuse_allowed ?? '');
  const ready =
    gate?.brief === 'READY' &&
    gate.distinctness_test === 'PASS' &&
    gate.repetition_audit === 'PASS' &&
    (gate.cross_family_reuse === 'NONE' || gate.cross_family_reuse === 'JUSTIFIED') &&
    gate.generation_allowed === true &&
    (reuse === 'NO' || (reuse === 'YES' && present(brief.cross_family_reuse_reason)));
  if (!ready) return { status: 'BLOCKED', blockedReason: 'FAMILY_EXPRESSION_GATE_FAILED' };
  return { status: 'PASS' };
}
