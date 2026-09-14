import type { FocusedHybridStrategyId } from '../../../../site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';

export const ACTUAL_PRESENTATION_FIREWALL = 'ACTUAL_PRESENTATION_FIREWALL' as const;
export const ACTUAL_PRESENTATION_VIOLATION_DEVICE_FRAME = 'ACTUAL_PRESENTATION_VIOLATION_DEVICE_FRAME' as const;

export type ActualPresentationFirewallResult = {
  gate: typeof ACTUAL_PRESENTATION_FIREWALL;
  pass: boolean;
  errorCode: string | null;
  notes: string | null;
};

export function buildActualPageOnlyPresentationFirewallBlock(): string {
  return [
    'ACTUAL PAGE ONLY — PRESENTATION FIREWALL (hard constraints):',
    '- Render the interface artifact itself as a flat mobile page design.',
    '- Do NOT place the interface inside a phone mockup, device shell, or hardware frame.',
    '- Do NOT use browser chrome, bezels, notch, camera cutout, or hardware buttons.',
    '- Do NOT place the page on paper, poster, or product-photography staging.',
    '- Do NOT float the page inside a scene or perspective product shot.',
    '- Output: flat mobile page artifact on a clean plain background (same conventions as GPT2 control pair).',
  ].join('\n');
}

/** Advisory gate — machine cannot auto-pass founder review. */
export function evaluateActualPresentationFirewall(input: {
  strategyId: FocusedHybridStrategyId;
  actualPrompt: string;
  renderImageUri: string;
  providerMetadata?: Record<string, unknown> | null;
  providerSettings?: Record<string, unknown> | null;
}): ActualPresentationFirewallResult {
  const base: ActualPresentationFirewallResult = {
    gate: ACTUAL_PRESENTATION_FIREWALL,
    pass: true,
    errorCode: null,
    notes: null,
  };

  if (input.strategyId !== 'NBP_FULL_PAIR_CORRECTED') {
    return base;
  }

  if (!input.actualPrompt.includes('PRESENTATION FIREWALL')) {
    return {
      ...base,
      pass: false,
      errorCode: 'ACTUAL_PRESENTATION_FIREWALL_PROMPT_MISSING',
      notes: 'NBP corrected Actual must include presentation firewall contract.',
    };
  }

  const settings = input.providerSettings ?? {};
  if (settings.simulateDeviceFrame === true) {
    return {
      ...base,
      pass: false,
      errorCode: ACTUAL_PRESENTATION_VIOLATION_DEVICE_FRAME,
      notes: 'Simulated device-frame violation (test or audit hook).',
    };
  }

  const uri = input.renderImageUri.toLowerCase();
  if (uri.includes('device-frame-violation') || uri.includes('phone-mockup')) {
    return {
      ...base,
      pass: false,
      errorCode: ACTUAL_PRESENTATION_VIOLATION_DEVICE_FRAME,
      notes: 'Render URI flagged as device-frame presentation.',
    };
  }

  const metaFlag = input.providerMetadata?.deviceFrameLikelihood;
  if (metaFlag === 'HIGH' || metaFlag === true) {
    return {
      ...base,
      pass: false,
      errorCode: ACTUAL_PRESENTATION_VIOLATION_DEVICE_FRAME,
      notes: 'Provider metadata indicates device-frame presentation risk.',
    };
  }

  return base;
}
