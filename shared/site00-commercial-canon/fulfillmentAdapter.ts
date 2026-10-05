/**
 * Part 8 — ServiceFulfillmentAdapter shared contract.
 */

import type {
  DeliverableRecord,
  FulfillmentStatus,
  IntakeBootstrapContext,
  ProjectBootstrapContext,
  Site00CatalogPackage,
} from './types.js';

export type AdapterValidationResult = { ok: boolean; errors: readonly string[] };

export type ServiceFulfillmentAdapter = {
  id: string;
  family: Site00CatalogPackage['family'];
  validateIntake(input: IntakeBootstrapContext, payload: Record<string, unknown>): AdapterValidationResult;
  createProject(input: ProjectBootstrapContext): { projectId: string | null; notes: string };
  provisionEntitlements(input: ProjectBootstrapContext): { entitlementId: string | null; notes: string };
  openWorkspace(input: ProjectBootstrapContext): { route: string | null };
  resolveProductionPipeline(input: ProjectBootstrapContext): { pipelineId: string };
  getClientStatus(input: ProjectBootstrapContext): FulfillmentStatus;
  getRequiredReviews(): readonly string[];
  getDeliverables(input: ProjectBootstrapContext): readonly DeliverableRecord[];
  getCompletionState(input: ProjectBootstrapContext): FulfillmentStatus;
};

export type AdapterRegistryEntry = ServiceFulfillmentAdapter & {
  implementation: 'WIRED' | 'PARTIAL' | 'MISSING';
};

const adapters = new Map<string, AdapterRegistryEntry>();

export function registerFulfillmentAdapter(entry: AdapterRegistryEntry): void {
  adapters.set(entry.id, entry);
}

export function getFulfillmentAdapter(adapterId: string): AdapterRegistryEntry | undefined {
  return adapters.get(adapterId);
}

export function listFulfillmentAdapters(): readonly AdapterRegistryEntry[] {
  return [...adapters.values()];
}

export function serviceHasFulfillmentAdapter(adapterId: string): boolean {
  return adapters.has(adapterId);
}
