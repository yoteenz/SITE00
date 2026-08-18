/**
 * Isolated seed/mock data for SITE 00 public pages.
 * Replace with real APIs or CMS when available — do not treat as production records.
 */

export type PortfolioProjectSeed = {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress';
  imageUrl?: string;
};

/** Public portfolio — empty until published project API exists. */
export const SITE00_PORTFOLIO_SEED: PortfolioProjectSeed[] = [];

export const SITE00_SERVICES_SEED = [
  { id: 'branding', title: 'BRANDING & IDENTITY', description: 'VISUAL SYSTEMS, IDENTITY ARCHITECTURE, AND BRAND FOUNDATIONS.', cta: 'EXPLORE →', href: '/idnty' },
  { id: 'web', title: 'WEB DESIGN & DEVELOPMENT', description: 'SPATIAL DIGITAL PLACES DESIGNED AND BUILT TO LAUNCH.', cta: 'START BUILD →', href: '/bldr' },
  { id: 'evolve', title: 'EVOLVE', description: 'IMPROVE, EXTEND, AND TRANSFORM EXISTING DIGITAL PROPERTIES.', cta: 'EXPLORE EVOLVE →', href: '/evolve' },
  { id: 'ai', title: 'AI & AUTOMATION', description: 'INTELLIGENT SYSTEMS INTEGRATED INTO YOUR BUILD WORKFLOW.', cta: 'VIEW →', href: '/services#integrations' },
  { id: 'content', title: 'CONTENT & CREATIVE', description: 'EDITORIAL ASSETS, CREATIVE DIRECTION, AND PRODUCTION SUPPORT.', cta: 'VIEW →', href: '/services#forms' },
  { id: 'systems', title: 'SYSTEMS & INFRASTRUCTURE', description: 'THE OPERATING ARCHITECTURE THAT POWERS SITE 00 BUILDS.', cta: 'VIEW SYSTEM →', href: '/system' },
  { id: 'support', title: 'ONGOING SUPPORT', description: 'CONTINUITY, MAINTENANCE, AND EVOLUTION AFTER LAUNCH.', cta: 'CONTACT →', href: '/support' },
] as const;

export const SITE00_SYSTEM_LAYERS = [
  { id: 'idnty', num: '01', title: 'IDNTY LAYER', description: 'IDENTITY, ACCESS, AND ACCOUNT FOUNDATIONS FOR EVERY BUILD.' },
  { id: 'build', num: '02', title: 'BUILD LAYER', description: 'DESIGN, DEVELOPMENT, AND CREATIVE PRODUCTION SYSTEMS.' },
  { id: 'deploy', num: '03', title: 'DEPLOY LAYER', description: 'DOMAINS, HOSTING, LAUNCH, AND LIVE ENVIRONMENT CONTROL.' },
  { id: 'insight', num: '04', title: 'INSIGHT LAYER', description: 'ANALYTICS, SIGNALS, AND OPERATIONAL INTELLIGENCE.' },
] as const;

export const SITE00_SYSTEM_STATUS_SEED = [
  { id: 'platform', label: 'PLATFORM', state: 'unavailable' as const },
  { id: 'database', label: 'DATABASE', state: 'unavailable' as const },
  { id: 'storage', label: 'STORAGE', state: 'unavailable' as const },
  { id: 'cdn', label: 'CDN', state: 'unavailable' as const },
  { id: 'auth', label: 'AUTH', state: 'unavailable' as const },
];

export const SITE00_JOURNAL_CATEGORIES = ['ALL', 'ARTICLES', 'UPDATES', 'NOTES'] as const;

export type JournalArticleSeed = {
  id: string;
  category: Exclude<(typeof SITE00_JOURNAL_CATEGORIES)[number], 'ALL'>;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
};

export const SITE00_JOURNAL_SEED: JournalArticleSeed[] = [];

export const SITE00_SUPPORT_TOPICS_SEED = [
  { id: 'getting-started', title: 'GETTING STARTED', description: 'LEARN THE BASICS OF SITE 00.', href: '/support#getting-started' },
  { id: 'billing', title: 'BILLING & PAYMENTS', description: 'MANAGE PLANS, INVOICES, AND PAYMENTS.', href: '/support#billing' },
  { id: 'sites-domains', title: 'SITES & DOMAINS', description: 'LAUNCH SITES AND CONNECT DOMAINS.', href: '/support#sites' },
  { id: 'projects', title: 'PROJECTS', description: 'ORGANIZE WORKSPACES AND BUILDS.', href: '/support#projects' },
  { id: 'account-security', title: 'ACCOUNT & SECURITY', description: 'PROTECT YOUR ACCOUNT AND ACCESS.', href: '/support#account-security' },
  { id: 'integrations', title: 'INTEGRATIONS', description: 'CONNECT EXTERNAL TOOLS AND SERVICES.', href: '/support#integrations' },
  { id: 'troubleshooting', title: 'TROUBLESHOOTING', description: 'RESOLVE COMMON ISSUES QUICKLY.', href: '/support#troubleshooting' },
  { id: 'api', title: 'API & DEVELOPER', description: 'BUILD WITH THE SITE 00 API.', href: '/support#api' },
] as const;

export const SITE00_TEMPLATE_CATEGORIES = ['ALL', 'WEBSITES', 'APPS', 'INFRASTRUCTURE'] as const;

export type TemplateSeed = {
  id: string;
  name: string;
  description: string;
  category: Exclude<(typeof SITE00_TEMPLATE_CATEGORIES)[number], 'ALL'>;
};

export const SITE00_TEMPLATES_SEED: TemplateSeed[] = [];

export const SITE00_IDNTY_HUB_MODULES = [
  { id: 'security', title: 'SIGN IN & SECURITY', href: '/idnty/sign-in-security' },
  { id: 'profile', title: 'PROFILE', href: '/control/settings' },
  { id: 'api-keys', title: 'API KEYS', href: '/control/settings#api-keys' },
  { id: 'sessions', title: 'SESSIONS', href: '/idnty/sign-in-security#sessions' },
  { id: 'notifications', title: 'NOTIFICATIONS', href: '/control/settings#notifications' },
  { id: 'privacy', title: 'PRIVACY', href: '/control/settings#privacy' },
  { id: 'tokens', title: 'ACCESS TOKENS', href: '/control/settings#tokens' },
  { id: 'delete', title: 'DELETE ACCOUNT', href: '/control/settings#delete-account', destructive: true },
] as const;

export const SITE00_BLDR_HUB_ACTIONS = [
  { id: 'start', title: 'START NEW PROJECT', description: 'BEGIN A NEW BUILD FROM YOUR CURRENT FOUNDATION.', cta: 'START →', href: '/bldr/state' },
  { id: 'templates', title: 'TEMPLATES', description: 'CHOOSE FROM PRE-BUILT TEMPLATES AND BLUEPRINTS.', cta: 'BROWSE →', href: '/bldr/templates' },
  { id: 'components', title: 'COMPONENTS', description: 'EXPLORE REUSABLE SITE 00 COMPONENTS.', cta: 'EXPLORE →', href: '/bldr/state' },
  { id: 'deploy', title: 'DEPLOY', description: 'PUBLISH YOUR BUILD TO PRODUCTION.', cta: 'DEPLOY →', href: '/control/sites' },
] as const;
