import type { MarketingServiceCategory } from './types.js';

export type MarketingServiceDefinition = {
  id: MarketingServiceCategory;
  code: string;
  title: string;
  tagline: string;
  whatItIs: string;
  produces: string[];
  bestFor: string;
  platforms: string[];
  selectCta: string;
};

export const MARKETING_CONTENT_SERVICES: MarketingServiceDefinition[] = [
  {
    id: 'social-content',
    code: '01',
    title: 'SOCIAL CONTENT',
    tagline: 'KEEP THE SIGNAL MOVING.',
    whatItIs: 'Repeatable content production aligned to your brand — not random posts.',
    produces: ['FEED ASSETS', 'STORIES', 'SHORT-FORM CLIPS', 'CAROUSEL SETS'],
    bestFor: 'Brands that need consistent presence without rebuilding every week.',
    platforms: ['INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'X'],
    selectCta: 'SELECT SOCIAL CONTENT →',
  },
  {
    id: 'campaign',
    code: '02',
    title: 'CAMPAIGN',
    tagline: 'ONE IDEA. FULL EXECUTION.',
    whatItIs: 'A coordinated creative push with direction, assets, and production discipline.',
    produces: ['CAMPAIGN CONCEPT', 'KEY VISUALS', 'COPY DIRECTION', 'LAUNCH ASSETS'],
    bestFor: 'Seasonal pushes, announcements, and moments that need weight.',
    platforms: ['WEB', 'SOCIAL', 'PAID MEDIA'],
    selectCta: 'SELECT CAMPAIGN →',
  },
  {
    id: 'product-campaign',
    code: '03',
    title: 'PRODUCT CAMPAIGN',
    tagline: 'MAKE THE OFFER VISIBLE.',
    whatItIs: 'Product-forward creative built around what you sell — shot, styled, and directed.',
    produces: ['PRODUCT STILLS', 'HERO VISUALS', 'LAUNCH CREATIVES', 'RETAIL ASSETS'],
    bestFor: 'Launches, collections, and offers that need clarity and desire.',
    platforms: ['ECOMMERCE', 'SOCIAL', 'PAID'],
    selectCta: 'SELECT PRODUCT CAMPAIGN →',
  },
  {
    id: 'brand-film',
    code: '04',
    title: 'BRAND FILM',
    tagline: 'TELL THE STORY WITH WEIGHT.',
    whatItIs: 'Editorial film direction — narrative, pacing, and brand continuity in motion.',
    produces: ['BRAND FILM', 'TEASERS', 'CUTDOWNS', 'KEY FRAMES'],
    bestFor: 'Positioning films, manifesto pieces, and flagship storytelling.',
    platforms: ['WEB', 'SOCIAL', 'EVENTS'],
    selectCta: 'SELECT BRAND FILM →',
  },
  {
    id: 'ugc-style',
    code: '05',
    title: 'UGC-STYLE CONTENT',
    tagline: 'AUTHENTIC. DIRECTED. ON-BRAND.',
    whatItIs: 'Human-centered content with creative direction — not uncontrolled generation.',
    produces: ['TALKING HEADS', 'DEMO CLIPS', 'TESTIMONIAL CUTS', 'NATIVE AD CREATIVE'],
    bestFor: 'Performance creative that still feels human and trustworthy.',
    platforms: ['TIKTOK', 'REELS', 'PAID SOCIAL'],
    selectCta: 'SELECT UGC-STYLE →',
  },
  {
    id: 'launch-campaign',
    code: '06',
    title: 'LAUNCH CAMPAIGN',
    tagline: 'COUNTDOWN TO LIVE.',
    whatItIs: 'Launch-ready creative system — from announcement through day-one presence.',
    produces: ['LAUNCH CREATIVE', 'COUNTDOWN ASSETS', 'DAY-ONE CONTENT', 'PRESS VISUALS'],
    bestFor: 'Product drops, location launches, and public moments.',
    platforms: ['WEB', 'SOCIAL', 'EMAIL', 'PAID'],
    selectCta: 'SELECT LAUNCH CAMPAIGN →',
  },
  {
    id: 'content-system',
    code: '07',
    title: 'CONTENT SYSTEM',
    tagline: 'BUILD THE ENGINE.',
    whatItIs: 'A repeatable content architecture — templates, rules, and production cadence.',
    produces: ['CONTENT FRAMEWORK', 'TEMPLATE SET', 'PRODUCTION CADENCE', 'BRAND RULES'],
    bestFor: 'Teams scaling output without losing coherence.',
    platforms: ['ALL CHANNELS'],
    selectCta: 'SELECT CONTENT SYSTEM →',
  },
];

export function getMarketingService(id: MarketingServiceCategory): MarketingServiceDefinition | undefined {
  return MARKETING_CONTENT_SERVICES.find((s) => s.id === id);
}
