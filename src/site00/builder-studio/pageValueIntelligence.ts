/**
 * Page-specific purpose, depth scope, and feature-grounded value copy for the Blueprint PAGES tab.
 */
import { CAPABILITY_BY_ID, EXPERIENCE_BY_ID, EXPERIENCE_DEPTHS } from '../builder-experience/registry';
import { chosenExperiences, deriveBuildLevel, effectiveCapabilities } from '../builder-experience/rules';
import type { BuilderSelection, ExperienceChoice, ExperienceDepth, ExperienceId } from '../builder-experience/types';

const up = (value: string) => value.toUpperCase();

type PageIntel = {
  purpose: string;
  whyItMatters: string;
};

const PAGE_INTEL: Partial<Record<ExperienceId, PageIntel>> = {
  HOME: {
    purpose: 'MAKE THE RIGHT FIRST IMPRESSION.',
    whyItMatters: 'INTRODUCE THE BRAND, ESTABLISH CREDIBILITY AND GUIDE VISITORS TOWARD RELEVANT ACTIONS.',
  },
  ABOUT: {
    purpose: 'GIVE PEOPLE A REASON TO TRUST YOUR BUSINESS.',
    whyItMatters: 'COMMUNICATE YOUR STORY, PERSPECTIVE, VALUES AND DIFFERENTIATORS.',
  },
  CONTACT: {
    purpose: 'MAKE STARTING A CONVERSATION EASIER.',
    whyItMatters: 'OFFER A CLEAR PATH TO INQUIRIES OR SUPPORTED INTAKE ACTIONS.',
  },
  STORIES: {
    purpose: 'HELP VISITORS EXPLORE YOUR IDEAS AND CONTENT.',
    whyItMatters: 'ORGANIZE PUBLISHED MATERIAL INTO A DISCOVERABLE EXPERIENCE.',
  },
  STORY: {
    purpose: 'GIVE IMPORTANT CONTENT THE SPACE IT DESERVES.',
    whyItMatters: 'PRESENT A SINGLE STORY WITH READABLE CONTENT HIERARCHY.',
  },
  SHOP: {
    purpose: 'TURN INTEREST INTO PURCHASES.',
    whyItMatters: 'HELP CUSTOMERS DISCOVER PRODUCTS AND MOVE TOWARD A SUPPORTED CHECKOUT.',
  },
  PRODUCT: {
    purpose: 'HELP CUSTOMERS CHOOSE CONFIDENTLY.',
    whyItMatters: 'PRESENT RELEVANT PRODUCT DETAILS, VARIANTS AND PURCHASE ACTIONS WHEN INCLUDED.',
  },
  CHECKOUT: {
    purpose: 'REDUCE FRICTION BETWEEN SELECTION AND PURCHASE.',
    whyItMatters: 'SUPPORT THE ACTUAL CHECKOUT FLOW IN THE SELECTED SCOPE.',
  },
  RECORDS: {
    purpose: 'KEEP IMPORTANT ACTIVITY ORGANIZED.',
    whyItMatters: 'PROVIDE AUTHORIZED ACCESS TO RELEVANT RECORDS AND WORKFLOWS.',
  },
  ACCOUNT: {
    purpose: 'MAKE RETURNING EASIER.',
    whyItMatters: 'GIVE USERS ACCESS TO THEIR SUPPORTED PERSONAL ACCOUNT TOOLS.',
  },
  DASHBOARD: {
    purpose: 'MAKE THE IMPORTANT INFORMATION EASIER TO SEE.',
    whyItMatters: 'SURFACE RELEVANT ACTIVITY, STATUS AND NEXT ACTIONS.',
  },
  PEOPLE: {
    purpose: 'GIVE THE RIGHT PEOPLE THE RIGHT ACCESS.',
    whyItMatters: 'SUPPORT SELECTED TEAM PERMISSIONS AND RESPONSIBILITIES.',
  },
  BOOKING: {
    purpose: 'MAKE SCHEDULING STRAIGHTFORWARD.',
    whyItMatters: 'HELP PEOPLE CHOOSE A TIME AND CONFIRM WITHIN YOUR SUPPORTED BOOKING FLOW.',
  },
  ENTRY: {
    purpose: 'OPEN THE DOOR TO SIGNED-IN SPACES.',
    whyItMatters: 'CONNECT PUBLIC PAGES TO THE PRIVATE AREAS YOUR BUILD INCLUDES.',
  },
};

function buildDepthProvides(pageId: ExperienceId, depth: ExperienceDepth, caps: Set<string>): string {
  const depthMeta = EXPERIENCE_DEPTHS.find((d) => d.id === depth)!;
  const label = depthMeta.label.toUpperCase();
  switch (pageId) {
    case 'HOME':
      if (depth === 'ESSENTIAL') return `${label}: HERO, PRIMARY MESSAGE AND ONE CLEAR NEXT STEP.`;
      if (depth === 'FULL') return `${label}: HOME PLUS KEY STATES — EMPTY, LOADING, ERROR AND PROMOTIONAL VARIANTS WHEN NEEDED.`;
      return `${label}: A BROADER HOME FAMILY — CAMPAIGN LANDINGS, SEGMENTS AND SEASONAL VARIANTS IN SCOPE.`;
    case 'SHOP':
      if (depth === 'ESSENTIAL') return `${label}: BROWSE COLLECTIONS AND OPEN A PRODUCT — CHECKOUT FOLLOWS WHEN SELL IS INCLUDED.`;
      if (depth === 'FULL') return `${label}: BROWSE, FILTER AND PRODUCT STATES${caps.has('SELL') ? ', WITH BAG AND CHECKOUT IN THIS BUILD.' : '.'}`;
      return `${label}: RICHER MERCHANDISING VIEWS, COLLECTION STATES AND EDGE CASES FOR YOUR CATALOG SIZE.`;
    case 'PRODUCT':
      if (depth === 'ESSENTIAL') return `${label}: CORE PRODUCT STORY, PRICE AND PRIMARY PURCHASE ACTION WHEN SELL IS INCLUDED.`;
      if (depth === 'FULL') return `${label}: VARIANTS, GALLERY STATES, AVAILABILITY AND CART FEEDBACK WHEN COMMERCE IS IN SCOPE.`;
      return `${label}: EXTENDED PRODUCT FAMILIES — BUNDLES, WAITLIST AND RELATED ITEMS WHEN YOUR SCOPE INCLUDES THEM.`;
    case 'CHECKOUT':
      if (!caps.has('SELL')) return `${label}: NOT IN THIS BUILD — ADD SHOP TO INCLUDE CHECKOUT.`;
      if (depth === 'ESSENTIAL') return `${label}: BAG REVIEW AND PAYMENT STEPS IN YOUR SUPPORTED CHECKOUT.`;
      if (depth === 'FULL') return `${label}: FULL CHECKOUT PATH — SHIPPING, PAYMENT ERRORS, CONFIRMATION AND RECEIPT STATES.`;
      return `${label}: EXTENDED CHECKOUT AND POST-PURCHASE STATES WITHIN YOUR COMMERCE SCOPE.`;
    case 'ACCOUNT':
      if (!caps.has('ACCOUNTS')) return `${label}: NOT IN THIS BUILD — ACCOUNTS ARE NOT SELECTED.`;
      if (depth === 'ESSENTIAL') return `${label}: SIGN-IN, PROFILE BASICS AND SIGN-OUT.`;
      if (depth === 'FULL') return `${label}: ACCOUNT SETTINGS, SECURITY STATES AND LINKS TO YOUR PRIVATE AREAS.`;
      return `${label}: BROADER ACCOUNT FLOWS AND EDGE CASES YOUR MEMBERSHIP OR PORTAL SCOPE REQUIRES.`;
    case 'DASHBOARD':
      if (!caps.has('DASHBOARD')) return `${label}: NOT IN THIS BUILD — DASHBOARD IS NOT SELECTED.`;
      if (depth === 'ESSENTIAL') return `${label}: A FOCUSED SUMMARY OF WHAT NEEDS ATTENTION NOW.`;
      if (depth === 'FULL') return `${label}: LIVE STATES, FILTERS AND DRILL-DOWNS YOUR DATA CONNECTIONS SUPPORT.`;
      return `${label}: EXPANDED DASHBOARD VIEWS AND ROLE-SPECIFIC PANELS IN SCOPE.`;
    case 'RECORDS':
      if (!caps.has('DATA_PORTAL')) return `${label}: NOT IN THIS BUILD — PORTAL / RECORDS ARE NOT SELECTED.`;
      if (depth === 'ESSENTIAL') return `${label}: LIST AND OPEN THE CORE RECORDS YOUR WORKFLOW NEEDS.`;
      if (depth === 'FULL') return `${label}: RECORD STATES, FILTERS, UPLOADS AND WORK STATES YOUR PORTAL INCLUDES.`;
      return `${label}: DEEPER RECORD FAMILIES AND WORKFLOW VARIATIONS WITHIN PORTAL SCOPE.`;
    case 'PEOPLE':
      if (!caps.has('TEAM_ROLES')) return `${label}: NOT IN THIS BUILD — TEAM ROLES ARE NOT SELECTED.`;
      if (depth === 'ESSENTIAL') return `${label}: SEE WHO HAS ACCESS AND THEIR BASIC ROLES.`;
      if (depth === 'FULL') return `${label}: INVITE, CHANGE ROLES AND PERMISSION STATES YOUR TEAM SCOPE INCLUDES.`;
      return `${label}: EXPANDED ADMIN AND AUDIT VIEWS WHEN YOUR SCOPE REQUIRES THEM.`;
    case 'STORY':
      if (depth === 'ESSENTIAL') return `${label}: READABLE ARTICLE LAYOUT WITH CORE TYPOGRAPHY AND SHARING.`;
      if (depth === 'FULL') return `${label}: STORY PLUS RELATED CONTENT, MEDIA STATES AND READING MODES.`;
      return `${label}: RICHER STORY VARIANTS — SERIES, SPECIAL FORMATS AND ARCHIVE TIES.`;
    case 'ABOUT':
      if (depth === 'ESSENTIAL') return `${label}: WHO YOU ARE, WHY IT MATTERS AND ONE CREDIBILITY PROOF.`;
      if (depth === 'FULL') return `${label}: TEAM, TIMELINE, VALUES AND PROOF STATES WITHIN YOUR CONTENT.`;
      return `${label}: EXPANDED ABOUT FAMILY — LOCATIONS, PRESS AND DEEPER PROOF WHEN IN SCOPE.`;
    case 'CONTACT':
      if (depth === 'ESSENTIAL') return `${label}: CLEAR CONTACT PATH AND EXPECTATIONS FOR RESPONSE.`;
      if (depth === 'FULL') return `${label}: FORM STATES, VALIDATION, CONFIRMATION AND ALTERNATE CHANNELS YOU USE.`;
      return `${label}: MULTI-STEP INTAKE OR LOCATION-SPECIFIC CONTACT FLOWS WHEN INCLUDED.`;
    default:
      if (depth === 'ESSENTIAL') return `${label}: THE CORE VIEWS PEOPLE NEED FOR ${EXPERIENCE_BY_ID[pageId].label.toUpperCase()}.`;
      if (depth === 'FULL') return `${label}: MAIN VIEWS PLUS THE SUB-VIEWS AND STATES PEOPLE MEET ON ${EXPERIENCE_BY_ID[pageId].label.toUpperCase()}.`;
      return `${label}: A LARGER VIEW FAMILY FOR ${EXPERIENCE_BY_ID[pageId].label.toUpperCase()} WITHIN YOUR SCOPE.`;
  }
}

function featuresNote(pageId: ExperienceId, caps: Set<string>): string | null {
  const notes: string[] = [];
  const exp = EXPERIENCE_BY_ID[pageId];
  if (exp.needsCapability && !caps.has(exp.needsCapability)) {
    return `REQUIRES ${CAPABILITY_BY_ID[exp.needsCapability].verb.toUpperCase()} — NOT SELECTED IN THIS BUILD.`;
  }
  if (pageId === 'SHOP' || pageId === 'PRODUCT' || pageId === 'CHECKOUT') {
    if (caps.has('SELL')) notes.push('SELL');
    if (caps.has('PAYMENTS')) notes.push('PAYMENTS');
    if (notes.length) return `ENABLED BY ${notes.join(' · ')} IN YOUR CONFIGURATION.`;
    return null;
  }
  if (pageId === 'BOOKING' && caps.has('BOOK')) return 'ENABLED BY BOOK IN YOUR CONFIGURATION.';
  if (pageId === 'RECORDS' && caps.has('DATA_PORTAL')) return 'ENABLED BY YOUR PRIVATE PORTAL / DATA AREA.';
  if (pageId === 'ACCOUNT' && caps.has('ACCOUNTS')) return 'ENABLED BY ACCOUNTS — LINKS TO YOUR SIGNED-IN SPACES.';
  if (pageId === 'DASHBOARD' && caps.has('DASHBOARD')) return 'ENABLED BY DASHBOARD — SURFACES LIVE DATA YOU CONNECT.';
  if (pageId === 'PEOPLE' && caps.has('TEAM_ROLES')) return 'ENABLED BY TEAM ROLES FOR PERMISSIONS.';
  if ((pageId === 'STORY' || pageId === 'STORIES' || pageId === 'JOURNAL') && caps.has('EDIT_CONTENT')) {
    return 'CONTENT CAN BE UPDATED THROUGH YOUR EDIT CONTENT CAPABILITY.';
  }
  return null;
}

function limitation(pageId: ExperienceId, caps: Set<string>): string | null {
  const exp = EXPERIENCE_BY_ID[pageId];
  if (exp.needsCapability && !caps.has(exp.needsCapability)) {
    return `THIS PAGE STAYS OUT OF THE BUILD UNTIL ${CAPABILITY_BY_ID[exp.needsCapability].verb.toUpperCase()} IS ADDED.`;
  }
  if (pageId === 'CHECKOUT' && caps.has('SELL') && !caps.has('PAYMENTS')) {
    return 'PAYMENTS ARE NOT SELECTED — CHECKOUT SCOPE FOLLOWS YOUR COMMERCE CHOICES AT REVIEW.';
  }
  return null;
}

export type PageValueDetail = {
  purpose: string;
  whyItMatters: string;
  depthProvides: string;
  depthSummary: string;
  featuresNote: string | null;
  limitation: string | null;
};

export function resolvePageValue(selection: BuilderSelection, choice: ExperienceChoice): PageValueDetail {
  const exp = EXPERIENCE_BY_ID[choice.id];
  const caps = new Set(effectiveCapabilities(selection));
  const intel = PAGE_INTEL[choice.id];
  const purpose = intel?.purpose ?? up(exp.plain);
  const whyItMatters = intel?.whyItMatters ?? up(`SUPPORTS ${exp.label.toUpperCase()} WITHIN YOUR SELECTED BUILD.`);
  const depthProvides = buildDepthProvides(choice.id, choice.depth, caps);
  const depthSummary = depthProvides;
  return {
    purpose,
    whyItMatters,
    depthProvides,
    depthSummary,
    featuresNote: featuresNote(choice.id, caps),
    limitation: limitation(choice.id, caps),
  };
}

/** Regression helper: distinct copy per page at same depth. */
export function pageDepthCopySignature(selection: BuilderSelection): string[] {
  const { level } = deriveBuildLevel(selection);
  return chosenExperiences(selection, level).map((c) => {
    const v = resolvePageValue(selection, c);
    return `${c.id}:${v.depthSummary}`;
  });
}
