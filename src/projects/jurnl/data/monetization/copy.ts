/**
 * JURNL monetization copy — UPPERCASE, FACT → VALUE → ACTION. No prices, no urgency, no dark patterns.
 * Plan / add-on names are never written here: they come from the plan registry at render time.
 */

export const JURNL_MONETIZATION_COPY = {
  preview: 'PREVIEW',
  viewOptions: 'VIEW OPTIONS',
  availableWith: (planName: string) => `AVAILABLE WITH ${planName}.`,
  availableAsAddOn: (addOnName: string) => `AVAILABLE AS ${addOnName}.`,
  addOnLead: 'OPTIONAL ADD-ON',
  usageReached: "THIS PERIOD'S LIMIT HAS BEEN REACHED.",
  usageResets: (when: string) => `RESETS ${when}.`,
  trialEnds: (date: string) => `TRIAL ENDS ${date}.`,
  billingState: {
    ACTIVE: 'ACTIVE',
    TRIALING: 'TRIAL',
    PAST_DUE: 'PAYMENT ISSUE',
    CANCELED: 'CANCELED',
    EXPIRED: 'EXPIRED',
    PAUSED: 'PAUSED',
    NONE: 'NO PLAN',
  },
  unavailable: {
    UNKNOWN_PLAN: "WE COULDN'T CONFIRM YOUR PLAN.",
    OFFLINE_BILLING: 'PLAN DETAILS ARE OFFLINE RIGHT NOW.',
    ENTITLEMENT_LOAD_FAILURE: "WE COULDN'T LOAD YOUR PLAN DETAILS.",
    EXPIRED_ACCESS: 'THIS ACCESS HAS ENDED.',
    PAYMENT_ISSUE: 'THERE IS A PAYMENT ISSUE ON YOUR PLAN.',
    PROVIDER_UNAVAILABLE: 'PLAN DETAILS ARE UNAVAILABLE RIGHT NOW.',
  },
  unavailableBody: 'YOUR CORE JURNL FEATURES STILL WORK.',
} as const;
