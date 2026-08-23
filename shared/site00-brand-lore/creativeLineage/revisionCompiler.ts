/**
 * Compile founder revision spec into delta-based generation brief.
 * Production compiler — output feeds live revision generation when founder approves.
 */

import type { CreativeAssetRecord } from './types.js';
import type {
  AssetExchangeInstruction,
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

function collectHardLocks(spec: CreativeRevisionSpec): string[] {
  return spec.lockedElements.map((key) => `HARD LOCK: ${elementLabel(key)} — preserve exactly`);
}

function collectSoftPreservation(spec: CreativeRevisionSpec): string[] {
  const soft: string[] = [];
  if (spec.preserveUnspecified) {
    soft.push('general editorial density and visual tension');
    soft.push('archival paper texture unless explicitly changed');
    soft.push('unspecified annotation treatment');
  }
  for (const [cat] of Object.entries(spec.categoryNotes)) {
    const el = CATEGORY_TO_ELEMENT[cat as RevisionCategoryKey];
    if (el && spec.elementStates[el] === 'UNSPECIFIED' && !spec.mutableElements.includes(el)) {
      soft.push(`${cat} (soft preservation preference)`);
    }
  }
  return soft;
}

function collectPreserve(spec: CreativeRevisionSpec): string[] {
  const preserve: string[] = collectHardLocks(spec);
  if (spec.preserveUnspecified) {
    preserve.push('all unmentioned dimensions (preserveUnspecified=true — do not invent improvements)');
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
    change.push(`CHANGE ONLY: ${elementLabel(key)}`);
  }
  for (const [cat, note] of Object.entries(spec.categoryNotes)) {
    if (note?.trim()) change.push(`${cat}: ${note.trim()}`);
  }
  for (const c of spec.requestedCopyChanges) change.push(`copy change: ${c}`);
  for (const c of spec.requestedColorChanges) change.push(`color change: ${c}`);
  for (const c of spec.requestedTypographyChanges) change.push(`typography change: ${c}`);
  if (spec.founderOriginalNote.trim()) {
    change.push(`founder note: ${spec.founderOriginalNote.trim()}`);
  }
  return change;
}

function formatAssetExchanges(exchanges: AssetExchangeInstruction[]): string[] {
  return exchanges.map((ex) => {
    const action = ex.replacementType || 'REPLACE';
    return `${action} ${ex.targetElement} → ${ex.replacementDescription}${ex.founderNote ? ` (${ex.founderNote})` : ''}`;
  });
}

function buildDoNot(_ctx: RevisionCompilerContext, spec: CreativeRevisionSpec): string[] {
  const base = [
    'redesign the concept from scratch',
    'change topic',
    `introduce another direction's DNA`,
    'alter locked copy or locked composition unless explicitly unlocked',
    'change Core Direction or world',
  ];
  if (spec.preserveUnspecified) {
    base.push(
      'invent unrelated improvements (new fonts, moved headlines, added objects, paper redesign, crop changes) unless explicitly requested',
    );
  }
  if (spec.severity !== 'REINTERPRET') {
    base.push('rebuild full image specification from scratch');
  }
  return base.filter(Boolean);
}

function buildAntiDriftRules(spec: CreativeRevisionSpec): string[] {
  const rules = [
    'Parent asset is authoritative visual context — edit the delta, do not regenerate inspiration',
    'Requested delta only — preserve approved creative DNA',
  ];
  if (spec.preserveUnspecified) {
    rules.push('Anything not listed as mutable must remain preservation-biased');
  }
  for (const locked of spec.lockedElements) {
    rules.push(`Do not change ${elementLabel(locked)} under any circumstance`);
  }
  return rules;
}

function buildWorldDnaPreserve(ctx: RevisionCompilerContext): string[] {
  return [
    `world: ${ctx.worldId}`,
    `direction: ${ctx.directionName}`,
    ctx.topicName ? `topic: ${ctx.topicName}` : 'topic: preserve parent topic',
    'editorial world DNA from parent — do not migrate to another direction',
  ].filter(Boolean) as string[];
}

function buildBrandDnaPreserve(ctx: RevisionCompilerContext): string[] {
  return [
    `brand: ${ctx.parentAsset.brandSlug}`,
    'client brand typography only — never platform default typography',
    'local color revision must not silently rewrite Brand Canon',
  ];
}

function buildFormatRequirements(ctx: RevisionCompilerContext, spec: CreativeRevisionSpec): string[] {
  const reqs: string[] = [];
  const format = ctx.parentAsset.contentLineage.format;
  if (format) reqs.push(`preserve format: ${format}`);
  if (ctx.parentAsset.contentLineage.slideNumber != null) {
    reqs.push(`carousel slide ${ctx.parentAsset.contentLineage.slideNumber} — single-slide revision only`);
  }
  if (spec.lockedElements.includes('CROP')) reqs.push('preserve exact crop');
  if (spec.lockedElements.includes('FORMAT')) reqs.push('preserve exact format dimensions');
  return reqs;
}

function buildDeltaPrompt(brief: Omit<RevisionGenerationBrief, 'deltaPrompt' | 'compiledAt'>): string {
  const section = (title: string, items: string[]) =>
    items.length ? ['', `${title}:`, ...items.map((p) => `- ${p}`)] : [];

  const lines = [
    'PARENT ASSET ROLE: authoritative visual source — apply surgical delta only',
    `REVISION MODE: ${brief.revisionMode}`,
    `PARENT ASSET ID: ${brief.parentAssetId}`,
    `CORE DIRECTION: ${brief.coreDirection}`,
    `WORLD: ${brief.world}`,
    ...section('PRESERVE EXACTLY', brief.preserve),
    ...section('CHANGE ONLY', brief.change),
    ...section('DO NOT CHANGE', brief.doNot),
    ...section('HARD LOCKS', brief.hardLocks),
    ...section('SOFT PRESERVATION', brief.softPreservation),
    ...section('ASSET EXCHANGES', brief.assetExchanges),
    ...section('ANTI-DRIFT RULES', brief.antiDriftRules),
    ...section('WORLD DNA TO PRESERVE', brief.worldDnaPreserve),
    ...section('BRAND DNA TO PRESERVE', brief.brandDnaPreserve),
    ...section('FORMAT REQUIREMENTS', brief.formatRequirements),
  ];

  if (brief.typographyRevision) lines.push('', 'TYPOGRAPHY DELTA:', brief.typographyRevision);
  if (brief.colorRevision) lines.push('', 'COLOR DELTA:', brief.colorRevision);
  if (brief.compositionRevision) lines.push('', 'COMPOSITION DELTA:', brief.compositionRevision);
  if (brief.copyRevision) lines.push('', 'COPY DELTA:', brief.copyRevision);
  if (brief.imageryRevision) lines.push('', 'IMAGE/OBJECT DELTA:', brief.imageryRevision);

  return lines.join('\n');
}

export function compileCreativeRevision(
  spec: CreativeRevisionSpec,
  ctx: RevisionCompilerContext,
): RevisionGenerationBrief {
  const hardLocks = collectHardLocks(spec);
  const softPreservation = collectSoftPreservation(spec);
  const preserve = collectPreserve(spec);
  const change = collectChange(spec);
  const doNot = buildDoNot(ctx, spec);
  const assetExchanges = formatAssetExchanges(spec.requestedAssetExchange);

  const partial: Omit<RevisionGenerationBrief, 'deltaPrompt' | 'compiledAt'> = {
    revisionMode: spec.severity,
    parentAssetId: spec.parentAssetId,
    coreDirection: ctx.directionName,
    world: ctx.worldId,
    preserve,
    change,
    doNot,
    hardLocks,
    softPreservation,
    antiDriftRules: buildAntiDriftRules(spec),
    typographyRevision: spec.categoryNotes.typography ?? (spec.requestedTypographyChanges.join('; ') || null),
    colorRevision: spec.categoryNotes.color ?? (spec.requestedColorChanges.join('; ') || null),
    compositionRevision: spec.categoryNotes.composition ?? null,
    copyRevision: spec.categoryNotes.copy ?? (spec.requestedCopyChanges.join('; ') || null),
    imageryRevision: spec.categoryNotes.imagery ?? null,
    assetExchanges,
    worldDnaPreserve: buildWorldDnaPreserve(ctx),
    brandDnaPreserve: buildBrandDnaPreserve(ctx),
    formatRequirements: buildFormatRequirements(ctx, spec),
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

export function hashRevisionPrompt(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i);
    hash |= 0;
  }
  return `rev-prompt-${Math.abs(hash).toString(16)}`;
}
