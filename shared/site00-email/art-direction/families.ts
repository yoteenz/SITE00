/** Visual family grammar — composition identity per email family group. */
export type VisualFamilyGroup =
  | 'ACCESS'
  | 'ONBOARDING'
  | 'PRODUCTION'
  | 'ACTION'
  | 'MILESTONE'
  | 'DELIVERY'
  | 'BILLING'
  | 'SECURITY'
  | 'RE-ENGAGEMENT';

export type VisualFamilySpec = {
  group: VisualFamilyGroup;
  thesis: string;
  dominantField: 'light' | 'dark' | 'mixed';
  density: 'low' | 'low-medium' | 'medium' | 'high';
  accent: string;
  prohibited: string[];
};

export const VISUAL_FAMILIES: Record<VisualFamilyGroup, VisualFamilySpec> = {
  ACCESS: {
    group: 'ACCESS',
    thesis: 'Credential issuance — authentication, entry, recognition, digital passport.',
    dominantField: 'dark',
    density: 'low-medium',
    accent: 'SITE 00 red illumination on black field',
    prohibited: ['generic membership card', 'oversized QR', 'SaaS header stack', 'serif fashion treatment'],
  },
  ONBOARDING: {
    group: 'ONBOARDING',
    thesis: 'Orientation — arrival, beginning, mapping the unknown.',
    dominantField: 'light',
    density: 'medium',
    accent: 'Route/map language, step markers, architectural progression',
    prohibited: ['dashboard screenshot layout', 'generic welcome banner'],
  },
  PRODUCTION: {
    group: 'PRODUCTION',
    thesis: 'The system is actively building something.',
    dominantField: 'mixed',
    density: 'medium',
    accent: 'Process rails, production coordinates, status instrumentation',
    prohibited: ['alert-email urgency styling', 'plain notification stack'],
  },
  ACTION: {
    group: 'ACTION',
    thesis: 'Visual urgency without alert-email clichés — review object focal.',
    dominantField: 'light',
    density: 'medium',
    accent: 'Annotation marks, approval controls, isolated focal artifact',
    prohibited: ['red exclamation patterns', 'generic task list card'],
  },
  MILESTONE: {
    group: 'MILESTONE',
    thesis: 'Ceremonial completion — negative space, reveal, achievement mark.',
    dominantField: 'light',
    density: 'low',
    accent: 'Oversized milestone typography, completion mark',
    prohibited: ['confetti', 'celebration stock imagery', 'generic badge'],
  },
  DELIVERY: {
    group: 'DELIVERY',
    thesis: 'Receiving a finished object — vault, manifest, completion seal.',
    dominantField: 'light',
    density: 'low-medium',
    accent: 'Archive language, delivery artifact, corner registration marks',
    prohibited: ['shipping box clipart', 'tracking-number fintech layout'],
  },
  BILLING: {
    group: 'BILLING',
    thesis: 'Precise financial record — ledger grid, transaction coordinates.',
    dominantField: 'light',
    density: 'medium',
    accent: 'Structured numbers, minimal ornament, ledger strips',
    prohibited: ['Stripe receipt clone', 'generic invoice table'],
  },
  SECURITY: {
    group: 'SECURITY',
    thesis: 'Controlled, technical, authoritative — system diagnostics.',
    dominantField: 'mixed',
    density: 'low-medium',
    accent: 'Session coordinates, restrained composition, diagnostic marks',
    prohibited: ['phishing-alert styling', 'lock icon hero'],
  },
  'RE-ENGAGEMENT': {
    group: 'RE-ENGAGEMENT',
    thesis: 'Signal transmission — editorial modules, numbered content.',
    dominantField: 'light',
    density: 'medium',
    accent: 'Editorial density, issue indexing, transmission diagram',
    prohibited: ['newsletter template grid', 'blog post layout'],
  },
};

/** Map registry EmailFamily → visual family group for gallery filters. */
export function visualFamilyForRegistryFamily(family: string): VisualFamilyGroup {
  switch (family) {
    case 'access':
      return 'ACCESS';
    case 'identity':
      return 'ONBOARDING';
    case 'project':
    case 'studio':
    case 'input':
    case 'assets':
      return 'PRODUCTION';
    case 'review':
      return 'ACTION';
    case 'milestone':
      return 'MILESTONE';
    case 'launch':
    case 'property':
    case 'domain':
      return 'DELIVERY';
    case 'billing':
      return 'BILLING';
    case 'support':
    case 'internal':
      return 'SECURITY';
    case 'signal':
      return 'RE-ENGAGEMENT';
    default:
      return 'PRODUCTION';
  }
}
