/** EVOLVE creative intake copy — witty, precise, never generic SaaS */

export const INTAKE_COPY = {
  social: {
    environment: 'THE ATTENTION ENVIRONMENT',
    breadcrumb: 'EVOLVE / ATTENTION / INTAKE',
    description: 'DESIGN CONTENT THAT STOPS THE SCROLL AND DRIVES ACTION.',
    completion: 'ATTENTION MAP CAPTURED — READY FOR BRIEF',
  },
  ugc: {
    environment: 'THE CREATOR FRAME',
    breadcrumb: 'EVOLVE / ATTENTION / INTAKE',
    description: 'AUTHENTIC DELIVERY UNDER CREATIVE DIRECTION — NATIVE, DIRECTED, ON-BRAND.',
    completion: 'UGC DIRECTION CAPTURED — READY FOR BRIEF',
  },
  film: {
    environment: 'THE SET',
    breadcrumb: 'EVOLVE / PRODUCTION / TREATMENT',
    description: 'STEP ONTO THE SET. DEFINE WHAT GOES ON SCREEN AND WHERE THE FINAL CUT LIVES.',
    completion: 'TREATMENT INPUT LOCKED — READY FOR CREATIVE DIRECTION',
  },
  campaign: {
    environment: 'THE CONTROL ROOM',
    breadcrumb: 'EVOLVE / CAMPAIGN / INTAKE',
    description: 'ONE IDEA. FULL EXECUTION. ALIGN STRATEGY, ASSETS, AND DISTRIBUTION INTO ONE COORDINATED PUSH.',
    completion: 'CAMPAIGN MAP CAPTURED — READY FOR BRIEF',
  },
  product: {
    environment: 'THE CONTROL ROOM',
    breadcrumb: 'EVOLVE / CAMPAIGN / PRODUCT CAMPAIGN / INTAKE',
    description: 'MAKE THE OFFER VISIBLE. STAGE THE PRODUCT, BUILD DESIRE, AND PLAN THE HERO MOMENT.',
    completion: 'PRODUCT CAMPAIGN CAPTURED — READY FOR BRIEF',
  },
  launch: {
    environment: 'THE MOMENT IT HITS',
    breadcrumb: 'EVOLVE / CAMPAIGN / LAUNCH CAMPAIGN / INTAKE',
    description: 'COUNTDOWN TO IMPACT. BUILD ANTICIPATION AND EXECUTE A LAUNCH THAT BREAKS THROUGH.',
    completion: 'LAUNCH BLUEPRINT CAPTURED — READY FOR BRIEF',
  },
  contentSystem: {
    environment: 'THE ENGINE',
    breadcrumb: 'EVOLVE / CONTENT / CONTENT SYSTEM / INTAKE',
    description: 'ORGANIZE YOUR CONTENT. BUILD A SYSTEM THAT SCALES. PLAN THE ARCHITECTURE BEHIND EVERYTHING YOU PUBLISH.',
    completion: 'CONTENT SYSTEM CAPTURED — READY FOR BRIEF',
  },
} as const;

export type IntakeInsight = { title: string; body: string };

export const INTAKE_INSIGHTS: Record<string, IntakeInsight[]> = {
  'social-content': [
    { title: 'HOOK ZONE', body: 'THE FIRST FRAME DECIDES WHETHER THEY STOP.' },
    { title: 'HOLD ZONE', body: 'KEEP ATTENTION LONG ENOUGH TO LAND THE IDEA.' },
    { title: 'ACT ZONE', body: 'EVERY STOP SHOULD LEAD SOMEWHERE INTENTIONAL.' },
  ],
  'ugc-style': [
    { title: 'AUDIENCE TRUST', body: 'PEOPLE CONNECT WITH PEOPLE — NOT POLISHED ADS.' },
    { title: 'PLATFORM NATIVE', body: 'FEEL LIKE CONTENT, NOT INTERRUPTION.' },
    { title: 'FAST TO PRODUCE', body: 'AUTHENTICITY SHOULD NOT MEAN CHAOS.' },
  ],
  campaign: [
    { title: 'ORCHESTRATION', body: 'EVERY ASSET SERVES THE SAME STRATEGIC MOVE.' },
    { title: 'DEPENDENCIES', body: 'CHANNELS, TIMING, AND DELIVERABLES MUST ALIGN.' },
    { title: 'MEASUREMENT', body: 'DEFINE HOW YOU WILL KNOW IT MOVED — WE DO NOT INVENT METRICS.' },
  ],
  'product-campaign': [
    { title: 'CLARITY', body: 'THE OFFER MUST BE IMMEDIATELY READABLE.' },
    { title: 'DESIRE', body: 'STAGE THE PRODUCT SO PEOPLE WANT IT.' },
    { title: 'CONVERSION', body: 'EVERY SURFACE SHOULD LEAD TOWARD ACTION.' },
  ],
  'brand-film': [
    { title: 'NARRATIVE', body: 'STORY BEATS DRIVE EMOTIONAL DESTINATION.' },
    { title: 'VISUAL APPROACH', body: 'TONE, PACE, AND FRAME LANGUAGE MATTER.' },
    { title: 'DESTINATION', body: 'WHERE THE FINAL CUT LIVES SHAPES THE TREATMENT.' },
  ],
  'launch-campaign': [
    { title: 'TIMING IS EVERYTHING', body: 'LAUNCH WINDOWS CREATE OR KILL MOMENTUM.' },
    { title: 'ONE MESSAGE WINS', body: 'FOCUS THE HOOK — DO NOT SPLIT ATTENTION.' },
    { title: 'MEASURE THE MOMENT', body: 'CAPTURE HOW YOU WILL EVALUATE IMPACT — NO FABRICATED PROJECTIONS.' },
  ],
  'content-system': [
    { title: 'CLARITY', body: 'PILLARS CREATE CONSISTENCY ACROSS OUTPUT.' },
    { title: 'SCALABILITY', body: 'SYSTEMS LET TEAMS PRODUCE WITHOUT CHAOS.' },
    { title: 'MEASURABILITY', body: 'STRUCTURE ENABLES PERFORMANCE TRACKING YOU SUPPLY.' },
  ],
};

export const INTAKE_MANIFESTO: Record<string, string> = {
  'social-content': 'CAPTURED INTENT ONLY — NO FABRICATED METRICS.',
  'ugc-style': 'AUTHENTICITY > PERFECTION — PEOPLE CONNECT WITH PEOPLE.',
  campaign: 'STRATEGY CREATES THE CAMPAIGN. EXECUTION DELIVERS IT.',
  'product-campaign': 'PLAN NOW — EXECUTE CLEANLY — LAUNCH STRONGLY.',
  'brand-film': 'PRE-PRODUCTION STATE — NO FABRICATED FOOTAGE.',
  'launch-campaign': 'ONE IDEA. ONE MOMENT. MAXIMUM IMPACT.',
  'content-system': 'GOOD CONTENT HAPPENS. GREAT SYSTEMS MAKE IT REPEATABLE.',
};
