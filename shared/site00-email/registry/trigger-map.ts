/**
 * Canonical trigger map — event → template → family → CTA.
 * Production wiring status in events.ts; this adds family context for QA.
 */
import type { EmailFamilyCanon } from '../families/registry.js';
import { getFamilySpec } from '../families/registry.js';
import { getPrimaryFamily } from './family-map.js';
import { EMAIL_EVENT_REGISTRY, type EmailEventId } from './events.js';
import { getTemplateById } from './templates.js';

export type TriggerMapEntry = {
  event: EmailEventId;
  templateId: string;
  family: EmailFamilyCanon;
  familyLabel: string;
  subjectTone: string;
  cta: string;
  wired: boolean;
  notes?: string;
};

export function buildTriggerMap(): TriggerMapEntry[] {
  return EMAIL_EVENT_REGISTRY.map((e) => {
    const t = getTemplateById(e.templateId);
    const family = getPrimaryFamily(e.templateId);
    const spec = getFamilySpec(family);
    return {
      event: e.event,
      templateId: e.templateId,
      family,
      familyLabel: spec.label,
      subjectTone: spec.subjectTone,
      cta: t?.ctaLabel ?? spec.primaryCtaPattern,
      wired: e.wired,
      notes: e.notes,
    };
  });
}

export function getTriggerEntry(event: EmailEventId): TriggerMapEntry | undefined {
  return buildTriggerMap().find((e) => e.event === event);
}
