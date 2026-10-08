/**
 * P0.JURNL.F09.REFERENCE-REPLICA1 — the SAFE TO SPEND family built as replicas of the founder's nine reference images.
 *
 * Each reference is one photograph with the interface drawn on top. The photograph is lifted out (type and controls
 * cleared) and used as the screen's only plate; the interface is coded over it in the reference's own pixels. Tile
 * photos, the profile thumbnail, the privacy card photo and the pill botanicals are isolated from the same images.
 *
 * Everything isolated here is 853 px wide at most. The 4K versions come from the job pack below: Grok isolates each
 * element from its reference, OpenArt (Sunburst) regenerates it at the target size. Neither route is reachable from the
 * session that built this, so every runtime asset is INTERIM until its 4K file replaces it at the same path.
 */
import { assessAssetQuality, type AssetQualityResult } from '../../asset-quality.js';
import { REFERENCE_FILES, JURNL_REFERENCE_DIR } from './safe-to-spend-family.js';

export const REFERENCE_REPLICA_SPRINT = 'P0.JURNL.F09.REFERENCE-REPLICA1' as const;
export const REFERENCE_REPLICA_DIR = 'JURNL/F09_SAFE/REFERENCE_REPLICA1' as const;
export const REPLICA_RUNTIME_ASSETS = 'src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA' as const;
export const REPLICA_LAYOUT = 'src/projects/jurnl/runtime/layout/referenceLayout.ts' as const;
export const REPLICA_TOOLS = 'scripts/jurnl/reference-replica' as const;

/** Reference canvas and the runtime canvas it maps onto. */
export const REPLICA_STAGE = { reference_px: { w: 853, h: 1844 }, runtime_pt: { w: 393, h: 852 }, review_scale: 3, scale: 393 / 853 } as const;

export type ReplicaScreen = { node: string; name: string; route: string; references: string[]; plate: string; component: string; note: string };

export const REPLICA_SCREENS: ReplicaScreen[] = [
  { node: 'F09.00', name: 'SAFE TO SPEND (reference 01)', route: '/production/jurnl/runtime/safe/reference', references: ['01_SAFE_TO_SPEND.png'], plate: 'plates/F09_PARENT_PLATE.jpg', component: 'SafeToSpendScreens.tsx · SafeToSpendReferenceScreen', note: 'Beside /safe, which keeps the founder-tuned parent from main. The menu opens the ACCOUNT drawer.' },
  { node: 'F09.WHY', name: 'WHY THIS NUMBER', route: '/production/jurnl/runtime/safe/why', references: ['02_WHY_THIS_NUMBER.png'], plate: 'plates/F09_WHY_PLATE.jpg', component: 'SafeToSpendScreens.tsx · SafeToSpendWhyScreen', note: 'Live breakdown rows; CHANGE WHAT’S HELD opens the hold sheet; LEARN MORE opens Ask JURNL.' },
  { node: 'F09.CHECK', name: 'CHECK A PURCHASE', route: '/production/jurnl/runtime/safe/check', references: ['07_CHECK_A_PURCHASE.png'], plate: 'plates/F09_CHECK_PLATE.jpg', component: 'CheckPurchaseScreens.tsx · CheckPurchaseScreen', note: 'Amount field and chips, category and account pickers, live verdict on CHECK PURCHASE.' },
  { node: 'F09.CHECK.CATEGORY', name: 'SELECT A CATEGORY', route: '/production/jurnl/runtime/safe/check (sheet)', references: ['08_SELECT_A_CATEGORY.png'], plate: 'plates/F09_CHECK_PLATE.jpg', component: 'CheckPurchaseScreens.tsx · SelectionSheet', note: 'Opens over CHECK A PURCHASE with the reference’s 50 % scrim.' },
  { node: 'F09.CHECK.PAY_WITH', name: 'SELECT AN ACCOUNT', route: '/production/jurnl/runtime/safe/check (sheet)', references: ['09_SELECT_AN_ACCOUNT_CURRENT.png', '08_SELECT_A_CATEGORY.png'], plate: 'plates/F09_CHECK_PLATE.jpg', component: 'CheckPurchaseScreens.tsx · SelectionSheet', note: 'Content from the current drawer, sizes from SELECT A CATEGORY (sprint rule).' },
  { node: 'F09.ACCOUNT', name: 'ACCOUNT (full page, 3 continuation screens)', route: '/production/jurnl/runtime/account', references: ['03_ACCOUNT_PAGE_1.png', '04_ACCOUNT_PAGE_2.png', '05_ACCOUNT_PAGE_3.png'], plate: 'plates/F09_ACCOUNT_PLATE.jpg', component: 'AccountScreens.tsx · AccountScreen', note: 'Page 1’s photograph and shell on all three pages (CONTINUATION_RULE); each page’s cards from its own reference.' },
  { node: 'F09.ACCOUNT', name: 'ACCOUNT (drawer)', route: 'menu on SAFE TO SPEND, WHY THIS NUMBER and ACCOUNT', references: ['06_ACCOUNT_DRAWER.png'], plate: 'plates/F09_ACCOUNT_DRAWER_PLATE.jpg', component: 'AccountScreens.tsx · AccountDrawer', note: 'Superseded on 2026-10-08 by the approved account folio (JURNL/OVERLAYS_EDITORIAL_REDESIGN1/HAMBURGER_MENU). The drawer plate and its two card images stay here as a record and are no longer drawn.' },
];

export type ReplicaAssetKind = 'PLATE' | 'TILE' | 'THUMBNAIL' | 'IMAGE_CARD' | 'DECORATION' | 'LOCKUP_LAYER';

export type ReplicaAsset = {
  file: string;
  kind: ReplicaAssetKind;
  reference: string;
  /** Box in the reference it came from, [x0, y0, x1, y1]. */
  source_box: [number, number, number, number];
  px: { w: number; h: number };
  method: string;
  /** Subject, used verbatim in the regeneration prompt. */
  subject: string;
  /** Target size for the 4K regeneration. */
  target_px: { w: number; h: number } | null;
  /** Kept as a record but no longer drawn by the runtime: the approved authority that replaced it. */
  superseded_by?: string;
};

const LIFT = 'LIFTED: type and controls masked; small holes Telea-inpainted, panel areas push-pull filled and softened (they sit under opaque coded panels)';
const PLATE_TARGET = { w: 2160, h: 4670 };
const TILE_TARGET = { w: 1024, h: 996 };
const TILE_TARGET_SHORT = { w: 1024, h: 957 };

const plate = (file: string, reference: string, subject: string): ReplicaAsset => ({ file: `plates/${file}`, kind: 'PLATE', reference, source_box: [0, 0, 853, 1844], px: { w: 853, h: 1844 }, method: LIFT, subject, target_px: PLATE_TARGET });
const cat = (name: string, i: number, subject: string): ReplicaAsset => {
  const xs = [35, 235, 436, 637] as const;
  const rows = [[1027, 178], [1266, 178], [1505, 171]] as const;
  const [y, h] = rows[Math.floor(i / 4)]!;
  const x = xs[i % 4]!;
  return { file: `tiles/CATEGORY_${name}.jpg`, kind: 'TILE', reference: '08_SELECT_A_CATEGORY.png', source_box: [x, y, x + 183, y + h], px: { w: 183, h }, method: 'CROP of the tile photo at native size', subject, target_px: h === 178 ? TILE_TARGET : TILE_TARGET_SHORT };
};
const acc = (name: string, box: [number, number, number, number], subject: string): ReplicaAsset => ({ file: `tiles/ACCOUNT_${name}.jpg`, kind: 'TILE', reference: '09_SELECT_AN_ACCOUNT_CURRENT.png', source_box: box, px: { w: 183, h: 178 }, method: 'CROP of the current 373 px tile photo around its subject, resampled to the category tile (183 × 178)', subject, target_px: TILE_TARGET });

export const REPLICA_ASSETS: ReplicaAsset[] = [
  plate('F09_PARENT_PLATE.jpg', '01_SAFE_TO_SPEND.png', 'a sunlit limewashed Mediterranean loggia: a tall arch open to a calm blue sea and a rocky headland, olive trees in terracotta-and-stone urns at both sides, a terrazzo floor with soft leaf shadows; centre foreground, a cream stone folder standing on a speckled granite plinth with four tabs at its back — sand, ivory, sage and deep green — and a small painted olive sprig printed near its top-left corner, nothing written on it'),
  plate('F09_WHY_PLATE.jpg', '02_WHY_THIS_NUMBER.png', 'the same sunlit loggia seen closer: a pale stone arch on the right opening to the sea and cliffs, olive branches top right and lower left, speckled stone urns on stepped terrazzo; centre, a tall cream stone folder with five tabs behind it — sand, ivory, pale stone, sage and deep green — and a painted olive sprig near its top-left corner, nothing written on it'),
  plate('F09_CHECK_PLATE.jpg', '07_CHECK_A_PURCHASE.png', 'a sunlit limewashed loggia with one tall arch open to a calm sea and a headland, an olive tree in a large speckled urn on the left, a woven throw and stone bench on the right, a pale terrazzo floor in dappled shade'),
  plate('F09_ACCOUNT_PLATE.jpg', '03_ACCOUNT_PAGE_1.png', 'a bright Mediterranean terrace: a limewashed arch framing blue sky, clouds, a cypress and a rocky coast, an olive tree and tall speckled stone vases on the left, stone steps, a cushioned bench with a woven throw on the right, a terrazzo floor with lattice shadows'),
  { ...plate('F09_ACCOUNT_DRAWER_PLATE.jpg', '06_ACCOUNT_DRAWER.png', 'on the left, a sunlit arch opening to sea and mountains, an olive tree and a speckled urn on a terrazzo floor with lattice shadows; on the right, filling most of the frame, a tall smooth plaster slab with softly rounded top corners standing on a curved plinth, an olive branch overhanging its top-right corner and casting soft shadows across it; the slab face is blank'), superseded_by: 'JURNL/OVERLAYS_EDITORIAL_REDESIGN1/HAMBURGER_MENU' },
  cat('FASHION', 0, 'a woven straw tote with a cream linen scarf and tortoiseshell sunglasses on a travertine ledge, olive leaves at the edge'),
  cat('BEAUTY', 1, 'a gold-capped perfume bottle and a cream tube on a speckled stone tray, olive sprigs beside them'),
  cat('HOME', 2, 'a speckled ceramic vase with olive branches and a textured cream cushion and knit throw on a stone bench'),
  cat('TRAVEL', 3, 'a straw hat on a cream hard-shell suitcase on a terrace above the sea, olive branches overhead'),
  cat('WELLNESS', 4, 'a rolled taupe yoga mat and a clear glass water bottle on a stone ledge, olive leaves'),
  cat('DINING', 5, 'a plate of pasta and a glass of white wine on a stone table by a window to the sea'),
  cat('GROCERIES', 6, 'a mesh market bag with greens, lemons and baguettes on a stone counter'),
  cat('GIFTS', 7, 'a parcel in textured cream paper tied with an olive-green ribbon, olive branches behind it'),
  cat('TECH', 8, 'an open laptop with a dark screen beside a coffee cup and a small vase of olive branches on a stone desk'),
  cat('TRANSPORT', 9, 'the cream front wing of a vintage car on a coastal road lined with olive trees above the sea'),
  cat('EVENTS', 10, 'lit pillar candles, a glass of white wine and small bites on a stone table under string lights'),
  cat('OTHER', 11, 'a branch of olives with dark fruit casting shadows on a warm plaster wall'),
  acc('CHECKING', [99, 902, 331, 1128], 'a closed leather ledger with a black pen beside a speckled stone cup on a travertine desk, an olive sprig in a vase behind'),
  acc('SAVINGS', [561, 902, 793, 1128], 'a still sea and a rocky headland seen past a small stone pool and an olive tree in a speckled urn'),
  acc('CREDIT_CARD', [134, 1205, 360, 1425], 'a matte ivory card with a gold chip resting on pale veined stone, olive leaves at the edge, no numbers or names'),
  acc('DEBIT_CARD', [511, 1205, 737, 1425], 'a slim sage-green card with a gold chip on travertine beside olive leaves, no numbers or names'),
  acc('CASH', [119, 1503, 351, 1729], 'folded banknotes in a shallow speckled stone bowl, olive leaves overhead, no legible denominations'),
  acc('JOINT_ACCOUNT', [566, 1503, 798, 1729], 'two matching speckled espresso cups side by side on a stone ledge above the sea, olive branches'),
  { file: 'assets/PROFILE_ARCH.jpg', kind: 'THUMBNAIL', reference: '06_ACCOUNT_DRAWER.png', source_box: [330, 447, 472, 589], px: { w: 142, h: 142 }, method: 'CROP; drawn round in CSS', subject: 'a limewashed arch opening onto a calm sea, an olive tree in a stone urn and a low stone ledge, seen straight on, centred for a circular crop', target_px: { w: 1024, h: 1024 }, superseded_by: 'JURNL/OVERLAYS_EDITORIAL_REDESIGN1/HAMBURGER_MENU' },
  { file: 'assets/PRIVACY_CARD.jpg', kind: 'IMAGE_CARD', reference: '06_ACCOUNT_DRAWER.png', source_box: [313, 1411, 831, 1594], px: { w: 518, h: 183 }, method: 'CROP; its type and arrow Telea-inpainted', subject: 'a warm plaster wall in soft sun, a stone plinth on the right holding a speckled terrazzo pot with an olive plant; the left two thirds stay quiet and empty', target_px: { w: 2048, h: 724 }, superseded_by: 'JURNL/OVERLAYS_EDITORIAL_REDESIGN1/HAMBURGER_MENU' },
  { file: 'assets/PILL_BOTANICAL_RIGHT.png', kind: 'DECORATION', reference: '03_ACCOUNT_PAGE_1.png', source_box: [699, 1533, 760, 1606], px: { w: 61, h: 73 }, method: 'DIFFERENCE MATTE against the pill’s cream fill (single tan colour + alpha)', subject: 'a softly painted leafy sprig in pale tan, watercolour edges, on transparency', target_px: { w: 512, h: 612 } },
  { file: 'assets/PILL_BOTANICAL_LEFT.png', kind: 'DECORATION', reference: '04_ACCOUNT_PAGE_2.png', source_box: [106, 1486, 172, 1565], px: { w: 66, h: 79 }, method: 'DIFFERENCE MATTE against the pill’s cream fill (single tan colour + alpha)', subject: 'a softly painted leafy sprig in pale tan, watercolour edges, mirrored for the left end of a pill, on transparency', target_px: { w: 512, h: 612 } },
  { file: 'assets/WHY_SPRIG_OLIVE.png', kind: 'DECORATION', reference: '02_WHY_THIS_NUMBER.png', source_box: [366, 70, 493, 138], px: { w: 127, h: 68 }, method: 'DIFFERENCE MATTE against the lifted plate', subject: 'a painted olive sprig with seven slender grey-green leaves and one green olive, lying horizontally, on transparency', target_px: { w: 1024, h: 548 } },
  { file: 'assets/LOCKUP_SPRIG.png', kind: 'LOCKUP_LAYER', reference: 'F09_LOCKUP.png (approved cut)', source_box: [0, 0, 82, 78], px: { w: 82, h: 78 }, method: 'Layer of the approved sprig-and-word cut, haze removed', subject: 'BRAND — not regenerated', target_px: null },
  { file: 'assets/LOCKUP_WORD.png', kind: 'LOCKUP_LAYER', reference: 'F09_LOCKUP.png (approved cut)', source_box: [0, 78, 196, 120], px: { w: 196, h: 42 }, method: 'Layer of the approved sprig-and-word cut, haze removed', subject: 'BRAND — not regenerated', target_px: null },
];

/** Size on the 393 × 852 runtime canvas, in points. */
export function coversPt(a: ReplicaAsset): { w: number; h: number } {
  const [x0, y0, x1, y1] = a.kind === 'PLATE' ? [0, 0, 853, 1844] : a.source_box;
  return { w: Math.round((x1 - x0) * REPLICA_STAGE.scale * 10) / 10, h: Math.round((y1 - y0) * REPLICA_STAGE.scale * 10) / 10 };
}

/**
 * Asset-quality verdicts for the interim files. The references' origin is not recorded (UNKNOWN provenance), so the
 * gate allows them no more than WIREFRAME_ONLY as authority material; they ship as interim runtime plates because the
 * founder directed it, and the 4K jobs below are the unblock route.
 */
export const REPLICA_ASSET_QUALITY: { file: string; result: AssetQualityResult }[] = REPLICA_ASSETS.filter((a) => a.kind !== 'LOCKUP_LAYER').map((a) => ({
  file: a.file,
  result: assessAssetQuality({ source_px: a.px, covers_pt: coversPt(a), review_scale: REPLICA_STAGE.review_scale, provenance: 'UNKNOWN', purpose: 'AUTHORITY_CANDIDATE', founder_facing: true }),
}));

/* ─────────────── 4K regeneration: Grok isolates, OpenArt (Sunburst) regenerates ─────────────── */

export const REGEN_ROUTE = {
  isolate: 'Grok (image edit): one job per element, the full reference attached.',
  regenerate: 'OpenArt, Sunburst model, image-to-image from the Grok output, at target_px.',
  status: 'READY_TO_RUN — neither route is reachable from the session that built the replicas (OpenArt not connected, no Grok route).',
  replace_rule: 'Each 4K file replaces the interim file at the same path and size ratio. Layout coordinates do not change.',
  preflight: 'Before spending a generation, confirm the route returns a file at target_px into the repository (BLOCKED_RUN_PROTOCOL).',
} as const;

const NEGATIVES_PLATE = 'no text, letters or logo; no buttons, cards, panels, icons or interface; no phone status bar or device frame; no people';
const NEGATIVES_TILE = 'no text, logos, legible numbers or brand names; no people; no frame or border';

export type RegenJob = { id: string; file: string; reference: string; grok_isolate: string; openart_sunburst: string; target_px: { w: number; h: number } };

function jobFor(a: ReplicaAsset): RegenJob | null {
  if (!a.target_px) return null;
  const [x0, y0, x1, y1] = a.source_box;
  const size = `${a.target_px.w} × ${a.target_px.h}`;
  const isolate =
    a.kind === 'PLATE'
      ? `The attached image is one photograph with an app interface drawn on top. Remove every interface element — all type, the JURNL logo and its sprig, buttons, cards, panels, input fields, icons, the bottom navigation, and any phone status bar or home indicator — and rebuild the photograph behind them as it would look with nothing in front of it. Keep the camera, framing, light and every object of the scene exactly where it is: ${a.subject}. Return the clean photograph at the same framing.`
      : `Crop the attached image to the box x ${x0}–${x1}, y ${y0}–${y1} (of 853 × 1844). Keep only the ${a.kind === 'DECORATION' ? 'painted decoration on a transparent background' : 'photograph'}: ${a.subject}. Remove any type, labels, arrows, rounded-card edges and sheet background around it.`;
  const regen =
    a.kind === 'DECORATION'
      ? `Use IMAGE 1 as the exact shape, pose and colour. Redraw it cleanly at ${size}: ${a.subject}. Soft painted edges, single warm tone, fully transparent background. Avoid: ${NEGATIVES_TILE}.`
      : `Use IMAGE 1 as the exact composition: same framing, same objects in the same places, same sunlight, palette and depth. Regenerate it as a sharp, high-resolution photograph at ${size}: ${a.subject}. Warm Mediterranean sun, limewash, travertine and olive. Avoid: ${a.kind === 'PLATE' ? NEGATIVES_PLATE : NEGATIVES_TILE}.`;
  return { id: a.file.replace(/^.*\//, '').replace(/\.(jpg|png)$/, ''), file: a.file, reference: a.reference, grok_isolate: isolate, openart_sunburst: regen, target_px: a.target_px };
}

export const REGEN_JOBS: RegenJob[] = REPLICA_ASSETS.map(jobFor).filter((j): j is RegenJob => j !== null);

/* ─────────────── decisions the references left open ─────────────── */

export const REPLICA_DECISIONS = [
  { id: 'DEVICE_CHROME', found: 'References 01–09 draw an iOS status bar (9:41) and a home indicator.', built: 'Not drawn — they belong to the phone (family rule: no device chrome).' },
  { id: 'PARENT_LOCKUP', found: 'main records the founder rule “do not put the lockup back on F09.00”; reference 01 shows the lockup and tagline.', built: '/safe keeps main’s founder-tuned parent. The reference 01 replica, lockup included, is at /safe/reference until the founder picks one.' },
  { id: 'MIXED_CASE', found: 'The drawer’s privacy card line is mixed case in reference 06.', built: 'Uppercase (family rule): MANAGE YOUR PRIVACY / SETTINGS AND DATA CONSENTS.' },
  { id: 'PAY_WITH_GRID', found: 'Reference 09 lists the accounts in 2 columns of 373 px tiles.', built: 'Four columns on SELECT A CATEGORY’s measured system (sprint rule); its tile photos re-cropped to 183 × 178. Apply button APPLY ACCOUNT, sibling of APPLY CATEGORY.' },
  { id: 'ACCOUNT_SHELL', found: 'References 04 and 05 move the menu, tagline and title by up to 33 px and redraw the photograph.', built: 'Page 1’s photograph and shell on all three pages (CONTINUATION_RULE); each page’s cards follow its own reference.' },
  { id: 'TYPEFACES', found: 'The references are set in a Didone serif and a round geometric sans; the runtime’s JURNL Display / Sans are Instrument Serif and Barlow Semi Condensed.', built: 'Replica screens use JURNL Authority Serif (Playfair Display, lining figures, renamed per its OFL Reserved Font Name) and JURNL Authority Sans (Jost). Other families unchanged.' },
  { id: 'LIVE_FIGURES', found: 'The references carry sample figures ($1,284 on the parent, $6,500 on WHY).', built: 'Live formula values; positions and type follow the reference.' },
  { id: 'CATEGORY_ROW_3', found: 'Row 3 photos in reference 08 are 171 px tall, rows 1–2 are 178 px.', built: 'Kept as drawn.' },
  { id: 'MISSING_FEATURES', found: 'PROFILE, NOTIFICATIONS, SECURITY, CALENDAR PREFERENCES, DATA EXPORT, HELP & SUPPORT and LEGAL have no feature behind them yet.', built: 'Each says NOT IN THIS PREVIEW YET. CURRENCY, CONNECTION, ASK CONTEXT, BUFFER, PRIVACY & CONSENTS and SIGN OUT work.' },
] as const;

export const REPLICA_REFERENCES = { dir: JURNL_REFERENCE_DIR, files: REFERENCE_FILES };
