/**
 * Inheritance QA — verify entire route branch feels like one coherent experience.
 */

import type {
  ChildConvergencePlan,
  InheritanceBranchQAReport,
  InheritanceException,
  InheritanceQAFinding,
  ParentExperienceAuthority,
} from './types.js';
import { inheritanceModeSkipsTransform } from './inheritanceModes.js';

export function evaluateInheritanceBranchQA(input: {
  projectId: string;
  parentRoute: string;
  parentAuthority: ParentExperienceAuthority;
  plans: ChildConvergencePlan[];
  exceptions?: InheritanceException[];
}): InheritanceBranchQAReport {
  const findings: InheritanceQAFinding[] = [];
  let genericFallbackCount = 0;
  let exemptCount = 0;

  for (const plan of input.plans) {
    if (plan.inheritanceMode === 'EXEMPT_WITH_REASON') {
      exemptCount += 1;
      const hasReason = input.exceptions?.some((e) => e.childRoute === plan.childRoute);
      if (!hasReason) {
        findings.push({
          code: 'PCI_EXEMPT_WITHOUT_REASON',
          severity: 'BLOCKING',
          childRoute: plan.childRoute,
          message: 'Exempt child missing stored rationale',
        });
      }
      continue;
    }

    if (inheritanceModeSkipsTransform(plan.inheritanceMode)) continue;

    if (plan.currentVisualDiagnosis.includes('GENERIC_ADMIN_UI_FALLBACK')) {
      genericFallbackCount += 1;
      findings.push({
        code: 'PCI_GENERIC_ADMIN_FALLBACK',
        severity: 'BLOCKING',
        childRoute: plan.childRoute,
        message: 'Child still on generic admin UI — must inherit parent grammar',
      });
    }

    if (plan.visualMustReplace.length === 0 && !inheritanceModeSkipsTransform(plan.inheritanceMode)) {
      findings.push({
        code: 'PCI_VISUAL_GRAMMAR_DRIFT',
        severity: 'WARNING',
        childRoute: plan.childRoute,
        message: 'No visual replacement actions defined',
      });
    }

    if (
      plan.inheritanceMode === 'INHERIT_FULL' &&
      plan.childArchetype !== 'LANDING' &&
      plan.layoutActions.some((a) => a.actionId === 'layout-hero')
    ) {
      findings.push({
        code: 'PCI_COMPOSITION_LITERAL_CLONE',
        severity: 'WARNING',
        childRoute: plan.childRoute,
        message: 'Non-landing child should not clone parent hero layout',
      });
    }

    if (plan.functionalMustPreserve.length < 3) {
      findings.push({
        code: 'PCI_FUNCTION_REGRESSION_RISK',
        severity: 'BLOCKING',
        childRoute: plan.childRoute,
        message: 'Insufficient functional preservation contract',
      });
    }

    const hasBlockingActions = plan.layoutActions.some((a) => a.priority === 'BLOCKING');
    if (!hasBlockingActions && plan.migrationRisk !== 'LOW') {
      findings.push({
        code: 'PCI_BRANCH_COHESION_FAILED',
        severity: 'WARNING',
        childRoute: plan.childRoute,
        message: 'High-risk child missing blocking layout convergence actions',
      });
    }
  }

  const blockingCount = findings.filter((f) => f.severity === 'BLOCKING').length;
  const childCount = input.plans.length;
  const cohesionScore =
    childCount === 0
      ? 100
      : Math.max(
          0,
          Math.round(
            100 -
              (blockingCount * 20 + genericFallbackCount * 15 + findings.filter((f) => f.severity === 'WARNING').length * 5) /
                Math.max(childCount, 1),
          ),
        );

  return {
    reportId: `qa-${input.projectId}-${Date.now()}`,
    projectId: input.projectId,
    parentRoute: input.parentRoute,
    childCount,
    passed: blockingCount === 0,
    cohesionScore,
    findings,
    genericFallbackCount,
    exemptCount,
    evaluatedAt: new Date().toISOString(),
  };
}
