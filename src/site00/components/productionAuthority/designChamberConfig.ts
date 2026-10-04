import type { ProductionDesignMode } from '../../config/production-authority-registry';
import { PW_IMG } from '../production/productionImagery';

export type ChamberVis = 'plates' | 'swatches' | 'type' | 'graph' | 'phones' | 'list' | 'grid' | 'frames' | 'globe';

export type ChamberPanel = {
  n: string;
  title: string;
  sub: string;
  vis: ChamberVis;
  items?: string[];
  plates?: string[];
};

export type DesignChamberConfig = {
  mode: ProductionDesignMode;
  label: string;
  overviewTitle: string;
  lede: string;
  list: string[];
  panels: ChamberPanel[];
  edgeLeft: string;
  edgeRight: string;
  pipeline: { title: string; sub: string }[];
  table: { title: string; sub: string; cta: string; plate: string }[];
};

const D = PW_IMG.designRows;
const X = PW_IMG.experienceRows;

export const DESIGN_CHAMBER: Record<ProductionDesignMode, DesignChamberConfig> = {
  brand: {
    mode: 'brand',
    label: 'BRAND',
    overviewTitle: 'BRAND / WORKSPACE OVERVIEW',
    lede: 'A UNIFIED BRAND SYSTEM FOR A BRIGHTER HUMAN FUTURE.',
    list: ['IDENTITY', 'VISUAL LANGUAGE', 'TYPOGRAPHY', 'COLOR SYSTEM', 'APPLICATIONS', 'GUIDELINES'],
    panels: [
      { n: '01', title: 'BRAND ESSENCE', sub: 'PURPOSE & POSITIONING', vis: 'plates', plates: [D.work!, D.framework!, D.history!] },
      { n: '02', title: 'VISUAL LANGUAGE', sub: 'KEY ELEMENTS & STYLE', vis: 'grid', items: ['ICONS', 'LOGOS', 'MOTION'] },
      { n: '03', title: 'TYPOGRAPHY SYSTEM', sub: 'TYPE RULES & HIERARCHY', vis: 'type', items: ['Aa', 'NDX GROTESK'] },
      { n: '04', title: 'COLOR & MATERIAL', sub: 'PALETTE & SURFACES', vis: 'swatches' },
      { n: '05', title: 'BRAND APPLICATIONS', sub: 'SYSTEM IN PRACTICE', vis: 'plates', plates: [D.family!, D.interactions!, D.assets!] },
    ],
    edgeLeft: 'FROM IDENTITY TO IMPACT',
    edgeRight: 'BRAND SYSTEMS / REAL-WORLD IMPACT',
    pipeline: [
      { title: 'RESEARCH', sub: 'INSIGHTS & AUDIENCE' },
      { title: 'IDENTITY', sub: 'STRATEGY & STORY' },
      { title: 'VISUAL SYSTEM', sub: 'ELEMENTS & GUIDELINES' },
      { title: 'APPLICATION', sub: 'TOUCHPOINTS & MEDIA' },
      { title: 'EVOLUTION', sub: 'MEASURE & REFINE' },
    ],
    table: [
      { title: 'BRAND IDENTITY REVIEW', sub: 'IDENTITY SYSTEM V1', cta: 'REVIEW', plate: D.work! },
      { title: 'COLOR SYSTEM FINAL', sub: 'PALETTE & MATERIAL', cta: 'CHOOSE', plate: D.framework! },
      { title: 'BRAND APPLICATIONS', sub: 'SYSTEM IN PRACTICE', cta: 'APPROVE', plate: D.family! },
    ],
  },
  experience: {
    mode: 'experience',
    label: 'EXPERIENCE',
    overviewTitle: 'EXPERIENCE / WORKSPACE OVERVIEW',
    lede: 'FROM PEOPLE TO POSSIBILITIES.',
    list: ['JOURNEYS', 'TOUCHPOINTS', 'FLOWS', 'STATES', 'ARCHITECTURE'],
    panels: [
      { n: '01', title: 'USER JOURNEYS', sub: 'PEOPLE TO POSSIBILITIES', vis: 'graph' },
      { n: '02', title: 'ROUTE MAPS', sub: 'PATHS & TOUCHPOINTS', vis: 'graph' },
      { n: '03', title: 'EXPERIENCE STATES', sub: 'SCREENS & INTERACTIONS', vis: 'phones' },
      { n: '04', title: 'EXPERIENCE FLOWS', sub: 'SYSTEMS & LOGIC', vis: 'graph' },
      { n: '05', title: 'MOMENTS', sub: 'KEY SCENARIOS', vis: 'list', items: ['DISCOVERY', 'ONBOARDING', 'CORE FLOW', 'ADVOCACY'] },
    ],
    edgeLeft: 'FROM PEOPLE TO IMPACT',
    edgeRight: 'PAGES / JOURNEYS / EXPERIENCES IN MOTION',
    pipeline: [
      { title: 'RESEARCH', sub: 'AUDIENCE & CONTEXT' },
      { title: 'JOURNEY', sub: 'PATHS & MOMENTS' },
      { title: 'INTERACTION', sub: 'STATES & BEHAVIOR' },
      { title: 'FLOW', sub: 'SYSTEMS & LOGIC' },
      { title: 'VALIDATION', sub: 'TEST & REFINE' },
    ],
    table: [
      { title: 'ROUTE REVIEW', sub: 'CUSTOMER JOURNEY', cta: 'REVIEW', plate: X.world! },
      { title: 'INTERACTION FLOW', sub: 'CORE EXPERIENCE', cta: 'CHOOSE', plate: D.interactions! },
      { title: 'STATE FAMILY', sub: 'SCREENS & BEHAVIORS', cta: 'APPROVE', plate: D.family! },
    ],
  },
  surfaces: {
    mode: 'surfaces',
    label: 'SURFACES',
    overviewTitle: 'SURFACES / WORKSPACE OVERVIEW',
    lede: 'SURFACES ACROSS DEVICES / WORLDS IN MOTION.',
    list: ['MOBILE', 'TABLET', 'DESKTOP', 'APPS', 'ENVIRONMENTS'],
    panels: [
      { n: '01', title: 'MOBILE SURFACES', sub: 'IOS · ANDROID', vis: 'phones' },
      { n: '02', title: 'TABLET SURFACES', sub: 'IPADOS · ANDROID TABLET', vis: 'phones' },
      { n: '03', title: 'DESKTOP SURFACES', sub: 'WINDOWS · MACOS', vis: 'grid', items: ['WINDOWS', 'MACOS', 'WEB'] },
      { n: '04', title: 'APP SURFACES', sub: 'HYBRID · NATIVE', vis: 'grid', items: ['HYBRID', 'NATIVE'] },
      { n: '05', title: 'ENVIRONMENT SURFACES', sub: 'KIOSKS · XR / AR', vis: 'plates', plates: [X.environments!, X.zones!] },
    ],
    edgeLeft: 'FROM SYSTEMS TO EXPERIENCES',
    edgeRight: 'SURFACES ACROSS DEVICES / WORLDS IN MOTION',
    pipeline: [
      { title: 'FOUNDATION', sub: 'TOKENS & GRID' },
      { title: 'COMPONENTS', sub: 'BLOCKS & STATES' },
      { title: 'EXTENSIONS', sub: 'VARIANTS' },
      { title: 'PLATFORMS', sub: 'DEVICE FAMILIES' },
      { title: 'DEPLOYMENT', sub: 'HANDOFF' },
    ],
    table: [
      { title: 'MOBILE EXPRESSION', sub: 'MOBILE SURFACES', cta: 'REVIEW', plate: D.family! },
      { title: 'TABLET AUTHORITY', sub: 'TABLET SURFACES', cta: 'CHOOSE', plate: D.interactions! },
      { title: 'DESKTOP SURFACES', sub: 'DESKTOP SUITE', cta: 'APPROVE', plate: D.work! },
    ],
  },
  compiler: {
    mode: 'compiler',
    label: 'COMPILER',
    overviewTitle: 'COMPILER / EXPERIENCE OVERVIEW',
    lede: 'UNIFIED EXPERIENCE COMPILER FROM CONCEPT TO DEPLOYMENT.',
    list: ['CONCEPTS', 'EXPERIENCE', 'INTELLIGENCE', 'FAMILIES', 'AUTHORITY', 'ORCHESTRATION'],
    panels: [
      { n: '01', title: 'CONCEPT TERRITORIES', sub: 'DIRECTIONS & MOODS', vis: 'plates', plates: [D.work!, D.history!, D.framework!, D.assets!] },
      { n: '02', title: 'EXPERIENCE GRAPH', sub: 'JOURNEYS & CONNECTIONS', vis: 'graph' },
      { n: '03', title: 'PROJECT INTELLIGENCE', sub: 'SIGNALS & RISK', vis: 'globe', items: ['USAGE SIGNALS', 'RISK ANALYSIS'] },
      { n: '04', title: 'FAMILIES & EXPRESSIONS', sub: 'SYSTEM VARIATIONS', vis: 'frames' },
      { n: '05', title: 'AUTHORITY BRIEF', sub: 'DOCUMENTS & GUIDELINES', vis: 'list', items: ['BRIEF', 'GUIDELINES', 'HANDOFF'] },
    ],
    edgeLeft: 'FROM CONCEPT TO WORLDS',
    edgeRight: 'PAGES / SYSTEMS / WORLDS IN MOTION',
    pipeline: [
      { title: 'INGEST & ANALYZE', sub: 'SOURCES' },
      { title: 'SYNTHESIZE', sub: 'DIRECTION' },
      { title: 'COMPILE', sub: 'EXPERIENCE' },
      { title: 'SYSTEMATIZE', sub: 'FAMILIES' },
      { title: 'DEPLOY', sub: 'RELEASE' },
    ],
    table: [
      { title: 'VISUAL DIRECTION REVIEW', sub: 'CONCEPT TERRITORIES', cta: 'REVIEW', plate: D.work! },
      { title: 'EXPERIENCE FLOW APPROVAL', sub: 'EXPERIENCE GRAPH', cta: 'APPROVE', plate: D.interactions! },
      { title: 'FAMILIES & EXPRESSIONS', sub: 'SYSTEM VARIATIONS', cta: 'CHOOSE', plate: D.family! },
    ],
  },
  assets: {
    mode: 'assets',
    label: 'ASSETS',
    overviewTitle: 'ASSETS / LIBRARY OVERVIEW',
    lede: 'A UNIFIED ASSET LIBRARY FOR EVERY SURFACE AND WORLD.',
    list: ['AUTHORITIES', 'ICONS', 'PLATES', 'MATERIALS', 'TEMPLATES'],
    panels: [
      { n: '01', title: 'VISUAL AUTHORITIES', sub: 'STYLES & REFERENCES', vis: 'plates', plates: [D.work!, D.framework!, D.history!, D.assets!] },
      { n: '02', title: 'ICON FAMILIES', sub: 'SYSTEMS & LIBRARIES', vis: 'grid', items: ['CORE', 'UI', 'SYSTEM'] },
      { n: '03', title: 'ENVIRONMENT PLATES', sub: 'WORLDS & LOCATIONS', vis: 'plates', plates: [X.environments!, X.world!] },
      { n: '04', title: 'MATERIALS & COMPONENTS', sub: 'SURFACES & BUILDING BLOCKS', vis: 'swatches' },
      { n: '05', title: 'TEMPLATES', sub: 'SYSTEMS & DELIVERABLES', vis: 'phones' },
    ],
    edgeLeft: 'FROM SOURCES TO LIBRARY',
    edgeRight: 'ASSETS ACROSS WORLDS',
    pipeline: [
      { title: 'SOURCE', sub: 'REFERENCES' },
      { title: 'PROCESS', sub: 'GENERATION' },
      { title: 'COMPONENTS', sub: 'PARTS' },
      { title: 'LIBRARY', sub: 'CANON' },
      { title: 'DELIVER', sub: 'HANDOFF' },
    ],
    table: [
      { title: 'ICON FAMILY REVIEW', sub: 'ICON FAMILIES', cta: 'REVIEW', plate: D.assets! },
      { title: 'ENVIRONMENT PLATES', sub: 'WORLDS & LOCATIONS', cta: 'CHOOSE', plate: X.environments! },
      { title: 'COMPONENT ASSETS', sub: 'MATERIALS & COMPONENTS', cta: 'APPROVE', plate: D.framework! },
    ],
  },
  viewport: {
    mode: 'viewport',
    label: 'VIEWPORT',
    overviewTitle: 'VIEWPORT / DEVICE CHAMBER',
    lede: 'PREVIEW THE LIVE CLIENT APP ON ANY DEVICE.',
    list: [],
    panels: [],
    edgeLeft: 'FROM SURFACES TO SCREENS',
    edgeRight: 'DEVICES IN MOTION',
    pipeline: [
      { title: 'RESEARCH', sub: '' },
      { title: 'CONCEPT', sub: '' },
      { title: 'AUTHORITY', sub: '' },
      { title: 'PAGE FAMILY', sub: '' },
      { title: 'COMPONENTS', sub: '' },
      { title: 'VIEWPORT', sub: '' },
      { title: 'PRODUCTION', sub: '' },
    ],
    table: [
      { title: 'VIEWPORT REVIEW', sub: 'DEVICE PREVIEW', cta: 'REVIEW', plate: D.interactions! },
      { title: 'SAFE AREA CHECK', sub: 'INSETS & NOTCHES', cta: 'VALIDATE', plate: D.family! },
      { title: 'RESPONSIVE STATES', sub: 'BREAKPOINTS', cta: 'CHECK', plate: D.work! },
      { title: 'ASSET PREVIEW', sub: 'PLATES IN CONTEXT', cta: 'OPEN', plate: D.assets! },
    ],
  },
};
