import type { ProviderAutomationMode } from '../types/schemas.js';
import { KLING4_CAPABILITY_MATRIX } from './kling4CapabilityMatrix.js';

export type ProviderAccessAssessment = {
  selectedProvider: 'artlist-kling-4' | 'fal-kling-legacy' | 'kling-direct-api';
  providerModelId: string;
  artlistKling4Access: 'UI_AND_MCP_ONLY' | 'OAUTH_BUSINESS_API_UNVERIFIED_FOR_VIDEO' | 'NOT_CONNECTED';
  artlistAutomation: ProviderAutomationMode;
  directKlingApi: ProviderAutomationMode;
  falKlingLegacyAutomation: ProviderAutomationMode;
  recommendation: string;
  tradeoffs: string[];
};

export function assessProviderAccess(): ProviderAccessAssessment {
  const paidApiRow = KLING4_CAPABILITY_MATRIX.find((r) => r.capability === 'PAID_GENERATION_API');
  return {
    selectedProvider: 'artlist-kling-4',
    providerModelId: 'kling-4.0',
    artlistKling4Access: 'OAUTH_BUSINESS_API_UNVERIFIED_FOR_VIDEO',
    artlistAutomation: 'MANUAL_SUBMISSION',
    directKlingApi: 'DISABLED',
    falKlingLegacyAutomation: 'API_AUTOMATED',
    recommendation:
      'Use MANUAL_SUBMISSION execution packets for Kling 4.0 via Artlist AI Toolkit until founder approves a credentialed API path. Retain fal-kling for legacy automated paths; do not disable.',
    tradeoffs: [
      'Artlist MCP enables assistant-driven generation but is not a headless production adapter and cannot replace reference-locked batch orchestration.',
      'Kling direct API may expose full keyframe/reference surface but requires separate commercial agreement and founder provider switch approval.',
      'FAL Kling v1/v2 is wired in expression engine but is not Kling 4 and remains blocked for Entry 002 motion sprints (klingBlocked flags).',
      paidApiRow?.notes ?? '',
    ],
  };
}
