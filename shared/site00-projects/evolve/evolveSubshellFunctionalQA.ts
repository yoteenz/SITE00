/**
 * B5.9R4 — Evolve subshell functional regression QA.
 */

import type { EvolveSubshellTabId } from './evolveSubshellTypes.js';

export type EvolveSubshellFunctionalFinding = {
  code: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  message: string;
};

export type EvolveSubshellFunctionalQAInput = {
  tabsPresent: EvolveSubshellTabId[];
  activeTab: EvolveSubshellTabId;
  campaignsMountsCampaignWorkspace: boolean;
  contentOpsMountsContentOpsWorkspace: boolean;
  labMountsLabWorkspace: boolean;
  moreOpensSecondarySurface: boolean;
  moreNotInlineInCampaign: boolean;
  expressionEngineInMore: boolean;
  performanceInMore: boolean;
  culturalIntelligenceInMore: boolean;
  routeChangesWithTab: boolean;
  deepLinksValid: boolean;
  backCloseReturnsToPreviousTab: boolean;
  posShellUnchanged: boolean;
  clientViewFirewall: boolean;
};

export function runEvolveSubshellFunctionalQA(
  input: EvolveSubshellFunctionalQAInput,
): EvolveSubshellFunctionalFinding[] {
  const findings: EvolveSubshellFunctionalFinding[] = [];
  const required: EvolveSubshellTabId[] = ['CAMPAIGNS', 'CONTENT_OPS', 'LAB', 'MORE'];

  for (const tab of required) {
    if (!input.tabsPresent.includes(tab)) {
      findings.push({
        code: `EVOLVE_TAB_MISSING_${tab}`,
        severity: 'CRITICAL',
        message: `EVOLVE SUBSHELL MISSING TAB: ${tab}`,
      });
    }
  }

  if (input.activeTab === 'CAMPAIGNS' && !input.campaignsMountsCampaignWorkspace) {
    findings.push({
      code: 'EVOLVE_ROUTE_CONTENT_MISMATCH',
      severity: 'CRITICAL',
      message: 'CAMPAIGNS TAB DOES NOT MOUNT CAMPAIGN WORKSPACE',
    });
  }
  if (input.activeTab === 'CONTENT_OPS' && !input.contentOpsMountsContentOpsWorkspace) {
    findings.push({
      code: 'EVOLVE_ROUTE_CONTENT_MISMATCH',
      severity: 'CRITICAL',
      message: 'CONTENT OPS TAB DOES NOT MOUNT CONTENT OPS WORKSPACE',
    });
  }
  if (input.activeTab === 'LAB' && !input.labMountsLabWorkspace) {
    findings.push({
      code: 'EVOLVE_ROUTE_CONTENT_MISMATCH',
      severity: 'CRITICAL',
      message: 'LAB TAB DOES NOT MOUNT LAB WORKSPACE',
    });
  }
  if (!input.moreOpensSecondarySurface) {
    findings.push({
      code: 'EVOLVE_MORE_NOT_SURFACE',
      severity: 'CRITICAL',
      message: 'MORE DOES NOT OPEN CONTROLLED SECONDARY SURFACE',
    });
  }
  if (input.moreNotInlineInCampaign === false) {
    findings.push({
      code: 'EVOLVE_MORE_INLINE_BODY',
      severity: 'CRITICAL',
      message: 'MORE LINKS STILL INLINE IN CAMPAIGN PAGE',
    });
  }
  if (!input.expressionEngineInMore || !input.performanceInMore || !input.culturalIntelligenceInMore) {
    findings.push({
      code: 'EVOLVE_MORE_CONTENT_MISSING',
      severity: 'HIGH',
      message: 'MORE PANEL MISSING REQUIRED SECONDARY DESTINATIONS',
    });
  }
  if (!input.routeChangesWithTab) {
    findings.push({
      code: 'EVOLVE_ROUTE_FAKE',
      severity: 'HIGH',
      message: 'TAB CHANGE DOES NOT UPDATE ROUTE / WORKSPACE',
    });
  }
  if (!input.posShellUnchanged) {
    findings.push({
      code: 'EVOLVE_POS_SHELL_REGRESSED',
      severity: 'CRITICAL',
      message: 'UNIVERSAL PROJECT SHELL REGRESSED',
    });
  }
  if (!input.clientViewFirewall) {
    findings.push({
      code: 'EVOLVE_CLIENT_LEAK',
      severity: 'CRITICAL',
      message: 'CLIENT VIEW EXPOSES FOUNDER EVOLVE SUBSHELL',
    });
  }

  return findings;
}

export function evolveSubshellFunctionalPasses(input: EvolveSubshellFunctionalQAInput): boolean {
  return runEvolveSubshellFunctionalQA(input).filter((f) => f.severity === 'CRITICAL').length === 0;
}
