/** Bridge F01 device AI + F02 setup consents into repository (W1.7). ASK_JURNL_CONTEXT is never derived from them. */

import type { SetupDraft } from '../f02/setupDraft';
import type { DeviceState } from '../../runtime/state/store';
import { getRepository } from './deviceRepository';

export function syncSetupConsentsToRepository(draft: SetupDraft) {
  const repo = getRepository();
  repo.patchConsent('DATA_REMEMBER', draft.consentRemember, 'F02.07');
  repo.patchConsent('LINKED_ACCOUNTS', draft.consentLinks, 'F02.07');
  repo.patchConsent('NO_DATA_SALE', draft.consentSale, 'F02.07');
}

export function syncDeviceAiToRepository(device: DeviceState) {
  const repo = getRepository();
  repo.patchConsent('AI_PERSONALIZED', device.ai.personalizedInsights, 'F01.11');
  repo.patchConsent('AI_CATEGORIZATION', device.ai.smartCategorization, 'F01.11');
  repo.patchConsent('AI_BUDGET', device.ai.budgetRecommendations, 'F01.11');
  repo.patchConsent('AI_NATURAL_LANGUAGE', device.ai.naturalLanguage, 'F01.11');
  repo.patchConsent('AI_MARKET_TRENDS', device.ai.marketTrends, 'F01.11');
  // ASK JURNL CONTEXT is its own consent: it is granted or withdrawn only by its own switch (PRIVACY & CONSENTS, the
  // ACCOUNT page, the approved drawer). Syncing the AI choices never writes it, so an AI switch cannot turn it back on.
}
