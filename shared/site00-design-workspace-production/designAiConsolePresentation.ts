/**
 * P0.VR.DESIGN.OPUS-AI-CONSOLES1 — founder-facing presentation model for the three
 * DESIGN AI consoles (Opus design agent, Grok asset agent, Viewport Authority).
 *
 * The runtime speaks in enums: `BLOCKED_AUTHORITY_PAIR_NOT_LOCKED`, `PAGE_EDIT`,
 * `WAITING_FOR_FOUNDER_REVIEW`. The consoles must speak in sentences a founder can
 * act on. Every mapping lives here — pure, testable, and shared by all three
 * consoles so their status language stays identical.
 */

import type {
  GrokAssetGenerationEligibility,
  GrokEligibilityResult,
  GrokReadinessGateRow,
} from './designGrokAssetEligibility.js';
import type { GrokAssetMode, GrokStagedAsset } from './designGrokAssetModel.js';

/** Shared status tone across all three consoles. Drives the header dot colour. */
export type ConsoleStatusTone = 'READY' | 'BUSY' | 'BLOCKED' | 'REVIEW' | 'IDLE';

export type ConsoleStatus = {
  label: string;
  tone: ConsoleStatusTone;
};

/* ------------------------------------------------------------------ OPUS -- */

export const OPUS_CONSOLE_TABS = [
  { id: 'DESIGN', label: 'DESIGN', purpose: 'Compose and dispatch a page change.' },
  { id: 'REVIEW', label: 'REVIEW', purpose: 'Inspect the proposal Opus produced.' },
  { id: 'CONTEXT', label: 'CONTEXT', purpose: 'What Opus is given, and what it may write.' },
] as const;

export type OpusConsoleTabId = (typeof OPUS_CONSOLE_TABS)[number]['id'];

/**
 * The status vocabulary the sprint specifies — READY / THINKING / TOOL / RENDER /
 * REVIEW / ERROR — mapped from the runtime's own, finer-grained union.
 */
export function opusConsoleStatus(input: {
  runStatus: string | null;
  lastTool: string | null;
  estimating: boolean;
  failed: boolean;
}): ConsoleStatus {
  if (input.failed) return { label: 'ERROR', tone: 'BLOCKED' };
  if (input.estimating) return { label: 'COMPILING', tone: 'BUSY' };
  if (!input.runStatus) return { label: 'READY', tone: 'READY' };
  switch (input.runStatus) {
    case 'THINKING':
      return { label: 'THINKING', tone: 'BUSY' };
    case 'RENDERING':
      return { label: 'RENDER', tone: 'BUSY' };
    case 'TOOL_USE': {
      const tool = input.lastTool ?? '';
      if (tool.includes('compare')) return { label: 'COMPARING', tone: 'BUSY' };
      if (tool.includes('test') || tool.includes('typecheck')) return { label: 'TESTING', tone: 'BUSY' };
      if (tool.includes('patch') || tool.includes('create_file')) return { label: 'PATCHING', tone: 'BUSY' };
      return { label: 'TOOL', tone: 'BUSY' };
    }
    case 'WAITING_FOR_FOUNDER_REVIEW':
      return { label: 'REVIEW', tone: 'REVIEW' };
    case 'FAILED':
      return { label: 'ERROR', tone: 'BLOCKED' };
    case 'APPROVED':
      return { label: 'APPROVED', tone: 'READY' };
    case 'REVERTED':
      return { label: 'REVERTED', tone: 'IDLE' };
    default:
      return { label: input.runStatus.replace(/_/g, ' '), tone: 'IDLE' };
  }
}

/**
 * Display order for the intent control. The runtime lists intents by write-mode
 * rank; the founder scans them by how often they are used, so the two refine
 * intents lead and the three creation intents trail.
 */
export const OPUS_INTENT_ORDER = [
  'REFINE_CURRENT',
  'FIX_VISUAL',
  'FIX_INTERACTION',
  'INSPECT_ONLY',
  'CREATE_PAGE',
  'CREATE_CHILD',
  'CREATE_GRANDCHILD',
] as const;

/** Compact founder wording for an intent — the long spec description stays in a tooltip. */
export const OPUS_INTENT_PRESENTATION: Record<
  string,
  { label: string; impact: 'LOW' | 'MEDIUM' | 'HIGH'; impactNote: string }
> = {
  REFINE_CURRENT: { label: 'REFINE CURRENT', impact: 'LOW', impactNote: 'VISUAL ONLY' },
  FIX_VISUAL: { label: 'FIX VISUAL', impact: 'LOW', impactNote: 'STYLES ONLY' },
  FIX_INTERACTION: { label: 'FIX INTERACTION', impact: 'MEDIUM', impactNote: 'BEHAVIOUR + STATE' },
  INSPECT_ONLY: { label: 'INSPECT ONLY', impact: 'LOW', impactNote: 'NO WRITES' },
  CREATE_PAGE: { label: 'CREATE PAGE', impact: 'HIGH', impactNote: 'NEW ROUTE' },
  CREATE_CHILD: { label: 'CREATE CHILD', impact: 'HIGH', impactNote: 'NEW CHILD PAGE' },
  CREATE_GRANDCHILD: { label: 'CREATE GRANDCHILD', impact: 'HIGH', impactNote: 'NEW DESCENDANT' },
};

/** Mode is a budget decision, so it is presented as duration rather than token ceiling. */
export const OPUS_MODE_PRESENTATION: Record<string, { label: string; time: string; note: string }> = {
  QUICK: { label: 'QUICK', time: '~1-2 MIN', note: 'Narrow context, one pass.' },
  DESIGN: { label: 'DESIGN', time: '~2-5 MIN', note: 'Page context, render and compare.' },
  FORENSIC: { label: 'FORENSIC', time: '~5-12 MIN', note: 'Full context, measured against the golden.' },
};

export type OpusEditScopeRow = {
  id: string;
  label: string;
  allowed: boolean;
  detail: string;
};

const WRITE_MODE_RANK: Record<string, number> = {
  READ_ONLY: 0,
  STYLE_ONLY: 1,
  COMPONENT_ONLY: 2,
  PAGE_EDIT: 3,
  PAGE_CREATE: 4,
  DERIVATIVE_CREATE: 5,
};

/**
 * EDIT SCOPE — what this surface's standing authority actually permits, as five
 * founder-legible capabilities rather than one enum value. Never widened here:
 * the ladder is the same one the runtime enforces.
 */
export function opusEditScopeRows(permittedMode: string | null): OpusEditScopeRow[] {
  const rank = WRITE_MODE_RANK[permittedMode ?? 'READ_ONLY'] ?? 0;
  return [
    { id: 'styles', label: 'PAGE STYLES', allowed: rank >= 1, detail: 'Colour, weight, spacing, geometry.' },
    { id: 'components', label: 'PAGE COMPONENTS', allowed: rank >= 2, detail: 'This page\u2019s own components.' },
    { id: 'interaction', label: 'INTERACTION', allowed: rank >= 3, detail: 'Behaviour and page state.' },
    { id: 'page-create', label: 'PAGE CREATION', allowed: rank >= 4, detail: 'New route and page shell.' },
    { id: 'child-page', label: 'CHILD PAGE', allowed: rank >= 5, detail: 'Derivative pages that inherit this one.' },
  ];
}

export type OpusReferenceInput = {
  id: string;
  label: string;
  src: string | null;
  origin: string;
};

/**
 * References are attached by naming them in the dispatched request, because the
 * runtime takes a task string and reads the page itself — there is no upload
 * channel to pretend into existence. Selecting a reference therefore has one
 * real effect, and this function is it.
 */
export function composeOpusRequest(task: string, references: readonly OpusReferenceInput[]): string {
  const base = task.trim();
  if (references.length === 0) return base;
  const lines = references.map((reference) => `- ${reference.label}: ${reference.src ?? reference.origin}`);
  return `${base}\n\nREFERENCES:\n${lines.join('\n')}`;
}

/** Deterministic context assist — compiled page facts, no model call, no spend. */
export function opusContextAssistText(input: {
  projectSlug: string;
  pageLabel: string;
  viewport: string;
  viewMode: string;
  route: string;
}): string {
  return [
    `Context: ${input.projectSlug.toUpperCase()} · ${input.pageLabel} · ${input.viewMode.toUpperCase()} · ${input.viewport}.`,
    `Route: ${input.route}.`,
    'Keep the approved DESIGN workspace grammar: thin borders, paper surfaces, lime for the active state.',
  ].join(' ');
}

/* ------------------------------------------------------------------ GROK -- */

export const GROK_CONSOLE_TABS = [
  { id: 'GENERATE', label: 'GENERATE', modes: ['PAGE_ASSET_PACK', 'SINGLE_ASSET', 'ICON_SYSTEM'] },
  { id: 'VARIATIONS', label: 'VARIATIONS', modes: ['ASSET_VARIATION'] },
  { id: 'EDIT', label: 'EDIT', modes: ['REPLACE_ASSET'] },
  { id: 'LIBRARY', label: 'LIBRARY', modes: [] },
] as const;

export type GrokConsoleTabId = (typeof GROK_CONSOLE_TABS)[number]['id'];

export function grokModesForTab(tab: GrokConsoleTabId): readonly GrokAssetMode[] {
  const entry = GROK_CONSOLE_TABS.find((candidate) => candidate.id === tab);
  return (entry?.modes ?? []) as readonly GrokAssetMode[];
}

export const GROK_MODE_LABELS: Record<GrokAssetMode, string> = {
  PAGE_ASSET_PACK: 'PAGE ASSET PACK',
  SINGLE_ASSET: 'SINGLE ASSET',
  ICON_SYSTEM: 'ICON SYSTEM',
  REPLACE_ASSET: 'REPLACE ASSET',
  ASSET_VARIATION: 'ASSET VARIATION',
};

/**
 * Translated eligibility. `shortReason` from the gating model is written for an
 * operator; the console needs a headline, one instruction, and a tone.
 */
export function grokConsoleStatus(result: GrokEligibilityResult): ConsoleStatus & {
  headline: string;
  instruction: string;
} {
  const map: Record<GrokAssetGenerationEligibility, { label: string; tone: ConsoleStatusTone; headline: string; instruction: string }> = {
    ELIGIBLE: {
      label: 'READY',
      tone: 'READY',
      headline: 'ASSET PRODUCTION READY',
      instruction: 'Generate page assets against the approved design target.',
    },
    BLOCKED_NO_PAGE_CONCEPT: {
      label: 'NOT READY',
      tone: 'BLOCKED',
      headline: 'ASSET PRODUCTION BLOCKED',
      instruction: 'Complete page concept workflow first.',
    },
    BLOCKED_CONCEPTS_NOT_APPROVED: {
      label: 'NOT READY',
      tone: 'BLOCKED',
      headline: 'ASSET PRODUCTION BLOCKED',
      instruction: 'Promote a mobile and a desktop design first.',
    },
    BLOCKED_AUTHORITY_PAIR_NOT_LOCKED: {
      label: 'NOT READY',
      tone: 'BLOCKED',
      headline: 'ASSET PRODUCTION BLOCKED',
      instruction: 'Complete Authority Pair first.',
    },
    BLOCKED_TWIN_NOT_CREATED: {
      label: 'NOT READY',
      tone: 'BLOCKED',
      headline: 'ASSET PRODUCTION BLOCKED',
      instruction: 'Build the twin page before producing assets.',
    },
    BLOCKED_TWIN_NOT_REVIEWABLE: {
      label: 'NOT READY',
      tone: 'BLOCKED',
      headline: 'ASSET PRODUCTION BLOCKED',
      instruction: 'Review the twin page before producing assets.',
    },
    BLOCKED_NO_CURRENT_CAPTURE: {
      label: 'NOT READY',
      tone: 'BLOCKED',
      headline: 'ASSET PRODUCTION BLOCKED',
      instruction: 'Capture the current screen so Grok can see it.',
    },
    BLOCKED_GROK_NOT_NEEDED: {
      label: 'NOT REQUIRED',
      tone: 'IDLE',
      headline: 'ASSET PRODUCTION NOT REQUIRED',
      instruction: 'This page is marked as needing no Grok assets.',
    },
  };
  const entry = map[result.eligibility];
  return { label: entry.label, tone: entry.tone, headline: entry.headline, instruction: entry.instruction };
}

export type GrokReadinessCell = {
  id: string;
  label: string;
  state: 'PASS' | 'PENDING' | 'LOCKED';
  note: string;
};

/**
 * The compact four-cell readiness strip. The nine runtime gates are collapsed to
 * the four the founder acts on; a collapsed cell passes only when all of its
 * underlying gates pass, so nothing is hidden by the summary.
 */
export function grokReadinessStrip(gates: readonly GrokReadinessGateRow[]): GrokReadinessCell[] {
  const status = (id: string) => gates.find((gate) => gate.id === id)?.status ?? 'BLOCKED';
  const all = (...ids: string[]) => ids.every((id) => status(id) === 'PASS' || status(id) === 'OPTIONAL');

  const conceptPass = all('page_concepts');
  const pairPass = all('mobile_promoted', 'desktop_promoted', 'pair_review', 'authority_locked');
  const handoffPass = all('composer_handoff');
  const readyPass = all('twin_created', 'twin_review', 'current_capture') && conceptPass && pairPass && handoffPass;

  return [
    {
      id: 'page-concept',
      label: 'PAGE CONCEPT',
      state: conceptPass ? 'PASS' : 'PENDING',
      note: conceptPass ? 'Complete' : 'Pending',
    },
    {
      id: 'authority-pair',
      label: 'AUTHORITY PAIR',
      state: pairPass ? 'PASS' : 'LOCKED',
      note: pairPass ? 'Locked' : 'Not locked',
    },
    {
      id: 'composer-handoff',
      label: 'COMPOSER HANDOFF',
      state: handoffPass ? 'PASS' : 'PENDING',
      note: handoffPass ? 'Sent' : 'Pending',
    },
    {
      id: 'ready-for-assets',
      label: 'READY FOR ASSETS',
      state: readyPass ? 'PASS' : 'PENDING',
      note: readyPass ? 'Ready' : 'Pending',
    },
  ];
}

export type GrokAssetCategoryId = 'ALL' | 'IMAGES' | 'ICONS' | 'TEXTURES' | 'LAYOUTS';

const CATEGORY_BY_SLOT: { match: RegExp; category: Exclude<GrokAssetCategoryId, 'ALL'> }[] = [
  { match: /icon/i, category: 'ICONS' },
  { match: /texture|grain|noise/i, category: 'TEXTURES' },
  { match: /layout|grid|plate|frame/i, category: 'LAYOUTS' },
];

export function grokAssetCategory(asset: Pick<GrokStagedAsset, 'slot'>): Exclude<GrokAssetCategoryId, 'ALL'> {
  const hit = CATEGORY_BY_SLOT.find((entry) => entry.match.test(asset.slot));
  return hit?.category ?? 'IMAGES';
}

/**
 * Only the categories the page actually has. A filter row advertising four empty
 * buckets is a filter row that lies about what was generated.
 */
export function grokAssetCategories(
  assets: readonly Pick<GrokStagedAsset, 'slot'>[],
): { id: GrokAssetCategoryId; label: string; count: number }[] {
  const counts = new Map<GrokAssetCategoryId, number>();
  for (const asset of assets) {
    const category = grokAssetCategory(asset);
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  const present = (['IMAGES', 'ICONS', 'TEXTURES', 'LAYOUTS'] as const).filter((id) => counts.has(id));
  return [
    { id: 'ALL' as const, label: 'ALL', count: assets.length },
    ...present.map((id) => ({ id: id as GrokAssetCategoryId, label: id, count: counts.get(id) ?? 0 })),
  ];
}

export function grokAssetDisplayName(asset: Pick<GrokStagedAsset, 'slot' | 'assetId' | 'format'>): string {
  const suffix = asset.assetId.slice(-4);
  return `${asset.slot.replace(/[^a-z0-9]+/gi, '_')}_${suffix}.${asset.format.toLowerCase()}`;
}

/* ------------------------------------------------- VIEWPORT AUTHORITY ----- */

export const AUTHORITY_CONSOLE_TABS = [
  { id: 'MOBILE', label: 'MOBILE AUTHORITY' },
  { id: 'DESKTOP', label: 'DESKTOP AUTHORITY' },
] as const;

export type AuthorityDetailRow = { label: string; value: string };

export function authorityDetailRows(input: {
  pageLabel: string;
  conceptLabel: string | null;
  viewport: 'MOBILE' | 'DESKTOP';
  versionLabel: string | null;
  versionStatus: string | null;
  createdAt: string | null;
  authorityId: string;
  isInitial: boolean;
}): AuthorityDetailRow[] {
  return [
    { label: 'PAGE', value: input.pageLabel.toUpperCase() },
    { label: 'CONCEPT', value: (input.conceptLabel ?? 'NOT SET').toUpperCase() },
    { label: 'VIEWPORT', value: input.viewport },
    { label: 'TYPE', value: input.isInitial ? 'INITIAL AUTHORITY' : 'REVISED AUTHORITY' },
    { label: 'CREATED', value: input.createdAt ? input.createdAt.slice(0, 10) : '—' },
    { label: 'REFERENCE', value: `${input.authorityId.split(':').pop() ?? input.authorityId}-${input.versionLabel ?? 'v1'}`.toUpperCase() },
    { label: 'STATUS', value: (input.versionStatus ?? 'DRAFT').toUpperCase() },
  ];
}

export function authorityTags(input: { viewport: 'MOBILE' | 'DESKTOP'; hasMessages: boolean; isActive: boolean }): string[] {
  const tags = [input.viewport.toLowerCase(), 'authority', 'founder'];
  if (input.hasMessages) tags.push('cgpt');
  if (input.isActive) tags.push('active');
  return tags;
}

export const AUTHORITY_UPLOAD_FORMATS = ['PNG', 'JPG', 'WEBP'] as const;
export const AUTHORITY_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export function authorityUploadRejection(file: { type: string; size: number }): string | null {
  if (!/^image\/(png|jpeg|webp)$/i.test(file.type)) return 'UNSUPPORTED FORMAT — PNG, JPG OR WEBP ONLY';
  if (file.size > AUTHORITY_UPLOAD_MAX_BYTES) return 'FILE TOO LARGE — 10MB MAXIMUM';
  return null;
}

export function formatClockTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${minutes} ${suffix}`;
}
