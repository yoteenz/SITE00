/** Discipline → creative experience registry */

import type { MarketingServiceCategory } from '../types.js';
import { INTAKE_COPY } from './copySystem.js';
import type { CreativeIntakeExperience, SignatureArtifact } from './types.js';

const SOCIAL_STAGES: CreativeIntakeExperience['stages'] = [
  {
    id: 'position',
    prompt: 'WHERE ARE WE TRYING TO STOP THEM?',
    hint: 'DEFINE YOUR OBJECTIVE AND THE PRIMARY SURFACE WHERE ATTENTION MUST LAND.',
    progressLabel: 'POSITION',
    fields: [
      { id: 'campaignObjective', type: 'textarea', a11yLabel: 'PRIMARY OBJECTIVE' },
      { id: 'platforms', type: 'platform-select', a11yLabel: 'PRIMARY PLATFORM OR SURFACE' },
    ],
  },
  {
    id: 'attention',
    prompt: 'WHAT GETS THE SECOND LOOK?',
    hint: 'THE CENTRAL IDEA, HOOK, AND WHAT WE ARE PUTTING IN FRAME.',
    progressLabel: 'ATTENTION',
    fields: [
      { id: 'makingWhat', type: 'textarea', a11yLabel: 'CENTRAL IDEA OR HOOK' },
      { id: 'productService', type: 'textarea', a11yLabel: 'PRODUCT, SERVICE, OR STORY' },
    ],
  },
  {
    id: 'audience',
    prompt: 'WHO ARE WE INTERRUPTING?',
    hint: 'THE AUDIENCE WHOSE SCROLL WE INTEND TO BREAK — DESCRIBED PRECISELY.',
    progressLabel: 'AUDIENCE',
    fields: [{ id: 'targetAudience', type: 'textarea', a11yLabel: 'TARGET AUDIENCE' }],
  },
  {
    id: 'memory',
    prompt: 'WHAT SHOULD SURVIVE THE SCROLL?',
    hint: 'THE SINGLE IDEA SOMEONE SHOULD REMEMBER AFTER SEEING THE CONTENT.',
    progressLabel: 'MEMORY',
    fields: [{ id: 'copyMessaging', type: 'textarea', a11yLabel: 'TAKEAWAY MESSAGE' }],
  },
  {
    id: 'action',
    prompt: 'WHAT HAPPENS AFTER THEY STOP?',
    hint: 'INTENDED BEHAVIOR, CTA, AND WHERE THEY SHOULD GO NEXT.',
    progressLabel: 'ACTION',
    fields: [
      { id: 'additionalNotes', type: 'textarea', a11yLabel: 'CALL TO ACTION AND CONVERSION INTENT' },
      { id: 'deliverableTypes', type: 'text', a11yLabel: 'DELIVERABLE FORMATS' },
    ],
  },
  {
    id: 'cadence',
    prompt: 'HOW OFTEN DOES THIS SIGNAL REPEAT?',
    hint: 'VOLUME, CADENCE, AND TIMING CONSTRAINTS.',
    progressLabel: 'CADENCE',
    fields: [
      { id: 'quantityCadence', type: 'text', a11yLabel: 'QUANTITY AND CADENCE' },
      { id: 'deadline', type: 'text', a11yLabel: 'DEADLINE' },
      { id: 'launchDate', type: 'text', a11yLabel: 'LAUNCH DATE' },
    ],
  },
  {
    id: 'brand',
    prompt: 'WHOSE SIGNAL IS THIS?',
    hint: 'BRAND IDENTITY, RESTRICTIONS, AND APPROVAL CONTACT.',
    progressLabel: 'BRAND',
    fields: [
      { id: 'businessName', type: 'text', a11yLabel: 'BUSINESS OR BRAND NAME' },
      { id: 'restrictions', type: 'textarea', a11yLabel: 'RESTRICTIONS' },
      { id: 'approvalContact', type: 'text', a11yLabel: 'APPROVAL CONTACT' },
    ],
  },
];

const UGC_STAGES: CreativeIntakeExperience['stages'] = [
  {
    id: 'concept',
    prompt: 'WHAT IS THE OPENING MOMENT?',
    hint: 'THE FIRST SECONDS THAT ESTABLISH WHY THE VIEWER SHOULD KEEP WATCHING.',
    progressLabel: 'CONCEPT',
    fields: [{ id: 'campaignObjective', type: 'textarea', a11yLabel: 'OPENING CONCEPT' }],
  },
  {
    id: 'style',
    prompt: 'WHAT DOES REAL FEEL LIKE?',
    hint: 'DEFINE TONE, AUTHENTICITY LEVEL, AND ON-CAMERA APPROACH.',
    progressLabel: 'STYLE',
    fields: [
      { id: 'makingWhat', type: 'tone-select', a11yLabel: 'CONTENT TONE' },
      { id: 'productService', type: 'text', a11yLabel: 'VISUAL STYLE REFERENCE' },
      { id: 'restrictions', type: 'text', a11yLabel: 'ON-CAMERA STYLE' },
    ],
  },
  {
    id: 'audience',
    prompt: 'WHO NEEDS TO BELIEVE THIS?',
    hint: 'THE VIEWER WHO MUST TRUST THE SPEAKER AND THE MESSAGE.',
    progressLabel: 'AUDIENCE',
    fields: [{ id: 'targetAudience', type: 'textarea', a11yLabel: 'TARGET AUDIENCE' }],
  },
  {
    id: 'format',
    prompt: 'HOW WILL THEY EXPERIENCE IT?',
    hint: 'FORMAT, LENGTH, AND PLATFORM-NATIVE CONSIDERATIONS.',
    progressLabel: 'FORMAT',
    fields: [
      { id: 'platforms', type: 'platform-select', a11yLabel: 'PRIMARY SURFACES' },
      { id: 'deliverableTypes', type: 'text', a11yLabel: 'FORMAT AND LENGTH' },
    ],
  },
  {
    id: 'deliverables',
    prompt: 'WHAT PROOF EXISTS?',
    hint: 'DEMONSTRATIONS, TESTIMONIALS, OR EVIDENCE THAT MAKES IT BELIEVABLE.',
    progressLabel: 'DELIVERABLES',
    fields: [{ id: 'copyMessaging', type: 'textarea', a11yLabel: 'PROOF AND DEMONSTRATION' }],
  },
  {
    id: 'voice',
    prompt: 'WHO IS SPEAKING?',
    hint: 'TALENT DIRECTION — CASTING STATE IF UNDECIDED IS VALID.',
    progressLabel: 'VOICE',
    fields: [{ id: 'additionalNotes', type: 'textarea', a11yLabel: 'SPEAKER / TALENT DIRECTION' }],
  },
  {
    id: 'brand',
    prompt: 'HOW STAY ON-BRAND?',
    hint: 'BRAND GUARDRAILS, RESTRICTIONS, AND APPROVAL PATH.',
    progressLabel: 'BRAND',
    fields: [
      { id: 'businessName', type: 'text', a11yLabel: 'BRAND NAME' },
      { id: 'approvalContact', type: 'text', a11yLabel: 'APPROVAL CONTACT' },
      { id: 'quantityCadence', type: 'text', a11yLabel: 'VOLUME AND CADENCE' },
    ],
  },
];

const FILM_STAGES: CreativeIntakeExperience['stages'] = [
  {
    id: 'scene-intent',
    prompt: 'WHAT ARE WE PUTTING ON SCREEN?',
    hint: 'THE FILM\'S PURPOSE — WHAT THIS PIECE MUST ACCOMPLISH.',
    progressLabel: 'INTENT',
    fields: [{ id: 'campaignObjective', type: 'textarea', a11yLabel: 'FILM INTENT' }],
  },
  {
    id: 'scene-subject',
    prompt: 'WHO OR WHAT CARRIES THE FRAME?',
    hint: 'SUBJECT, PRODUCT, TALENT, OR ENTITY AT THE CENTER.',
    progressLabel: 'SUBJECT',
    fields: [
      { id: 'makingWhat', type: 'textarea', a11yLabel: 'SUBJECT' },
      { id: 'productService', type: 'textarea', a11yLabel: 'PRODUCT OR SERVICE ON SCREEN' },
    ],
  },
  {
    id: 'scene-world',
    prompt: 'WHAT WORLD ARE WE BUILDING?',
    hint: 'ENVIRONMENT, TONE, AND VISUAL TERRITORY.',
    progressLabel: 'WORLD',
    fields: [{ id: 'restrictions', type: 'textarea', a11yLabel: 'WORLD AND VISUAL DIRECTION' }],
  },
  {
    id: 'scene-treatment',
    prompt: 'WHAT ARE WE PUTTING ON SCREEN?',
    hint: 'TONE, STYLE REFERENCE, AND KEY SCENES.',
    progressLabel: 'TREATMENT',
    fields: [
      { id: 'copyMessaging', type: 'textarea', a11yLabel: 'TONE AND STORY BEATS' },
      { id: 'deliverableTypes', type: 'text', a11yLabel: 'STYLE REFERENCE' },
    ],
  },
  {
    id: 'scene-frame',
    prompt: 'HOW SHOULD IT MOVE?',
    hint: 'FORMAT, ASPECT RATIO INTENT, DELIVERABLE TYPES.',
    progressLabel: 'FRAME',
    fields: [
      { id: 'targetAudience', type: 'textarea', a11yLabel: 'WHO SHOULD FEEL THIS' },
      { id: 'additionalNotes', type: 'textarea', a11yLabel: 'PACING AND FORMAT NOTES' },
    ],
  },
  {
    id: 'scene-sound',
    prompt: 'WHAT SHOULD IT SOUND LIKE?',
    hint: 'AUDIO DIRECTION, VOICE, MUSIC SENSIBILITY.',
    progressLabel: 'SOUND',
    fields: [{ id: 'quantityCadence', type: 'text', a11yLabel: 'SOUND DIRECTION' }],
  },
  {
    id: 'scene-delivery',
    prompt: 'WHERE WILL THE FINAL CUT LIVE?',
    hint: 'DESTINATIONS, LAUNCH TIMING, DISTRIBUTION SURFACES.',
    progressLabel: 'DELIVERY',
    fields: [
      { id: 'platforms', type: 'platform-select', a11yLabel: 'DISTRIBUTION SURFACES' },
      { id: 'launchDate', type: 'text', a11yLabel: 'LAUNCH DATE' },
      { id: 'deadline', type: 'text', a11yLabel: 'DELIVERY DEADLINE' },
    ],
  },
];

const CAMPAIGN_STAGES: CreativeIntakeExperience['stages'] = [
  {
    id: 'objective',
    prompt: 'WHAT ARE WE TRYING TO MOVE?',
    hint: 'THE STRATEGIC OBJECTIVE THIS CAMPAIGN MUST SHIFT.',
    progressLabel: 'OBJECTIVE',
    fields: [
      { id: 'campaignObjective', type: 'objective-select', a11yLabel: 'CAMPAIGN OBJECTIVE TERRITORY' },
      { id: 'makingWhat', type: 'textarea', a11yLabel: 'CAMPAIGN DESCRIPTION' },
    ],
  },
  {
    id: 'audience',
    prompt: 'WHO ARE WE SPEAKING TO?',
    hint: 'AUDIENCE SEGMENTS, GOALS, AND INSIGHTS.',
    progressLabel: 'AUDIENCE',
    fields: [
      { id: 'targetAudience', type: 'textarea', a11yLabel: 'PRIMARY AUDIENCE' },
      { id: 'productService', type: 'textarea', a11yLabel: 'AUDIENCE GOAL' },
    ],
  },
  {
    id: 'message',
    prompt: 'WHAT DO THEY NEED TO HEAR?',
    hint: 'CORE MESSAGE ARCHITECTURE AND PROOF POINTS.',
    progressLabel: 'MESSAGE',
    fields: [{ id: 'copyMessaging', type: 'textarea', a11yLabel: 'CORE MESSAGE' }],
  },
  {
    id: 'channels',
    prompt: 'WHERE DOES IT TRAVEL?',
    hint: 'CHANNELS AND SURFACES — STRATEGY SELECTION, NOT PROVIDER CONNECTION.',
    progressLabel: 'CHANNELS',
    fields: [
      { id: 'platforms', type: 'platform-select', a11yLabel: 'CHANNELS' },
      { id: 'deliverableTypes', type: 'text', a11yLabel: 'DELIVERABLE TYPES' },
    ],
  },
  {
    id: 'deliverables',
    prompt: 'WHAT HAS TO EXIST?',
    hint: 'ASSETS, FORMATS, AND PRODUCTION OUTPUTS REQUIRED.',
    progressLabel: 'DELIVERABLES',
    fields: [{ id: 'additionalNotes', type: 'textarea', a11yLabel: 'REQUIRED DELIVERABLES' }],
  },
  {
    id: 'timing',
    prompt: 'WHEN DOES IT HIT?',
    hint: 'LAUNCH SEQUENCE, DEADLINES, AND CADENCE.',
    progressLabel: 'TIMING',
    fields: [
      { id: 'launchDate', type: 'text', a11yLabel: 'LAUNCH DATE' },
      { id: 'deadline', type: 'text', a11yLabel: 'DEADLINE' },
      { id: 'quantityCadence', type: 'text', a11yLabel: 'ROLLOUT CADENCE' },
    ],
  },
  {
    id: 'measurement',
    prompt: 'HOW WILL WE KNOW IT MOVED?',
    hint: 'SUCCESS SIGNALS YOU WILL SUPPLY — WE DO NOT INVENT METRICS.',
    progressLabel: 'MEASUREMENT',
    fields: [{ id: 'restrictions', type: 'textarea', a11yLabel: 'MEASUREMENT INTENT' }],
  },
  {
    id: 'brand',
    prompt: 'CAMPAIGN AUTHORITY',
    hint: 'BRAND NAME, APPROVAL CONTACT, GOVERNANCE.',
    progressLabel: 'AUTHORITY',
    fields: [
      { id: 'businessName', type: 'text', a11yLabel: 'BRAND OR CAMPAIGN NAME' },
      { id: 'approvalContact', type: 'text', a11yLabel: 'APPROVAL CONTACT' },
    ],
  },
];

const PRODUCT_STAGES: CreativeIntakeExperience['stages'] = [
  {
    id: 'product',
    prompt: 'WHAT ARE WE PUTTING IN FRAME?',
    hint: 'THE PRODUCT OR OFFER AT THE CENTER OF THIS CAMPAIGN.',
    progressLabel: 'PRODUCT',
    fields: [
      { id: 'productService', type: 'textarea', a11yLabel: 'PRODUCT OR OFFER' },
      { id: 'makingWhat', type: 'textarea', a11yLabel: 'PRODUCT CONTEXT' },
    ],
  },
  {
    id: 'desire',
    prompt: 'WHY SHOULD THEY WANT IT?',
    hint: 'DESIRE, EMOTIONAL HOOK, AND THE FEELING WE ARE SELLING.',
    progressLabel: 'DESIRE',
    fields: [{ id: 'campaignObjective', type: 'textarea', a11yLabel: 'DESIRE AND EMOTIONAL HOOK' }],
  },
  {
    id: 'positioning',
    prompt: 'HOW DO WE POSITION IT?',
    hint: 'MARKET POSITION, DIFFERENTIATION, AND COMPETITIVE CONTEXT.',
    progressLabel: 'POSITIONING',
    fields: [{ id: 'copyMessaging', type: 'textarea', a11yLabel: 'POSITIONING STATEMENT' }],
  },
  {
    id: 'proof',
    prompt: 'WHAT MAKES IT BELIEVABLE?',
    hint: 'PROOF POINTS, SOCIAL PROOF, AND CREDIBILITY SIGNALS.',
    progressLabel: 'PROOF',
    fields: [{ id: 'additionalNotes', type: 'textarea', a11yLabel: 'PROOF AND CREDIBILITY' }],
  },
  {
    id: 'deliverables',
    prompt: 'WHAT DO WE NEED TO CREATE?',
    hint: 'HERO ASSETS, STILLS, LAUNCH CREATIVE, AND PRODUCTION OUTPUTS.',
    progressLabel: 'DELIVERABLES',
    fields: [
      { id: 'deliverableTypes', type: 'text', a11yLabel: 'PRIMARY DELIVERABLES' },
      { id: 'restrictions', type: 'textarea', a11yLabel: 'ADDITIONAL NOTES' },
    ],
  },
  {
    id: 'surfaces',
    prompt: 'WHERE DOES THE OFFER APPEAR?',
    hint: 'COMMERCIAL SURFACES — STRATEGY SELECTION ONLY.',
    progressLabel: 'SURFACES',
    fields: [{ id: 'platforms', type: 'platform-select', a11yLabel: 'DISTRIBUTION SURFACES' }],
  },
  {
    id: 'conversion',
    prompt: 'WHAT ACTION FOLLOWS?',
    hint: 'CONVERSION INTENT, CTA, AND COMMERCIAL OUTCOME.',
    progressLabel: 'CONVERSION',
    fields: [{ id: 'targetAudience', type: 'textarea', a11yLabel: 'TARGET BUYER AND CONVERSION GOAL' }],
  },
  {
    id: 'brand',
    prompt: 'PRODUCT CAMPAIGN AUTHORITY',
    hint: 'BRAND, TIMING, AND APPROVAL.',
    progressLabel: 'AUTHORITY',
    fields: [
      { id: 'businessName', type: 'text', a11yLabel: 'BRAND NAME' },
      { id: 'launchDate', type: 'text', a11yLabel: 'LAUNCH DATE' },
      { id: 'approvalContact', type: 'text', a11yLabel: 'APPROVAL CONTACT' },
    ],
  },
];

const LAUNCH_STAGES: CreativeIntakeExperience['stages'] = [
  {
    id: 'concept',
    prompt: 'WHAT IS THE MOMENT?',
    hint: 'THE BIG IDEA AND LAUNCH TYPE THAT DEFINES THIS PUSH.',
    progressLabel: 'CONCEPT',
    fields: [
      { id: 'campaignObjective', type: 'launch-type-select', a11yLabel: 'LAUNCH TYPE' },
      { id: 'makingWhat', type: 'textarea', a11yLabel: 'LAUNCH GOAL' },
    ],
  },
  {
    id: 'audience',
    prompt: 'WHO NEEDS TO FEEL IT?',
    hint: 'THE AUDIENCE WAITING FOR THIS MOMENT.',
    progressLabel: 'AUDIENCE',
    fields: [{ id: 'targetAudience', type: 'textarea', a11yLabel: 'LAUNCH AUDIENCE' }],
  },
  {
    id: 'message',
    prompt: 'WHAT IS THE ONE MESSAGE?',
    hint: 'LAUNCH HOOK, BIG IDEA, AND KEY MESSAGE.',
    progressLabel: 'MESSAGE',
    fields: [
      { id: 'copyMessaging', type: 'textarea', a11yLabel: 'LAUNCH HOOK / BIG IDEA' },
      { id: 'productService', type: 'textarea', a11yLabel: 'KEY LAUNCH MESSAGE' },
    ],
  },
  {
    id: 'treatment',
    prompt: 'HOW DO WE BUILD ANTICIPATION?',
    hint: 'CREATIVE TREATMENT AND COUNTDOWN APPROACH.',
    progressLabel: 'TREATMENT',
    fields: [{ id: 'additionalNotes', type: 'textarea', a11yLabel: 'ANTICIPATION CREATIVE' }],
  },
  {
    id: 'launch',
    prompt: 'HOW ARE WE LAUNCHING?',
    hint: 'LAUNCH WINDOW, TIMING, AND TIMEZONE.',
    progressLabel: 'LAUNCH',
    fields: [
      { id: 'launchDate', type: 'text', a11yLabel: 'START DATE' },
      { id: 'deadline', type: 'text', a11yLabel: 'END DATE' },
      { id: 'quantityCadence', type: 'text', a11yLabel: 'TIMEZONE' },
    ],
  },
  {
    id: 'distribution',
    prompt: 'WHERE DOES IT BREAK THROUGH?',
    hint: 'CHANNELS AND SURFACES FOR LAUNCH AMPLIFICATION.',
    progressLabel: 'DISTRIBUTION',
    fields: [
      { id: 'platforms', type: 'platform-select', a11yLabel: 'LAUNCH CHANNELS' },
      { id: 'deliverableTypes', type: 'text', a11yLabel: 'LAUNCH DELIVERABLES' },
    ],
  },
  {
    id: 'measurement',
    prompt: 'HOW WILL WE MEASURE THE MOMENT?',
    hint: 'SUCCESS SIGNALS YOU SUPPLY — NO FABRICATED PROJECTIONS.',
    progressLabel: 'MEASUREMENT',
    fields: [
      { id: 'restrictions', type: 'textarea', a11yLabel: 'MEASUREMENT INTENT' },
      { id: 'businessName', type: 'text', a11yLabel: 'CAMPAIGN NAME' },
      { id: 'approvalContact', type: 'text', a11yLabel: 'APPROVAL CONTACT' },
    ],
  },
];

const CONTENT_SYSTEM_STAGES: CreativeIntakeExperience['stages'] = [
  {
    id: 'strategy',
    prompt: 'WHAT IS THE ENGINE FOR?',
    hint: 'PURPOSE, POSITIONING, AND PROMISE OF YOUR CONTENT SYSTEM.',
    progressLabel: 'STRATEGY',
    fields: [{ id: 'campaignObjective', type: 'textarea', a11yLabel: 'CONTENT STRATEGY' }],
  },
  {
    id: 'structure',
    prompt: 'HOW IS IT ORGANIZED?',
    hint: 'ARCHITECTURE, TEMPLATES, AND STRUCTURAL RULES.',
    progressLabel: 'STRUCTURE',
    fields: [
      { id: 'makingWhat', type: 'textarea', a11yLabel: 'SYSTEM STRUCTURE' },
      { id: 'productService', type: 'textarea', a11yLabel: 'CONTENT TERRITORIES' },
    ],
  },
  {
    id: 'content-types',
    prompt: 'WHAT ARE WE BUILDING?',
    hint: 'DEFINE THE CORE CONTENT COMPONENTS IN YOUR SYSTEM.',
    progressLabel: 'CONTENT TYPES',
    fields: [
      { id: 'copyMessaging', type: 'textarea', a11yLabel: 'PRIMARY CONTENT PILLARS' },
      { id: 'deliverableTypes', type: 'format-select', a11yLabel: 'CONTENT FORMAT MIX' },
    ],
  },
  {
    id: 'workflow',
    prompt: 'HOW DOES CONTENT MOVE?',
    hint: 'PLAN → CREATE → REVIEW → PUBLISH → ANALYZE.',
    progressLabel: 'WORKFLOW',
    fields: [{ id: 'additionalNotes', type: 'textarea', a11yLabel: 'WORKFLOW NOTES' }],
  },
  {
    id: 'distribution',
    prompt: 'WHERE DOES IT PUBLISH?',
    hint: 'OWNED, SOCIAL, AND DISTRIBUTION CHANNELS — STRATEGY ONLY.',
    progressLabel: 'DISTRIBUTION',
    fields: [
      { id: 'platforms', type: 'platform-select', a11yLabel: 'DISTRIBUTION CHANNELS' },
      { id: 'quantityCadence', type: 'text', a11yLabel: 'TARGET CADENCE' },
    ],
  },
  {
    id: 'governance',
    prompt: 'WHO GOVERNS OUTPUT?',
    hint: 'APPROVAL PATH, RESTRICTIONS, AND BRAND RULES.',
    progressLabel: 'GOVERNANCE',
    fields: [
      { id: 'restrictions', type: 'textarea', a11yLabel: 'GOVERNANCE AND RESTRICTIONS' },
      { id: 'approvalContact', type: 'text', a11yLabel: 'APPROVAL CONTACT' },
    ],
  },
  {
    id: 'measurement',
    prompt: 'HOW DO WE KNOW IT WORKS?',
    hint: 'MEASUREMENT FRAMEWORK YOU SUPPLY — NO FABRICATED METRICS.',
    progressLabel: 'MEASUREMENT',
    fields: [
      { id: 'targetAudience', type: 'textarea', a11yLabel: 'MEASUREMENT INTENT' },
      { id: 'businessName', type: 'text', a11yLabel: 'SYSTEM NAME / BRAND' },
      { id: 'launchDate', type: 'text', a11yLabel: 'TARGET LAUNCH DATE' },
    ],
  },
];

function socialExperience(): CreativeIntakeExperience {
  return {
    discipline: 'social-content',
    family: 'ATTENTION',
    environment: INTAKE_COPY.social.environment,
    visualMode: 'attention-viewport',
    signatureArtifact: 'ATTENTION_MAP',
    progressMetaphor: 'ATTENTION MAP ASSEMBLING',
    completionLanguage: INTAKE_COPY.social.completion,
    differentiationMarker: 'ATTENTION_MAP',
    stages: SOCIAL_STAGES,
    mobileMode: 'viewport-attention',
  };
}

function ugcExperience(): CreativeIntakeExperience {
  return {
    discipline: 'ugc-style',
    family: 'UGC_AUTHENTICITY',
    environment: INTAKE_COPY.ugc.environment,
    visualMode: 'creator-frame',
    signatureArtifact: 'UGC_STYLE_GUIDE',
    progressMetaphor: 'UGC STYLE GUIDE ASSEMBLING',
    completionLanguage: INTAKE_COPY.ugc.completion,
    differentiationMarker: 'UGC_STYLE_GUIDE',
    stages: UGC_STAGES,
    mobileMode: 'creator-frame',
  };
}

function filmExperience(): CreativeIntakeExperience {
  return {
    discipline: 'brand-film',
    family: 'FILM_SET',
    environment: INTAKE_COPY.film.environment,
    visualMode: 'cinematic-treatment',
    signatureArtifact: 'FILM_TREATMENT',
    progressMetaphor: 'TREATMENT ASSEMBLING',
    completionLanguage: INTAKE_COPY.film.completion,
    differentiationMarker: 'FILM_TREATMENT',
    stages: FILM_STAGES,
    mobileMode: 'director-monitor',
  };
}

function campaignExperience(): CreativeIntakeExperience {
  return {
    discipline: 'campaign',
    family: 'CAMPAIGN_CONTROL',
    environment: INTAKE_COPY.campaign.environment,
    visualMode: 'campaign-orchestration',
    signatureArtifact: 'CAMPAIGN_CONTROL',
    progressMetaphor: 'CAMPAIGN MAP ASSEMBLING',
    completionLanguage: INTAKE_COPY.campaign.completion,
    differentiationMarker: 'CAMPAIGN_CONTROL',
    stages: CAMPAIGN_STAGES,
    mobileMode: 'active-node',
  };
}

function productExperience(): CreativeIntakeExperience {
  return {
    discipline: 'product-campaign',
    family: 'PRODUCT_STAGING',
    environment: INTAKE_COPY.product.environment,
    visualMode: 'product-stage',
    signatureArtifact: 'PRODUCT_STAGE',
    progressMetaphor: 'PRODUCT STAGE ASSEMBLING',
    completionLanguage: INTAKE_COPY.product.completion,
    differentiationMarker: 'PRODUCT_STAGE',
    stages: PRODUCT_STAGES,
    mobileMode: 'product-stage',
  };
}

function launchExperience(): CreativeIntakeExperience {
  return {
    discipline: 'launch-campaign',
    family: 'LAUNCH_SEQUENCE',
    environment: INTAKE_COPY.launch.environment,
    visualMode: 'launch-countdown',
    signatureArtifact: 'LAUNCH_BLUEPRINT',
    progressMetaphor: 'LAUNCH BLUEPRINT ASSEMBLING',
    completionLanguage: INTAKE_COPY.launch.completion,
    differentiationMarker: 'LAUNCH_BLUEPRINT',
    stages: LAUNCH_STAGES,
    mobileMode: 'launch-countdown',
  };
}

function contentSystemExperience(): CreativeIntakeExperience {
  return {
    discipline: 'content-system',
    family: 'CONTENT_ENGINE',
    environment: INTAKE_COPY.contentSystem.environment,
    visualMode: 'system-architecture',
    signatureArtifact: 'CONTENT_SYSTEM_MAP',
    progressMetaphor: 'CONTENT SYSTEM MAP ASSEMBLING',
    completionLanguage: INTAKE_COPY.contentSystem.completion,
    differentiationMarker: 'CONTENT_SYSTEM_MAP',
    stages: CONTENT_SYSTEM_STAGES,
    mobileMode: 'system-architecture',
  };
}

const REGISTRY: Record<MarketingServiceCategory, CreativeIntakeExperience> = {
  'social-content': socialExperience(),
  'ugc-style': ugcExperience(),
  'brand-film': filmExperience(),
  campaign: campaignExperience(),
  'product-campaign': productExperience(),
  'launch-campaign': launchExperience(),
  'content-system': contentSystemExperience(),
};

export function getCreativeIntakeExperience(serviceId: MarketingServiceCategory): CreativeIntakeExperience {
  return REGISTRY[serviceId];
}

export function listCreativeIntakeExperiences(): CreativeIntakeExperience[] {
  return Object.values(REGISTRY);
}

export function getExperienceMatrix(): Array<{
  discipline: MarketingServiceCategory;
  family: string;
  environment: string;
  signatureArtifact: SignatureArtifact;
  progressMetaphor: string;
  mobileMode: string;
}> {
  return listCreativeIntakeExperiences().map((e) => ({
    discipline: e.discipline,
    family: e.family,
    environment: e.environment,
    signatureArtifact: e.signatureArtifact,
    progressMetaphor: e.progressMetaphor,
    mobileMode: e.mobileMode,
  }));
}

export type { SignatureArtifact } from './types.js';
export {
  CAMPAIGN_OBJECTIVE_TERRITORIES,
  SUPPORTED_PLATFORMS,
  UGC_TONE_OPTIONS,
  UGC_CAMERA_STYLES,
  LAUNCH_TYPE_OPTIONS,
  CONTENT_FORMAT_OPTIONS,
} from './types.js';
