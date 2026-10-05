import type { ConceptCandidate } from '../p0vrTwinV22/types.js';
import type { TwinV2ImplementationStrategy } from './types.js';

export function resolveTwinV2ImplementationStrategy(input: {
  conceptId: string;
  approvalStatus: ConceptCandidate['founderJudgment'];
  executionPackageId: string | null;
  visualAuthorityId: string | null;
  implementationStrategy?: TwinV2ImplementationStrategy | null;
}): TwinV2ImplementationStrategy {
  if (input.approvalStatus !== 'APPROVED') {
    throw new Error('TWIN_V2_STRATEGY_BLOCKED: concept must be APPROVED');
  }
  if (!input.executionPackageId) {
    throw new Error('TWIN_V2_STRATEGY_BLOCKED: ExecutableConceptPackage required');
  }
  if (!input.visualAuthorityId) {
    throw new Error('TWIN_V2_VISUAL_AUTHORITY_MISSING');
  }
  const forbidden: TwinV2ImplementationStrategy[] = [
    'SEMANTIC_BLUEPRINT_RENDERER',
    'PACKAGE_DRIVEN_SOURCE_GENERATION',
    'LEGACY_TWIN_V2_RENDERER',
  ];
  const requested = input.implementationStrategy ?? 'VISUAL_TO_CODE_COMPILER';
  if (forbidden.includes(requested)) {
    throw new Error('TWIN_V2_OLD_RENDERER_INVOKED: invalid strategy for approved pilot');
  }
  return 'VISUAL_TO_CODE_COMPILER';
}

export function assertApprovedPilotStrategy(strategy: TwinV2ImplementationStrategy): void {
  if (strategy !== 'VISUAL_TO_CODE_COMPILER') {
    throw new Error(`TWIN_V2_OLD_RENDERER_INVOKED: expected VISUAL_TO_CODE_COMPILER got ${strategy}`);
  }
}
