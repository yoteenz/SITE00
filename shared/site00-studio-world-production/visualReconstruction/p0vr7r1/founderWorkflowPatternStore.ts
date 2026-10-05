/**
 * P0.VR.7R1 — In-memory founder workflow pattern persistence.
 */

import type { FounderWorkflowPattern, SiblingAssetSetType } from './types.js';

const patterns = new Map<string, FounderWorkflowPattern>();

function patternKey(projectId: string, assetSetType: SiblingAssetSetType): string {
  return `${projectId}::${assetSetType}`;
}

export function getFounderWorkflowPattern(input: {
  projectId: string;
  jobType?: string;
  assetSetType: SiblingAssetSetType;
}): FounderWorkflowPattern | null {
  return patterns.get(patternKey(input.projectId, input.assetSetType)) ?? null;
}

export function upsertFounderWorkflowPattern(pattern: FounderWorkflowPattern): FounderWorkflowPattern {
  patterns.set(patternKey(pattern.projectId, pattern.assetSetType), pattern);
  return pattern;
}

export function recordPatternUsage(patternId: string): void {
  for (const [key, pattern] of patterns.entries()) {
    if (pattern.patternId === patternId) {
      patterns.set(key, { ...pattern, usageCount: pattern.usageCount + 1, lastUsedAt: new Date().toISOString() });
      return;
    }
  }
}

export function resetFounderWorkflowPatternsForTest(): void {
  patterns.clear();
}
