/**
 * B5.7 — Detect stale demo content and cross-tab mismatches.
 */

import type { ProjectOperatingState, StaleProjectFailureClass } from './types.js';
import { isStaleDemoFixtureLabel } from '../../../site00-campaign-package/assetIngestion/staleDemoFixtures.js';

export type StaleProjectDataQAResult = {
  passed: boolean;
  failureClasses: StaleProjectFailureClass[];
  issues: string[];
};

export function runStaleProjectDataQA(args: {
  operatingState: ProjectOperatingState;
  uiLabels: string[];
  tabCounts?: Record<string, number>;
}): StaleProjectDataQAResult {
  const failures: StaleProjectFailureClass[] = [];
  const issues: string[] = [];

  for (const label of args.uiLabels) {
    if (isStaleDemoFixtureLabel(label)) {
      failures.push('DEMO_FIXTURE_IN_ACTIVE_UI');
      issues.push(`Stale demo fixture in active UI: ${label}`);
    }
  }

  const staleInWork = args.operatingState.currentWork.filter(isStaleDemoFixtureLabel);
  if (staleInWork.length) {
    failures.push('CURRENT_WORK_NOT_CANONICAL');
    issues.push('Current work contains demo fixtures');
  }

  if (!args.operatingState.entry001Audit.archivePackageConsistent) {
    failures.push('ARCHIVE_PACKAGE_STATE_AMBIGUOUS');
    issues.push(args.operatingState.entry001Audit.explanation);
  }

  if (args.tabCounts) {
    const overviewProduction = args.tabCounts.overviewProduction ?? 0;
    const canonicalProduction = args.operatingState.inProduction.length;
    if (overviewProduction > 0 && canonicalProduction > 0 && overviewProduction !== canonicalProduction) {
      failures.push('CROSS_TAB_STATE_MISMATCH');
      issues.push(`Overview production count (${overviewProduction}) != canonical (${canonicalProduction})`);
    }
  }

  const unique = [...new Set(failures)];
  return { passed: unique.length === 0, failureClasses: unique, issues };
}

export function assertNoDemoFixturesInActiveUi(labels: string[]): void {
  const stale = labels.filter(isStaleDemoFixtureLabel);
  if (stale.length) {
    throw new Error(`DEMO_FIXTURE_IN_ACTIVE_UI: ${stale.join(', ')}`);
  }
}
