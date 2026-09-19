/**
 * B5.9R4 — Evolve subshell visual regression QA.
 */

export type EvolveSubshellVisualFailureCode =
  | 'EVOLVE_ICONS_MISSING'
  | 'EVOLVE_TEXT_ONLY_NAV'
  | 'EVOLVE_MORE_INLINE_BODY'
  | 'EVOLVE_ACTIVE_STATE_DUPLICATED'
  | 'EVOLVE_ROUTE_CONTENT_MISMATCH'
  | 'EVOLVE_TAB_WORKSPACE_STACKED'
  | 'EVOLVE_SUBNAV_GENERIC_OVERRIDE'
  | 'EVOLVE_ICON_ASSET_ORPHANED';

export type EvolveSubshellVisualFinding = {
  code: EvolveSubshellVisualFailureCode;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  message: string;
};

export type EvolveSubshellVisualQAInput = {
  subshellMounted: boolean;
  navUsesIcons: boolean;
  textOnlyNav: boolean;
  moreLinksInlineInCampaignBody: boolean;
  duplicateActiveIndicators: boolean;
  posOwnsEvolveInternalNav: boolean;
  iconAssetsConnected: boolean;
  tabWorkspacesExclusive: boolean;
};

export function runEvolveSubshellVisualRegressionQA(
  input: EvolveSubshellVisualQAInput,
): EvolveSubshellVisualFinding[] {
  const findings: EvolveSubshellVisualFinding[] = [];

  if (!input.subshellMounted) {
    findings.push({
      code: 'EVOLVE_SUBNAV_GENERIC_OVERRIDE',
      severity: 'CRITICAL',
      message: 'EVOLVE SUBSHELL NOT MOUNTED — GENERIC POS SUBNAV LIKELY ACTIVE',
    });
  }
  if (!input.navUsesIcons || input.textOnlyNav) {
    findings.push({
      code: input.textOnlyNav ? 'EVOLVE_TEXT_ONLY_NAV' : 'EVOLVE_ICONS_MISSING',
      severity: 'CRITICAL',
      message: 'EVOLVE BOTTOM NAV MISSING APPROVED ICONS',
    });
  }
  if (input.moreLinksInlineInCampaignBody) {
    findings.push({
      code: 'EVOLVE_MORE_INLINE_BODY',
      severity: 'CRITICAL',
      message: 'MORE / SECONDARY LINKS RENDER INLINE IN CAMPAIGN BODY',
    });
  }
  if (input.duplicateActiveIndicators) {
    findings.push({
      code: 'EVOLVE_ACTIVE_STATE_DUPLICATED',
      severity: 'HIGH',
      message: 'MULTIPLE ACTIVE INDICATORS ON EVOLVE NAV',
    });
  }
  if (input.posOwnsEvolveInternalNav) {
    findings.push({
      code: 'EVOLVE_SUBNAV_GENERIC_OVERRIDE',
      severity: 'CRITICAL',
      message: 'PROJECT SHELL OWNS EVOLVE INTERNAL TABS INSTEAD OF SUBSHELL',
    });
  }
  if (!input.iconAssetsConnected) {
    findings.push({
      code: 'EVOLVE_ICON_ASSET_ORPHANED',
      severity: 'HIGH',
      message: 'APPROVED EVOLVE TAB ICONS NOT CONNECTED TO NAV',
    });
  }
  if (!input.tabWorkspacesExclusive) {
    findings.push({
      code: 'EVOLVE_TAB_WORKSPACE_STACKED',
      severity: 'HIGH',
      message: 'EVOLVE TAB WORKSPACES STACKED OR NOT EXCLUSIVE',
    });
  }

  return findings;
}

export function evolveSubshellVisualRegressionPasses(input: EvolveSubshellVisualQAInput): boolean {
  return runEvolveSubshellVisualRegressionQA(input).filter((f) => f.severity === 'CRITICAL').length === 0;
}
