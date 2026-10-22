import type { ProviderAutomationMode } from '../types/schemas.js';
import type { ReferenceReadinessResult } from '../types/schemas.js';
import type { ShotExecutionContract } from '../types/schemas.js';

export type ProviderCapabilityValidation = {
  ok: boolean;
  mode: ProviderAutomationMode;
  unsupportedRequirements: string[];
};

export type CompiledProviderRequest = {
  provider: string;
  model: string;
  mode: ProviderAutomationMode;
  payload: Record<string, unknown>;
  manualInstructions?: string;
};

export type ProviderJobHandle = {
  providerJobId: string | null;
  state: 'SUBMITTED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'NOT_SUBMITTED';
  error: string | null;
};

export type ProviderOutputRetrieval = {
  outputUrl: string | null;
  outputBytesPath: string | null;
  metadata: Record<string, unknown>;
};

export interface CinematicVideoProviderAdapter {
  providerId: string;
  modelId: string;
  automationMode: ProviderAutomationMode;

  validateCapabilities(contract: ShotExecutionContract): ProviderCapabilityValidation;
  validateReferences(readiness: ReferenceReadinessResult): { ok: boolean; detail?: string };
  compileRequest(contract: ShotExecutionContract, compiledKeyframes: Record<string, unknown>): CompiledProviderRequest;
  estimateCost?(contract: ShotExecutionContract): number | null;
  submitJob?(compiled: CompiledProviderRequest): Promise<ProviderJobHandle>;
  getJobStatus?(providerJobId: string): Promise<ProviderJobHandle>;
  retrieveOutput?(providerJobId: string): Promise<ProviderOutputRetrieval>;
  cancelJob?(providerJobId: string): Promise<{ ok: boolean }>;
  reportProviderError(error: unknown): { code: string; message: string; retrySafe: boolean };
}
