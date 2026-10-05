import { SITE00_ROUTES } from './routes';

export const CTRL_ROOM_MOBILE_COPY = {
  hero: {
    kicker: 'CTRL ROOM / COMMAND CENTER',
    headlineLine1: 'WHAT NEEDS',
    headlineLine2: 'MY ATTENTION?',
    subhead: 'MONITOR YOUR PROPERTIES, PROJECTS, ACCESS, AND ACCOUNT ACTIVITY.',
  },
  operatingStatus: {
    label: 'OPERATING STATUS',
  },
  commandOverview: {
    title: 'COMMAND OVERVIEW',
    micro: 'SYSTEM SNAPSHOT',
  },
  propertyNetwork: {
    title: 'PROPERTY NETWORK',
    emptyTitle: 'NO ACTIVE PROPERTIES.',
    emptyBody: 'YOUR NETWORK IS READY FOR ITS FIRST LOCATION.',
    emptyCta: 'ENTER BLDR →',
    viewAll: 'VIEW ALL PROPERTIES →',
  },
  actionQueue: {
    title: 'ACTION QUEUE',
    emptyIndex: '00',
    emptyLabel: 'REQUIRES ATTENTION',
    emptyBody: 'ALL SYSTEMS CLEAR. NOTHING REQUIRES YOUR ATTENTION.',
    unavailable: 'STATUS TEMPORARILY UNAVAILABLE',
  },
  activityStream: {
    title: 'ACTIVITY STREAM',
    micro: 'LATEST EVENTS',
    empty: 'NO RECENT ACTIVITY.',
    viewAll: 'VIEW ALL ACTIVITY →',
    unavailable: 'ACTIVITY TEMPORARILY UNAVAILABLE',
  },
  closing: {
    headlineLine1: 'YOUR DIGITAL WORLD.',
    headlineLine2: 'ONE OPERATING VIEW.',
    body: 'SITE 00 KEEPS YOUR PROPERTIES, PROJECTS, ACCESS, AND ACTIVITY CONNECTED.',
    projectsCta: 'ENTER PROJECTS →',
    buildCta: 'START A BUILD →',
  },
  adminAccess: {
    kicker: 'OPERATOR ACCESS',
    title: '00 / CONTROL',
    body: 'Open the SITE 00 admin command center for production, projects, and orchestration.',
    cta: 'ENTER ADMIN DASH →',
  },
} as const;

export const CTRL_ROOM_COMMAND_CELLS = [
  {
    id: 'properties',
    index: '01',
    title: 'PROPERTIES',
    stateLabel: 'ACTIVE',
    actionLabel: 'VIEW ALL →',
    href: SITE00_ROUTES.controlSites,
    icon: 'hex' as const,
  },
  {
    id: 'domains',
    index: '02',
    title: 'DOMAINS',
    stateLabel: 'CONNECTED',
    actionLabel: 'MANAGE →',
    href: SITE00_ROUTES.controlDomains,
    icon: 'target' as const,
  },
  {
    id: 'plan',
    index: '03',
    title: 'PLAN',
    stateLabel: 'CURRENT',
    actionLabel: 'MANAGE →',
    href: SITE00_ROUTES.controlBilling,
    icon: 'cube' as const,
  },
  {
    id: 'billing',
    index: '04',
    title: 'BILLING',
    stateLabel: 'NEXT EVENT',
    actionLabel: 'VIEW BILLING →',
    href: SITE00_ROUTES.controlBilling,
    icon: 'calendar' as const,
  },
] as const;
