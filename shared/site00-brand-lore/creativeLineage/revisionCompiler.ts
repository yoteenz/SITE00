/**
 * Compile founder revision spec into delta-based generation brief.
 * Does NOT invoke image generation — output is gated for future use.
 */

import type { CreativeAssetRecord } from './types.js';
import type {
  CreativeRevisionSpec,
  RevisionCategoryKey,
  RevisionElementKey,
  RevisionGenerationBrief,
  RevisionSeverity,
} from './revisionTypes.js';

export type RevisionCompilerContext = {
  parentAsset: CreativeAssetRecord;
  parentVisualBrief?: Record<string, unknown> | null;
  parentGenerationPrompt?: string | null;
  directionName: string;
  worldId: string;
  topicName?: string | null;
};

const CATEGORY_TO_ELEMENT: Partial<Record<RevisionCategoryKey, RevisionElementKey>> = {
  typography: 'TYPOGRAPHY',
  color: 'COLOR',
  composition: 'COMPOSITION',
  copy: 'COPY',
  imagery: 'ASSETS',
  material: 'MATERIALS',
  annotation: 'ANNOTATIONS',
  hierarchy: 'INFORMATION',
  crop: 'CROP',
  formatBehavior: 'FORMAT',
  motion: 'FORMAT',
};

function elementLabel(key: RevisionElementKey): string {
  return key.replace(/_/g, ' ').toLowerCase();
}

function collectPreserve(spec: CreativeRevisionSpec): string[] {
  const preserve: string[] = [];
  for (const key of spec.lockedElements) {
    preserve.push(elementLabel(key));
  }
  if (spec.preserveUnspecified) {
    preserve.push('all unmentioned dimensions (default surgical preserve)');
  }
  for (const [cat, note] of Object.entries(spec.categoryNotes)) {
    if (!note?.trim()) continue;
    const el = CATEGORY_TO_ELEMENT[cat as RevisionCategoryKey];
    if (el && spec.elementStates[el] === 'UNSPECIFIED' && !spec.mutableElements.includes(el)) {
      preserve.push(`${cat} (unspecified — preserve)`);
    }
  }
  return preserve;
}

function collectChange(spec: CreativeRevisionSpec): string[] {
  const change: string[] = [];
  for (const key of spec.mutableElements) {
    change.push(elementLabel(key));
  }
  for (const [cat, note] of Object.entries(spec.categoryNotes)) {
    if (note?.trim()) change.push(`${cat}: ${note.trim()}`);
  }
  for (const c of spec.requestedCopyChanges) change.push(`copy change: ${c}`);
  for (const c of spec.requestedColorChanges) change.push(`color change: ${c}`);
  for (const c of spec.requestedTypographyChanges) change.push(`typography change: ${c}`);
  for (const ex of spec.requestedAssetExchange) {
    change.push(`exchange ${ex.targetElement} → ${ex.replacementDescription}`);
  }
  if (spec.founderOriginalNote.trim()) {
    change.push(`founder note: ${spec.founderOriginalNote.trim()}`);
  }
  return change;
}

function buildDoNot(_ctx: RevisionCompilerContext, spec: CreativeRevisionSpec): string[] {
  return [
    'redesign the concept from scratch',
    'change topic',
    `introduce another direction's DNA`,
    'alter locked copy or locked composition unless explicitly unlocked',
    'change Core Direction or world',
    ...(spec.severity !== 'REINTERPRET' ? ['rebuild full image specification from scratch'] : []),
  ].filter(Boolean);
}

function buildDeltaPrompt(brief: Omit<RevisionGenerationBrief, 'deltaPrompt' | 'compiledAt'>): string {
  const lines = [
    `REVISION MODE: ${brief.revisionMode}`,
    `PARENT ASSET: ${brief.parentAssetId}`,
    `CORE DIRECTION: ${brief.coreDirection}`,
    `WORLD: ${brief.world}`,
    '',
    'PRESERVE:',
    ...brief.preserve.map((p) => `- ${p}`),
    '',
    'CHANGE:',
    ...brief.change.map((c) => `- ${c}`),
    '',
    'DO NOT:',
    ...brief.doNot.map((d) => `- ${d}`),
  ];
  if (brief.typographyRevision) lines.push('', 'TYPOGRAPHY REVISION:', brief.typographyRevision);
  if (brief.colorRevision) lines.push('', 'COLOR REVISION:', brief.colorRevision);
  if (brief.compositionRevision) lines.push('', 'COMPOSITION REVISION:', brief.compositionRevision);
  if (brief.copyRevision) lines.push('', 'COPY REVISION:', brief.copyRevision);
  if (brief.imageryRevision) lines.push('', 'IMAGE / ASSET REVISION:', brief.imageryRevision);
  return lines.join('\n');
}

export function compileCreativeRevision(
  spec: CreativeRevisionSpec,
  ctx: RevisionCompilerContext,
): RevisionGenerationBrief {
  const preserve = collectPreserve(spec);
  const change = collectChange(spec);
  const doNot = buildDoNot(ctx, spec);

  const partial: Omit<RevisionGenerationBrief, 'deltaPrompt' | 'compiledAt'> = {
    revisionMode: spec.severity,
    parentAssetId: spec.parentAssetId,
    coreDirection: ctx.directionName,
    world: ctx.worldId,
    preserve,
    change,
    doNot,
    typographyRevision: spec.categoryNotes.typography ?? (spec.requestedTypographyChanges.join('; ') || null),
    colorRevision: spec.categoryNotes.color ?? (spec.requestedColorChanges.join('; ') || null),
    compositionRevision: spec.categoryNotes.composition ?? null,
    copyRevision: spec.categoryNotes.copy ?? (spec.requestedCopyChanges.join('; ') || null),
    imageryRevision: spec.categoryNotes.imagery ?? null,
  };

  return {
    ...partial,
    deltaPrompt: buildDeltaPrompt(partial),
    compiledAt: new Date().toISOString(),
  };
}

export function defaultRevisionSeverity(): RevisionSeverity {
  return 'TARGETED';
}

export function preferredGenerationMode(severity: RevisionSeverity): 'IMAGE_EDIT' | 'PROMPT_REGENERATION' {
  if (severity === 'MICRO' || severity === 'TARGETED') return 'IMAGE_EDIT';
  return 'PROMPT_REGENERATION';
}
