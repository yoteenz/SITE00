import type { PageInteractionContract } from '../site00-studio-world-production/visualReconstruction/pageCompletionIntelligence/types.js';

export const SELF_DIRECTED_PAGE_IDS = {
  home: 'self-directed-home',
  projects: 'self-directed-projects',
  reviews: 'self-directed-reviews',
  inbox: 'self-directed-inbox',
  profile: 'self-directed-profile',
} as const;

export const SELF_DIRECTED_HOME_CONTRACTS: PageInteractionContract[] = [
  {
    interactionId: 'ix-sd-home-view-project',
    pageId: SELF_DIRECTED_PAGE_IDS.home,
    regionId: 'featured',
    label: 'VIEW PROJECT',
    affordanceType: 'LINK',
    intent: 'OPEN_PROJECTS_TAB',
    targetType: 'ROUTE',
    route: '/app/projects/:slug/projects',
    status: 'IMPLEMENTED',
    confidence: 'HIGH',
  },
  {
    interactionId: 'ix-sd-home-continue-working',
    pageId: SELF_DIRECTED_PAGE_IDS.home,
    regionId: 'continue',
    label: 'CONTINUE WORKING',
    affordanceType: 'BUTTON',
    intent: 'OPEN_CURRENT_WORK',
    targetType: 'ROUTE',
    route: '/app/projects/:slug/projects',
    status: 'IMPLEMENTED',
    confidence: 'HIGH',
  },
  {
    interactionId: 'ix-sd-home-evolve-banner',
    pageId: SELF_DIRECTED_PAGE_IDS.home,
    regionId: 'evolve-banner',
    label: 'OPEN',
    affordanceType: 'LINK',
    intent: 'OPEN_EVOLVE_MODULE',
    targetType: 'ROUTE',
    route: '/projects/:slug/evolve',
    status: 'IMPLEMENTED',
    confidence: 'HIGH',
  },
];

export const SELF_DIRECTED_PROJECTS_CONTRACTS: PageInteractionContract[] = [
  {
    interactionId: 'ix-sd-projects-current-focus',
    pageId: SELF_DIRECTED_PAGE_IDS.projects,
    regionId: 'focus',
    label: 'REVIEW CAMPAIGN DIRECTION',
    affordanceType: 'BUTTON',
    intent: 'OPEN_REVIEWS',
    targetType: 'ROUTE',
    route: '/app/projects/:slug/reviews',
    status: 'IMPLEMENTED',
    confidence: 'HIGH',
  },
];

export const SELF_DIRECTED_REVIEWS_CONTRACTS: PageInteractionContract[] = [
  {
    interactionId: 'ix-sd-reviews-open',
    pageId: SELF_DIRECTED_PAGE_IDS.reviews,
    regionId: 'queue',
    label: 'OPEN REVIEW',
    affordanceType: 'CARD_ACTION',
    intent: 'OPEN_REVIEW_DETAIL',
    targetType: 'CHILD_ROUTE',
    route: '/app/projects/:slug/reviews/:reviewId',
    childSurfaceRequirement: 'sd-review-detail',
    status: 'IMPLEMENTED',
    confidence: 'HIGH',
  },
];

export const SELF_DIRECTED_INBOX_CONTRACTS: PageInteractionContract[] = [
  {
    interactionId: 'ix-sd-inbox-thread',
    pageId: SELF_DIRECTED_PAGE_IDS.inbox,
    regionId: 'threads',
    label: 'OPEN THREAD',
    affordanceType: 'CARD_ACTION',
    intent: 'OPEN_INBOX_THREAD',
    targetType: 'CHILD_ROUTE',
    route: '/app/projects/:slug/inbox/:threadId',
    childSurfaceRequirement: 'sd-inbox-thread',
    status: 'IMPLEMENTED',
    confidence: 'HIGH',
  },
];

export const SELF_DIRECTED_PROFILE_CONTRACTS: PageInteractionContract[] = [
  {
    interactionId: 'ix-sd-profile-edit',
    pageId: SELF_DIRECTED_PAGE_IDS.profile,
    regionId: 'hero',
    label: 'EDIT PROFILE',
    affordanceType: 'BUTTON',
    intent: 'OPEN_PROFILE_EDIT',
    targetType: 'SHEET',
    route: '/app/projects/:slug/profile',
    childSurfaceRequirement: 'sd-profile-edit',
    status: 'IMPLEMENTED',
    confidence: 'HIGH',
    mobilePresentation: 'SHEET',
    desktopPresentation: 'MODAL',
  },
  {
    interactionId: 'ix-sd-profile-change-package',
    pageId: SELF_DIRECTED_PAGE_IDS.profile,
    regionId: 'package',
    label: 'CHANGE PACKAGE',
    affordanceType: 'BUTTON',
    intent: 'OPEN_PACKAGE_SELECT',
    targetType: 'ROUTE',
    route: '/evolve/plans',
    status: 'IMPLEMENTED',
    confidence: 'HIGH',
  },
  {
    interactionId: 'ix-sd-profile-sign-out',
    pageId: SELF_DIRECTED_PAGE_IDS.profile,
    regionId: 'actions',
    label: 'SIGN OUT',
    affordanceType: 'BUTTON',
    intent: 'SIGN_OUT',
    targetType: 'EXTERNAL_ACTION',
    route: '/origin/sign-in',
    status: 'IMPLEMENTED',
    confidence: 'HIGH',
  },
];

export const ALL_SELF_DIRECTED_CONTRACTS: PageInteractionContract[] = [
  ...SELF_DIRECTED_HOME_CONTRACTS,
  ...SELF_DIRECTED_PROJECTS_CONTRACTS,
  ...SELF_DIRECTED_REVIEWS_CONTRACTS,
  ...SELF_DIRECTED_INBOX_CONTRACTS,
  ...SELF_DIRECTED_PROFILE_CONTRACTS,
];
