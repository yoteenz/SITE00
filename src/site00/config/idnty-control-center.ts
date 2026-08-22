import { SITE00_ROUTES } from './routes';

export const IDNTY_CONTROL_CENTER_HERO = {
  kicker: 'IDNTY / CONTROL CENTER',
  headlineLine1: 'YOUR ACCESS.',
  headlineLine2: 'YOUR IDENTITY.',
  subhead: 'CONTROL YOUR ACCESS. PROTECT WHAT MATTERS.',
} as const;

export const IDNTY_CONTROL_CENTER_STATUS_RAIL = {
  label: 'SYSTEM STATUS',
  categories: ['IDENTITY', 'ACCESS', 'SECURITY', 'PRIVACY'] as const,
} as const;

export type IdntyControlRowId =
  | 'security'
  | 'sessions'
  | 'api-keys'
  | 'tokens'
  | 'profile'
  | 'notifications'
  | 'privacy'
  | 'delete';

export type IdntyControlGroupId = 'access-control' | 'identity-preferences' | 'account-protocols';

export type IdntyControlRowConfig = {
  id: IdntyControlRowId;
  index: string;
  title: string;
  description: string;
  href: string;
  iconKey: IdntyControlRowId;
  destructive?: boolean;
};

export type IdntyControlGroupConfig = {
  id: IdntyControlGroupId;
  title: string;
  microLabel: string;
  rows: IdntyControlRowConfig[];
  variant?: 'default' | 'destructive';
};

export const IDNTY_CONTROL_CENTER_GROUPS: IdntyControlGroupConfig[] = [
  {
    id: 'access-control',
    title: 'ACCESS CONTROL',
    microLabel: 'SECURE YOUR ACCESS',
    rows: [
      {
        id: 'security',
        index: '01',
        title: 'SIGN IN & SECURITY',
        description: 'PASSWORD • RECOVERY',
        href: SITE00_ROUTES.idntySignInSecurity,
        iconKey: 'security',
      },
      {
        id: 'sessions',
        index: '02',
        title: 'SESSIONS',
        description: 'MANAGE ACTIVE SESSIONS',
        href: `${SITE00_ROUTES.idntySignInSecurity}#sessions`,
        iconKey: 'sessions',
      },
      {
        id: 'api-keys',
        index: '03',
        title: 'API KEYS',
        description: 'DEVELOPER ACCESS',
        href: `${SITE00_ROUTES.controlSettings}#api-keys`,
        iconKey: 'api-keys',
      },
      {
        id: 'tokens',
        index: '04',
        title: 'ACCESS TOKENS',
        description: 'SERVICE & INTEGRATION TOKENS',
        href: `${SITE00_ROUTES.controlSettings}#tokens`,
        iconKey: 'tokens',
      },
    ],
  },
  {
    id: 'identity-preferences',
    title: 'IDENTITY & PREFERENCES',
    microLabel: 'MANAGE YOUR IDENTITY',
    rows: [
      {
        id: 'profile',
        index: '05',
        title: 'PROFILE',
        description: 'NAME • CONTACT • ACCOUNT INFO',
        href: SITE00_ROUTES.controlSettings,
        iconKey: 'profile',
      },
      {
        id: 'notifications',
        index: '06',
        title: 'NOTIFICATIONS',
        description: 'ALERTS • EMAIL • PREFERENCES',
        href: `${SITE00_ROUTES.controlSettings}#notifications`,
        iconKey: 'notifications',
      },
      {
        id: 'privacy',
        index: '07',
        title: 'PRIVACY',
        description: 'DATA • VISIBILITY • CONSENT',
        href: `${SITE00_ROUTES.controlSettings}#privacy`,
        iconKey: 'privacy',
      },
    ],
  },
  {
    id: 'account-protocols',
    title: 'ACCOUNT PROTOCOLS',
    microLabel: 'ADVANCED ACCOUNT ACTIONS',
    variant: 'destructive',
    rows: [
      {
        id: 'delete',
        index: '08',
        title: 'DELETE ACCOUNT',
        description: 'PERMANENTLY DELETE YOUR ACCOUNT AND ASSOCIATED DATA.',
        href: `${SITE00_ROUTES.controlSettings}#delete-account`,
        iconKey: 'delete',
        destructive: true,
      },
    ],
  },
];
