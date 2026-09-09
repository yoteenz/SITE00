/**
 * PageCompletionRecursionGuard
 */

const MAX_DEPTH = 4;

export function canRecursePageCompletion(depth: number, pageId: string, visited: string[]): {
  allowed: boolean;
  reason: string | null;
} {
  if (depth >= MAX_DEPTH) {
    return { allowed: false, reason: 'PAGE_COMPLETION_RECURSION_LOOP' };
  }
  if (visited.includes(pageId)) {
    return { allowed: false, reason: 'PAGE_COMPLETION_RECURSION_LOOP' };
  }
  return { allowed: true, reason: null };
}

export function nextVisited(visited: string[], pageId: string): string[] {
  return [...visited, pageId];
}
