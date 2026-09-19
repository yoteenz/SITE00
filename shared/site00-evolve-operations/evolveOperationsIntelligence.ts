/**
 * EvolveOperationsIntelligence — orchestrates all operational engines.
 */

import { buildClientSafeOpsView, firewallProjectOpsView } from './clientFirewall.js';
import { deriveClientRisk } from './clientRiskIntelligence.js';
import { classifyFailure, applyRetryGuard, deriveFailureBudget } from './failureLoopIntelligence.js';
import { buildEscalation, deriveEscalationLevel } from './escalationIntelligence.js';
import { computeOperationalPriorityScore } from './operationalPriorityScore.js';
import { buildPortfolioPage } from './portfolioAggregator.js';
import { deriveProjectHealth } from './projectHealthIntelligence.js';
import { resolveEvolveOperationsPolicy } from './policyRegistry.js';
import { buildOperationalAction, routeOperationalIssue } from './queueRoutingIntelligence.js';
import { deriveSpendState, enforceNoNegativeBalance } from './spendIntelligence.js';
import { computeMarginSnapshot } from './marginIntelligence.js';
import { createOperationsEvent, EvolveOperationsAuditLog } from './events.js';
import { inspectDecision } from './systemInspector.js';
import type {
  EvolveFailureClass,
  EvolvePortfolioPage,
  EvolveProjectOpsInput,
  EvolveProjectOpsView,
  EvolveProviderIncident,
  EvolveRetryGuardResult,
  EvolveSystemInspectorEntry,
} from './types.js';

export class EvolveOperationsIntelligence {
  readonly auditLog = new EvolveOperationsAuditLog();
  private lastSnapshot: EvolvePortfolioPage | null = null;

  analyzeProject(input: EvolveProjectOpsInput, now = Date.now()): EvolveProjectOpsView {
    const policy = resolveEvolveOperationsPolicy(input.servicePackage, input.deliveryMode);
    const spend = deriveSpendState(input.spend, input.servicePackage, input.deliveryMode);
    const health = deriveProjectHealth(input, now);
    const priority = computeOperationalPriorityScore(input, health, spend);
    const clientRisk = deriveClientRisk(input, health, spend);

    let classification = null as ReturnType<typeof classifyFailure> | null;
    if (input.lastFailureClass) {
      classification = classifyFailure(String(input.lastFailureClass), {
        priorFailureClass: input.repeatedFailureCount >= 2 ? input.lastFailureClass : undefined,
      });
    }

    let retryResult: EvolveRetryGuardResult | null = null;
    if (classification) {
      retryResult = applyRetryGuard(
        classification,
        input.failedJobCount > 0 ? 1 : 0,
        input.servicePackage,
        input.deliveryMode,
      );
      this.auditLog.append(
        createOperationsEvent({
          eventType: retryResult.action === 'AUTO_RETRY' ? 'JOB_RETRIED' : 'JOB_BLOCKED',
          projectId: input.projectId,
          accountId: input.accountId,
          classification: classification.failureClass,
          policyApplied: policy.id,
          automaticAction: retryResult.action,
          reasons: retryResult.reasons,
        }),
      );
    }

    const escalationLevel = deriveEscalationLevel(input, health, priority, retryResult, classification);
    const escalation = buildEscalation(input, escalationLevel, priority);
    const assignment = routeOperationalIssue(input, health, spend, priority);
    const pendingActions = [buildOperationalAction(input, assignment)];

    const internalMargin =
      input.deliveryMode === 'SITE00_DIRECTED' && input.margin
        ? input.margin
        : input.deliveryMode === 'SITE00_DIRECTED'
          ? computeMarginSnapshot(
              input.revenueTierCents,
              input.spend.providerCostCents,
              Math.round(input.revenueTierCents * 0.22),
              0,
              input.servicePackage,
              input.deliveryMode,
            )
          : null;

    const failureBudget = deriveFailureBudget(input.spend, 3, input.repeatedFailureCount >= 2 ? 11 : 3);

    const clientSafe = buildClientSafeOpsView(
      health,
      spend,
      input.openReviewCount,
      health.stallReason ? [health.stallReason] : [],
    );

    const view: EvolveProjectOpsView = {
      health,
      spend,
      failureBudget,
      escalation,
      clientRisk,
      queueAssignments: [assignment],
      internalMargin,
      pendingActions,
      clientSafe,
    };

    return view;
  }

  analyzePortfolio(
    inputs: EvolveProjectOpsInput[],
    incidents: EvolveProviderIncident[] = [],
    whatSystemHandled: string[] = [],
  ): EvolvePortfolioPage {
    const views = inputs.map((i) => this.analyzeProject(i));
    const changed: string[] = [];
    if (this.lastSnapshot) {
      const prev = this.lastSnapshot.summary;
      const next = views.length;
      if (next !== prev.activeProjects) changed.push(`ACTIVE PROJECTS ${prev.activeProjects} → ${next}`);
    }
    const page = buildPortfolioPage(views, incidents, changed, whatSystemHandled);
    this.lastSnapshot = page;
    return page;
  }

  handleJobFailure(
    input: EvolveProjectOpsInput,
    rawError: string,
    automatedRetryCount: number,
    providerIncidentActive = false,
  ): {
    classification: ReturnType<typeof classifyFailure>;
    retryGuard: EvolveRetryGuardResult;
    inspector: EvolveSystemInspectorEntry;
  } {
    const policy = resolveEvolveOperationsPolicy(input.servicePackage, input.deliveryMode);
    const classification = classifyFailure(rawError, {
      providerId: input.providerId ?? undefined,
      priorFailureClass: input.lastFailureClass ?? undefined,
    });
    const retryGuard = applyRetryGuard(
      classification,
      automatedRetryCount,
      input.servicePackage,
      input.deliveryMode,
      providerIncidentActive,
    );

    this.auditLog.append(
      createOperationsEvent({
        eventType: 'JOB_FAILED',
        projectId: input.projectId,
        accountId: input.accountId,
        classification: classification.failureClass,
        policyApplied: policy.id,
        automaticAction: retryGuard.action,
        reasons: classification.reasons,
      }),
    );

    const inspector = inspectDecision(
      'retry_policy',
      { rawError, automatedRetryCount, providerIncidentActive },
      { action: retryGuard.action, allowed: retryGuard.allowed },
      policy.id,
      retryGuard.reasons,
    );

    return { classification, retryGuard, inspector };
  }

  getClientSafeView(projectView: EvolveProjectOpsView) {
    return firewallProjectOpsView(projectView);
  }

  validateSpendGuards(spend: EvolveProjectOpsInput['spend']): { noNegativeBalance: boolean } {
    return { noNegativeBalance: enforceNoNegativeBalance(spend) };
  }
}

export function createEvolveOperationsIntelligence(): EvolveOperationsIntelligence {
  return new EvolveOperationsIntelligence();
}

export type { EvolveFailureClass };
