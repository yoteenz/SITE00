/**
 * JURNL EDITORIAL CORRESPONDENCE — system doctrine: identity, creative doctrine, layer model, ownership matrix,
 * typography, material grammar, restraint, copy constraints, production lifecycle, pipeline and agent roles.
 */

import type { AgentRole, CaseRule, EmailLayerId, EmailProductionState, Ownership } from './types.js';

export const JURNL_EMAIL_SPRINT = 'P0.JURNL.EMAIL-ENGINE.CANONICAL-ARCHITECTURE-AND-CREATIVE-INFRASTRUCTURE1';

/** Canonical names. Do not rename casually. */
export const JURNL_EMAIL_SYSTEM = {
  name: 'JURNL EDITORIAL CORRESPONDENCE',
  collection: 'JURNL EMAILS v1',
  /** Repository folder (exports, contracts, manifests, review). */
  root: 'JURNL EMAILS v1',
  /** Single source of truth for everything exported under the root. */
  source: 'shared/jurnl-email-engine',
  centralIdea: { app: 'ENVIRONMENT AS INTERFACE', email: 'ARTIFACT AS INTERFACE' },
} as const;

/** Core creative doctrine. */
export const CREATIVE_DOCTRINE = {
  statement:
    'A JURNL EMAIL SHOULD FEEL LIKE SOMETHING RECEIVED FROM A BEAUTIFUL PRIVATE FINANCIAL ATELIER — NOT SOMETHING SENT BY A FINTECH CRM.',
  positioning: 'EDITORIAL CORRESPONDENCE FROM A PRIVATE FINANCIAL ATELIER.',
  principles: [
    'The email itself behaves like a physical correspondence artifact: a letter, a financial brief, a clipped note, a correspondence card, an invitation, a dossier, an archival index, a printed review, a ledger insert, a milestone notice, a private access credential.',
    'The surrounding imagery may reference the larger JURNL world, but the communication artifact is the primary object.',
    'The artifact carries the message; the message itself is live HTML. Imagery never carries words, numbers, links or anything the reader must act on.',
    'Every email belongs to a family and inherits its artifact grammar, mood and restraint; states are variants of one template, not new designs.',
    'Correspondence has lineage: emails in one family share materials, so a reader recognizes JURNL across the whole lifecycle.',
    'Security and account mail is the plainest family: clarity, trust and legibility outrank expression.',
  ],
  isNot: [
    'mini app screens',
    'generic newsletters',
    'SaaS email templates',
    'HTML replicas of the mobile product',
    'Canva-style marketing cards',
    'giant flattened images',
    'repetitive Mediterranean arches',
    'generic fintech CRM emails',
    'entire app screenshots as email backgrounds',
    'one universal email design for every message type',
    'scrapbook collage',
  ],
  feelsLike: ['a letter', 'a financial brief', 'a clipped note', 'a correspondence card', 'an invitation', 'a dossier', 'an archival index', 'a printed review', 'a ledger insert', 'a milestone notice', 'a private access credential'],
  legacyRule: 'LEGACY IMPLEMENTATION IS NOT VISUAL AUTHORITY. Existing triggers, providers, routes, auth flows and delivery may be preserved where valid; their templates are not the design.',
} as const;

/** The failures this system exists to prevent, and the rule that prevents each. */
export const PREVENTED_FAILURES: readonly { failure: string; prevention: string }[] = [
  { failure: 'generic newsletter templates', prevention: 'Every template derives from a family artifact grammar (families.ts); no family is a newsletter.' },
  { failure: 'giant image-only emails', prevention: 'Layer model: L3–L5 are HTML; the image-blocked state must still read completely (responsive.ts IMAGE_BLOCKED).' },
  { failure: 'duplicated Mediterranean scenes', prevention: 'Asset lineage: environments are reused per lineage group, and arches are capped (assets.ts).' },
  { failure: 'baked text that cannot personalize', prevention: 'Ownership matrix: names, figures, dates, CTAs and links are HTML only.' },
  { failure: 'illegible mobile email layouts', prevention: 'Responsive rules: 16 px body minimum, single column under 480 px, 44 px tap targets.' },
  { failure: 'inconsistent hierarchy', prevention: 'One primary gesture + one secondary detail + one contrast anchor; heading order gates.' },
  { failure: 'random art-history motifs', prevention: 'Motifs come from the material grammar and the lineage group, not per email.' },
  { failure: 'every email receiving a completely unrelated design', prevention: 'Family inheritance and lineage groups; states are variants of one template.' },
  { failure: 'marketing language leaking into security messages', prevention: 'Consent firewall: TRANSACTIONAL forbids marketing modules (EC05 campaign use, EC17 promo) and promotional copy.' },
  { failure: 'transactional messages becoming promotional', prevention: 'Firewall + component permissions per consent class.' },
  { failure: 'typography drift', prevention: 'Typography rules per role (TYPOGRAPHY) with case rules.' },
  { failure: 'inaccessible CTAs', prevention: 'CTA is live HTML, ≥ 44 px tall, descriptive label, ≥ 4.5:1 contrast.' },
  { failure: 'broken dark-mode / mobile rendering', prevention: 'Dark-mode approximation and fallback backgrounds are QA gates.' },
  { failure: 'asset duplication', prevention: 'Asset manifest + REUSE / DERIVE / REGENERATE / CREATE_NEW decision rules.' },
  { failure: 'unclear trigger ownership', prevention: 'Trigger contracts name the source system and its status (exists / state exists / proposed).' },
  { failure: 'no correspondence lineage across the lifecycle', prevention: 'Lineage manifest: every template names its lineage group and the assets it inherits.' },
];

/** L0–L5. Hard rule: L3–L5 are never flattened into generated imagery. */
export const LAYER_MODEL: readonly { id: EmailLayerId; name: string; owner: Ownership; holds: string[]; optional: boolean }[] = [
  { id: 'L0', name: 'EMAIL CANVAS', owner: 'HTML', holds: ['email-safe outer background colour', 'fallback field when images are blocked'], optional: false },
  { id: 'L1', name: 'ENVIRONMENTAL / CAMPAIGN ART', owner: 'IMAGE', holds: ['generated still life', 'architectural scene', 'crop', 'texture', 'contextual photograph'], optional: true },
  { id: 'L2', name: 'CORRESPONDENCE ARTIFACT', owner: 'IMAGE', holds: ['letter', 'broadside', 'dossier', 'invitation', 'clipped briefing sheet', 'archival index', 'ledger sheet'], optional: false },
  { id: 'L3', name: 'LIVE EMAIL CONTENT', owner: 'HTML', holds: ['headline', 'copy', 'personalization', 'financial figures', 'status', 'dates', 'account details'], optional: false },
  { id: 'L4', name: 'LIVE ACTIONS', owner: 'HTML', holds: ['CTA', 'secondary link', 'security action', 'preference controls where appropriate'], optional: false },
  { id: 'L5', name: 'SYSTEM / LEGAL', owner: 'HTML', holds: ['sender identity', 'unsubscribe where required', 'preferences', 'privacy / legal', 'mailing address / compliance', 'security footer where appropriate'], optional: false },
];
export const LAYER_HARD_RULE = 'DO NOT FLATTEN L3–L5 INTO GENERATED IMAGERY.';

/** What imagery may own, and what live HTML must own. */
export const OWNERSHIP_MATRIX = {
  imageMayOwn: [
    'environment photography',
    'classical fragments',
    'paper texture',
    'envelope',
    'dossier',
    'card stock',
    'clipped paper',
    'brass objects',
    'ribbon',
    'botanical elements',
    'still-life compositions',
    'background collage',
    'nonfunctional embellishment',
    'physical artifact shells',
  ],
  htmlMustOwn: [
    "user's name",
    'email address',
    'financial values',
    'Safe to Spend values',
    'bill amounts',
    'due dates',
    'dates',
    'percentages',
    'dynamic state',
    'account status',
    'CTA labels',
    'links',
    'verification codes',
    'reset links',
    'security information',
    'unsubscribe links',
    'preference controls',
    'personalized recommendations',
    'legally required text',
    'subject, preheader and headline',
  ],
} as const;

/** One primary editorial gesture + one secondary tactile detail + one contrast anchor. */
export const RESTRAINT_RULE = {
  formula: 'ONE PRIMARY EDITORIAL GESTURE + ONE SECONDARY TACTILE DETAIL + ONE CONTRAST ANCHOR',
  never: 'EMAIL MUST NOT BECOME SCRAPBOOK COLLAGE. Do not use every motif at once.',
  perFamilyCeiling: 'E06 uses at most the artifact and one tactile detail (no environment art); E07 may add one more editorial gesture.',
} as const;

/** Typography: strong uppercase language where it is short; sentence case where people read. */
export const TYPOGRAPHY: readonly { role: string; face: 'EDITORIAL_SERIF' | 'SANS'; caseRule: CaseRule; desktopPx: [number, number]; mobilePx: [number, number]; tracking: string; note: string }[] = [
  { role: 'DISPLAY HEADLINE', face: 'EDITORIAL_SERIF', caseRule: 'UPPERCASE_OR_DESIGNED_TITLE_CASE', desktopPx: [34, 44], mobilePx: [28, 34], tracking: '-0.01em', note: 'Per authority: uppercase for short declaratives, designed title case for longer lines.' },
  { role: 'EYEBROW', face: 'SANS', caseRule: 'UPPERCASE', desktopPx: [11, 12], mobilePx: [11, 12], tracking: '0.22em', note: 'Family label or date line above the headline.' },
  { role: 'SECTION LABEL', face: 'SANS', caseRule: 'UPPERCASE', desktopPx: [11, 12], mobilePx: [11, 12], tracking: '0.2em', note: 'COMING · MOVED · YOUR PLAN.' },
  { role: 'FIGURE', face: 'EDITORIAL_SERIF', caseRule: 'UPPERCASE', desktopPx: [32, 48], mobilePx: [28, 40], tracking: '0', note: 'Lining figures; live HTML only.' },
  { role: 'CTA', face: 'SANS', caseRule: 'UPPERCASE', desktopPx: [13, 14], mobilePx: [14, 15], tracking: '0.18em', note: 'Descriptive verb + object: VERIFY MY EMAIL, OPEN MY WEEK.' },
  { role: 'SHORT STATUS COPY', face: 'SANS', caseRule: 'UPPERCASE', desktopPx: [12, 13], mobilePx: [12, 13], tracking: '0.14em', note: 'Five words or fewer: ON TRACK. NEEDS A LOOK.' },
  { role: 'LONG-FORM BODY', face: 'SANS', caseRule: 'SENTENCE_CASE', desktopPx: [16, 17], mobilePx: [16, 17], tracking: '0.01em', note: 'Never uppercase. Line height 1.55–1.65. 60–70 characters per line on desktop.' },
  { role: 'LEGAL / SUPPORTING BODY', face: 'SANS', caseRule: 'SENTENCE_CASE', desktopPx: [12, 13], mobilePx: [12, 13], tracking: '0.01em', note: 'Sentence case, never below 12 px.' },
];
export const TYPE_STACKS = {
  EDITORIAL_SERIF: "'Playfair Display', Georgia, 'Times New Roman', serif",
  SANS: "'Jost', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  note: 'Web fonts are progressive: many clients drop them, so every role must read in its fallback. The app ships a renamed Playfair (JURNL Authority Serif) and Jost; email may only link the original Google-hosted families or fall back.',
} as const;

/** JURNL voice. */
export const VOICE = {
  is: ['calm confidence', 'clarity', 'precision', 'human', 'direct'],
  isNot: ['finance-bro', 'robotic', 'flowery for ordinary system communication'],
} as const;

/** Financial nudges inform; they never shame. */
export const NUDGE_COPY_CONSTRAINT = {
  rule: 'JURNL INFORMS, IT DOES NOT SHAME.',
  avoid: ['fear language', 'guilt', 'moral judgment', 'panic', 'manipulative urgency', '“bad spending” language', 'countdown pressure', 'loss framing for engagement'],
  prefer: ['THIS MAY NEED A SECOND LOOK.', 'HERE’S WHAT CHANGED.', 'THIS PURCHASE WOULD CHANGE YOUR PLAN.', 'YOU STILL HAVE OPTIONS.'],
  bannedWords: ['bad', 'overspent', 'irresponsible', 'warning', 'urgent', 'act now', 'last chance', 'mistake', 'failed to', 'you should have'],
} as const;

/** Reusable correspondence materials. */
export const MATERIAL_GRAMMAR = {
  base: ['ivory', 'bone', 'warm cream', 'stone', 'plaster', 'linen', 'deckled paper'],
  contrast: ['deep olive', 'black editorial ink', 'burgundy / oxblood', 'dark green marble', 'aged brass'],
  signature: [
    'olive emboss',
    'burgundy registration strip',
    'linen-bound folio',
    'brass fastener',
    'clipped note',
    'archival index',
    'correspondence envelope',
    'antiquarian print',
    'architectural engraving',
    'classical relief / sculpture fragment',
    'botanical study',
  ],
  /** HTML-safe tokens that match the materials (used by L0 and L3–L5). */
  tokens: {
    canvas: '#EFE9DF',
    paper: '#F7F2E8',
    ink: '#16130E',
    inkSoft: '#3D372D',
    mute: '#6F6658',
    olive: '#2C3220',
    burgundy: '#6B1F22',
    rule: '#CFC5B4',
    brass: '#9C7A3C',
    darkCanvas: '#1C1A16',
    darkPaper: '#26231D',
    darkInk: '#EFE8DB',
  },
  motifCaps: [
    'At most one arch or loggia view per lineage group; never in E06.',
    'Classical fragments are cropped and partial — never a full statue as a mascot.',
    'One botanical per email.',
  ],
} as const;

/** Production lifecycle, in order. SUPERSEDED / ARCHIVED are terminal side states. */
export const PRODUCTION_STATES: readonly { state: EmailProductionState; meaning: string; requiresFounder: boolean }[] = [
  { state: 'PLANNED', meaning: 'Named in the email ontology; no contract yet.', requiresFounder: false },
  { state: 'CONTRACT_READY', meaning: 'Message contract complete: purpose, trigger, consent class, personalization, copy fields, components.', requiresFounder: false },
  { state: 'CREATIVE_READY', meaning: 'Creative territory chosen inside the family grammar; ready for an authority design.', requiresFounder: false },
  { state: 'AUTHORITY_IN_REVIEW', meaning: 'A full email authority (mobile + desktop) is with the founder.', requiresFounder: false },
  { state: 'AUTHORITY_APPROVED', meaning: 'The founder approved the full authority.', requiresFounder: true },
  { state: 'ASSETS_READY', meaning: 'Assets decomposed from the approved authority and fabricated; founder approved them.', requiresFounder: true },
  { state: 'IMPLEMENTATION_READY', meaning: 'Template spec, assets and fixtures complete for implementation.', requiresFounder: false },
  { state: 'IMPLEMENTED', meaning: 'Email-safe HTML template exists and renders with fixtures.', requiresFounder: false },
  { state: 'RESPONSIVE_QA', meaning: 'Client matrix, image-blocked and dark-mode checks pass.', requiresFounder: false },
  { state: 'DELIVERY_QA', meaning: 'Provider delivery, links, suppression and idempotency verified with test recipients.', requiresFounder: false },
  { state: 'APPROVED', meaning: 'Founder approved the implemented email for release.', requiresFounder: true },
  { state: 'LIVE', meaning: 'Sending to real recipients.', requiresFounder: true },
  { state: 'SUPERSEDED', meaning: 'Replaced by a newer approved template; kept as a record.', requiresFounder: false },
  { state: 'ARCHIVED', meaning: 'Retired; never sent.', requiresFounder: false },
];
export const APPROVAL_RULE = 'Founder approval is never inferred. A state that requires the founder can only be set from an explicit founder decision recorded with a date.';

/** The future pipeline. Full email authority before asset decomposition. */
export const GENERATION_PIPELINE: readonly { step: number; name: string; owner: AgentRole[]; output: string }[] = [
  { step: 1, name: 'MESSAGE CONTRACT', owner: ['OPUS'], output: 'contract in shared/jurnl-email-engine/contracts.ts' },
  { step: 2, name: 'EMAIL FAMILY', owner: ['OPUS'], output: 'family + lineage group assignment' },
  { step: 3, name: 'CREATIVE TERRITORY', owner: ['OPUS', 'GROK_OPENART'], output: 'artifact, primary gesture, secondary detail, contrast anchor' },
  { step: 4, name: 'FULL EMAIL AUTHORITY', owner: ['GROK_OPENART', 'OPUS'], output: 'one complete email image per viewport, with sample copy, for review only' },
  { step: 5, name: 'FOUNDER REVIEW', owner: ['FOUNDER'], output: 'approve / revise' },
  { step: 6, name: 'RESPONSIVE AUTHORITY', owner: ['OPUS'], output: 'mobile and desktop authorities + image-blocked plan' },
  { step: 7, name: 'ASSET DECOMPOSITION', owner: ['OPUS'], output: 'asset list: class, lineage action, live-content zones removed' },
  { step: 8, name: 'SIDEKICK / ARTIFACT GENERATION', owner: ['GROK_OPENART'], output: 'clean shells, inserts, environments — no live content' },
  { step: 9, name: 'FOUNDER APPROVAL', owner: ['FOUNDER'], output: 'assets approved' },
  { step: 10, name: 'TEMPLATE IMPLEMENTATION', owner: ['COMPOSER'], output: 'email-safe HTML template + plain-text fallback' },
  { step: 11, name: 'PROVIDER INTEGRATION', owner: ['COMPOSER'], output: 'delivery through the provider-neutral contract' },
  { step: 12, name: 'EMAIL CLIENT QA', owner: ['COMPOSER', 'OPUS'], output: 'client matrix pass' },
  { step: 13, name: 'DELIVERY QA', owner: ['COMPOSER'], output: 'test-recipient delivery, links, suppression' },
  { step: 14, name: 'LIVE', owner: ['FOUNDER'], output: 'founder releases' },
];
export const PIPELINE_HARD_RULE = 'FULL EMAIL AUTHORITY BEFORE ASSET DECOMPOSITION. Do not generate random plates in advance.';

export const AGENT_RESPONSIBILITIES: readonly { role: AgentRole; owns: string[]; never: string[] }[] = [
  { role: 'GROK_OPENART', owns: ['creative visual generation', 'full email authorities (images)', 'asset fabrication: shells, inserts, environments'], never: ['live copy inside final assets', 'final copy decisions', 'template code'] },
  { role: 'OPUS', owns: ['creative architecture', 'email authority methodology', 'UX / composition', 'asset decomposition', 'visual QA', 'contract authoring'], never: ['repetitive production code across many templates', 'provider migrations'] },
  { role: 'COMPOSER', owns: ['HTML / template engineering', 'trigger wiring', 'provider integration', 'tests', 'rendering QA', 'repetitive propagation across templates'], never: ['changing families, doctrine or approved authorities', 'inferring approval'] },
  { role: 'FOUNDER', owns: ['authority approval', 'asset approval', 'release to LIVE', 'final copy approval'], never: [] },
];

/** What may be measured, without letting metrics distort the brand. */
export const ANALYTICS_MODEL = {
  events: [
    { id: 'DELIVERED', note: 'Provider acceptance / delivery webhook.' },
    { id: 'BOUNCED', note: 'Hard bounces suppress the address for non-critical classes.' },
    { id: 'OPENED', note: 'Only where the provider reports it and it is meaningful; Apple Mail Privacy Protection inflates opens, so never optimize on it.' },
    { id: 'CTA_CLICKED', note: 'Tagged per component (EC07 / EC08 / EC15).' },
    { id: 'DEEP_LINK_OPENED', note: 'The app route opened from the email link.' },
    { id: 'UNSUBSCRIBED', note: 'Per preference category; applied immediately.' },
    { id: 'PREFERENCE_CHANGED', note: 'From the preference centre once it exists.' },
    { id: 'CONVERSION_EVENT', note: 'Only a product-truth event (e.g. setup completed after A03), never a proxy.' },
  ],
  guardrails: [
    'No open-rate or click-rate targets for E06 (security) — success is the user completing the action.',
    'No re-send loops on non-open; cooldowns are fixed by contract, not tuned for engagement.',
    'No streaks, scores or urgency mechanics.',
    'Analytics never changes what a TRANSACTIONAL email says.',
    'Link tracking must not break security links: verification and reset links are never wrapped by click tracking.',
  ],
} as const;
