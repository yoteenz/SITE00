/**
 * Intake + project bootstrap + deliverable helpers (Parts 17–19).
 */

import type {
  DeliverableRecord,
  IntakeBootstrapContext,
  ProjectBootstrapContext,
  Site00CatalogPackage,
} from './types.js';

export function intakeContextFromPackage(pkg: Site00CatalogPackage): IntakeBootstrapContext {
  return {
    serviceId: pkg.serviceId,
    packageId: pkg.packageId,
    priceMode: pkg.priceMode,
    projectType: pkg.projectType,
    intakeSchemaId: pkg.intakeSchemaId,
  };
}

export function mergeIntakeIntoProjectBootstrap(
  intake: IntakeBootstrapContext,
  partial: Omit<ProjectBootstrapContext, keyof IntakeBootstrapContext>,
): ProjectBootstrapContext {
  return {
    ...partial,
    serviceId: intake.serviceId,
    packageId: intake.packageId,
    projectType: intake.projectType,
  };
}

export function packageContextSurvivesIntakeToProject(
  intake: IntakeBootstrapContext,
  project: ProjectBootstrapContext,
): boolean {
  return (
    intake.serviceId === project.serviceId &&
    intake.packageId === project.packageId &&
    intake.projectType === project.projectType
  );
}

export function deliverableContractForFamily(family: Site00CatalogPackage['family']): {
  completionCriteria: readonly string[];
  deliveryDestination: string;
} {
  switch (family) {
    case 'IDENTITY':
      return {
        completionCriteria: ['APPROVED_IDENTITY_SYSTEM'],
        deliveryDestination: 'Identity asset package / project library',
      };
    case 'BUILDER_SIMPLE':
      return {
        completionCriteria: ['PUBLISHED_SITE'],
        deliveryDestination: 'Live site / studio deliverables',
      };
    case 'BUILDER_CUSTOM_WORLD':
      return {
        completionCriteria: ['LAUNCHED_EXPERIENCE'],
        deliveryDestination: 'Design workspace outputs + launch',
      };
    case 'MARKETING_CAMPAIGN':
      return {
        completionCriteria: ['APPROVED_CAMPAIGN_DELIVERABLES'],
        deliveryDestination: 'Engagement deliverables + vault',
      };
    case 'RECURRING_RETAINER':
      return {
        completionCriteria: ['MONTHLY_DELIVERY_CYCLE_COMPLETE'],
        deliveryDestination: 'EVOLVE OS campaign outputs',
      };
    case 'ADD_ON':
      return {
        completionCriteria: ['ADD_ON_APPLIED_TO_PARENT'],
        deliveryDestination: 'Parent project entitlement credit',
      };
    default:
      return {
        completionCriteria: ['FOUNDER_DECISION_REQUIRED'],
        deliveryDestination: 'FOUNDER_DECISION_REQUIRED',
      };
  }
}

export function skeletonDeliverable(
  project: ProjectBootstrapContext,
  family: Site00CatalogPackage['family'],
): DeliverableRecord {
  const { completionCriteria } = deliverableContractForFamily(family);
  return {
    deliverableId: `dlv-${project.commercialRecordId}`,
    projectId: project.projectId ?? 'pending',
    serviceId: project.serviceId,
    packageId: project.packageId,
    version: '1',
    reviewStatus: 'PENDING',
    deliveryStatus: 'DRAFT',
    completionCriteriaRef: completionCriteria[0] ?? 'UNKNOWN',
  };
}
