/**
 * JURNL SAFE TO SPEND family under the Parent → Child Visual Derivation Protocol
 * (P0.JURNL.PARENT-CHILD.VISUAL-DERIVATION.PROTOCOL1 + P0.JURNL.CHECK-PURCHASE.PAY-WITH-DRAWER.MATCH-CATEGORY-DRAWER1).
 *
 * The founder's nine reference images are in JURNL/F09_SAFE/REFERENCE_REPLICA1/REFERENCES (REFERENCE_FILES). The runtime
 * builds them as replicas (P0.JURNL.F09.REFERENCE-REPLICA1); SELECT A CATEGORY is measured below and SELECT AN ACCOUNT is
 * built on that measured system.
 */
import {
  buildChildDerivationBrief,
  checkSiblingSheets,
  type SelectionSheetSystem,
  type ChildDerivationSpec,
  type Expression,
  type FamilyConstantKey,
  type FamilyLevel,
} from '../../parent-child-derivation.js';

export const JURNL_FAMILY_DIR = 'JURNL/F09_SAFE/PARENT_CHILD_DERIVATION_PROTOCOL1' as const;
export const JURNL_REFERENCE_DIR = 'JURNL/F09_SAFE/REFERENCE_REPLICA1/REFERENCES' as const;

/** The founder reference images (853 × 1844, one 852 × 1847). Role: what each one is authority for. */
export const REFERENCE_FILES = [
  { node: 'F09.00', file: '01_SAFE_TO_SPEND.png', role: 'APPROVED', note: 'Parent. Shows the lockup, tagline and menu; the 9:41 status bar and home indicator are the phone, not JURNL.' },
  { node: 'F09.WHY', file: '02_WHY_THIS_NUMBER.png', role: 'APPROVED', note: 'Direct descendant, full page.' },
  { node: 'F09.ACCOUNT', file: '03_ACCOUNT_PAGE_1.png', role: 'APPROVED', note: 'Full page, continuation 1 of 3. Its shell is the shell of all three.' },
  { node: 'F09.ACCOUNT', file: '04_ACCOUNT_PAGE_2.png', role: 'APPROVED', note: 'Continuation 2 of 3.' },
  { node: 'F09.ACCOUNT', file: '05_ACCOUNT_PAGE_3.png', role: 'APPROVED', note: 'Continuation 3 of 3.' },
  { node: 'F09.ACCOUNT', file: '06_ACCOUNT_DRAWER.png', role: 'APPROVED', note: 'Drawer expression. One line is mixed case in the image; built uppercase (family rule).' },
  { node: 'F09.CHECK', file: '07_CHECK_A_PURCHASE.png', role: 'APPROVED', note: 'Direct descendant; parent of both selection sheets.' },
  { node: 'F09.CHECK.CATEGORY', file: '08_SELECT_A_CATEGORY.png', role: 'APPROVED', note: 'The sizing template (CATEGORY_SHEET_SYSTEM).' },
  { node: 'F09.CHECK.PAY_WITH', file: '09_SELECT_AN_ACCOUNT_CURRENT.png', role: 'CURRENT', note: 'Information only: what the drawer lists. Its 2-column, 373 px tiles are the drift being corrected.' },
] as const;

/* ─────────────── D. family constants ─────────────── */

export const JURNL_FAMILY_CONSTANTS: Record<FamilyConstantKey, string[]> = {
  BRAND: ['JURNL identity stays the same on every screen.', 'Tagline: PLAN TODAY. GROW FREELY.', 'Tone: quiet, confident, elegant, clear.'],
  TYPOGRAPHY: ['Uppercase only. No mixed-case UI language.', 'Large serif display moments (JURNL Display) against refined, spaced uppercase support text (JURNL Sans).', 'The SAFE TO SPEND references are set in a Didone serif and a round geometric sans: the replicas use JURNL Authority Serif (Playfair Display, lining figures) and JURNL Authority Sans (Jost).', 'No casual or generic SaaS type behaviour.'],
  DECORATIVE_LOGO: ['Never reduce JURNL to plain text.', 'Follow the approved composed treatment: official mark, botanical accent, lockup built from the official asset.', 'Decorative is not glowing, tacky or randomly embellished.'],
  SHELL: ['Mobile application shell.', 'Bottom navigation dock unless the screen type replaces it.', 'The immersive world stays behind the UI.', 'No device chrome, no browser chrome, no phone UX at the top unless requested.'],
  RATIO: ['Founder captures: 402×874 pt (1206×2622 @3x). Reference images: 853×1844. Runtime authority canvas: 393×852 pt. All ≈ 0.46 (9 : 19.5).', 'Fill the frame: no black bands, no letterbox, no careless crop.'],
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
  { id: 'F09.00', name: 'SAFE TO SPEND', level: 'PARENT', parent: null, expressions: ['FULL_PAGE'], route: '/production/jurnl/runtime/safe', authority: 'APPROVED', authority_source: 'REFERENCES/01_SAFE_TO_SPEND.png', note: 'The family’s visual authority. Phones render the replica; tablet and desktop keep the approved wide plates.' },
  { id: 'F09.WHY', name: 'WHY THIS NUMBER', level: 'DIRECT_DESCENDANT', parent: 'F09.00', expressions: ['FULL_PAGE'], route: '/production/jurnl/runtime/safe/why', authority: 'APPROVED', authority_source: 'REFERENCES/02_WHY_THIS_NUMBER.png', note: 'Live breakdown rows on the folder from the reference.' },
  { id: 'F09.CHECK', name: 'CHECK A PURCHASE', level: 'DIRECT_DESCENDANT', parent: 'F09.00', expressions: ['FULL_PAGE'], route: '/production/jurnl/runtime/safe/check', authority: 'APPROVED', authority_source: 'REFERENCES/07_CHECK_A_PURCHASE.png', note: 'Derives from SAFE TO SPEND, not from ACCOUNT. Opens from the parent’s bridge; the F10 PURCHASES hub stays its own family.' },
  { id: 'F09.ACCOUNT', name: 'ACCOUNT', level: 'DIRECT_DESCENDANT', parent: 'F09.00', expressions: ['FULL_PAGE', 'DRAWER'], route: '/production/jurnl/runtime/account', authority: 'APPROVED', authority_source: 'REFERENCES/03–06 (three continuation pages + drawer)', note: 'Full page and drawer are siblings (EXPRESSION_PAIR_RULE). The menu opens the drawer. Its page logic must not leak into CHECK A PURCHASE.' },
  { id: 'F09.CHECK.CATEGORY', name: 'SELECT A CATEGORY', level: 'SECONDARY_DESCENDANT', parent: 'F09.CHECK', expressions: ['DRAWER'], route: null, authority: 'APPROVED', authority_source: 'REFERENCES/08_SELECT_A_CATEGORY.png', note: 'The sizing template for every selection sheet in this flow (CATEGORY_SHEET_SYSTEM).' },
  { id: 'F09.CHECK.PAY_WITH', name: 'PAY WITH / SELECT AN ACCOUNT', level: 'SECONDARY_DESCENDANT', parent: 'F09.CHECK', expressions: ['DRAWER'], route: null, authority: 'CURRENT', authority_source: 'REFERENCES/09_SELECT_AN_ACCOUNT_CURRENT.png (information only)', note: 'Sibling of SELECT A CATEGORY, built on its measured system; only the content differs.' },
];

export const SAFE_TO_SPEND_SIBLING_SHEETS = [['F09.CHECK.CATEGORY', 'F09.CHECK.PAY_WITH']] as const;

/* ─────────────── Part 2. selection sheets ─────────────── */

/**
 * SELECT A CATEGORY, measured on its reference (853 px wide; inner width 785 px from the first tile's left edge at 35 to
 * the last tile's right edge at 820). Tiles 183 px wide, photos 183 × 178, radius 12, column gap ≈ 17.3, row gap 15,
 * labels 12 px cap height tracked 0.197 em, side padding 35, handle 20 px below the sheet edge, apply button 25 px above
 * the bottom. The runtime numbers are in src/projects/jurnl/runtime/layout/referenceLayout.ts (REF_CATEGORY).
 */
const INNER = 785;
export const CATEGORY_SHEET_SYSTEM: SelectionSheetSystem = {
  sheet: 'SELECT A CATEGORY',
  header: { title: 'SELECT A CATEGORY', subtext: 'CHOOSE THE CATEGORY THAT BEST FITS YOUR PURCHASE.', align: 'CENTER', close: true, drag_handle: true },
  grid: { columns: 4, rows_visible: 3, overflow: 'SCROLL' },
  tile: { width: +(183 / INNER).toFixed(4), aspect: +(183 / 178).toFixed(3), radius: +(12 / INNER).toFixed(4), crop: 'one styled object on Mediterranean stone, photo above, label strip below' },
  gap: { column: +(17.3 / INNER).toFixed(4), row: +(15 / INNER).toFixed(4) },
  label: { cap_height: +(12 / INNER).toFixed(4), tracking_em: 0.197, position: 'BELOW_TILE', case: 'UPPERCASE' },
  padding: { side: +(35 / INNER).toFixed(4), top: +(20 / INNER).toFixed(4), bottom: +(25 / INNER).toFixed(4) },
};

/** SELECT AN ACCOUNT on the same system. Six accounts fill one row and a half; the sheet's top edge drops by one row. */
export const PAY_WITH_SHEET_SYSTEM: SelectionSheetSystem = {
  ...CATEGORY_SHEET_SYSTEM,
  sheet: 'SELECT AN ACCOUNT',
  header: { ...CATEGORY_SHEET_SYSTEM.header, title: 'SELECT AN ACCOUNT', subtext: 'CHOOSE THE ACCOUNT YOU WANT TO USE FOR THIS PURCHASE.' },
  grid: { ...CATEGORY_SHEET_SYSTEM.grid, rows_visible: 2 },
};

/** The current drawer as drawn in its reference: two columns of 373 px tiles, 62 px labels area — the drift. */
export const PAY_WITH_CURRENT_SYSTEM: SelectionSheetSystem = {
  ...PAY_WITH_SHEET_SYSTEM,
  grid: { columns: 2, rows_visible: 3, overflow: 'NONE' },
  tile: { ...CATEGORY_SHEET_SYSTEM.tile, width: +(373 / 776).toFixed(4), aspect: +(373 / 225).toFixed(3) },
  gap: { column: +(29 / 776).toFixed(4), row: +(20 / 776).toFixed(4) },
  label: { ...CATEGORY_SHEET_SYSTEM.label, cap_height: +(14 / 776).toFixed(4), tracking_em: 0.3 },
  padding: { ...CATEGORY_SHEET_SYSTEM.padding, side: +(39 / 776).toFixed(4) },
};

export const PAY_WITH_SIBLING_CHECK = { current: checkSiblingSheets(CATEGORY_SHEET_SYSTEM, PAY_WITH_CURRENT_SYSTEM), built: checkSiblingSheets(CATEGORY_SHEET_SYSTEM, PAY_WITH_SHEET_SYSTEM) };

/* ─────────────── PAY WITH / SELECT AN ACCOUNT drawer ─────────────── */

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
  sizing: 'MEASURED — CATEGORY_SHEET_SYSTEM (4 columns, 183 px tiles, 12 px radius, 17 / 15 px gaps, 12 px uppercase labels). The current 2-column drawer is DRIFT; the runtime drawer is MATCHED.',
  status: 'BUILT_IN_RUNTIME',
  runtime: 'src/projects/jurnl/runtime/screens/CheckPurchaseScreens.tsx (SelectionSheet) at /production/jurnl/runtime/safe/check',
  apply_label: 'APPLY ACCOUNT',
  apply_label_note: 'Sibling of APPLY CATEGORY; the current drawer has no apply button. Founder can rename it.',
  inputs_required: [
    { role: 'APPROVED_PARENT', what: 'approved CHECK A PURCHASE parent screen', received: 'REFERENCES/07_CHECK_A_PURCHASE.png' },
    { role: 'APPROVED_SIBLING', what: 'approved SELECT A CATEGORY drawer (the sizing template)', received: 'REFERENCES/08_SELECT_A_CATEGORY.png' },
    { role: 'CURRENT_SCREEN', what: 'current SELECT AN ACCOUNT drawer (information only)', received: 'REFERENCES/09_SELECT_AN_ACCOUNT_CURRENT.png' },
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
