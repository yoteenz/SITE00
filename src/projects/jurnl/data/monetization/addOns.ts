/** JURNL ADD-ONS — separate from base plans (DRAFT candidates; not finalized). */

import type { AddOnDefinition } from '../../../../../shared/site00-monetization/contract.js';

export const JURNL_ADD_ONS: readonly AddOnDefinition[] = [
  {
    addOnId: 'JURNL_ADD_ON_TRAVEL',
    name: 'JURNL TRAVEL',
    status: 'DRAFT',
    entitlementClass: 'JURNL_ADD_ON',
    capabilityGrants: ['ADVANCED_TRIP_PLANNING'],
    eligiblePlans: ['JURNL_FREE', 'JURNL_PLUS', 'JURNL_PRO'],
    billingType: 'TBD',
    limits: [],
  },
  {
    addOnId: 'JURNL_ADD_ON_PREMIUM_CREDIT',
    name: 'JURNL PREMIUM CREDIT',
    status: 'DRAFT',
    entitlementClass: 'JURNL_ADD_ON',
    capabilityGrants: ['ADVANCED_CREDIT_PLANNING'],
    eligiblePlans: ['JURNL_PLUS', 'JURNL_PRO'],
    billingType: 'TBD',
    limits: [],
  },
  {
    addOnId: 'JURNL_ADD_ON_MAJOR_PURCHASE_PREP',
    name: 'JURNL MAJOR PURCHASE PREP',
    status: 'DRAFT',
    entitlementClass: 'JURNL_ADD_ON',
    capabilityGrants: ['ADVANCED_PURCHASE_ANALYSIS'],
    eligiblePlans: ['JURNL_FREE', 'JURNL_PLUS'],
    billingType: 'TBD',
    limits: [],
  },
  {
    addOnId: 'JURNL_ADD_ON_BUSINESS_TAX',
    name: 'JURNL BUSINESS TAX',
    status: 'DRAFT',
    entitlementClass: 'JURNL_ADD_ON',
    capabilityGrants: ['BUSINESS_TAX_ADVANCED'],
    eligiblePlans: ['JURNL_BUSINESS'],
    billingType: 'TBD',
    limits: [],
  },
];
