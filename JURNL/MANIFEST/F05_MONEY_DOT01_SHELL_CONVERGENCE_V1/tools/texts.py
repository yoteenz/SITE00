T = {}
T['01'] = """# 01 · Branch and runtime baseline

## Branches inspected (origin, 2026-11-04)

| Ref | SHA | What it is |
|---|---|---|
| `cursor/jurnl-financial-safety-integration-4e5a` (#1713 candidate) | `f7e2739c6` | canonical financial safety (card overpay guard, cabinet archive safety) |
| `claude/jurnl-f05-dot01-authority-scenes-um0u93` (OPUS2) | `4d222f7c0` | OPUS2: 03 / 04 / 05 authority scene bands; pushed, no PR |
| `claude/jurnl-global-interactive-v3-um0u93` (V3, OPUS1) | `3fac5e546` | V3 interactive system, global menu, membership, zero-balance archive (`HELD_BALANCE`) |
| `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` | `d6992b3fc` | Cursor merge (19:17 UTC) of its MONEY parent work (`7752eae2f`: accounts rail, PENDING / INCOMING copy, the 2 px MONEY type nudge) with V3 `3fac5e546` |
| `preview/tunnel` | `e413590e1` (2026-11-02) | contains **no DOT 01 code** (`git cat-file` on DirectoryPage.tsx fails) |

Lineage: `f7e2739c6` ⊂ `3604d2e72` ⊂ `4d222f7c0` (OPUS2) ⊂ `3fac5e546` (V3) ⊂ `d6992b3fc`.

## OPUS2 status — VERIFIED EXECUTED, PARTIAL
`4d222f7c0` is on origin. It rebuilt 03 / 04 / 05 from authority scene bands (scripts/jurnl/f05-motion-pilot/extract_dot01_account_scenes.py,
families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENE_0{3,4,5}.webp) and reported PARTIAL. It classified 06 as AUTHORITY_MATCH_CANDIDATE:
**that classification is withdrawn here** (06 was on SK02_FIELD with no lower landscape; report 06).

## Base chosen
`d6992b3fc` — the newest coherent head that contains every required line (financial safety, archive safeguards, OPUS2 compositions,
V3, the asset registries) and, by name and timing, the build the founder was shown. The founder's ALL ACCOUNTS screenshot cannot be
from `preview/tunnel` (no DOT 01 there); the live tunnel's serving SHA is **UNVERIFIED** (no access to the founder's tunnel
connector; not reconfigured). Work is on a new isolated branch `claude/jurnl-f05-dot01-shell-convergence-um0u93` created from
`d6992b3fc`; no other agent's branch was written to, nothing force-pushed.

## Runtime used for evidence
Vite dev (:5174) for the 37-state probe and the count captures; production build `vite preview` (:5176) for E2E. Synthetic
worlds only (e2e/jurnl/helpers). DOT 01 is reached as the runtime does: `?parent=motion` (session flag `jurnl.f05.parent`).
"""
T['02'] = """# 02 · Current shell architecture

```
JurnlScreen (F05 family, singlePlate)
└─ Dot01Frame (page) / Dot01Overlay (portal, focus trap)        runtime/screens/f05/dot01/Dot01Frame.tsx
   └─ Dot01Board  — one 941 × 1672 board scaled by u, translated by ox
      L0 env        SK01_FIELD · SK02 · SK02_FIELD · SK03 · SK03_FIELD   (sliced at the env seam; elastic tile on tall phones)
      L1 layers     SIDEKICK papers, motion PNGs, authority scene bands (03 / 04 / 05 / 22), 06 papers / actions
      L2 live type  JURNL mark, title on the heading paper, one cursive line; board-px figures (`board(L)` renderer)
      L3 chips      back / search / add / manage, laid out from the right edge
   └─ content      screen-px region mapped from a board rect (forms, lists); clamps + scrolls inside on short phones
   └─ JurnlProductNav (06, 31 only) on the torn nav paper; positioned from NAV_RECT via boardToScreen
```

Common environment vs screen composition (this sprint): the environment (L0) is now chosen per authority family, and the
screen-specific composition (papers, actions, figures) is placed by the page in board coordinates instead of document flow:

* `SK01_FIELD` (new env) = F05_MOTION_SIDEKICK, SK01 with its account papers, title paper and seal removed (the parent's own
  text-free plate). It grows inside its sheet at the parent's seam (y 1190) with the parent's sheet tile; its nav paper is
  baked (one owner — the frame no longer draws a second nav paper on it; an empty marker keeps the dock geometry testable).
* `absorb` (new, opt-in per page): on a screen SHORTER than 9:16, instead of letting the board's foot (landscape, nav paper,
  dock) fall below the fold, the page takes slack out at its seam (lower slice overlaps the upper one inside plain sheet,
  feathered) and otherwise fits the board to the height. Pages that do not opt in keep the existing behaviour.
* `maxCrop` per page: 06 crops at most 24 board px a side (its papers reach x 28…915).

Dock: global JurnlProductNav, unchanged (canonical vectors), placed on the nav paper's NAV_RECT.
"""
T['03a'] = """# 03 · SIDEKICK source and hash audit

Source: the V9 full package (`JURNL_F05_DOT01_FULL_PART_01…07_OF_07.zip`, every SHA-256 matching `SPECS/FULL_PACKAGE_MANIFEST.json`),
SIDEKICK PNGs committed at `JURNL/F05_MONEY_DOT01/INPUT_V9/SIDEKICKS/`. The V9 manifest calls all three
`generated_text_free_candidate_not_pixel_extracted` — they are not cut from the authorities and are not claimed to be."""
T['03b'] = """All three are fully opaque RGB (no alpha): every "layer" separation is done by extraction or by authority lifts.

| | SK01_PARENT_MONEY | SK02_ACCOUNT_DETAILS | SK03_RECEIPT_OVERLAYS |
|---|---|---|---|
| Baked title parchment | yes (blank) + laurel seal | yes (blank) + laurel seal | yes (blank) + laurel seal |
| Baked decorative | statue, lemons, arch, red fabric, laurel | same hero, olive leaves, red fabric | same hero family |
| Baked foreground | large sheet (y 740–1320) with four illustrated card slots, coastal engraving (1300–1450), torn nav paper (1459–1662) | two stat papers, temple-coastal panel, three action strips, bottom landscape (1548+) | wood-grain receipt frame, two buttons, strip papers, landscape |
| Intended screens (manifest) | 01, 06 family | 02–13 | 14–37 overlays |
| Mounted (runtime) | 01 (F05_MOTION_SIDEKICK), **06 from this sprint** (SK01_FIELD) | 02–13, 22, 31, 32, 35 as SK02_FIELD (papers removed); full SK02 nowhere | 26 full; 14–37 as SK03_FIELD |
| CSS crop / scale / position | width-first on phones: u = w / (941 − 2·crop), crop ≤ 30 (06: ≤ 24); tablets / desktop: u = h / 1672, centred (ox) | same | same |
| Pixel-paired authorities (hero MAD < 7; the foot carries page content, e.g. 01's baked dock glyphs) | 01 | 02 | 26 |
| Known duplications | nav paper (SK01_FIELD baked + frame layer) — **removed this sprint** | laurel seal under SEAL_22 / SEAL_03 (fully covered) | none found |
| Missing scene regions | none: 06's lower band is SK01's own sheet + landscape | its papers are removed in SK02_FIELD (plain field 588–1548): any page whose content does not fill it shows olive — the 06 void | none |

Band distances per authority are in report 04 (mean |Δ| over the hero band x 0–820 × y 120–330 and the foot band y 1500–1672)."""
T['04'] = """# 04 · 37-screen SIDEKICK coverage

Method: for every V9 authority PNG, mean |Δ| (RGB, 0–255) against each SIDEKICK over the hero band (x 0–820, y 120–330, left of the
chips) and the foot band (y 1500–1672). Pixel-paired = both bands close. Everything else is an independent render in one of
the three families; its residual is page content (papers, rows, figures), not a missing environment.

Result: three pixel pairs (01–SK01, 02–SK02, 26–SK03), as S6 found. Every authority's hero is nearest SK02 / SK01 / SK03 at
MAD 8.4–19.8 (pairs: 01 5.8, 02 6.0, 26 6.0) except 16 (≈ 32–34 for all three: 16 frames the same hero higher — its title paper sits near y 250 — a crop and
composition difference, not an environment the SIDEKICKs lack). 06's foot is nearest SK01 (41.2 vs SK02 77.8): the evidence
for re-mounting 06 on SK01_FIELD. **No authority requires an environment absent from SK01 / SK02 / SK03.**"""
T['05'] = """# 05 · Missing environment vs foreground

| Missing material | Where | Class | Resolution |
|---|---|---|---|
| lower sheet + coastal landscape + laurel / fabric | 06 | I (incorrect mount: SK02_FIELD) + H (geometry) | re-mounted on SK01_FIELD (report 12) |
| four large illustrated account papers | 06 | B (large foreground) | lifted from 06 (CARD06_*) |
| two action surfaces (dark olive / parchment) | 06 | C + F | lifted from 06 (ACTION06_*, ICON06_*) |
| wallet / temple card / coins / coastal print + sheet with type papers | 22 | B + C | lifted from 22 (SCENE_22) |
| temple (bank) wax seal | 22, 16 | E (decorative object) | 22: lifted (SEAL_22); 16: gap (report 27) |
| keychain / amphora / coin on oxblood | 03 / 04 / 05 | B | OPUS2 scene bands (verified, unchanged) |
| per-screen seals (coin, amphora, card, padlock) | 17–20, 36 | E | SOURCE_ART_BLOCKED (not in V9 as layers; lifting from each authority is the next step) |
| account thumbnails in history rows | 08, 09, 25, 35 | B | not done (structural rebuilds, report 14 / 15) |
| scanner corners / beam | 27 | G (animation layer) | Batch 06 corrections pending |
| short-phone foot below the fold | 06, 22 (fixed); 02–05 (remaining) | J (responsive state) | `absorb` + height fit (report 22) |

**A (environmental background) deficits proven: 0.**"""
T['06'] = """# 06 · Generic-template root cause (screen 06 ALL ACCOUNTS)

Reproduced at 393 × 852 / 471 × 836 / 393 × 660 with 0, 1, 2, 3, 4, 5, 7 synthetic pockets (evidence/06_counts/before):

| Cause | Verified | Evidence |
|---|---|---|
| INCORRECT_SIDEKICK_MAPPING | yes | 06 mounted `env="SK02_FIELD"` (DirectoryPage.tsx before): SK02 with its papers removed = plain reconstructed olive field y 588–1548 |
| MISSING_ARTWORK_MOUNT | yes | 06's lower sheet, coastal engraving, laurel, red fabric (y 1100–1500) had no layer; SK02_FIELD's own landscape sits at 1548+ under the nav paper |
| DATA_DRIVEN_LAYOUT_COLLAPSE | yes | cards + action strip were document flow at the top of a 600–1446 content region: 2 pockets → one row, then ~850 board px of olive |
| GENERIC_COMPONENT_OVERRIDE | yes | actions were the generic `d01-btn` on 09_BLANK_TORN_PARCHMENT; cards the shared `AccountCard` |
| INCORRECT_SCALING (cards) | yes | the parent's SK01 card thumbnails (413 × 198) in a CSS grid, not 06's own larger papers (≈ 440 × 247) |
| FALLBACK_ICON_SUBSTITUTION | yes | ADD / REORDER glyphs were inline vectors (`plus-framed`, `updown`) |
| WRONG_RESPONSIVE_BREAKPOINT | yes | phones are width-first (u = w / 881): on any screen shorter than 9:16 (471 × 836, 393 × 660, iOS Safari with toolbars) the foot of the board (landscape, nav paper) was below the fold and the dock was drawn over the field |
| BAKED_ARTWORK_DUPLICATION | latent | mounting SK01 with the frame's NAV_PAPER layer would have doubled the nav paper — avoided (one owner) |
| STALE_PREVIEW_BUILD | possible, unverified | preview/tunnel has no DOT 01; the founder's capture must be an agent-served build (report 01) |

Same root on 22 EMPTY ACCOUNTS (generic panel + tiles on SK02_FIELD, its wallet / temple / sheet composition missing)."""
T['07'] = """# 07 · Scene-coordinate contract

Reference: the V9 authority, 941 × 1672 px (verified on every PNG). One board in those px, scaled by `u`:
* phones (w ≤ 520): width-first, u = w / (941 − 2·crop) with crop ≤ 30 (06: ≤ 24, so no paper edge is cut)
* tablets / desktop: u = h / 1672, centred (ox > 0)
* taller than 9:16: `extra` = h / u − 1672 > 0 is inserted at the env seam (SK01 sheet tile / SK02 / SK03 field tile)
* shorter than 9:16 (pages with `absorb`): up to `absorb` px are taken out at the seam (extra < 0), then u = h / (1672 − absorb)

## 06 ALL ACCOUNTS (directoryScene.ts, board px)

| Region | Box / rule |
|---|---|
| SAFE_AREA_TOP | chips at y ≈ 40–110 (JURNL tag paper, amber back chip) |
| HERO_REGION | 0–330 (statue, lemons, arch — SK01_FIELD) |
| TITLE_REGION | SK01 title paper [70, 323, 615, 590] + laurel seal [26, 323, 167, 451]; live title on the heading [172, 356, 612, 552] |
| CONTENT_REGION (card zone) | y 594 → 1150 + extra; 2 × 2 cells at x {30, 474}, y {625, 877} (the 06 papers' own corners) |
| ACTION_REGION | ADD [80, 1163, 471, 1303], REORDER [485, 1154, 887, 1303], + extra |
| FOREGROUND_REGION | SK01 sheet foot + coastal engraving y ≈ 1300–1450 (+ extra) |
| DOCK_REGION | nav paper [19, 1459, 930, 1662] (+ extra), five cells NAV_RECT [34, 1478, 904, 1616] |
| SAFE_AREA_BOTTOM | the board's foot = the viewport's bottom (no strip reserved) |
| Z-ORDER | L0 SK01_FIELD → L1 title paper, seal → L1 papers (drop shadow) → L1 action surfaces → L2 type → L3 chips → dock |

Counts: 4 → authority 2 × 2; 3 → 2 + 1 centred; 1–2 → one row centred in the zone; ≥ 5 → the zone scrolls inside itself (two
rows + the top of a third, fading under the action row). `absorb`: 1–2 → zone slack (269), 3–4 → 0 (exact 2 × 2, fitted
instead), ≥ 5 → keeps 1.5 rows.

## 22 EMPTY ACCOUNTS
Band [0, 552, 941, 1540] lifted from 22; seam y 994 (plain sheet under the copy); tall phones: 40 % of extra opens the olive above
the wallet, 60 % grows the sheet; heading y 806, copy y 902, type papers [60/480, 1012/1162, …], ADD FIRST ACCOUNT [63, 1332, 875, 1430],
LEARN ACCOUNT TYPES [105, 1455, 833, 1537]; `absorb` 12 then fitted. The env's own landscape follows below the band.

No arbitrary per-screen transforms: every value above is a measured authority coordinate or a rule on `extra`."""
T['08'] = """# 08 · Screens 01 and 02

**01 MONEY parent** — SK01 pixel pair (hero MAD 5.8). Composition as OPUS / Cursor left it; this sprint did not touch the parent.
Deviation found: on `d6992b3fc` the ACCOUNTS collection is Cursor's snap rail (two pockets + ADD A POCKET + MOVE MONEY papers),
where the authority draws the four account papers. The probe flags CASH and CREDIT as off-screen in every viewport because they
are in the horizontal rail (reachable by swipe). The carousel / motion E2E specs still assert the four-paper layout and fail on the
untouched base too (report 26): the rail is a founder-facing decision, recorded FOUNDER_REVIEW_REQUIRED, not changed here.

**02 BANK ACCOUNT** — SK02 pixel pair (hero 6.0, foot 9.1). Unchanged. Deviations: the tunnel copy sets SET ASIDE / PENDING /
INCOMING where the authority prints AVAILABLE / HELD / PENDING; ACCOUNT HISTORY's open-book art is a vector."""
for sid, name, obj in (('09', 'RIDESHARE CARD', 'the leather keychain over red textile'), ('10', 'CASH ON HAND', 'the terracotta amphora with botanical overlap'), ('11', 'CREDIT CARD', 'the bronze coin on oxblood fabric')):
    n = {'09': '03', '10': '04', '11': '05'}[sid]
    T[sid] = f"""# {sid} · Screen {n} {name}

Verified, not rebuilt again: OPUS2 replaced the generic SK02 template with {n}'s own authority scene band
(`SCENES/F05_DOT01_SCENE_{n}.webp`, lifted from the V9 {n} PNG with only live-text pixels inpainted; SHA in F05_DOT01_SCENES.json):
{obj} at authority scale, the page's own summary parchment, its landscape, its action rows at authority coordinates, live
figures. OPUS2 measured scene edge recall 0.98–0.99 (text-masked) against the authority. This sprint re-captured it on the tunnel
base (evidence/03_04_05, DSF 2, 471 × 836 and 393 × 852): the composition is intact; the 2 px MONEY type nudge from the tunnel
merge applies to its live type.

Remaining: the DETAILS row glyph is an inline vector (Batch 02's medallion is glossy, rejected for an ink-line slot); on phones
shorter than 9:16 the landscape under the last row falls below the fold (the rows themselves stay reachable: OPUS2's
seatActionRows); its object is flattened in the band (no native layer exists in V9). Status: PARTIAL (no founder approval)."""
T['12'] = """# 12 · Screen 06 ALL ACCOUNTS — rebuild

Before (d6992b3fc): SK02_FIELD + flow grid of the parent's card thumbnails + generic action strip; lower landscape absent; with 2
pockets ≈ 60 % of the screen olive (evidence/06_counts/before).

After:
* L0 SK01_FIELD (the parent's text-free SK01): hero, arch, title paper + laurel seal (SK01's own layers), the large sheet, the
  coastal engraving, laurel and red fabric, the torn nav paper — the authority's lower composition, at its authority place.
* L1 the four 06 papers, lifted from the 06 PNG with their torn edges (GrabCut on the measured box, chevron tab kept) and only the
  pocket name and figure inpainted: bank village · rideshare lemon branch · cash amphora · credit coin on oxblood. A pocket uses
  its kind's paper (`kindOf`), so the art is never a fake account and a figure is never baked.
* L1 the two 06 action surfaces (dark-olive ADD, parchment REORDER) lifted the same way; their glyphs lifted as alpha from the
  authority (exact shape); labels live; REORDER disabled below two pockets; pressed / focus / disabled states.
* L2 live name (two lines, 37 px, 600) and figure (62 px, 600) at the authority's offsets; OWED caption on liabilities;
  NEEDS REVIEW badge when the reconciliation has issues.
* Dock unchanged, on the baked nav paper.

Measured at 471 × 836 (the reference ratio) with the four approved pockets: the board is fitted (u 0.500) and every paper,
action and the dock land on the authority boxes (rects in evidence/06_counts/after/rects.json; side-by-side in
evidence/06_counts/06_AUTHORITY_VS_AFTER_471x836.webp). Olive void: RESOLVED — the olive between the title paper and the card zone
is the authority's own; no count leaves an uncomposed field (report 13).

Not pixel-perfect: the figures are live (the authority's sample amounts are not reproduced), names use the shared MONEY 2 px
nudge, and on tall phones the extra height becomes sheet between the grid and the actions (or olive above it) — composed but not
in the authority."""
T['13'] = """# 13 · Account-count variants

No fake accounts: each world is the first N records of the synthetic `many` world; the layout returns exactly N cells (unit test C2).

| Pockets | Composition | Authority status |
|---|---|---|
| 0 | authority 22 EMPTY ACCOUNTS (its own band, report 16) | AUTHORITY_MATCH_CANDIDATE |
| 1 | one 06 paper centred in the card zone, on the SK01 sheet | proposal — FOUNDER_REVIEW_REQUIRED |
| 2 | one row of two, centred in the zone | proposal — FOUNDER_REVIEW_REQUIRED |
| 3 | 2 + 1, the single paper centred under the pair | proposal — FOUNDER_REVIEW_REQUIRED |
| 4 | the authority 2 × 2 at its own coordinates | AUTHORITY_MATCH_CANDIDATE |
| ≥ 5 | the card zone scrolls inside itself (two rows + the top of a third, fading under the action row); the page never scrolls | proposal — FOUNDER_REVIEW_REQUIRED |

Long names: two balanced lines, shrink to 27 px, then ellipsis (full name in the accessible label). Large figures shrink to 40 px.
The action row, landscape and dock never move with the count (unit test C3)."""
T['14'] = """# 14 · Screens 07–13 composition audit

Unchanged this sprint (priority went to 06 / 22, the demonstrated failure). Revalidated on the tunnel base; OPUS2's structural
findings stand. None of these needs a new SIDEKICK: all are SK02-family hero renders (hero MAD 8.4–13.8, report 04) whose
differences are page structure."""
T['15'] = """# 15 · Screens 14–25 composition audit

22 rebuilt from its own authority (report 16 lists the band). 25's probe fixture now satisfies ZERO HELD BALANCE BEFORE ARCHIVE
(a pocket with money opens ARCHIVE BLOCKED, as the policy requires). The per-screen seals of 16–20 are the main source gap."""
T['16'] = """# 16 · Screens 26–37 composition audit

31 remains the advanced transaction search page; the V3 quick-search drawer is a separate, unbuilt presentation (V3 U3). 26 keeps
its one short-phone defect (ENTER MANUALLY half below the fold at 393 × 660)."""
T['17'] = """# 17 · Scenic foreground and layer map

| Illustration | Owner (one each) | Screens |
|---|---|---|
| hero statue / lemons / arch | BAKED INTO ENVIRONMENT (SK01_FIELD / SK02_FIELD / SK03_FIELD) | all |
| title paper | SK01: separate layer F05_MOTION_TITLE_PAPER (01, 06); SK02 / SK03: baked | all |
| laurel wax seal | SK01: layer F05_MOTION_WAX_SEAL; SK02 / SK03: baked; 03: SEAL_03 layer over it; 22: SEAL_22 layer over it (covers it) | all |
| large sheet + coastal engraving + laurel + red fabric (lower band) | BAKED INTO ENVIRONMENT SK01_FIELD | 01, 06 |
| torn nav paper | BAKED INTO SK01_FIELD (06) / F05_DOT01_NAV_PAPER layer (31 on SK02_FIELD) | 06, 31 |
| bank village / lemon branch / amphora / coin papers | SCREEN-SPECIFIC FOREGROUND: CARD06_* (06); F05_MOTION_CARD_* (01) | 01, 06 |
| keychain / amphora / coin on oxblood + summary parchment + landscape | SCREEN-SPECIFIC FOREGROUND: SCENE_03 / 04 / 05 | 03–05 |
| wallet / temple card / coins / coastal print + empty sheet | SCREEN-SPECIFIC FOREGROUND: SCENE_22 | 22 |
| ADD / REORDER surfaces and glyphs | INTERACTIVE SURFACE: ACTION06_* / ICON06_* | 06 |
| action strips (02–05) | INTERACTIVE SURFACE: SK02_STRIP_1–3 / authority strips | 02–05 |

Duplications checked: SK01_FIELD + NAV_PAPER (avoided); SEAL_22 over the baked laurel (covers it: no visible double); the 06
papers replace the parent thumbnails (not stacked). Duplicated baked art visible after this sprint: 0 known."""
T['18'] = """# 18 · Full asset recovery log

| Step | Result |
|---|---|
| Founder kit (`JURNL_DOT01_37_AUTHORITY_SIDEKICK_AUDIT_OPUS_KIT.zip`) | extracted, 42 files: 37 JPEG previews (500 px, not production), 3 SIDEKICK previews, audit, README |
| V9 masters | recovered from the uploaded 7-part package (already extracted in a prior session): 37 × 941 × 1672 PNG, SHA-256 equal to INPUT_V9/README.md (e.g. 06 `4161e407…`, 22 `4f70fa1e…`) |
| SIDEKICKs | INPUT_V9/SIDEKICKS (lossless PNG), hashes in report 03 |
| 22 motion PNGs | trimmed WebP derivatives in families/F05_MONEY/DOT01 (unchanged) |
| Large illustrations | keychain / amphora / coin: OPUS2 bands (verified); 06 papers + actions + glyphs, 22 band + seal: lifted this sprint |
| Generation | none. OpenArt / Grok / any paid provider: not used |

Source gaps (no layer in V9, not lifted yet): per-screen seals of 16 (temple), 17 / 19 (coin), 18 (amphora), 20 (card), 36 (padlock);
16's receipt-with-corners art; 07–10 / 25 / 35 account thumbnails; 27 scanner corners / beam. Each exists inside its own authority
render and can be lifted by the same method (report 30, next action)."""
T['19'] = """# 19 · Micro-icon source and mapping

Census: the 37-state probe records every visible icon (393 × 852) with its control, real source, rendered size and colour.
Source classes: AUTHORITY_LIFT (exact authority pixels: 06 ADD / REORDER), MICRO_ASSET (registry ID, Batches 01–06; founder or
candidate art — not founder-approved), DOCK_COMPONENT (canonical dock vectors, kept: the authority draws flat engraved line glyphs
and Batch 06 NAV is an exact reuse, not a better source), INLINE_SVG (line glyph fallback).

ICONS_MATCHING_AUTHORITY is counted strictly: only AUTHORITY_LIFT icons are proven identical to the authority. MICRO_ASSET icons
are approved-source candidates (shape-checked by the B05 / B06 qualification), not proven. INLINE_SVG icons are fallbacks: where an
approved source exists they are defects; where none exists they are source gaps (report 27). Rejected / correction-required Grok
art (B05-02 gloss, B05-03 leaves, B06-02 halo, Batch 04 glossy set) is not mounted."""
T['20'] = """# 20 · Button and parchment geometry

06 action surfaces (authority px, lifted): ADD [80, 1163, 471, 1303] (391 × 140, dark-olive torn paper), REORDER [485, 1154, 887, 1303]
(402 × 149, parchment). Glyph boxes ADD [140, 1190, 222, 1268], REORDER [536, 1192, 614, 1266]; labels two lines, 36 px / 600,
tracking 0.06 em, cream on olive / ink on parchment. Not stretched: each surface is drawn at its own size and aspect.
States: pressed (2 px drop, brightness 0.96, shadow tightens), disabled (glyph + label 42 %), focus (6 px gold outline).
06 papers: the whole paper is the control (≥ 110 css px tall on a phone); chevron tab kept from the authority.
22 strips: ADD FIRST ACCOUNT [63, 1332, 875, 1430], LEARN ACCOUNT TYPES [105, 1455, 833, 1537] — the authority's own strips (band),
labels live and centred in the label field between divider and arrow.
Elsewhere unchanged: 02–05 strips (SK02 strips / authority strips, OPUS2); overlays keep the `d01-btn` kit."""
T['21'] = """# 21 · V3 interactive compatibility

Preserved: the V3 global menu, membership / add-ons / unlock, the V3 caution inside the V9 ARCHIVE BLOCKED frame, the Pocket
context-menu fragment, the V3 drawer material — none of their files changed. The DOT 01 page compositions stay V9 (06 / 22 are
V9 authority lifts, not V3 folios). New interactive state this sprint (LEARN ACCOUNT TYPES) uses the existing Dot01Overlay (focus
trap, Escape, focus return) and kit rows. Verified by the V3 suite (jurnl-global-interactive-v3.e2e.ts) and the unit suite
(jurnlGlobalInteractiveV3.test.tsx) — report 26."""
T['22'] = """# 22 · Responsive and short phone

Viewports: 360 × 780, 375 × 667, 393 × 660, 393 × 852, 430 × 932, 471 × 836 (reference ratio), 768 × 1024, 834 × 1194, 1024 × 768,
1440 × 900. 471 × 836 is the 9:16 reference, not a substitute for small-phone QA. Probe: scripts/jurnl/f05-motion-pilot/probe_dot01_37_states.ts."""
T['23'] = """# 23 · iOS Safari status — UNVERIFIED

No WebKit / iOS Safari environment is available in this container (only Chromium is installed; installing browsers is not
permitted here), and the live tunnel was not touched. Not verified: dynamic viewport units, safe-area insets, toolbar collapse,
soft keyboard, long press, nested overlays, touch-action conflicts on iOS.

What was done instead: Chromium at the iPhone-class sizes, including 393 × 660 (an iPhone 15 Safari visible area with toolbars),
where 06 / 22 now keep their foot on screen (`absorb` / height fit) instead of pushing it below the fold. Founder check on a real
iPhone is required before any visual approval."""
T['24'] = """# 24 · All 37 visual comparisons

Method (compare_dot01_all_screens.py): each probe capture (471 × 836, DSF 1) is cut to the board rect the probe recorded and compared
with the authority resized to the same board size, over the on-screen board: edge recall (authority Sobel edges reproduced within
2 px), edge precision, mean |Δ| RGB. Nothing is masked (live figures differ from the authority's sample figures by design), so no
screen reaches 1.0 and a low MAD never proves a match. Images: evidence/37/<id>_AUTHORITY_BEFORE_AFTER.webp (authority · before ·
after, 471 × 836)."""
T['25'] = """# 25 · Financial non-regression

No financial module changed this sprint (data/, ledger/, finance/ untouched; git diff in report 29). The rebuilt pages read the
same canonical figures: `computeMoneyPicture` positions (held / owed), `reviewIssues`, `orderAccounts`. ZERO HELD BALANCE BEFORE
ARCHIVE (`HELD_BALANCE`), zero liability, no unresolved dependencies: unchanged and tested (jurnlF05Dot01 D53 / D53b,
jurnlF05Pockets P08b, E2E pockets T14 / T16). No automatic money movement; no ledger record is touched by any composition."""
T['26'] = 'see generated test section'
T['27'] = """# 27 · Remaining visual and asset gates

1. Per-screen seals 16 / 17 / 18 / 19 / 20 / 36 and 16's receipt header art — lift from each authority (method of this sprint).
2. Structural rebuilds still open: 07–13, 23, 24, 28, 31, 33 (STRUCTURAL_MISMATCH).
3. Layout passes: 14, 15, 21, 25, 30, 32, 34, 35, 37.
4. 06 reduced / extended count variants (0–3, ≥ 5) are proposals.
5. 01's accounts rail (Cursor) vs the authority's four papers — founder decision; its carousel / motion E2E specs fail on the base.
6. 02 copy (SET ASIDE / PENDING / INCOMING vs AVAILABLE / HELD / PENDING) — founder decision.
7. 26 ENTER MANUALLY at 393 × 660.
8. 02–05 foot below the fold on screens shorter than 9:16 (rows reachable) — apply `absorb` / fit per page.
9. Inline-vector icons where no approved source exists (DETAILS info glyph, back arrow on the amber chip, MANAGE dots).
10. iOS Safari verification (report 23)."""
T['28'] = """# 28 · SIDEKICK generation decision

SK01: **SUFFICIENT** — it is the environment of 01 and (now) 06; 06's lower band is SK01's own.
SK02: **SUFFICIENT** — hero environment for 02–15 / 17–18 / 20 / 22 / 30–37 family renders; its removed papers are page content.
SK03: **SUFFICIENT** — 26 is its pixel pair; the overlays render on its field.

ADDITIONAL_SIDEKICKS_PROVEN_MISSING: **0**. SIDEKICK_GENERATION_REQUIRED: **NO**. No SIDEKICK_GAP brief is issued: no authority
shows an environment deficit after its foreground is restored (report 04 / 05). The remaining gaps are foreground objects and
seals (MISSING_HERO_ASSET / micro assets), each present inside its own approved authority render. NEW_GENERATION_APPROVED: NO."""
T['29'] = 'generated'
T['30'] = """# 30 · Founder review

Please review on a real iPhone (Safari) — this sprint could not verify iOS (report 23):

1. **06 ALL ACCOUNTS** with your real pockets: does the restored SK01 composition (papers, ADD / REORDER surfaces, landscape, dock)
   match the authority? Approve or reject the reduced-count variants (1, 2, 3) and the ≥ 5 internal scroller.
2. **22 EMPTY ACCOUNTS**: the authority composition; LEARN ACCOUNT TYPES now opens a short explainer (new copy, review it).
3. **01 accounts rail** (Cursor, tunnel): keep the rail or return to the authority's four papers?
4. **02 summary labels**: SET ASIDE / PENDING / INCOMING (tunnel) or AVAILABLE / HELD / PENDING (authority)?
5. Authorise the next lift batch: the per-screen seals (16–20, 36) and the 07–13 structural rebuilds.

Nothing is founder-approved by this package. No merge, no deployment, no generation, no spend, no database change."""
T['29'] = """# 29 · Changed files and SHA map

Base `d6992b3fc` → branch `claude/jurnl-f05-dot01-shell-convergence-um0u93` (SHA in the final response; this package is part of
that commit). No financial, ledger, server, Supabase or V3 file changed.

| File | Change |
|---|---|
| `src/projects/jurnl/runtime/screens/f05/dot01/Dot01Frame.tsx` | new env SK01_FIELD (F05_MOTION_SIDEKICK, sheet tile at the parent's seam 1190, SK01 title paper + seal layers, baked nav paper with one owner + empty geometry marker); `absorb` (short-screen seam overlap, then height fit); per-env tile seating |
| `src/projects/jurnl/runtime/screens/f05/dot01/directoryScene.ts` (new) | the 06 / 22 scene-coordinate contract: kind papers, action surfaces, cells per count, zone, absorb, max crop, type sizes, 22 band / seam / boxes |
| `src/projects/jurnl/runtime/screens/f05/dot01/DirectoryPage.tsx` | 06 seated in board px on SK01_FIELD (DirectoryPaper, DirectoryAction); 22 EmptyBoard from its own band; LEARN ACCOUNT TYPES overlay; reorder (32) unchanged |
| `src/projects/jurnl/runtime/screens/f05/dot01/jurnl-f05-dot01.css` | `.d01-dir*` (06) and `.d01-empty*` (22) board styles; overlap feather; nav-paper marker |
| `src/projects/jurnl/families/F05_MONEY/DOT01/SCENES/` (new files) | CARD06_{BANK,PAYOUT,CASH,CREDIT}, ACTION06_{ADD,REORDER}, ICON06_{ADD,REORDER}, SCENE_22, SCENE_22_TILE, SEAL_22 (WebP, alpha), F05_DOT01_SCENE06.json (source SHA-256, boxes, masked boxes) |
| `scripts/jurnl/f05-motion-pilot/extract_dot01_directory_scene.py` (new) | the deterministic lift (GrabCut + Telea inpainting of live-text pixels only; SHA-256 checked against the V9 manifest) |
| `scripts/jurnl/f05-motion-pilot/capture_dot01_directory_counts.ts` (new) | 06 at 0 / 1 / 2 / 3 / 4 / 5 / 7 pockets: screenshots + board rects |
| `scripts/jurnl/f05-motion-pilot/probe_dot01_37_states.ts` | 25 reached under the zero-balance archive policy (`many-zero` world); ICONS=1 icon census |
| `tests/jurnlF05DirectoryScene.test.ts` (new) | 9 contract tests (C1–C7, E1–E2) |
| `e2e/jurnl/jurnl-f05-dot01-directory.e2e.ts` (new) | 06 with 1 / 2 / 4 / 7 pockets, art per kind, 22 journeys |
| `playwright.config.ts` | the new spec added to the `small` project list |
| `JURNL/MANIFEST/F05_MONEY_DOT01_SHELL_CONVERGENCE_V1/` | this package |
"""
