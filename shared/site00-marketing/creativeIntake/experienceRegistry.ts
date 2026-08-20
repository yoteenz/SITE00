/** Discipline → creative experience registry */

import type { MarketingServiceCategory } from '../types.js';
import { INTAKE_COPY } from './copySystem.js';
import type { CreativeIntakeExperience, SignatureArtifact } from './types.js';
import { CAMPAIGN_OBJECTIVE_TERRITORIES, SUPPORTED_PLATFORMS } from './types.js';

const SOCIAL_STAGES: CreativeIntakeExperience['stages'] = [
  {
    id: 'position',
    prompt: 'WHERE ARE WE TRYING TO STOP THEM?',
    hint: 'The objective and surface where attention must land.',
    progressLabel: 'POSITION',
    fields: [
      { id: 'campaignObjective', type: 'textarea', a11yLabel: 'Primary objective' },
      { id: 'platforms', type: 'platform-select', a11yLabel: 'Primary platform or surface' },
    ],
  },
  {
    id: 'attention',
    prompt: 'WHAT GETS THE SECOND LOOK?',
    hint: 'The central idea, hook, and what we are putting in frame.',
    progressLabel: 'ATTENTION',
    fields: [
      { id: 'makingWhat', type: 'textarea', a11yLabel: 'Central idea or content type' },
      { id: 'productService', type: 'textarea', a11yLabel: 'Product, service, or story' },
    ],
  },
  {
    id: 'audience',
    prompt: 'WHO ARE WE INTERRUPTING?',
    hint: 'The audience whose scroll we intend to break — described precisely.',
    progressLabel: 'AUDIENCE',
    fields: [{ id: 'targetAudience', type: 'textarea', a11yLabel: 'Target audience' }],
  },
  {
    id: 'memory',
    prompt: 'WHAT SHOULD SURVIVE THE SCROLL?',
    hint: 'The single idea someone should remember after seeing the content.',
    progressLabel: 'MEMORY',
    fields: [{ id: 'copyMessaging', type: 'textarea', a11yLabel: 'Takeaway message' }],
  },
  {
    id: 'action',
    prompt: 'WHAT HAPPENS AFTER THEY STOP?',
    hint: 'Intended behavior, CTA, and where they should go next.',
    progressLabel: 'ACTION',
    fields: [
      { id: 'additionalNotes', type: 'textarea', a11yLabel: 'Call to action and conversion intent' },
      { id: 'deliverableTypes', type: 'text', a11yLabel: 'Deliverable formats' },
    ],
  },
  {
    id: 'cadence',
    prompt: 'HOW OFTEN DOES THIS SIGNAL REPEAT?',
    hint: 'Volume, cadence, and timing constraints.',
    progressLabel: 'CADENCE',
    fields: [
      { id: 'quantityCadence', type: 'text', a11yLabel: 'Quantity and cadence' },
      { id: 'deadline', type: 'text', a11yLabel: 'Deadline' },
      { id: 'launchDate', type: 'text', a11yLabel: 'Launch date' },
    ],
  },
  {
    id: 'brand',
    prompt: 'WHOSE SIGNAL IS THIS?',
    hint: 'Brand identity, restrictions, and approval contact.',
    progressLabel: 'BRAND',
    fields: [
      { id: 'businessName', type: 'text', a11yLabel: 'Business or brand name' },
      { id: 'restrictions', type: 'textarea', a11yLabel: 'Restrictions' },
      { id: 'approvalContact', type: 'text', a11yLabel: 'Approval contact' },
    ],
  },
];

const FILM_STAGES: CreativeIntakeExperience['stages'] = [
  {
    id: 'scene-intent',
    prompt: 'WHAT ARE WE PUTTING ON SCREEN?',
    hint: 'The film\'s purpose — what this piece must accomplish.',
    progressLabel: 'SCENE 01 / INTENT',
    fields: [{ id: 'campaignObjective', type: 'textarea', a11yLabel: 'Film intent' }],
  },
  {
    id: 'scene-subject',
    prompt: 'WHO OR WHAT CARRIES THE FRAME?',
    hint: 'Subject, product, talent, or entity at the center.',
    progressLabel: 'SCENE 02 / SUBJECT',
    fields: [
      { id: 'makingWhat', type: 'textarea', a11yLabel: 'Subject' },
      { id: 'productService', type: 'textarea', a11yLabel: 'Product or service on screen' },
    ],
  },
  {
    id: 'scene-world',
    prompt: 'WHAT WORLD ARE WE BUILDING?',
    hint: 'Environment, tone, and visual territory.',
    progressLabel: 'SCENE 03 / WORLD',
    fields: [{ id: 'restrictions', type: 'textarea', a11yLabel: 'World and visual direction' }],
  },
  {
    id: 'scene-story',
    prompt: 'WHERE DOES THE STORY BEGIN?',
    hint: 'Narrative arc, emotional destination, story beats.',
    progressLabel: 'SCENE 04 / STORY',
    fields: [{ id: 'copyMessaging', type: 'textarea', a11yLabel: 'Story and narrative' }],
  },
  {
    id: 'scene-frame',
    prompt: 'HOW SHOULD IT MOVE?',
    hint: 'Format, aspect ratio intent, deliverable types.',
    progressLabel: 'SCENE 05 / FRAME',
    fields: [
      { id: 'deliverableTypes', type: 'text', a11yLabel: 'Formats and deliverables' },
      { id: 'targetAudience', type: 'textarea', a11yLabel: 'Who should feel this' },
    ],
  },
  {
    id: 'scene-sound',
    prompt: 'WHAT SHOULD IT SOUND LIKE?',
    hint: 'Audio direction, voice, music sensibility.',
    progressLabel: 'SCENE 06 / SOUND',
    fields: [{ id: 'additionalNotes', type: 'textarea', a11yLabel: 'Sound direction' }],
  },
  {
    id: 'scene-delivery',
    prompt: 'WHERE WILL THE FINAL CUT LIVE?',
    hint: 'Destinations, launch timing, distribution surfaces.',
    progressLabel: 'SCENE 07 / DELIVERY',
    fields: [
      { id: 'platforms', type: 'platform-select', a11yLabel: 'Distribution surfaces' },
      { id: 'launchDate', type: 'text', a11yLabel: 'Launch date' },
      { id: 'deadline', type: 'text', a11yLabel: 'Delivery deadline' },
    ],
  },
  {
    id: 'scene-brand',
    prompt: 'PRODUCTION IDENTITY',
    hint: 'Brand name and approval path.',
    progressLabel: 'SLATE / BRAND',
    fields: [
      { id: 'businessName', type: 'text', a11yLabel: 'Project or brand name' },
      { id: 'approvalContact', type: 'text', a11yLabel: 'Approval contact' },
      { id: 'quantityCadence', type: 'text', a11yLabel: 'Cut versions or cadence' },
    ],
  },
];

const CAMPAIGN_STAGES: CreativeIntakeExperience['stages'] = [
  {
    id: 'objective',
    prompt: 'WHAT ARE WE TRYING TO MOVE?',
    hint: 'The strategic objective this campaign must shift.',
    progressLabel: 'OBJECTIVE',
    fields: [
      { id: 'campaignObjective', type: 'objective-select', a11yLabel: 'Campaign objective territory' },
      { id: 'makingWhat', type: 'textarea', a11yLabel: 'Campaign description' },
    ],
  },
  {
    id: 'audience',
    prompt: 'WHO NEEDS TO MOVE?',
    hint: 'Audience segments and behavior we are targeting.',
    progressLabel: 'AUDIENCE',
    fields: [{ id: 'targetAudience', type: 'textarea', a11yLabel: 'Target audience' }],
  },
  {
    id: 'message',
    prompt: 'WHAT DO THEY NEED TO HEAR?',
    hint: 'Core message architecture and proof points.',
    progressLabel: 'MESSAGE',
    fields: [
      { id: 'copyMessaging', type: 'textarea', a11yLabel: 'Core message' },
      { id: 'productService', type: 'textarea', a11yLabel: 'Offer or product context' },
    ],
  },
  {
    id: 'channels',
    prompt: 'WHERE DOES IT TRAVEL?',
    hint: 'Channels and surfaces — strategy selection, not provider connection.',
    progressLabel: 'CHANNELS',
    fields: [
      { id: 'platforms', type: 'platform-select', a11yLabel: 'Channels' },
      { id: 'deliverableTypes', type: 'text', a11yLabel: 'Deliverable types' },
    ],
  },
  {
    id: 'deliverables',
    prompt: 'WHAT HAS TO EXIST?',
    hint: 'Assets, formats, and production outputs required.',
    progressLabel: 'DELIVERABLES',
    fields: [{ id: 'additionalNotes', type: 'textarea', a11yLabel: 'Required deliverables' }],
  },
  {
    id: 'timing',
    prompt: 'WHEN DOES IT HIT?',
    hint: 'Launch sequence, deadlines, and cadence.',
    progressLabel: 'TIMING',
    fields: [
      { id: 'launchDate', type: 'text', a11yLabel: 'Launch date' },
      { id: 'deadline', type: 'text', a11yLabel: 'Deadline' },
      { id: 'quantityCadence', type: 'text', a11yLabel: 'Rollout cadence' },
    ],
  },
  {
    id: 'measurement',
    prompt: 'HOW WILL WE KNOW IT MOVED?',
    hint: 'Success signals you will supply — we do not invent metrics.',
    progressLabel: 'MEASUREMENT',
    fields: [{ id: 'restrictions', type: 'textarea', a11yLabel: 'Measurement intent and constraints' }],
  },
  {
    id: 'brand',
    prompt: 'CAMPAIGN AUTHORITY',
    hint: 'Brand name, approval contact, governance.',
    progressLabel: 'AUTHORITY',
    fields: [
      { id: 'businessName', type: 'text', a11yLabel: 'Brand or campaign name' },
      { id: 'approvalContact', type: 'text', a11yLabel: 'Approval contact' },
    ],
  },
];

const EDITORIAL_STAGES: CreativeIntakeExperience['stages'] = [
  {
    id: 'angle',
    prompt: 'WHAT IS THE ANGLE?',
    hint: 'Editorial point of view and thesis.',
    progressLabel: 'ANGLE',
    fields: [{ id: 'campaignObjective', type: 'textarea', a11yLabel: 'Editorial angle' }],
  },
  {
    id: 'subject',
    prompt: 'WHAT IS THE SUBJECT?',
    hint: 'Topic, series, or content territory.',
    progressLabel: 'SUBJECT',
    fields: [
      { id: 'makingWhat', type: 'textarea', a11yLabel: 'Subject matter' },
      { id: 'productService', type: 'textarea', a11yLabel: 'Related offer or context' },
    ],
  },
  {
    id: 'reader',
    prompt: 'WHO IS READING?',
    hint: 'Audience and recognition goals.',
    progressLabel: 'READER',
    fields: [{ id: 'targetAudience', type: 'textarea', a11yLabel: 'Reader audience' }],
  },
  {
    id: 'thesis',
    prompt: 'WHAT IS THE THESIS?',
    hint: 'Argument, takeaway, and message priority.',
    progressLabel: 'THESIS',
    fields: [{ id: 'copyMessaging', type: 'textarea', a11yLabel: 'Editorial thesis' }],
  },
  {
    id: 'format',
    prompt: 'WHAT FORMAT HOLDS IT?',
    hint: 'Series structure, templates, production cadence.',
    progressLabel: 'FORMAT',
    fields: [
      { id: 'deliverableTypes', type: 'text', a11yLabel: 'Formats' },
      { id: 'quantityCadence', type: 'text', a11yLabel: 'Cadence' },
    ],
  },
  {
    id: 'distribution',
    prompt: 'WHERE DOES IT DISTRIBUTE?',
    hint: 'Surfaces and channels for the content system.',
    progressLabel: 'DISTRIBUTION',
    fields: [
      { id: 'platforms', type: 'platform-select', a11yLabel: 'Distribution channels' },
      { id: 'launchDate', type: 'text', a11yLabel: 'Launch date' },
      { id: 'deadline', type: 'text', a11yLabel: 'Deadline' },
    ],
  },
  {
    id: 'brand',
    prompt: 'EDITORIAL AUTHORITY',
    hint: 'Brand, restrictions, approval.',
    progressLabel: 'AUTHORITY',
    fields: [
      { id: 'businessName', type: 'text', a11yLabel: 'Brand name' },
      { id: 'restrictions', type: 'textarea', a11yLabel: 'Editorial restrictions' },
      { id: 'approvalContact', type: 'text', a11yLabel: 'Approval contact' },
      { id: 'additionalNotes', type: 'textarea', a11yLabel: 'Additional editorial notes' },
    ],
  },
];

function attentionExperience(discipline: MarketingServiceCategory): CreativeIntakeExperience {
  return {
    discipline,
    family: 'ATTENTION',
    environment: INTAKE_COPY.social.environment,
    visualMode: 'attention-viewport',
    signatureArtifact: 'ATTENTION_MAP',
    progressMetaphor: 'Attention map assembling',
    completionLanguage: INTAKE_COPY.social.completion,
    differentiationMarker: 'ATTENTION_MAP',
    stages: SOCIAL_STAGES,
    mobileMode: 'viewport-attention',
  };
}

function filmExperience(): CreativeIntakeExperience {
  return {
    discipline: 'brand-film',
    family: 'FILM_SET',
    environment: INTAKE_COPY.film.environment,
    visualMode: 'cinematic-treatment',
    signatureArtifact: 'FILM_TREATMENT',
    progressMetaphor: 'Treatment assembling',
    completionLanguage: INTAKE_COPY.film.completion,
    differentiationMarker: 'FILM_TREATMENT',
    stages: FILM_STAGES,
    mobileMode: 'director-monitor',
  };
}

function campaignExperience(discipline: MarketingServiceCategory): CreativeIntakeExperience {
  return {
    discipline,
    family: 'CAMPAIGN_CONTROL',
    environment: INTAKE_COPY.campaign.environment,
    visualMode: 'campaign-orchestration',
    signatureArtifact: 'CAMPAIGN_CONTROL',
    progressMetaphor: 'Campaign map assembling',
    completionLanguage: INTAKE_COPY.campaign.completion,
    differentiationMarker: 'CAMPAIGN_CONTROL',
    stages: CAMPAIGN_STAGES,
    mobileMode: 'active-node',
  };
}

function editorialExperience(): CreativeIntakeExperience {
  return {
    discipline: 'content-system',
    family: 'EDITORIAL',
    environment: INTAKE_COPY.editorial.environment,
    visualMode: 'editorial-desk',
    signatureArtifact: 'STORY_FILE',
    progressMetaphor: 'Story file assembling',
    completionLanguage: INTAKE_COPY.editorial.completion,
    differentiationMarker: 'STORY_FILE',
    stages: EDITORIAL_STAGES,
    mobileMode: 'specimen-record',
  };
}

const REGISTRY: Record<MarketingServiceCategory, CreativeIntakeExperience> = {
  'social-content': attentionExperience('social-content'),
  'ugc-style': attentionExperience('ugc-style'),
  'brand-film': filmExperience(),
  campaign: campaignExperience('campaign'),
  'product-campaign': campaignExperience('product-campaign'),
  'launch-campaign': campaignExperience('launch-campaign'),
  'content-system': editorialExperience(),
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

export { CAMPAIGN_OBJECTIVE_TERRITORIES, SUPPORTED_PLATFORMS };
