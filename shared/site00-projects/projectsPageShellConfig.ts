/**
 * B5.9R8R1 — Static projects index shell copy (never varies by view mode).
 */

export const PROJECTS_PAGE_SHELL_CONFIG = {
  brand: 'SITE 00',
  verbs: ['CREATE', 'BUILD', 'EVOLVE'] as const,
  kicker: 'PROJECTS /',
  title: 'PROJECTS',
  tagline: 'ALL PROJECTS. ONE SYSTEM.',
  support: 'IDEAS BECOME ENVIRONMENTS. ENVIRONMENTS CREATE OPPORTUNITY.',
  rail: ['PLAN', 'PRODUCE', 'PUBLISH', 'REPEAT'] as const,
  railSub: 'BUILDING BIGGER WORLDS',
  indexMark: '00',
} as const;

export const PROJECTS_METRIC_SLOT_COUNT = 4 as const;

export const PROJECTS_FOUNDER_METRIC_LABELS = [
  'TOTAL PROJECTS',
  'ACTIVE',
  'PRE LAUNCH',
  'COMPLETE',
] as const;

export const PROJECTS_CLIENT_METRIC_LABELS = [
  'YOUR PROJECTS',
  'ACTIVE',
  'IN REVIEW',
  'COMPLETE',
] as const;
