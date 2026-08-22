import type {
  ManifestRequirementRow,
  RequirementDependencyRow,
  ReadinessResult,
  RequirementClassification,
  ExecutionStatus,
} from './types.js';
import {
  countsTowardReadiness,
  isCompleteRequirement,
  READINESS_EXCLUDED_CLASSIFICATIONS,
} from './types.js';

export function calculateReadiness(
  requirements: ManifestRequirementRow[],
  overrides: Set<string>,
): ReadinessResult {
  const contributing = requirements.map((r) => {
    const hasOverride = overrides.has(r.id);
    const counts = countsTowardReadiness(r.classification);
    const complete = isCompleteRequirement(r.classification, r.execution_status, hasOverride);
    let blockingReason: string | null = null;

    if (counts && !complete && !hasOverride) {
      if (r.classification === 'BLOCKED') {
        blockingReason = r.blocking_impact ?? 'Requirement is blocked';
      } else if (r.execution_status === 'NOT_STARTED' || r.execution_status === 'IN_PROGRESS') {
        blockingReason = `${r.title} is ${r.execution_status.replace(/_/g, ' ').toLowerCase()}`;
      } else if (r.execution_status === 'BLOCKED') {
        blockingReason = r.blocking_impact ?? 'Execution blocked';
      }
    }

    if (hasOverride && !complete) {
      blockingReason = null;
    }

    return {
      id: r.id,
      requirement_key: r.requirement_key,
      title: r.title,
      classification: r.classification,
      execution_status: r.execution_status,
      countsTowardReadiness: counts,
      blockingReason,
      hasOverride,
      complete,
    };
  });

  const required = contributing.filter((c) => c.countsTowardReadiness);
  const completeItems = required.filter((c) => c.complete || c.hasOverride).length;
  const blockedItems = required.filter((c) => c.blockingReason !== null).length;
  const deferredItems = requirements.filter((r) =>
    READINESS_EXCLUDED_CLASSIFICATIONS.includes(r.classification),
  ).length;
  const optionalItems = requirements.filter((r) => r.classification === 'OPTIONAL_POST_LAUNCH').length;

  const requiredItems = required.length;
  const blockingRequirementsRemaining = required.filter((c) => c.blockingReason !== null).length;
  const readinessScore =
    requiredItems > 0 ? Math.round((completeItems / requiredItems) * 100) : 100;

  const explanation: string[] = [
    `Launch readiness calculated against ${requiredItems} required items only.`,
    `${completeItems} complete, ${blockingRequirementsRemaining} blocking remaining.`,
    `${deferredItems} deferred/out-of-scope items excluded from readiness.`,
  ];

  if (blockedItems > 0) {
    explanation.push(`${blockedItems} items currently blocking launch.`);
  }

  return {
    readinessScore,
    blockingRequirementsRemaining,
    requiredItems,
    completeItems,
    blockedItems,
    deferredItems,
    optionalItems,
    explanation,
    contributingRequirements: contributing.map(({ hasOverride: _, complete: __, ...rest }) => rest),
  };
}

export function explainRequirement(
  requirement: ManifestRequirementRow,
  dependencies: RequirementDependencyRow[],
  allRequirements: ManifestRequirementRow[],
): { whyRequired: string; dependencyChain: string[]; whyNotBlocking: string | null } {
  const byId = new Map(allRequirements.map((r) => [r.id, r]));
  const chain: string[] = [requirement.title.toUpperCase()];

  let current = requirement;
  const visited = new Set<string>();
  while (current) {
    const dep = dependencies.find((d) => d.target_requirement_id === current!.id);
    if (!dep || visited.has(dep.source_requirement_id)) break;
    visited.add(dep.source_requirement_id);
    const parent = byId.get(dep.source_requirement_id);
    if (!parent) break;
    chain.unshift(parent.title.toUpperCase());
    current = parent;
  }

  let whyNotBlocking: string | null = null;
  if (READINESS_EXCLUDED_CLASSIFICATIONS.includes(requirement.classification)) {
    whyNotBlocking = `Classification: ${requirement.classification}. ${
      requirement.why_required ?? 'Owner elected to defer or exclude from current launch target.'
    } Launch impact: NON-BLOCKING. Target: ${requirement.target_milestone ?? 'EVOLVE / POST-LAUNCH'}.`;
  }

  return {
    whyRequired: requirement.why_required ?? requirement.description ?? 'Required for launch target.',
    dependencyChain: chain,
    whyNotBlocking,
  };
}

export function canParentBeSatisfied(
  parentId: string,
  requirements: ManifestRequirementRow[],
  dependencies: RequirementDependencyRow[],
  overrides: Set<string>,
): boolean {
  const parent = requirements.find((r) => r.id === parentId);
  if (!parent) return false;

  const childDeps = dependencies.filter((d) => d.source_requirement_id === parentId);
  for (const dep of childDeps) {
    const child = requirements.find((r) => r.id === dep.target_requirement_id);
    if (!child) continue;
    if (!isCompleteRequirement(child.classification, child.execution_status, overrides.has(child.id))) {
      return false;
    }
  }
  return true;
}
