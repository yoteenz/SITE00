/**
 * Conceptual distinctiveness gate across six Core Directions — pre-generation QA.
 */

import type { FormedCoreDirection } from '../creativeIntelligence/types.js';

const MARKED_UP_COPY_CLONE_SIGNALS = [
  'marked-up',
  'marked up',
  'strike-through',
  'strikethrough',
  'handwritten margin',
  'annotation',
  'proof sheet',
  'document table',
  'distressed print',
  'editorial margin',
  'cream background',
  'lime accent',
];

const COMPARISON_FIELDS: Array<keyof FormedCoreDirection> = [
  'oneLineThesis',
  'bigIdea',
  'visualMetaphor',
  'governingBehavior',
  'materialImageryLanguage',
  'typographicAttitude',
  'coreColorLogic',
  'primaryBrandArtifact',
  'socialExpressionHypothesis',
];

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokenSet(text: string): Set<string> {
  const out = new Set<string>();
  for (const token of normalizeText(text).split(/\s+/)) {
    if (token.length > 2) out.add(token);
  }
  return out;
}

function fieldOverlap(a: FormedCoreDirection, b: FormedCoreDirection): number {
  const partsA: string[] = [];
  const partsB: string[] = [];
  for (const field of COMPARISON_FIELDS) {
    const va = a[field];
    const vb = b[field];
    if (typeof va === 'string') partsA.push(va);
    if (typeof vb === 'string') partsB.push(vb);
    if (Array.isArray(va)) partsA.push(...va.map(String));
    if (Array.isArray(vb)) partsB.push(...vb.map(String));
  }
  const setA = tokenSet(partsA.join(' '));
  const setB = tokenSet(partsB.join(' '));
  if (setA.size === 0 && setB.size === 0) return 0;
  if (setA.size === 0 || setB.size === 0) return 0;
  let shared = 0;
  for (const t of setA) {
    if (setB.has(t)) shared += 1;
  }
  return shared / Math.max(setA.size, setB.size);
}

function looksLikeMarkedUpClone(direction: FormedCoreDirection): boolean {
  const blob = COMPARISON_FIELDS.map((f) => String(direction[f] ?? '')).join(' ').toLowerCase();
  let hits = 0;
  for (const signal of MARKED_UP_COPY_CLONE_SIGNALS) {
    if (blob.includes(signal)) hits += 1;
  }
  return hits >= 3;
}

export type DirectionDistinctivenessGateResult = {
  passed: boolean;
  pairResults: Array<{
    directionA: string;
    directionB: string;
    overlapRatio: number;
    collapseRisk: boolean;
    cloneRisk: boolean;
  }>;
  notes: string[];
};

export function runDirectionDistinctivenessGate(
  directions: FormedCoreDirection[],
): DirectionDistinctivenessGateResult {
  const notes: string[] = [];
  const pairResults: DirectionDistinctivenessGateResult['pairResults'] = [];

  for (let i = 0; i < directions.length; i += 1) {
    for (let j = i + 1; j < directions.length; j += 1) {
      const a = directions[i];
      const b = directions[j];
      const overlapRatio = fieldOverlap(a, b);
      const collapseRisk = overlapRatio >= 0.55;
      const cloneRisk =
        looksLikeMarkedUpClone(b) &&
        (a.directionName.toUpperCase().includes('MARKED') || looksLikeMarkedUpClone(a));
      pairResults.push({
        directionA: a.directionName,
        directionB: b.directionName,
        overlapRatio: Math.round(overlapRatio * 100) / 100,
        collapseRisk,
        cloneRisk,
      });
      if (collapseRisk) {
        notes.push(
          `COLLAPSE RISK: "${a.directionName}" vs "${b.directionName}" — conceptual overlap ${Math.round(overlapRatio * 100)}%`,
        );
      }
      if (cloneRisk) {
        notes.push(`CLONE RISK: "${b.directionName}" may be Marked-Up Copy execution variant`);
      }
    }
  }

  const passed = !pairResults.some((p) => p.collapseRisk || p.cloneRisk);
  if (passed) {
    notes.push('Distinctiveness gate passed — six directions occupy separable conceptual territories.');
  }

  return { passed, pairResults, notes };
}
