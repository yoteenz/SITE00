/**
 * Stand-in imagery for the mobile Production / Projects surfaces.
 * Plates are cropped from the founder mobile reference pack; replace with approved authority
 * imagery per project as it becomes available (project data always wins when present).
 */

const BASE = '/site00/production-mobile';
const img = (name: string) => `${BASE}/${name}.jpg`;

export const PW_IMG = {
  heroPortrait: img('hero-portrait'),
  detailHero: img('detail-hero'),
  pillar: {
    DESIGN: img('pillar-design'),
    EXPERIENCE: img('pillar-experience'),
    EXPRESSION: img('pillar-expression'),
  },
  project: {
    ndxbook: img('thumb-ndxbook'),
    'studio-world': img('thumb-studio-world'),
    studioworld: img('thumb-studio-world'),
    'frontal-slayer': img('thumb-frontal-slayer'),
    frontalslayer: img('thumb-frontal-slayer'),
  } as Record<string, string>,
  designRows: {
    work: img('row-concepts'),
    authorities: img('row-concepts'),
    family: img('row-page-family'),
    interactions: img('row-interactions'),
    responsive: img('row-page-family'),
    framework: img('row-framework'),
    assets: img('row-assets'),
    history: img('row-history'),
  } as Record<string, string>,
  experienceRows: {
    world: img('exp-world'),
    environments: img('exp-environments'),
    modules: img('exp-modules'),
    simulations: img('exp-simulations'),
    zones: img('exp-zones'),
    assets: img('exp-assets'),
    review: img('row-history'),
  } as Record<string, string>,
  expressionRows: {
    narrative: img('xp-narrative'),
    casting: img('xp-casting'),
    wardrobe: img('xp-wardrobe'),
    performance: img('xp-performance'),
    sets: img('xp-sets'),
    storyboard: img('xp-storyboard'),
    review: img('xp-review'),
  } as Record<string, string>,
  cast: {
    HERO: img('cast-subject'),
    SUPPORTING: img('cast-supporting'),
    FEATURED_BACKGROUND: img('cast-background'),
    ENSEMBLE: img('cast-background'),
  } as Record<string, string>,
  look: img('look-2016'),
  performance: img('perf-strip'),
  set: img('set-hero'),
  library: {
    actors: img('lib-actors'),
    wardrobe: img('lib-wardrobe'),
    hair: img('lib-hair'),
    environment: img('lib-environment'),
    sets: img('lib-environment'),
    prop: img('lib-prop'),
    graphic: img('lib-prop'),
    performance: img('lib-performance'),
  } as Record<string, string>,
  request: {
    design: img('req-website'),
    character: img('req-character'),
    set: img('req-set'),
    content: img('req-social'),
  },
  deliverable: {
    homepage: img('deliv-homepage'),
    pages: [img('deliv-p1'), img('deliv-p2'), img('deliv-p3')],
  },
} as const;

export function projectImage(slug: string): string | null {
  return PW_IMG.project[slug.toLowerCase()] ?? null;
}
