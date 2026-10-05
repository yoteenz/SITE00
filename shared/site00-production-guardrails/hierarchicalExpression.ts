import fs from 'node:fs';
import path from 'node:path';
import { familyKey } from './familyEnvironmentDistinctness.js';
import type { BlockedReason, GenerationRequest } from './types.js';

/** Global expression matrix. Separate from the family-brief matrix. */
export const EXPRESSION_MATRIX_PATH = 'JURNL/MANIFEST/JURNL_EXPRESSION_MATRIX.json';

export const EXPRESSION_NODE_FIELDS = [
  'node_id',
  'node_type',
  'product_job',
  'expression_class',
  'expression_concept',
  'parent_expression_inherited',
  'expression_changes',
  'environment_policy',
  'panel_policy',
  'button_policy',
  'typography_policy',
  'interaction_policy',
  'motion_policy',
  'distinct_authority_required',
] as const;

const NODE_TYPES = new Set(['FAMILY', 'PARENT', 'CHILD', 'GRANDCHILD', 'STATE', 'INTERACTION', 'PANEL', 'CONTROL']);
const CHILD_CLASSES = new Set(['DIRECT_INHERITANCE', 'MODULATED_INHERITANCE', 'DISTINCT_SUB_EXPRESSION']);
const GRANDCHILD_CLASSES = new Set(['STATE_LIKE', 'INTERACTION_LIKE', 'MATERIAL_SUB_SURFACE']);
const ENVIRONMENT_POLICIES = new Set([
  'REUSE_PARENT_PLATE',
  'MODULATE_PARENT_PLATE',
  'NEW_PLATE_WITHIN_FAMILY',
  'NO_PLATE_REQUIRED',
]);

export type HierarchicalCheck =
  | { status: 'PASS' }
  | {
      status: 'BLOCKED';
      blockedReason: Extract<BlockedReason, 'HIERARCHICAL_EXPRESSION_REQUIRED' | 'FAMILY_EXPRESSION_GATE_FAILED'>;
    };

function present(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return true;
  if (typeof value === 'boolean') return true;
  return value !== null && value !== undefined;
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
}

type ExpressionNode = Record<string, unknown>;

function nodeReady(node: ExpressionNode): boolean {
  if (!EXPRESSION_NODE_FIELDS.every((field) => present(node[field]))) return false;
  if (!NODE_TYPES.has(String(node.node_type))) return false;
  if (!ENVIRONMENT_POLICIES.has(String(node.environment_policy))) return false;
  if (typeof node.distinct_authority_required !== 'boolean') return false;
  if (node.node_type === 'CHILD' && !CHILD_CLASSES.has(String(node.expression_class))) return false;
  if (node.node_type === 'GRANDCHILD' && !GRANDCHILD_CLASSES.has(String(node.expression_class))) return false;
  return true;
}

/**
 * Paid JURNL work needs an expression tree below the family: a parent concept,
 * classified material children, and environment / panel / control policies.
 * Other projects are unchanged. Credits stay 0 when this blocks.
 */
export function validateHierarchicalExpression(request: GenerationRequest, repoRoot: string): HierarchicalCheck {
  if (request.projectId !== 'JURNL') return { status: 'PASS' };
  const key = familyKey(request.familyId);
  if (!/^F\d+$/.test(key)) return { status: 'PASS' };

  const matrixFile = path.join(repoRoot, EXPRESSION_MATRIX_PATH);
  if (!fs.existsSync(matrixFile)) return { status: 'BLOCKED', blockedReason: 'HIERARCHICAL_EXPRESSION_REQUIRED' };
  const matrix = readJson(matrixFile) as { families?: Record<string, { expression_tree?: string }> };
  const treeRel = matrix.families?.[key]?.expression_tree;
  if (!treeRel) return { status: 'BLOCKED', blockedReason: 'HIERARCHICAL_EXPRESSION_REQUIRED' };
  const treeFile = path.join(repoRoot, treeRel);
  if (!fs.existsSync(treeFile)) return { status: 'BLOCKED', blockedReason: 'HIERARCHICAL_EXPRESSION_REQUIRED' };

  const tree = readJson(treeFile) as {
    nodes?: ExpressionNode[];
    repetition_audit?: { status?: string };
    generation_gate?: Record<string, unknown>;
  };
  const nodes = tree.nodes ?? [];
  if (!nodes.length || !nodes.every(nodeReady)) return { status: 'BLOCKED', blockedReason: 'FAMILY_EXPRESSION_GATE_FAILED' };
  if (!nodes.some((node) => node.node_type === 'PARENT' && present(node.expression_concept))) {
    return { status: 'BLOCKED', blockedReason: 'FAMILY_EXPRESSION_GATE_FAILED' };
  }
  if (!nodes.some((node) => node.node_type === 'FAMILY')) {
    return { status: 'BLOCKED', blockedReason: 'FAMILY_EXPRESSION_GATE_FAILED' };
  }
  if (tree.repetition_audit?.status !== 'PASS') return { status: 'BLOCKED', blockedReason: 'FAMILY_EXPRESSION_GATE_FAILED' };

  const gate = tree.generation_gate ?? {};
  const ready =
    gate.product_tree_locked_enough === true &&
    gate.family_expression_defined === true &&
    gate.parent_expression_defined === true &&
    gate.material_child_expressions_defined === true &&
    gate.environment_policies_defined === true &&
    gate.panel_control_policies_defined === true &&
    gate.repetition_audit === 'PASS';
  if (!ready) return { status: 'BLOCKED', blockedReason: 'FAMILY_EXPRESSION_GATE_FAILED' };
  return { status: 'PASS' };
}
