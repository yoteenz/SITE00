/**
 * Email asset classes, lineage groups and reuse rules. Assets are decomposed from an approved full email authority —
 * never generated in advance. Nothing in this module points at a real image yet.
 */

import type { EmailAssetClass, EmailFamilyId, EmailId, LineageAction } from './types.js';

export const EMAIL_ASSET_CLASSES: readonly { id: EmailAssetClass; definition: string; layer: 'L1' | 'L2' | 'L3'; rules: readonly string[] }[] = [
  { id: 'EMAIL_ENVIRONMENT', definition: 'Broad contextual visual: still life, architectural scene, crop or texture.', layer: 'L1', rules: ['No text, numbers or UI.', 'Never an app screenshot.', 'Exported 1280 px wide (2×).'] },
  { id: 'EMAIL_ARTIFACT_SHELL', definition: 'The correspondence object with no live content: envelope, dossier, sheet, invitation, ledger head, card edges.', layer: 'L2', rules: ['Blank where live content sits; the body of a sheet is an HTML paper cell, not an image.', 'Edges and heads are sliced so the HTML cell between them can grow.'] },
  { id: 'EMAIL_DECORATIVE_INSERT', definition: 'Classical print, botanical, paper fragment, ribbon, seal, clip.', layer: 'L2', rules: ['Decorative (alt="") unless it carries meaning.', 'No words or figures in seals or prints.'] },
  { id: 'EMAIL_THUMBNAIL', definition: 'Small contextual image (≤ 240 px display).', layer: 'L2', rules: ['Never a product screenshot.'] },
  { id: 'EMAIL_LIVE_CONTENT', definition: 'Headlines, copy, figures, dates, CTAs, links, legal.', layer: 'L3', rules: ['HTML only — never an image.'] },
];

/** Lineage groups: shared materials across the lifecycle. */
export const LINEAGE_GROUPS: readonly { id: string; families: readonly EmailFamilyId[]; emails: readonly EmailId[]; materials: string; /** The email whose approved authority founds the group's assets (null until one exists). */ founder: EmailId | null }[] = [
  { id: 'ARRIVAL', families: ['E01', 'E02'], emails: ['A01', 'A04'], materials: 'morning still life on stone and linen, heavy cream stock, olive emboss', founder: 'A01' },
  { id: 'SECURE_CORRESPONDENCE', families: ['E06'], emails: ['A02', 'A08'], materials: 'plain correspondence card, blind emboss, no environment', founder: 'A02' },
  { id: 'DESK_NOTE', families: ['E05'], emails: ['A03', 'A06'], materials: 'pinned note / desk slip, brass clip, pencil rule', founder: 'A03' },
  { id: 'BRIEFING', families: ['E03'], emails: ['A05'], materials: 'clipped briefing sheet, ledger rules, narrow desk crop', founder: 'A05' },
  { id: 'CEREMONIAL', families: ['E04'], emails: ['A07'], materials: 'ceremonial card, wax / blind seal, burgundy, brass', founder: 'A07' },
  { id: 'FIELD_GUIDE', families: ['E02'], emails: [], materials: 'annotated field guide pages, botanical and architectural plates', founder: null },
  { id: 'EDITORIAL', families: ['E07'], emails: [], materials: 'magazine spreads, broadsides, art-history references — per campaign', founder: null },
];

/** When to reuse, derive, regenerate or create new. */
export const LINEAGE_RULES: readonly { action: LineageAction; when: string; never: string }[] = [
  { action: 'REUSE', when: 'Same lineage group and the asset fits the new email unchanged (same artifact, new crop or new live content).', never: 'Reuse an environment across different lineage groups just to save work.' },
  { action: 'DERIVE', when: 'Same material family, different object or format (A04 entry card from the A01 letter stock; A06 slip from the A03 note).', never: 'Derive across families whose mood conflicts (ceremonial seal into a security email).' },
  { action: 'REGENERATE', when: 'An approved asset fails QA (resolution, artefacts, dark-mode edges) or the founder asks for a revision; keep the slot, replace the file, record the superseded version.', never: 'Regenerate silently; the old version is marked SUPERSEDED, not deleted.' },
  { action: 'CREATE_NEW', when: 'First asset of a lineage group, or a new message type the existing groups cannot carry.', never: 'Create a new world per email.' },
];

export const ASSET_RULES = [
  'PAGE / AUTHORITY FIRST → asset decomposition second. Do not generate random plates in advance.',
  'Every asset records: class, lineage group, lineage action, source authority, approval state, superseded-by.',
  'No live content in any asset (names, figures, dates, CTA labels, links, legal text).',
  'At most one arch or loggia per lineage group; none in SECURE_CORRESPONDENCE.',
] as const;
