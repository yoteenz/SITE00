export const SolDesignBenchModelContract = {
  contractType: 'SolDesignBenchModelContract',
  provider: 'openai',
  providerLabel: 'OpenAI',
  modelId: 'gpt-5.6-sol',
  reasoningEffort: 'high',
  visionInputRequired: true,
  fallbackAllowed: false,
  webSearchAllowed: false,
  competitorAccessAllowed: false,
  responsesEndpoint: 'https://api.openai.com/v1/responses',
} as const;

export type SolDesignBenchModelContractValue = typeof SolDesignBenchModelContract;

export const SolDesignBenchOutputBudget = {
  contractType: 'SolDesignBenchOutputBudget',
  maxOutputTokens: 32_000,
  appliesToStressProof: true,
  appliesToFounderRun: true,
  model: 'gpt-5.6-sol',
  schemaVersion: 'figma-interface-translation-v1',
} as const;

/** F5 production proof remains valid because F6 changes capacity only. */
export const SolDesignBenchPriorProofAttestation = {
  tinyLiveSchemaSmokePassed: true,
  runId: 'sol_bb016b79-7f63-47d7-8679-d4f3ec96a668',
  apiBuild: '4b803623dcf9f9768d12530087fe017f19388947',
  parserPath: 'openai.responses.parse.output_parsed',
  schemaValidationPass: true,
} as const;

export interface SolStructuredOutputProofConfiguration {
  provider: 'openai';
  model: 'gpt-5.6-sol';
  reasoning: 'high';
  promptVersion: string;
  promptHash: string;
  schemaVersion: 'figma-interface-translation-v1';
  schemaName: 'figma_style_interface_translation_package';
  structuredOutputMode: 'json_schema';
  strict: true;
  parserPath: 'openai.responses.parse.output_parsed';
  maxOutputTokens: 32_000;
}

export interface SolStructuredOutputProofEvidence {
  proofMode: 'TINY_LIVE_SCHEMA_SMOKE' | 'LARGE_OUTPUT_STRESS';
  runId: string;
  apiBuild: string;
  sourcePromptVersion: string;
  sourceMaxOutputTokens: number;
  finishReason: string;
  outputCharacters: number | null;
  actualOutputTokens: number | null;
  schemaValidationPass: true;
  structuredResultDirect: true;
  manualJsonParseUsed: false;
  outputTextUsedAsPrimaryResult: false;
  passed: true;
}

export interface SolStructuredOutputProofReceipt {
  receiptType: 'SolStructuredOutputProofReceipt';
  receiptVersion: 1;
  environment: 'production';
  configuration: SolStructuredOutputProofConfiguration;
  configurationFingerprint: string;
  tinyLiveSchemaSmoke: SolStructuredOutputProofEvidence | null;
  largeOutputStress: SolStructuredOutputProofEvidence | null;
  structuredOutputPipelineProofPassed: boolean;
  provenance: 'LIVE_PROOF' | 'F6R1_VERIFIED_EVIDENCE_BACKFILL';
  compatibilityBasis: string;
  persistedAt: string;
}

export interface SolBenchmarkProviderDispatchReceipt {
  receiptType: 'SolBenchmarkProviderDispatchReceipt';
  runId: string;
  provider: 'openai';
  modelId: 'gpt-5.6-sol';
  reasoningEffort: 'high';
  imageInputAttached: true;
  structuredOutputRequested: true;
  structuredOutputMode: 'json_schema';
  schemaName: 'figma_style_interface_translation_package';
  strict: true;
  schemaVersion: string;
  jsonInstructionPresent: true;
  requestedModelId: 'gpt-5.6-sol';
  actualDispatchedModelId: 'gpt-5.6-sol' | null;
  requestedReasoningEffort: 'high';
  fallbackAllowed: false;
  webSearchEnabled: false;
  endpoint: 'https://api.openai.com/v1/responses';
  providerResponseId: string | null;
  dispatchedAt: string;
}

export interface SolStructuredOutputValidationReceipt {
  receiptType: 'SolStructuredOutputValidationReceipt';
  runId: string;
  model: 'gpt-5.6-sol';
  schemaVersion: string;
  responseReceived: boolean;
  jsonParsePass: boolean;
  schemaValidationPass: boolean;
  missingFields: string[];
  invalidFields: string[];
  rawResponsePersistedSafely: boolean;
  recoverable: boolean;
  repairAttempted: boolean;
  repairSucceeded: boolean;
}

export interface SolOutputCompletenessReceipt {
  receiptType: 'SolOutputCompletenessReceipt';
  runId: string;
  finishReason: string;
  outputCharacters: number;
  outputTokens: number | null;
  maxOutputTokens: number;
  actualOutputTokens: number | null;
  schemaValidationPass: boolean;
  truncated: boolean;
  complete: boolean;
}

export interface SolStructuredOutputRuntimeReceipt {
  receiptType: 'SolStructuredOutputRuntimeReceipt';
  runId: string;
  liveApiBuild: string;
  provider: 'openai';
  model: 'gpt-5.6-sol';
  reasoning: 'high';
  structuredOutputMode: 'json_schema';
  schemaName: 'figma_style_interface_translation_package';
  strict: true;
  imageInputAttached: true;
  providerResponseType: 'openai.responses.parse.output_parsed';
  providerResponseSuccess: boolean;
  structuredResultDirect: true;
  manualJsonParseUsed: false;
  outputTextUsedAsPrimaryResult: false;
  schemaValidationPass: boolean;
}

export interface SolBenchmarkInputReceipt {
  receiptType: 'SolBenchmarkInputReceipt';
  runId: string;
  referenceSha256: string;
  referenceWidth: number;
  referenceHeight: number;
  imageInputAttached: true;
  provider: 'openai';
  modelId: 'gpt-5.6-sol';
  requestedReasoningEffort: 'high';
  promptVersion: string;
}

export interface SolDesignBenchProviderReadinessReceipt {
  receiptType: 'SolDesignBenchProviderReadinessReceipt';
  state: 'READY' | 'BLOCKED';
  checkedAt: string;
  openAiCredentialPresentServerSide: boolean;
  exactModelIdConfigured: boolean;
  highReasoningConfigured: boolean;
  referenceImageAvailable: boolean;
  imageInputAttachmentPathValid: boolean;
  noFallbackConfigured: boolean;
  webSearchDisabled: boolean;
  tinyLiveSchemaSmokePassed: boolean;
  largeOutputStressPassed: boolean;
  structuredOutputPipelineProofPassed: boolean;
  structuredOutputProofReceipt: SolStructuredOutputProofReceipt | null;
  structuredOutputProofPersistence: 'SUPABASE' | 'TEST_OVERRIDE' | 'UNAVAILABLE';
  blockingReasons: string[];
}
