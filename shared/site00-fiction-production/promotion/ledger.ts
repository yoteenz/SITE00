import { EXCHANGE_PATHS } from '../paths.js';
import { ASSET_REQUIREMENTS, PRODUCTION_HOLDS } from './assets.js';
import { BACKGROUND_IDENTITIES, BACKGROUND_TIERS } from './background.js';
import { APPROVED_GROUPS, AUDIT_COMMIT, DECISION_STATES, FOUNDER_ANSWERS, FOUNDER_APPROVED_IDS, NOT_APPROVED, PRODUCTION_STATES, PROMOTION_DATE, PROMOTION_ORDER, PROMOTION_SPRINT } from './founder.js';
import { PROMOTIONS, RECONCILIATION } from './promotions.js';
import { SOUND_MOTIFS, WORLD_RULES } from './rules.js';
import { S101_GUARDS, S101_PATCH } from './s101Patch.js';

export const PROMOTION_LEDGER_PATH = `${EXCHANGE_PATHS.season}/LIVING_WORLD_PROMOTION_LEDGER_V1.json`;
export const BACKGROUND_REGISTRY_PATH = `${EXCHANGE_PATHS.season}/RECURRING_BACKGROUND_REGISTRY_V1.json`;

const counts = () => ({
  auditProposals: RECONCILIATION.length,
  founderApproved: RECONCILIATION.filter((r) => r.founderDecision === 'FOUNDER_APPROVED').length,
  pendingFounder: RECONCILIATION.filter((r) => r.founderDecision === 'PENDING_FOUNDER').length,
  founderHeld: RECONCILIATION.filter((r) => r.founderDecision === 'FOUNDER_HELD').length,
  founderRejected: RECONCILIATION.filter((r) => r.founderDecision === 'FOUNDER_REJECTED').length,
  conditionalProductionHold: PROMOTIONS.filter((p) => p.productionState === 'CONDITIONAL_PRODUCTION_HOLD').length,
});

/** The canonical record of this promotion. Every entry traces to the audit, the founder's words, an implementation and a check. */
export function buildPromotionLedger() {
  return {
    schemaVersion: '1.0.0',
    propertySlug: 'the-exchange',
    ledgerId: 'THE_EXCHANGE.S1.LIVING_WORLD_PROMOTION_LEDGER.V1',
    founderApproval: { date: PROMOTION_DATE, sprint: PROMOTION_SPRINT, auditCommit: AUDIT_COMMIT, groups: APPROVED_GROUPS, approvedIds: FOUNDER_APPROVED_IDS, answers: FOUNDER_ANSWERS, notApproved: NOT_APPROVED },
    rule: 'Founder approval is at the creative-proposal level. Production readiness is tracked separately and may lag. An audit recommendation is never a founder decision; the 53 unapproved proposals keep theirs and await the founder.',
    states: { decision: DECISION_STATES, production: PRODUCTION_STATES },
    counts: counts(),
    promotionOrder: PROMOTION_ORDER,
    promotions: PROMOTIONS,
    worldRules: WORLD_RULES,
    soundMotifs: SOUND_MOTIFS,
    s101: { patch: S101_PATCH, guards: S101_GUARDS },
    productionHolds: PRODUCTION_HOLDS,
    assetRequirements: ASSET_REQUIREMENTS,
    reconciliation: RECONCILIATION,
    implementation: [
      `${EXCHANGE_PATHS.master} approvedAmendments (AM-LW-*)`,
      `${EXCHANGE_PATHS.season}/SEASON1_SCENE_INDEX_V1.json developmentRequirements`,
      `${EXCHANGE_PATHS.season}/FUTURE_PRODUCTION_DEPENDENCIES_V1.json livingWorld`,
      BACKGROUND_REGISTRY_PATH,
    ],
    validation: ['shared/site00-fiction-production/promotion/validate.ts › validatePromotion()', 'tests/theExchangeLivingWorldPromotion.test.ts'],
  };
}

export function buildBackgroundRegistry() {
  return {
    schemaVersion: '1.0.0',
    propertySlug: 'the-exchange',
    registryId: 'THE_EXCHANGE.S1.RECURRING_BACKGROUND_REGISTRY.V1',
    classification: 'APPROVED_DEVELOPMENT_DIRECTION',
    authority: `FD-S101-06 RECURRING, FD-S101-07 ANONYMOUS, R-01 SPEAKING and R-05 approved (founder, ${PROMOTION_DATE})`,
    tiers: BACKGROUND_TIERS,
    rules: [
      'A recurring background identity is a stable reference (face, wardrobe, mannerism, appearances), not a principal character: no biography, no name the source does not give, no relationship the source does not state.',
      'No voice is created for a background identity unless the founder authorizes it.',
      'A tier changes only by founder decision; tierHistory keeps every earlier state and every reference survives the change.',
      'The woman on the balcony and the neighbour stay scene-scoped until an explicit approval says otherwise.',
      'Faces come from start frames that do not exist yet. Nothing here is an asset.',
    ],
    identities: BACKGROUND_IDENTITIES,
  };
}
