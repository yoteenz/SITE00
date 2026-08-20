/**
 * EVOLVE / Marketing & Content — capability config (complementary to REFINE / INSTALL / TRANSFORM).
 */

export const EVOLVE_MARKETING_CAPABILITY = {
  code: '04',
  id: 'marketing-content',
  title: 'MARKETING & CONTENT',
  subtitle: 'KEEP THE BRAND MOVING.',
  description:
    'YOUR PROPERTY EXISTS. NOW KEEP IT MOVING — CAMPAIGN DIRECTION, CONTENT PRODUCTION, AND REPEATABLE CREATIVE SYSTEMS.',
  entryHeadlineLine1: 'YOUR PROPERTY EXISTS.',
  entryHeadlineLine2: 'NOW KEEP IT MOVING.',
  entrySubhead:
    'CAMPAIGN DIRECTION, CONTENT PRODUCTION, AND REPEATABLE CREATIVE SYSTEMS — WITHOUT STARTING FROM ZERO.',
  cta: 'EXPLORE MARKETING & CONTENT →',
  startCta: 'START EVOLUTION →',
  locationLabel: 'LOCATION / EVOLVE / MARKETING',
} as const;

export const MARKETING_INTAKE_STEPS = [
  { id: 'objective', label: 'OBJECTIVE', fields: ['campaignObjective', 'makingWhat', 'productService'] },
  { id: 'audience', label: 'AUDIENCE & PLATFORMS', fields: ['targetAudience', 'platforms', 'deliverableTypes'] },
  { id: 'timeline', label: 'TIMELINE', fields: ['quantityCadence', 'deadline', 'launchDate'] },
  { id: 'brand', label: 'BRAND & ASSETS', fields: ['businessName', 'copyMessaging', 'restrictions', 'approvalContact'] },
  { id: 'notes', label: 'ADDITIONAL SIGNAL', fields: ['additionalNotes'] },
] as const;

export const MARKETING_ASSET_CATEGORIES = [
  { id: 'logo', label: 'LOGO' },
  { id: 'brand-guide', label: 'BRAND GUIDE' },
  { id: 'products', label: 'PRODUCTS' },
  { id: 'character-talent', label: 'CHARACTER / TALENT' },
  { id: 'environments', label: 'ENVIRONMENTS' },
  { id: 'reference-content', label: 'REFERENCE CONTENT' },
  { id: 'campaign-references', label: 'CAMPAIGN REFERENCES' },
  { id: 'copy', label: 'COPY' },
  { id: 'other', label: 'OTHER' },
] as const;
