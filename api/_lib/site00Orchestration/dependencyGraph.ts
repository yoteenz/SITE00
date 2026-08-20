import type { RequirementDependencyRow } from './types.js';

export class CircularDependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircularDependencyError';
  }
}

export function validateDependencyGraph(
  dependencies: Array<{ source_requirement_id: string; target_requirement_id: string }>,
): void {
  const graph = new Map<string, string[]>();
  for (const d of dependencies) {
    const edges = graph.get(d.source_requirement_id) ?? [];
    edges.push(d.target_requirement_id);
    graph.set(d.source_requirement_id, edges);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (visiting.has(node)) {
      throw new CircularDependencyError(
        `Circular dependency detected: ${[...path, node].join(' → ')}`,
      );
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const next of graph.get(node) ?? []) {
      dfs(next, [...path, node]);
    }
    visiting.delete(node);
    visited.add(node);
  }

  for (const node of graph.keys()) {
    dfs(node, []);
  }
}

export function getDownstreamRequirements(
  requirementId: string,
  dependencies: RequirementDependencyRow[],
): string[] {
  const result: string[] = [];
  const queue = [requirementId];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (seen.has(current)) continue;
    seen.add(current);

    for (const dep of dependencies) {
      if (dep.source_requirement_id === current && !seen.has(dep.target_requirement_id)) {
        result.push(dep.target_requirement_id);
        queue.push(dep.target_requirement_id);
      }
    }
  }
  return result;
}

export function getBlockingDependencies(
  requirementId: string,
  dependencies: RequirementDependencyRow[],
  completedIds: Set<string>,
): string[] {
  return dependencies
    .filter(
      (d) =>
        d.target_requirement_id === requirementId &&
        !completedIds.has(d.source_requirement_id),
    )
    .map((d) => d.source_requirement_id);
}

export function buildDependencyChainTitles(
  requirementId: string,
  dependencies: RequirementDependencyRow[],
  titleById: Map<string, string>,
): string[] {
  const chain: string[] = [];
  let currentId: string | null = requirementId;
  const visited = new Set<string>();

  while (currentId) {
    const title = titleById.get(currentId);
    if (title) chain.unshift(title.toUpperCase());
    const dep = dependencies.find((d) => d.target_requirement_id === currentId);
    if (!dep || visited.has(dep.source_requirement_id)) break;
    visited.add(dep.source_requirement_id);
    currentId = dep.source_requirement_id;
  }
  return chain;
}
