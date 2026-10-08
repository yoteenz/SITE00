/**
 * Canonical manifests and their JSON Schemas. Built from the TypeScript source; exported to "JURNL EMAILS v1/MANIFESTS"
 * by scripts/jurnl/email-engine-export.ts. They let any later agent answer: what the email is, why and when it is sent,
 * who may receive it, what it may say, its family, its assets, what supersedes what, and whether it is approved,
 * implemented or live.
 */

import { EMAIL_ASSET_CLASSES, LINEAGE_GROUPS, LINEAGE_RULES } from './assets.js';
import { EMAIL_COMPONENTS } from './components.js';
import { EMAIL_CONTRACTS } from './contracts.js';
import { EMAIL_FAMILIES } from './families.js';
import { RESPONSIVE_RULES, RESPONSIVE_VIEWPORTS } from './responsive.js';
import { JURNL_EMAIL_SPRINT, JURNL_EMAIL_SYSTEM, PRODUCTION_STATES } from './system.js';
import { TRIGGER_EVENTS } from './triggers.js';

export const MANIFEST_IDS = [
  'email-family-manifest',
  'email-template-manifest',
  'email-component-manifest',
  'email-trigger-manifest',
  'email-asset-manifest',
  'email-lineage-manifest',
  'email-responsive-manifest',
] as const;
export type ManifestId = (typeof MANIFEST_IDS)[number];

const head = (id: ManifestId) => ({
  id,
  system: JURNL_EMAIL_SYSTEM.name,
  collection: JURNL_EMAIL_SYSTEM.collection,
  sprint: JURNL_EMAIL_SPRINT,
  schema: `schemas/${id}.schema.json`,
  generated_by: 'scripts/jurnl/email-engine-export.ts',
  source: JURNL_EMAIL_SYSTEM.source,
});

const STATES = PRODUCTION_STATES.map((s) => s.state);
const str = { type: 'string', minLength: 1 } as const;
const strArr = { type: 'array', items: str } as const;
const headSchema = {
  id: str,
  system: { const: JURNL_EMAIL_SYSTEM.name },
  collection: { const: JURNL_EMAIL_SYSTEM.collection },
  sprint: str,
  schema: str,
  generated_by: str,
  source: str,
} as const;
const schema = (id: ManifestId, title: string, itemsKey: string, item: Record<string, unknown>, required: string[], extra: Record<string, unknown> = {}) => ({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: `jurnl-emails-v1/${id}.schema.json`,
  title,
  type: 'object',
  required: [...Object.keys(headSchema), itemsKey, ...Object.keys(extra)],
  properties: { ...headSchema, ...extra, [itemsKey]: { type: 'array', minItems: 1, items: { type: 'object', required, properties: item } } },
});

export const MANIFEST_SCHEMAS: Record<ManifestId, Record<string, unknown>> = {
  'email-family-manifest': schema(
    'email-family-manifest',
    'JURNL email families',
    'families',
    {
      id: { enum: ['E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07'] },
      name: str,
      artifact_grammar: strArr,
      consent_classes: { type: 'array', items: { enum: ['TRANSACTIONAL', 'LIFECYCLE_SERVICE', 'MARKETING'] } },
      expressiveness: { type: 'integer', minimum: 1, maximum: 5 },
      environment_art: { enum: ['NONE', 'OPTIONAL', 'EXPECTED'] },
      allowed_components: strArr,
      emails: strArr,
    },
    ['id', 'name', 'artifact_grammar', 'consent_classes', 'expressiveness', 'environment_art', 'allowed_components', 'emails'],
  ),
  'email-template-manifest': schema(
    'email-template-manifest',
    'JURNL email templates (message contracts and their production state)',
    'templates',
    {
      id: { pattern: '^A\\d{2}$' },
      name: str,
      folder: str,
      family: { pattern: '^E0[1-7]$' },
      consent_class: { enum: ['TRANSACTIONAL', 'LIFECYCLE_SERVICE', 'MARKETING'] },
      preference_category: str,
      states: strArr,
      subject: str,
      preheader: str,
      from_name: str,
      components: strArr,
      production_state: { enum: STATES },
      founder_approval: { type: 'object', required: ['status'], properties: { status: { enum: ['NOT_REVIEWED', 'IN_REVIEW', 'APPROVED', 'REVISION_REQUESTED'] } } },
      implemented: { type: 'boolean' },
      live: { type: 'boolean' },
      superseded_by: { type: ['string', 'null'] },
    },
    ['id', 'name', 'folder', 'family', 'consent_class', 'preference_category', 'states', 'subject', 'preheader', 'from_name', 'components', 'production_state', 'founder_approval', 'implemented', 'live', 'superseded_by'],
  ),
  'email-component-manifest': schema(
    'email-component-manifest',
    'JURNL email components',
    'components',
    { id: { pattern: '^EC\\d{2}$' }, name: str, families: strArr, consent_classes: strArr, html: strArr, image: { type: 'array', items: str }, dynamic_data: { type: 'array', items: str }, forbidden: strArr },
    ['id', 'name', 'families', 'consent_classes', 'html', 'image', 'dynamic_data', 'forbidden'],
  ),
  'email-trigger-manifest': schema(
    'email-trigger-manifest',
    'JURNL email triggers',
    'triggers',
    {
      email_id: { pattern: '^A\\d{2}$' },
      trigger_event: str,
      source_status: { enum: ['EXISTS_PROVIDER_OWNED', 'STATE_EXISTS_EVENT_NOT_EMITTED', 'PROPOSED'] },
      eligibility: strArr,
      suppression: strArr,
      cooldown: str,
      personalization: { enum: ['P0', 'P1', 'P2', 'P3'] },
      cta_destination: str,
      consent_class: str,
      priority: { enum: ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'] },
      duplicate_guard: str,
      delivery_state: { enum: ['NOT_WIRED', 'RENDER_ONLY', 'DRY_RUN', 'PROVIDER_OWNED', 'LIVE', 'PAUSED'] },
    },
    ['email_id', 'trigger_event', 'source_status', 'eligibility', 'suppression', 'cooldown', 'personalization', 'cta_destination', 'consent_class', 'priority', 'duplicate_guard', 'delivery_state'],
    { events: { type: 'array', minItems: 1 } },
  ),
  'email-asset-manifest': schema(
    'email-asset-manifest',
    'JURNL email assets (planned slots until authorities are approved)',
    'assets',
    {
      email_id: str,
      slot: str,
      asset_class: { enum: ['EMAIL_ENVIRONMENT', 'EMAIL_ARTIFACT_SHELL', 'EMAIL_DECORATIVE_INSERT', 'EMAIL_THUMBNAIL'] },
      lineage_group: str,
      lineage_action: { enum: ['REUSE', 'DERIVE', 'REGENERATE', 'CREATE_NEW'] },
      status: { enum: ['PLANNED', 'GENERATED', 'APPROVED', 'SUPERSEDED'] },
      file: { type: ['string', 'null'] },
    },
    ['email_id', 'slot', 'asset_class', 'lineage_group', 'lineage_action', 'status', 'file'],
    { classes: { type: 'array', minItems: 5 } },
  ),
  'email-lineage-manifest': schema(
    'email-lineage-manifest',
    'JURNL email lineage',
    'groups',
    { id: str, families: strArr, emails: { type: 'array', items: str }, materials: str, founder: { type: ['string', 'null'] } },
    ['id', 'families', 'emails', 'materials', 'founder'],
    { rules: { type: 'array', minItems: 4 } },
  ),
  'email-responsive-manifest': schema(
    'email-responsive-manifest',
    'JURNL email responsive authorities',
    'templates',
    { email_id: str, mobile_authority: { type: ['string', 'null'] }, desktop_authority: { type: ['string', 'null'] }, image_blocked_plan: { type: ['string', 'null'] }, status: { enum: ['NOT_STARTED', 'IN_REVIEW', 'APPROVED'] } },
    ['email_id', 'mobile_authority', 'desktop_authority', 'image_blocked_plan', 'status'],
    { viewports: { type: 'array', minItems: 2 }, rules: { type: 'object' } },
  ),
};

export function buildManifests(): Record<ManifestId, Record<string, unknown>> {
  return {
    'email-family-manifest': {
      ...head('email-family-manifest'),
      families: EMAIL_FAMILIES.map((f) => ({
        id: f.id,
        name: f.name,
        purpose: f.purpose,
        artifact_grammar: f.artifactGrammar,
        mood: f.mood,
        consent_classes: f.consentClasses,
        expressiveness: f.expressiveness,
        environment_art: f.environmentArt,
        max_personalization: f.maxPersonalization,
        lineage: f.lineage,
        allowed_components: EMAIL_COMPONENTS.filter((c) => c.families.includes(f.id)).map((c) => c.id),
        emails: EMAIL_CONTRACTS.filter((e) => e.family === f.id || e.traits.includes(f.id)).map((e) => e.id),
      })),
    },
    'email-template-manifest': {
      ...head('email-template-manifest'),
      templates: EMAIL_CONTRACTS.map((e) => ({
        id: e.id,
        name: e.name,
        folder: e.folder,
        family: e.family,
        traits: e.traits,
        message_type: e.messageType,
        purpose: e.purpose,
        consent_class: e.trigger.consentClass,
        preference_category: e.preferenceCategory,
        states: e.states.map((s) => s.id),
        subject: e.copy.subject,
        preheader: e.copy.preheader,
        from_name: e.copy.fromName,
        copy_status: e.copy.status,
        components: e.components,
        artifact: e.artifact,
        production_state: e.productionState,
        founder_approval: e.founderApproval,
        implemented: false,
        live: false,
        template: null,
        superseded_by: null,
      })),
    },
    'email-component-manifest': {
      ...head('email-component-manifest'),
      components: EMAIL_COMPONENTS.map((c) => ({
        id: c.id,
        name: c.name,
        purpose: c.purpose,
        families: c.families,
        consent_classes: c.consentClasses,
        html: c.html,
        image: c.image,
        responsive: c.responsive,
        accessibility: c.accessibility,
        dynamic_data: c.dynamicData,
        variants: c.variants,
        forbidden: c.forbidden,
      })),
    },
    'email-trigger-manifest': {
      ...head('email-trigger-manifest'),
      events: TRIGGER_EVENTS,
      triggers: EMAIL_CONTRACTS.map((e) => {
        const t = e.trigger;
        return {
          email_id: t.emailId,
          trigger_event: t.triggerEvent,
          source_status: TRIGGER_EVENTS.find((x) => x.id === t.triggerEvent)!.status,
          eligibility: t.eligibility,
          suppression: t.suppression,
          cooldown: t.cooldown,
          personalization_inputs: t.personalizationInputs,
          personalization: t.personalization,
          cta_destination: t.ctaDestination,
          consent_class: t.consentClass,
          priority: t.priority,
          duplicate_guard: t.duplicateGuard,
          delivery_state: t.deliveryState,
        };
      }),
    },
    'email-asset-manifest': {
      ...head('email-asset-manifest'),
      classes: EMAIL_ASSET_CLASSES,
      assets: EMAIL_CONTRACTS.flatMap((e) =>
        e.assetPlan.map((a) => ({ email_id: e.id, slot: a.slot, asset_class: a.assetClass, lineage_group: e.lineageGroup, lineage_action: a.lineageAction, note: a.note, status: 'PLANNED', file: null })),
      ),
    },
    'email-lineage-manifest': {
      ...head('email-lineage-manifest'),
      rules: LINEAGE_RULES,
      groups: LINEAGE_GROUPS.map((g) => ({ id: g.id, families: g.families, emails: g.emails, materials: g.materials, founder: g.founder })),
    },
    'email-responsive-manifest': {
      ...head('email-responsive-manifest'),
      viewports: RESPONSIVE_VIEWPORTS,
      rules: RESPONSIVE_RULES,
      templates: EMAIL_CONTRACTS.map((e) => ({ email_id: e.id, mobile_authority: null, desktop_authority: null, image_blocked_plan: null, status: 'NOT_STARTED' })),
    },
  };
}
