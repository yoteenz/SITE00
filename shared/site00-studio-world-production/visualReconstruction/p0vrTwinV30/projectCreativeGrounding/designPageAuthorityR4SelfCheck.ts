import type { AuthorityCreativeGenerationPayload } from './types.js';

export type DesignPageAuthorityR4SelfCheck = {
  projectCreativeContextInPrompt: boolean;
  artifactVocabularyInPrompt: boolean;
  sourcePriorityInPrompt: boolean;
  noGenericFallbackRule: boolean;
  sharedArtifactFamilyAcrossTerritories: boolean;
  designWorkspaceJobsInPrompt: boolean;
  forbiddenMotifsInPrompt: boolean;
  failClosedGateDocumented: boolean;
  pass: boolean;
  failures: string[];
};

export function runDesignPageAuthorityR4SelfCheck(input: {
  promptOrArtifactText: string;
  territoryPrompts: Record<'A' | 'B' | 'C', string>;
  payloads: Record<'A' | 'B' | 'C', AuthorityCreativeGenerationPayload>;
}): DesignPageAuthorityR4SelfCheck {
  const t = input.promptOrArtifactText.toLowerCase();
  const failures: string[] = [];

  const projectCreativeContextInPrompt =
    t.includes('project creative grounding') &&
    t.includes('projectcreativecontextpackage') &&
    t.includes('cultural intelligence');
  if (!projectCreativeContextInPrompt) failures.push('PROJECT_CONTEXT_BLOCK_MISSING');

  const artifactVocabularyInPrompt =
    t.includes('cultural_receipt') &&
    t.includes('index_card') &&
    t.includes('entry_cover') &&
    t.includes('artifact family');
  if (!artifactVocabularyInPrompt) failures.push('ARTIFACT_VOCABULARY_MISSING');

  const sourcePriorityInPrompt =
    t.includes('source priority') && t.includes('approved project asset');
  if (!sourcePriorityInPrompt) failures.push('SOURCE_PRIORITY_MISSING');

  const noGenericFallbackRule =
    (t.includes('no generic fallback') || t.includes('do not fill gaps')) &&
    t.includes('bookstore') &&
    t.includes('library');
  if (!noGenericFallbackRule) failures.push('NO_GENERIC_FALLBACK_RULE_MISSING');

  const famA = input.payloads.A.sharedArtifactFamily.join(',');
  const famB = input.payloads.B.sharedArtifactFamily.join(',');
  const famC = input.payloads.C.sharedArtifactFamily.join(',');
  const sharedArtifactFamilyAcrossTerritories = famA === famB && famB === famC && famA.length > 10;
  if (!sharedArtifactFamilyAcrossTerritories) failures.push('TERRITORY_ARTIFACT_FAMILY_MISMATCH');

  const a = input.territoryPrompts.A.toLowerCase();
  const b = input.territoryPrompts.B.toLowerCase();
  const c = input.territoryPrompts.C.toLowerCase();
  const territoryConsistencyInPrompt =
    a.includes('spatial composition only') &&
    b.includes('spatial composition only') &&
    c.includes('spatial composition only');
  if (!territoryConsistencyInPrompt) failures.push('TERRITORY_CONSISTENCY_RULE_MISSING');

  const designWorkspaceJobsInPrompt =
    t.includes('review active concept') && t.includes('compare concepts') && t.includes('workspace function contract');
  if (!designWorkspaceJobsInPrompt) failures.push('FUNCTION_CONTRACT_MISSING');

  const forbiddenMotifsInPrompt =
    t.includes('forbidden visual motifs') || t.includes('library shelves') || t.includes('random book');
  if (!forbiddenMotifsInPrompt) failures.push('FORBIDDEN_MOTIFS_MISSING');

  const failClosedGateDocumented =
    t.includes('ungrounded') || t.includes('artifacttype + source');
  if (!failClosedGateDocumented) failures.push('UNGROUNDED_GUARD_MISSING');

  return {
    projectCreativeContextInPrompt,
    artifactVocabularyInPrompt,
    sourcePriorityInPrompt,
    noGenericFallbackRule,
    sharedArtifactFamilyAcrossTerritories,
    designWorkspaceJobsInPrompt,
    forbiddenMotifsInPrompt,
    failClosedGateDocumented,
    pass: failures.length === 0,
    failures,
  };
}

export function buildProjectGroundingReviewSummary(input: {
  groundingGatePass: boolean;
  r4SelfCheckPass: boolean;
  ungroundedAssetCount: number;
  hostProjectFirewallPass: boolean;
}): import('./types.js').ProjectGroundingReviewSummary {
  const projectGrounding = input.groundingGatePass && input.r4SelfCheckPass ? 'PASS' : 'FAIL';
  const artifactVocabulary = input.r4SelfCheckPass ? 'PASS' : 'FAIL';
  let randomAssetRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (input.ungroundedAssetCount > 0) randomAssetRisk = 'HIGH';
  else if (!input.r4SelfCheckPass) randomAssetRisk = 'MEDIUM';
  return {
    projectGrounding,
    artifactVocabulary,
    randomAssetRisk,
    territoryContentConsistency: input.r4SelfCheckPass ? 'PASS' : 'FAIL',
    hostProjectFirewall: input.hostProjectFirewallPass ? 'PASS' : 'FAIL',
  };
}
