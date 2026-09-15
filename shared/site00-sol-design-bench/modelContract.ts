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

export interface SolBenchmarkProviderDispatchReceipt {
  receiptType: 'SolBenchmarkProviderDispatchReceipt';
  runId: string;
  provider: 'openai';
  modelId: 'gpt-5.6-sol';
  reasoningEffort: 'high';
  imageInputAttached: true;
  structuredOutputRequested: true;
  structuredOutputMode: 'json_schema';
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
  truncated: boolean;
  complete: boolean;
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
  blockingReasons: string[];
}
