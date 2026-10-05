/** Ask Jurnl context boundary (W1.3). No secrets, no raw storage, no debug state. */

import { computeSafeToSpend } from '../f09/safeToSpend';
import { getRepository } from '../repository/deviceRepository';
import { consentGranted } from './consent';

export type AskJurnlContext = {
  current_family_id: string;
  current_node_id: string;
  current_route: string;
  safe_to_spend: number;
  obligation_count: number;
  completeness: string;
  display_currency: string;
};

export type AskJurnlExplanation = {
  headline: string;
  body: string;
  state: 'READY' | 'NO_CONTEXT' | 'UNAVAILABLE';
};

export function buildAskJurnlContext(familyId: string, route: string, nodeId: string): AskJurnlContext {
  const signal = computeSafeToSpend();
  const settings = getRepository().getSettings();
  return {
    current_family_id: familyId,
    current_node_id: nodeId,
    current_route: route,
    safe_to_spend: signal.value,
    obligation_count: signal.setupObligationCount,
    completeness: signal.completeness,
    display_currency: settings.displayCurrency,
  };
}

export function explainFromContext(ctx: AskJurnlContext): AskJurnlExplanation {
  const records = getRepository().getConsent();
  if (!consentGranted(records, 'ASK_JURNL_CONTEXT') && !consentGranted(records, 'AI_NATURAL_LANGUAGE')) {
    return {
      headline: 'ASK JURNL NEEDS CONTEXT PERMISSION',
      body: 'ENABLE ASK JURNL CONTEXT IN ACCOUNT SETTINGS TO READ THIS FAMILY.',
      state: 'UNAVAILABLE',
    };
  }
  return {
    headline: `SAFE TO SPEND ${ctx.completeness === 'UNSTATED' ? 'IS UNSTATED' : 'IS A COMPUTED SIGNAL'}`,
    body: `${ctx.current_family_id} · ${ctx.obligation_count} SETUP OBLIGATIONS · DISPLAY ${ctx.display_currency}. THIS IS EXPLANATION ONLY — NOT A PLAN AND NOT LIVE BANK DATA.`,
    state: 'READY',
  };
}
