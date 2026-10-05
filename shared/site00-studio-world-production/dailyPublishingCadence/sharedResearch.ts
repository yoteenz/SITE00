/**
 * Shared research package — reused across platform expressions from one intelligence object.
 */

import { createHash } from 'node:crypto';
import type { CrossPlatformContentIntelligence, PlatformContentExpression, SharedResearchPackage } from './types.js';

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

export function buildSharedResearchPackage(params: {
  contentIntelligenceId: string;
  verifiedFacts: string[];
  citations: string[];
  evidence: string[];
}): SharedResearchPackage {
  return {
    packageId: `research-${params.contentIntelligenceId}`,
    contentIntelligenceId: params.contentIntelligenceId,
    verifiedFacts: params.verifiedFacts,
    citations: params.citations,
    evidence: params.evidence,
    chronology: [],
    sourceLineage: params.citations,
    claimClassifications: [],
    frozenAt: null,
    fingerprint: hash(params.contentIntelligenceId),
  };
}

export function freezeSharedResearchPackage(pkg: SharedResearchPackage): SharedResearchPackage {
  return { ...pkg, frozenAt: new Date().toISOString() };
}

export function researchReusedAcrossPlatforms(params: {
  packages: SharedResearchPackage[];
  expressions: PlatformContentExpression[];
}): boolean {
  const intelligenceIds = new Set(params.expressions.map((e) => e.contentIntelligenceId));
  return params.packages.filter((p) => intelligenceIds.has(p.contentIntelligenceId)).length <= intelligenceIds.size;
}

export function researchNotDuplicatedPerPlatformByDefault(
  _intelligence: CrossPlatformContentIntelligence,
  platformCount: number,
  researchPackageCount: number,
): boolean {
  return researchPackageCount <= 1 && platformCount > 1;
}
