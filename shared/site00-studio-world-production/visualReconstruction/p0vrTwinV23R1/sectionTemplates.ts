import type { ExecutableConceptObject } from './types.js';
import { renderPrimitiveForRole } from './renderPrimitivePolicy.js';

type SectionTemplate = { role: string; type: string; relBounds: { x: number; y: number; w: number; h: number }; text?: string };

const SECTION_OBJECT_TEMPLATES: Record<string, SectionTemplate[]> = {
  masthead: [
    { role: 'project_mark', type: 'text', relBounds: { x: 0.04, y: 0.08, w: 0.2, h: 0.12 } },
    { role: 'project_name', type: 'text', relBounds: { x: 0.04, y: 0.22, w: 0.55, h: 0.14 }, text: 'NDXBOOK' },
    { role: 'archive_descriptor', type: 'text', relBounds: { x: 0.04, y: 0.38, w: 0.5, h: 0.1 } },
    { role: 'founder_status', type: 'text', relBounds: { x: 0.6, y: 0.1, w: 0.36, h: 0.12 } },
    { role: 'project_id', type: 'text', relBounds: { x: 0.6, y: 0.24, w: 0.36, h: 0.08 } },
    { role: 'role_label', type: 'text', relBounds: { x: 0.6, y: 0.34, w: 0.36, h: 0.08 } },
    { role: 'status_indicator', type: 'status', relBounds: { x: 0.6, y: 0.44, w: 0.36, h: 0.1 } },
  ],
  nav: [
    { role: 'nav_item', type: 'nav', relBounds: { x: 0.02, y: 0.15, w: 0.96, h: 0.7 } },
    { role: 'nav_divider', type: 'divider', relBounds: { x: 0, y: 0.92, w: 1, h: 0.02 } },
  ],
  hero: [
    { role: 'eyebrow', type: 'text', relBounds: { x: 0.04, y: 0.05, w: 0.4, h: 0.08 } },
    { role: 'headline', type: 'text', relBounds: { x: 0.04, y: 0.14, w: 0.42, h: 0.22 } },
    { role: 'supporting_copy', type: 'text', relBounds: { x: 0.04, y: 0.38, w: 0.42, h: 0.18 } },
    { role: 'central_media', type: 'photo', relBounds: { x: 0.38, y: 0.08, w: 0.28, h: 0.55 } },
    { role: 'ndx_overlay', type: 'graphic', relBounds: { x: 0.42, y: 0.2, w: 0.2, h: 0.25 } },
    { role: 'utility_column', type: 'text', relBounds: { x: 0.72, y: 0.08, w: 0.24, h: 0.5 } },
    { role: 'quick_action', type: 'control', relBounds: { x: 0.04, y: 0.58, w: 0.9, h: 0.12 } },
  ],
  progress: [
    { role: 'progress_label', type: 'text', relBounds: { x: 0.04, y: 0.05, w: 0.5, h: 0.12 } },
    { role: 'progress_percentage', type: 'text', relBounds: { x: 0.7, y: 0.05, w: 0.26, h: 0.12 } },
    { role: 'progress_track', type: 'progress', relBounds: { x: 0.04, y: 0.22, w: 0.92, h: 0.08 } },
    { role: 'progress_fill', type: 'progress', relBounds: { x: 0.04, y: 0.22, w: 0.55, h: 0.08 } },
    { role: 'phase_label', type: 'text', relBounds: { x: 0.04, y: 0.34, w: 0.6, h: 0.1 } },
    { role: 'step_markers', type: 'progress', relBounds: { x: 0.04, y: 0.48, w: 0.92, h: 0.2 } },
  ],
  metrics: [
    { role: 'metric_cell', type: 'metric', relBounds: { x: 0.04, y: 0.1, w: 0.28, h: 0.35 } },
    { role: 'metric_cell', type: 'metric', relBounds: { x: 0.36, y: 0.1, w: 0.28, h: 0.35 } },
    { role: 'metric_cell', type: 'metric', relBounds: { x: 0.68, y: 0.1, w: 0.28, h: 0.35 } },
    { role: 'metric_divider', type: 'divider', relBounds: { x: 0.04, y: 0.48, w: 0.92, h: 0.02 } },
  ],
  focus: [
    { role: 'focus_icon', type: 'graphic', relBounds: { x: 0.04, y: 0.08, w: 0.12, h: 0.12 } },
    { role: 'focus_eyebrow', type: 'text', relBounds: { x: 0.18, y: 0.08, w: 0.78, h: 0.08 } },
    { role: 'focus_title', type: 'text', relBounds: { x: 0.04, y: 0.2, w: 0.92, h: 0.18 } },
    { role: 'focus_copy', type: 'text', relBounds: { x: 0.04, y: 0.4, w: 0.92, h: 0.25 } },
    { role: 'focus_cta', type: 'control', relBounds: { x: 0.04, y: 0.68, w: 0.4, h: 0.12 } },
  ],
  milestone: [
    { role: 'milestone_icon', type: 'graphic', relBounds: { x: 0.04, y: 0.1, w: 0.1, h: 0.1 } },
    { role: 'milestone_label', type: 'text', relBounds: { x: 0.16, y: 0.1, w: 0.8, h: 0.08 } },
    { role: 'milestone_title', type: 'text', relBounds: { x: 0.04, y: 0.22, w: 0.92, h: 0.16 } },
    { role: 'milestone_copy', type: 'text', relBounds: { x: 0.04, y: 0.4, w: 0.92, h: 0.2 } },
    { role: 'due_date', type: 'text', relBounds: { x: 0.04, y: 0.64, w: 0.45, h: 0.1 } },
    { role: 'remaining_time', type: 'text', relBounds: { x: 0.52, y: 0.64, w: 0.44, h: 0.1 } },
  ],
  activity: [
    { role: 'activity_title', type: 'text', relBounds: { x: 0.04, y: 0.04, w: 0.6, h: 0.1 } },
    { role: 'view_all', type: 'control', relBounds: { x: 0.72, y: 0.04, w: 0.24, h: 0.1 } },
    { role: 'activity_row', type: 'text', relBounds: { x: 0.04, y: 0.18, w: 0.92, h: 0.14 } },
    { role: 'activity_row', type: 'text', relBounds: { x: 0.04, y: 0.34, w: 0.92, h: 0.14 } },
    { role: 'activity_row', type: 'text', relBounds: { x: 0.04, y: 0.5, w: 0.92, h: 0.14 } },
    { role: 'activity_row', type: 'text', relBounds: { x: 0.04, y: 0.66, w: 0.92, h: 0.14 } },
  ],
};

export function normalizeSectionKey(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('masthead') || l.includes('identity')) return 'masthead';
  if (l.includes('nav') && !l.includes('bottom')) return 'nav';
  if (l.includes('hero')) return 'hero';
  if (l.includes('progress')) return 'progress';
  if (l.includes('metric')) return 'metrics';
  if (l.includes('focus')) return 'focus';
  if (l.includes('milestone')) return 'milestone';
  if (l.includes('activity')) return 'activity';
  if (l.includes('host') || l.includes('bottom')) return 'host';
  return 'other';
}

export function expandSectionObjects(input: {
  sectionId: string;
  sectionLabel: string;
  sectionBounds: { x: number; y: number; w: number; h: number };
  conceptId: string;
}): ExecutableConceptObject[] {
  const key = normalizeSectionKey(input.sectionLabel);
  if (key === 'host' || key === 'other') return [];
  const templates = SECTION_OBJECT_TEMPLATES[key] ?? [];
  return templates.map((t, i) => {
    const b = t.relBounds;
    const abs = {
      x: input.sectionBounds.x + b.x * input.sectionBounds.w,
      y: input.sectionBounds.y + b.y * input.sectionBounds.h,
      w: b.w * input.sectionBounds.w,
      h: b.h * input.sectionBounds.h,
    };
    const primitive = renderPrimitiveForRole(t.role, t.type);
    return {
      objectId: `exo-${input.sectionId}-${key}-${i + 1}`,
      parentId: input.sectionId,
      sectionId: input.sectionId,
      role: t.role,
      type: t.type,
      bounds: abs,
      renderPrimitive: primitive,
      textContent: t.text ?? null,
      typography: null,
      surface: null,
      color: null,
      border: null,
      assetSlotId: t.type === 'photo' ? `slot-hero-media-${input.sectionId}` : null,
      functionBindingId: null,
      interaction: t.type === 'control' || t.type === 'nav' ? 'interactive' : null,
      zIndex: 10 + i,
      status: 'READY' as const,
    };
  });
}
