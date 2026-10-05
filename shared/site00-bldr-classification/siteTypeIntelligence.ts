/**
 * BLDR site-type combination intelligence — capability signals + downstream flags.
 */

import type { BldrSiteTypeId } from './siteTypeModel';
import { normalizeSiteTypes } from './siteTypeModel';

export type SiteTypeCapabilitySignal =
  | 'COMMERCE'
  | 'SCHEDULING'
  | 'ACCOUNT_SUBSCRIPTION'
  | 'APPLICATION_LOGIC'
  | 'PORTFOLIO_PRESENTATION'
  | 'BUSINESS_PRESENCE';

export type SiteTypeDownstreamFlag =
  | 'COMMERCE_QUESTIONS'
  | 'BOOKING_QUESTIONS'
  | 'MEMBERSHIP_QUESTIONS'
  | 'APPLICATION_QUESTIONS';

export type SiteTypeClassificationProfile = {
  siteTypes: BldrSiteTypeId[];
  summaryLabel: string;
  capabilitySignals: SiteTypeCapabilitySignal[];
  downstreamFlags: SiteTypeDownstreamFlag[];
};

const TYPE_LABELS: Record<BldrSiteTypeId, string> = {
  business: 'BUSINESS WEBSITE',
  ecommerce: 'E-COMMERCE STORE',
  portfolio: 'PORTFOLIO SITE',
  booking: 'BOOKING / APPOINTMENTS',
  membership: 'MEMBERSHIP / COMMUNITY',
  'web-app': 'WEB APPLICATION',
  other: 'OTHER',
};

export function deriveSiteTypeCapabilitySignals(siteTypes: BldrSiteTypeId[]): SiteTypeCapabilitySignal[] {
  const signals = new Set<SiteTypeCapabilitySignal>();
  if (siteTypes.includes('business')) signals.add('BUSINESS_PRESENCE');
  if (siteTypes.includes('portfolio')) signals.add('PORTFOLIO_PRESENTATION');
  if (siteTypes.includes('ecommerce')) signals.add('COMMERCE');
  if (siteTypes.includes('booking')) signals.add('SCHEDULING');
  if (siteTypes.includes('membership')) signals.add('ACCOUNT_SUBSCRIPTION');
  if (siteTypes.includes('web-app')) signals.add('APPLICATION_LOGIC');
  return Array.from(signals);
}

export function deriveSiteTypeDownstreamFlags(siteTypes: BldrSiteTypeId[]): SiteTypeDownstreamFlag[] {
  const flags: SiteTypeDownstreamFlag[] = [];
  if (siteTypes.includes('ecommerce')) flags.push('COMMERCE_QUESTIONS');
  if (siteTypes.includes('booking')) flags.push('BOOKING_QUESTIONS');
  if (siteTypes.includes('membership')) flags.push('MEMBERSHIP_QUESTIONS');
  if (siteTypes.includes('web-app')) flags.push('APPLICATION_QUESTIONS');
  return flags;
}

export function summarizeSiteTypeCombination(siteTypes: BldrSiteTypeId[]): string {
  if (siteTypes.length === 0) return 'UNSPECIFIED SITE TYPE';
  if (siteTypes.length === 1) {
    return TYPE_LABELS[siteTypes[0]!] ?? siteTypes[0]!.toUpperCase();
  }

  const has = (id: BldrSiteTypeId) => siteTypes.includes(id);
  if (has('business') && has('booking') && siteTypes.length === 2) {
    return 'SERVICE BUSINESS WITH SCHEDULING CAPABILITY';
  }
  if (has('ecommerce') && has('membership') && siteTypes.length === 2) {
    return 'COMMERCE + ACCOUNT / MEMBERSHIP EXPERIENCE';
  }
  if (has('business') && has('web-app') && siteTypes.length === 2) {
    return 'HYBRID MARKETING + APPLICATION PROPERTY';
  }
  if (siteTypes.length >= 3) {
    return 'MULTI-CAPABILITY DIGITAL PROPERTY';
  }
  return siteTypes.map((t) => TYPE_LABELS[t] ?? t.toUpperCase()).join(' + ');
}

export function compileSiteTypeClassificationProfile(
  value: string | string[] | undefined,
): SiteTypeClassificationProfile {
  const siteTypes = normalizeSiteTypes(value);
  return {
    siteTypes,
    summaryLabel: summarizeSiteTypeCombination(siteTypes),
    capabilitySignals: deriveSiteTypeCapabilitySignals(siteTypes),
    downstreamFlags: deriveSiteTypeDownstreamFlags(siteTypes),
  };
}

export type SiteTypeFollowUpStepDef = {
  id: string;
  title: string;
  subtitle: string;
  flag: SiteTypeDownstreamFlag;
  placeholder: string;
};

export const SITE_TYPE_FOLLOWUP_STEPS: SiteTypeFollowUpStepDef[] = [
  {
    id: 'commerce-scope',
    title: 'COMMERCE REQUIREMENTS',
    subtitle: 'E-COMMERCE SELECTED — DESCRIBE PRODUCTS, CHECKOUT, AND INVENTORY NEEDS.',
    flag: 'COMMERCE_QUESTIONS',
    placeholder: 'PRODUCT TYPES, CHECKOUT FLOW, INVENTORY, FULFILLMENT…',
  },
  {
    id: 'scheduling-scope',
    title: 'SCHEDULING / BOOKING REQUIREMENTS',
    subtitle: 'BOOKING SELECTED — DESCRIBE CALENDAR, INTAKE, AND APPOINTMENT FLOW.',
    flag: 'BOOKING_QUESTIONS',
    placeholder: 'CALENDAR RULES, INTAKE FORMS, REMINDERS, STAFF AVAILABILITY…',
  },
  {
    id: 'membership-scope',
    title: 'MEMBERSHIP / COMMUNITY REQUIREMENTS',
    subtitle: 'MEMBERSHIP SELECTED — DESCRIBE ACCOUNTS, GATED CONTENT, AND SUBSCRIPTIONS.',
    flag: 'MEMBERSHIP_QUESTIONS',
    placeholder: 'TIERS, GATED CONTENT, SUBSCRIPTIONS, COMMUNITY FEATURES…',
  },
  {
    id: 'application-scope',
    title: 'WEB APPLICATION REQUIREMENTS',
    subtitle: 'WEB APPLICATION SELECTED — DESCRIBE CUSTOM LOGIC, DASHBOARDS, AND USER FLOWS.',
    flag: 'APPLICATION_QUESTIONS',
    placeholder: 'USER ROLES, DASHBOARDS, WORKFLOWS, CUSTOM LOGIC…',
  },
];

export function resolveSiteTypeFollowUpStepIds(siteTypes: BldrSiteTypeId[]): string[] {
  const flags = deriveSiteTypeDownstreamFlags(siteTypes);
  return SITE_TYPE_FOLLOWUP_STEPS.filter((s) => flags.includes(s.flag)).map((s) => s.id);
}
