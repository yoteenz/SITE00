import { getDesignWorkspaceFunctionContract } from './designWorkspaceFunctionContract.js';
import type { ProjectCreativeContextPackage, ProjectCreativeGroundingGateResult } from './types.js';

export function runProjectCreativeGroundingGate(
  pkg: ProjectCreativeContextPackage,
): ProjectCreativeGroundingGateResult {
  const missing: string[] = [];
  const dna = pkg.creativeDNA;
  const projectCreativeDNAReady = Boolean(
    dna.projectPurpose &&
      dna.projectPremise &&
      dna.brandTruths.length >= 3 &&
      dna.nonNegotiables.length >= 2 &&
      pkg.status === 'READY',
  );
  if (!projectCreativeDNAReady) missing.push('creativeDNA');

  const artifactVocabularyReady = pkg.artifactVocabulary.entries.length >= 10;
  if (!artifactVocabularyReady) missing.push('artifactVocabulary');

  const visualLanguageReady =
    pkg.visualLanguage.primaryPalette.length > 0 &&
    pkg.visualLanguage.forbiddenMotifs.length >= 5 &&
    Boolean(pkg.visualLanguage.imageTreatment);
  if (!visualLanguageReady) missing.push('visualLanguage');

  const typographyReady =
    Boolean(pkg.typographyExpression.hostTypography) &&
    Boolean(pkg.typographyExpression.projectTypography) &&
    Boolean(pkg.typographyExpression.uiCaseRule) &&
    Boolean(pkg.typographyExpression.allPagesCaseRule);
  if (!typographyReady) missing.push('typographyExpression');

  const assetSourceMapReady = pkg.assetSourceMap.sources.length >= 3;
  if (!assetSourceMapReady) missing.push('assetSourceMap');

  const workspaceExpressionReady =
    pkg.workspaceExpression.status === 'READY' && pkg.workspaceExpression.hostBoundaries.length >= 5;
  if (!workspaceExpressionReady) missing.push('workspaceExpression');

  const fn = getDesignWorkspaceFunctionContract();
  const functionContractReady = fn.jobs.length >= 10;
  if (!functionContractReady) missing.push('designWorkspaceFunctionContract');

  const pass = missing.length === 0;
  return {
    projectCreativeDNAReady,
    artifactVocabularyReady,
    visualLanguageReady,
    typographyReady,
    assetSourceMapReady,
    workspaceExpressionReady,
    functionContractReady,
    pass,
    missing,
  };
}

export function assertProjectCreativeGroundingGate(pkg: ProjectCreativeContextPackage): ProjectCreativeGroundingGateResult {
  const gate = runProjectCreativeGroundingGate(pkg);
  if (!gate.pass) {
    throw new Error(
      `PROJECT_CREATIVE_CONTEXT_INCOMPLETE: missing ${gate.missing.join(', ')}`,
    );
  }
  return gate;
}
