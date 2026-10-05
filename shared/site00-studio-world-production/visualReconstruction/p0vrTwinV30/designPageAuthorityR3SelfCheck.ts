import { NDXBOOK_LIME, SITE00_HOST_RED } from './activeProjectExpressionContract.js';
import { DESIGN_PAGE_V3_HOST_PRODUCT_NAME } from './constants.js';
import { DESIGN_WORKSPACE_UI_UPPERCASE_MARKER } from './formatDesignWorkspaceTypographyCasePromptBlock.js';
import { HOST_PROJECT_EXPRESSION_CORE_RULE } from './hostProjectExpressionModel.js';

export type DesignPageAuthorityR3SelfCheck = {
  coreRulePresent: boolean;
  hostStableWorkspaceReactiveRule: boolean;
  hostProjectFirewall: boolean;
  ndxbookLimeAccentQa: boolean;
  site00RedOwnershipQa: boolean;
  typographyOwnershipQa: boolean;
  uppercaseCaseGovernanceQa: boolean;
  spatialGrammarQa: boolean;
  genericDashboardDriftQa: boolean;
  threeDistinctTerritories: boolean;
  pass: boolean;
  failures: string[];
};

export function runDesignPageAuthorityR3SelfCheck(input: {
  promptOrArtifactText: string;
  territoryPrompts: Record<'A' | 'B' | 'C', string>;
}): DesignPageAuthorityR3SelfCheck {
  const t = input.promptOrArtifactText.toLowerCase();
  const failures: string[] = [];

  const coreRulePresent =
    t.includes('architecture') &&
    t.includes('atmosphere') &&
    input.promptOrArtifactText.includes(HOST_PROJECT_EXPRESSION_CORE_RULE);
  if (!coreRulePresent) failures.push('CORE_RULE_MISSING');

  const hostStableWorkspaceReactiveRule =
    t.includes('host controls') || t.includes('project-reactive') || t.includes('workspace surfaces');
  if (!hostStableWorkspaceReactiveRule) failures.push('HOST_STABLE_RULE_MISSING');

  const hostProjectFirewall =
    t.includes('host shell') &&
    (t.includes('ndxbook') || t.includes('lime')) &&
    t.includes('compiler') &&
    !/ndxbook owns the shell/i.test(input.promptOrArtifactText);
  if (!hostProjectFirewall) failures.push('HOST_PROJECT_FIREWALL_WEAK');

  const ndxbookLimeAccentQa =
    t.includes('lime') || t.includes(NDXBOOK_LIME.toLowerCase()) || t.includes('ndxbook lime');
  if (!ndxbookLimeAccentQa) failures.push('NDXBOOK_LIME_QA_FAIL');

  const site00RedOwnershipQa =
    (t.includes('site 00 red') || t.includes('host red') || t.includes(SITE00_HOST_RED)) &&
    (t.includes('reserved') || t.includes('host') || t.includes('system'));
  if (!site00RedOwnershipQa) failures.push('SITE00_RED_OWNERSHIP_QA_FAIL');

  const typographyOwnershipQa =
    t.includes('martian mono') && (t.includes('host') || t.includes('system'));
  if (!typographyOwnershipQa) failures.push('TYPOGRAPHY_OWNERSHIP_QA_FAIL');

  const uppercaseCaseGovernanceQa =
    input.promptOrArtifactText.includes(DESIGN_WORKSPACE_UI_UPPERCASE_MARKER) &&
    t.includes('typography case governance') &&
    t.includes('every page');
  if (!uppercaseCaseGovernanceQa) failures.push('UPPERCASE_CASE_GOVERNANCE_QA_FAIL');

  const spatialGrammarQa =
    t.includes('dominant') &&
    (t.includes('central stage') || t.includes('workbench') || t.includes('spatial workflow')) &&
    t.includes('not') &&
    (t.includes('card') || t.includes('saas') || t.includes('admin'));
  if (!spatialGrammarQa) failures.push('SPATIAL_GRAMMAR_QA_FAIL');

  const genericDashboardDriftQa =
    t.includes('anti') || t.includes('fail if') || (t.includes('generic') && t.includes('dashboard'));
  if (!genericDashboardDriftQa) failures.push('GENERIC_DASHBOARD_DRIFT_QA_FAIL');

  const a = input.territoryPrompts.A.toLowerCase();
  const b = input.territoryPrompts.B.toLowerCase();
  const c = input.territoryPrompts.C.toLowerCase();
  const threeDistinctTerritories =
    a.includes('central stage') &&
    b.includes('editorial') &&
    c.includes('spatial workflow') &&
    a !== b &&
    b !== c;
  if (!threeDistinctTerritories) failures.push('TERRITORIES_NOT_DISTINCT');

  return {
    coreRulePresent,
    hostStableWorkspaceReactiveRule,
    hostProjectFirewall,
    ndxbookLimeAccentQa,
    site00RedOwnershipQa,
    typographyOwnershipQa,
    uppercaseCaseGovernanceQa,
    spatialGrammarQa,
    genericDashboardDriftQa,
    threeDistinctTerritories,
    pass: failures.length === 0,
    failures,
  };
}

export function hostProjectFirewallQaSummary(): string {
  return `${DESIGN_PAGE_V3_HOST_PRODUCT_NAME} shell + active project workspace atmosphere; project may not override host nav, identity, account, host error colors, breadcrumbs, compiler semantics.`;
}
