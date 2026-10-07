/**
 * JURNL SAFE TO SPEND family under the Parent → Child Visual Derivation Protocol
 * (P0.JURNL.PARENT-CHILD.VISUAL-DERIVATION.PROTOCOL1 + P0.JURNL.CHECK-PURCHASE.PAY-WITH-DRAWER.MATCH-CATEGORY-DRAWER1).
 *
 * The approved images for this family (IMAGE 1, the CHECK A PURCHASE parent, the SELECT A CATEGORY drawer) are held by
 * the founder and are not in the repository. Anything that depends on measuring them is marked UNMEASURED.
 */
import {
  buildChildDerivationBrief,
  type ChildDerivationSpec,
  type Expression,
  type FamilyConstantKey,
  type FamilyLevel,
} from '../../parent-child-derivation.js';

export const JURNL_FAMILY_DIR = 'JURNL/F09_SAFE/PARENT_CHILD_DERIVATION_PROTOCOL1' as const;

/* ─────────────── D. family constants ─────────────── */

export const JURNL_FAMILY_CONSTANTS: Record<FamilyConstantKey, string[]> = {
  BRAND: ['JURNL identity stays the same on every screen.', 'Tagline: PLAN TODAY. GROW FREELY.', 'Tone: quiet, confident, elegant, clear.'],
  TYPOGRAPHY: ['Uppercase only. No mixed-case UI language.', 'Large serif display moments (JURNL Display) against refined, spaced uppercase support text (JURNL Sans).', 'No casual or generic SaaS type behaviour.'],
  DECORATIVE_LOGO: ['Never reduce JURNL to plain text.', 'Follow the approved composed treatment: official mark, botanical accent, lockup built from the official asset.', 'Decorative is not glowing, tacky or randomly embellished.'],
  SHELL: ['Mobile application shell.', 'Bottom navigation dock unless the screen type replaces it.', 'The immersive world stays behind the UI.', 'No device chrome, no browser chrome, no phone UX at the top unless requested.'],
  RATIO: ['Founder captures: 402×874 pt (1206×2622 @3x). Runtime authority canvas: 393×852 pt. Both ≈ 0.46 (9 : 19.5).', 'Fill the frame: no black bands, no letterbox, no careless crop.'],
};

/* ─────────────── G. family tree ─────────────── */

export type FamilyNode = {
  id: string;
  name: string;
  level: FamilyLevel;
  parent: string | null;
  expressions: Expression[];
  route: string | null;
  authority: 'APPROVED' | 'APPROVED_EXPLORATION' | 'CURRENT' | 'TO_DERIVE';
  authority_source: string;
  note: string;
};

export const SAFE_TO_SPEND_FAMILY: FamilyNode[] = [
  { id: 'F09.00', name: 'SAFE TO SPEND', level: 'PARENT', parent: null, expressions: ['FULL_PAGE'], route: '/production/jurnl/runtime/safe', authority: 'APPROVED', authority_source: 'IMAGE 1 (founder-held) · live route on main', note: 'The family’s visual authority. The live route reconstructs IMAGE 1.' },
  { id: 'F09.WHY', name: 'WHY THIS NUMBER', level: 'DIRECT_DESCENDANT', parent: 'F09.00', expressions: ['FULL_PAGE'], route: '/production/jurnl/runtime/safe/why', authority: 'TO_DERIVE', authority_source: 'runtime (information only)', note: 'The runtime page still uses the generic family chrome and panels; it is an information authority, not a visual one.' },
  { id: 'F09.CHECK', name: 'CHECK A PURCHASE', level: 'DIRECT_DESCENDANT', parent: 'F09.00', expressions: ['FULL_PAGE'], route: '/production/jurnl/runtime/purchases', authority: 'APPROVED', authority_source: 'approved CHECK A PURCHASE parent screen (founder-held)', note: 'Derives from SAFE TO SPEND, not from ACCOUNT. The runtime route still renders the older F10 PURCHASES page.' },
  { id: 'F09.ACCOUNT', name: 'ACCOUNT', level: 'DIRECT_DESCENDANT', parent: 'F09.00', expressions: ['FULL_PAGE', 'DRAWER'], route: '/production/jurnl/runtime/account', authority: 'TO_DERIVE', authority_source: 'menu on the parent', note: 'Full page and drawer are siblings (EXPRESSION_PAIR_RULE). Its page logic must not leak into CHECK A PURCHASE.' },
  { id: 'F09.CHECK.CATEGORY', name: 'SELECT A CATEGORY', level: 'SECONDARY_DESCENDANT', parent: 'F09.CHECK', expressions: ['DRAWER'], route: null, authority: 'APPROVED', authority_source: 'approved SELECT A CATEGORY drawer (founder-held)', note: 'The sizing template for every selection sheet in this flow.' },
  { id: 'F09.CHECK.PAY_WITH', name: 'PAY WITH / SELECT AN ACCOUNT', level: 'SECONDARY_DESCENDANT', parent: 'F09.CHECK', expressions: ['DRAWER'], route: null, authority: 'CURRENT', authority_source: 'current SELECT AN ACCOUNT drawer (founder-held)', note: 'Sibling of SELECT A CATEGORY. Must share its sizing system; only the content differs.' },
];

export const SAFE_TO_SPEND_SIBLING_SHEETS = [['F09.CHECK.CATEGORY', 'F09.CHECK.PAY_WITH']] as const;

/* ─────────────── Part 2. PAY WITH / SELECT AN ACCOUNT drawer ─────────────── */

export const PAY_WITH_ACCOUNTS = [
  { label: 'CHECKING', imagery: 'a linen ledger and brass pen on a sunlit travertine desk' },
  { label: 'SAVINGS', imagery: 'a still sea horizon through a limewashed arch' },
  { label: 'CREDIT CARD', imagery: 'a matte ivory card with a blind emboss on pale marble' },
  { label: 'DEBIT CARD', imagery: 'a slim sage card beside a leather wallet' },
  { label: 'CASH', imagery: 'folded banknotes in a shallow marble bowl' },
  { label: 'JOINT ACCOUNT', imagery: 'two matching espresso cups side by side on a stone ledge' },
] as const;

export const PAY_WITH_DRAWER = {
  id: 'F09.CHECK.PAY_WITH',
  title: 'SELECT AN ACCOUNT',
  subtext: 'CHOOSE THE ACCOUNT YOU WANT TO USE FOR THIS PURCHASE.',
  accounts: PAY_WITH_ACCOUNTS,
  structure: [
    'drag handle at the top, as on SELECT A CATEGORY',
    'centered title and centered supporting line at SELECT A CATEGORY’s sizes',
    'close button where SELECT A CATEGORY has it',
    'tile grid with SELECT A CATEGORY’s columns, tile size, crop, corner radius and gaps',
    'uppercase label under each tile at SELECT A CATEGORY’s label size and tracking',
  ],
  expansion: 'More accounts continue the same grid (same tile size and gaps) using SELECT A CATEGORY’s overflow behaviour, never smaller tiles.',
  sizing_source: 'F09.CHECK.CATEGORY',
  sizing: 'UNMEASURED — measured from the approved SELECT A CATEGORY drawer once it is supplied (SelectionSheetSystem), then checked with checkSiblingSheets.',
  status: 'AWAITING_FOUNDER_INPUTS',
  inputs_required: [
    { role: 'APPROVED_PARENT', what: 'approved CHECK A PURCHASE parent screen' },
    { role: 'APPROVED_SIBLING', what: 'approved SELECT A CATEGORY drawer (the sizing template)' },
    { role: 'CURRENT_SCREEN', what: 'current SELECT AN ACCOUNT drawer (information only)' },
  ],
} as const;

export const PAY_WITH_DERIVATION_SPEC: ChildDerivationSpec = {
  family: 'JURNL SAFE TO SPEND / CHECK A PURCHASE',
  child: 'SELECT AN ACCOUNT',
  level: 'SECONDARY_DESCENDANT',
  expression: 'DRAWER',
  job: 'It opens from PAY WITH so the person can choose the account for this purchase. It is the sibling of IMAGE 2: same template, different content.',
  references: [
    { file: 'CHECK_A_PURCHASE_APPROVED', kind: 'APPROVED_PARENT', role: 'world, materials, sheet panel, radius, type and dock; the drawer opens over it' },
    { file: 'SELECT_A_CATEGORY_APPROVED', kind: 'APPROVED_SIBLING', role: 'the sizing template: handle, header, tiles, crop, radius, gaps, columns, labels' },
    { file: 'SELECT_AN_ACCOUNT_CURRENT', kind: 'CURRENT_SCREEN', role: 'what the drawer lists only; ignore its sizes and spacing' },
  ],
  parent_dna: [
    'the sunlit Mediterranean world softly visible behind the sheet',
    'plaster, stone and olive',
    'the white-beige sheet and its corner radius',
    'serif title over spaced uppercase support text',
  ],
  structure: ['handle, centered title, centered supporting line, close button, tile grid and labels exactly as IMAGE 2'],
  exact_strings: [PAY_WITH_DRAWER.title, PAY_WITH_DRAWER.subtext, ...PAY_WITH_ACCOUNTS.map((a) => a.label)],
  content: PAY_WITH_ACCOUNTS.map((a) => ({ label: a.label, imagery: a.imagery })),
  sizing_rule: 'same tile size, crop, radius, gaps, columns and label size as IMAGE 2. Only pictures and words change.',
  negatives: [
    'phone status bar, home indicator or device frame',
    'lowercase or mixed-case text',
    'tiles larger, smaller or looser than IMAGE 2',
    'legible card numbers, bank names or logos inside the tile pictures',
    'a visual style that does not match IMAGE 1',
  ],
};

export const PAY_WITH_DERIVATION_BRIEF = buildChildDerivationBrief(PAY_WITH_DERIVATION_SPEC);
