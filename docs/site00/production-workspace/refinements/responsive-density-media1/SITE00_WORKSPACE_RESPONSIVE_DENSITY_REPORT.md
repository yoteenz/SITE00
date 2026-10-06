# SITE00 workspace — responsive density + media framing report

**Sprint:** P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1 · **Agent:** OPUS
**Primary target:** mobile 393×852 · **Regression targets:** tablet 834×1194, desktop 1440×900
**Evidence:** live browser (Chromium / Playwright) against the real workspace routes on this branch and on current `main`, captured with the same scripts. Unit tests only guard the contract; nothing below is claimed from static inspection.

---

## 1. Founder decision → what changed

HUB is the responsive density authority for typographic scale, panel density, media / thumbnail framing and mobile child-page behaviour. Every other tab keeps its own composition (DESIGN design-oriented, EXPERIENCE spatial, EXPRESSION creative / production, LIBRARY archival, ACTIVITY timeline, INBOX NEEDS YOU / WATCHING / RESOLVED). On mobile, each tab's **internal layers** (page title, section title, panel title, body, label, control, metric, caption, padding, gaps, media slots) are mapped onto HUB's own tokens. No page is scaled, no composition is flattened, and the shell (top bar, project selector, tab taxonomy, bottom nav) is untouched.

| | Before (main) | After |
|---|---|---|
| Non-HUB root tabs with an oversized title (mobile) | 4 / 6 | **0 / 6** |
| Oversized text layers on root tabs (mobile) | 90 | **0** |
| Oversized text layers on child pages (mobile) | 180 | **0** |
| Text clipping flags (mobile) | 22 | **10** (DESIGN chamber miniatures, intentional — §8) |
| Media elements declaring a slot + fit (mobile) | 0 / 237 | **169 / 237** — the other 68 are DESIGN composition art (§5.4) |
| Media cropped without any declared slot (mobile) | 168 | **23** (DESIGN composition art, fit owned by the chamber) |
| Media distortion · broken · source-driven geometry | — | **0 · 0 · 0** |
| Horizontal overflow (all 75 states) | 0 | **0** |
| Pane-edge hard cuts in internal scroll panes (mobile) | 7 | **0** (scroll-edge fade, §6.3) |
| HUB / tablet / desktop pixel diff vs main | — | **0.00%** on every captured state |
| Media stress test (63 + 42 + 42 cases) | — | **147 / 147 pass** |

---

## 2. HUB forensics (measured, not guessed)

Source: `site00-production-hub-reconstruction.css` — one authority px `u = 100cqi / 1125` (mobile), `/1792` (tablet), `/2000` (desktop), with legibility floors on phones. Live computed sizes on `/production` (see `SITE00_WORKSPACE_HUB_TYPE_AUTHORITY.json`):

| Role | HUB layer (proof) | HUB token | 393 (mobile) | 834 (tablet) | 1440 (desktop) |
|---|---|---|---|---|---|
| **T0** micro / system label | legend, VIEW ALL, timestamps | `--f-sub` 16.5–17 | 6.5 | 8.61 | 11.88 |
| **T1** supporting label | hero `small`, status captions | `--f-label` 17–19 | 7 | 8.84 | 12.24 |
| **T2** body / control | ops rows, status cells | `--f-main` 19–22 | 7 | 10.24 | 14.4 |
| **T3** panel title | `.hubx-head h2` | `--f-sec` 24–28 | 8.5 | 13.03 | 17.28 |
| **T4** section / feature title | `.hubx-feature b` | `--f-feature` 26–28 | 9.78 | 13.03 | 18.72 |
| **T5** workspace page title | hero `strong` "ENTRY 002" | `--f-entry` 38–50 | 13.27 | 23.27 | 31.68 |
| **T6** rare display | hero `h1` "NDXBOOK" | `--f-title` 58–74 | 20.26 | 34.44 | 47.52 |
| **METRIC** | status `strong`, ring `b` | `--f-num` 34–38 | 11.88 | 17.69 | 24.48 |
| **Nav** (shell, not modified) | bottom nav label | shell artboard 17px × 0.456 | 7.75 rendered | 9.86 | 11.59 |

**HUB density:** one screen of content at 393×852 (746 px scroll, 1.00 screens), panel pad ≈ 38u, row gap ≈ 15u, row thumbnails 58u square, entry thumbnails 98u, feature media 140u, hero band 315u, media radius 6px, controls ≥ 28px.
**HUB media treatment:** every HUB thumbnail is a fixed slot (cover, centred), hero plates are full-bleed bands with copy on a light wash, and nothing in HUB is sized by its source image.

---

## 3. Shared type scale (`WorkspaceTypeScale`)

`size = max(floorPx, authorityUnits × min(width, 2200) / artboard)` — the same formula HUB uses. Tokens `--pw-t0 … --pw-t6`, `--pw-metric` are emitted at every width on `.pxa[data-density]` / `.pw[data-density]` (mirror of `src/site00/config/production-workspace-density.ts`; a test keeps CSS and TS in sync).

- **T6 is rare:** at most one display title per ROOT tab, never above HUB's own display size (20.26 px at 393). ACTIVITY, EXPERIENCE and EXPRESSION hero titles (24–34 px before) now sit at T6.
- **Children top out at T5** (13.27 px at 393): Experience children 27.2 → 13.27, Expression families 19 → 13.27, ACTIVITY milestone 24 → 13.27, INBOX decision detail / all 19–22 → 13.27.
- **Root lens exception:** `ACTIVITY ?view=approvals` is a lens of the ACTIVITY root (same root hero), so its `h1` stays the root's T6 display title — recorded as `rootLens` in `SITE00_WORKSPACE_CHILD_PAGE_QA.json`.
- Deviation threshold: anything above the HUB-equivalent ceiling × 1.15 is reported. Mobile after: **0** layers.

Per-tab mobile type, before → after (px at 393; full table in `SITE00_WORKSPACE_ROOT_TAB_QA.json`):

| Tab | Page / hero title | Section title | Body | Label | Control | Metric | Screens |
|---|---|---|---|---|---|---|---|
| HUB (authority) | 20.26 → 20.26 | 13.27 → 13.27 | 7 → 7 | 6.5 → 6.5 | 6.5 → 6.5 | 11.88 → 11.88 | 1 → 1 |
| INBOX | — | 9.5 → 8.5 | 9 → 7 | 10 → 7 | 10 → 7 | 24 → 11.88 | 1 → 1 |
| DESIGN | — | 11 → 8.5 | 5 → 5 (chamber miniatures) | 6 → 6.5 | 7.5 → 7 | — | 1 → 1 |
| EXPERIENCE | 24 → 20.26 | — | 8 → 6.5 | 8.5 → 6.5 | 7.5 → 7 | — | 1.25 → 1 |
| EXPRESSION | 24 → 20.26 | 11 → 8.5 | 8.5 → 7 | 9 → 6.5 | 9 → 7 | 20 → 11.88 | 2.08 → 1.83 |
| LIBRARY | — | 22 → 13.27 | 10.5 → 7 | 10 → 6.5 | 9.5 → 7 | — | 2.11 → 1.77 |
| ACTIVITY | 34 → 20.26 | 15 → 8.5 | 13 → 7 | 11 → 6.5 | 10.5 → 6.5 | 22 → 11.88 | 2.2 → 1.56 |

---

## 4. Shared panel density (`WorkspacePanel`)

Tokens (mobile, HUB units): `--pw-pad` 38u · `--pw-gap` 15u · `--pw-row-gap` 15u · `--pw-radius` 6px · `--pw-target` 28px · `--pw-thumb-row` 58u · `--pw-thumb-strip` 98u · `--pw-media-card` 150u · `--pw-media-feature` 560u · `--pw-hero-h` 315u (tablet / desktop values in `SITE00_WORKSPACE_PANEL_DENSITY_CONTRACT.json`).

- Applied per tab on mobile: INBOX rows / focus / decision detail, ACTIVITY feed (64 → 39 px rows), lenses, search, stat icons, EXPRESSION cards / making / floor grid, LIBRARY tabs / category grid / vault / strips / collections, DESIGN bands, Experience children.
- `WorkspacePanel` primitive: explicit zones (media · text · metadata · actions), six layout modes — `MEDIA_LEFT_TEXT_RIGHT`, `MEDIA_TOP_TEXT_BOTTOM`, `THUMBNAIL_INLINE`, `FULL_BLEED_MEDIA_WITH_OVERLAY`, `MEDIA_ONLY_PREVIEW`, `METADATA_WITH_SMALL_THUMBNAIL`. The panel is its own inline-size container: side-by-side stacks when the **panel** is narrower than 300 px. Titles clamp to 2 lines (T3), metadata to 3 lines (T0) and long file names wrap anywhere.

---

## 5. Media slot contract (`WorkspaceMediaSlot`)

**Central rule:** the panel defines the media slot; the source never sizes the panel.

### 5.1 Fit modes (`SITE00_WORKSPACE_MEDIA_FIT_MODES.json`)

| Mode | Fit | Default focal | Crop |
|---|---|---|---|
| THUMBNAIL_COVER | cover | 50% 50% | intentional |
| THUMBNAIL_CONTAIN | contain | 50% 50% | never (neutral backdrop) |
| PORTRAIT_COVER | cover | 50% 22% (face / upper third) | intentional |
| LANDSCAPE_COVER | cover | 50% 45% | intentional |
| LOGO_CONTAIN | contain | 50% 50% | never (transparent) |
| UI_CAPTURE_CONTAIN | contain | 50% 0% (top bar kept) | never (dark backdrop) |
| AUTHORITY_PREVIEW_COVER | cover | 50% 0% | intentional (board previews) |
| WIDE_SCENE_COVER | cover | 50% 42% | intentional (hero plates) |
| DOCUMENT_PREVIEW_CONTAIN | contain | 50% 50% | never (hairline frame) |

### 5.2 Slot types (`SITE00_WORKSPACE_MEDIA_SLOT_CONTRACT.json`)

ROW_THUMB 1:1 · STRIP_THUMB 16:10 · CARD_MEDIA 16:9 · FEATURE_MEDIA 3:2 · PORTRAIT 4:5 · DOCUMENT 3:4 · UI_CAPTURE 9:16 · HERO_PLATE band · LOGO_MARK 1:1 · BOARD_PREVIEW (composed). Each declares aspect, default fit, mobile size / cap, overflow `CLIP_TO_SLOT`, radius, frame and responsive behaviour.

- **Caps never crush a frame:** a max size is applied through the inline size, `min(100%, maxBlock × aspect)`, so the aspect always holds. This was verified live: an earlier max-height cap squeezed real frames (LIBRARY strips 114×52 → 112×34, ACTIVITY milestone thumbs 40×40 → 20×40). It was replaced before merge, and the probe now reports 0 cap-bound frames.
- **Cascade strength:** cover fits and default focal points are zero-specificity (`:where(.pxa[data-density], .pw[data-density])`), so art-directed crops (zoom + per-item position) keep working and frames without the density layer are untouched. Contain fits and explicit `--pw-focal` metadata are strong, so a declared no-crop always wins.
- **Missing / failed asset:** the slot keeps its geometry and shows the named hatched state (`data-asset-state="missing"`), never a broken-image icon. Row-scale slots hide the label and move the name to the tooltip.

### 5.3 Frame ownership

- **Shared primitive** (`.pw-media`): the slot sets the frame (aspect + cap).
- **Existing compositions:** keep their authored frame, and HUB's own frames are the authority. The contract governs fit, focal, radius, missing state and source independence, and no shared rule may change an authored frame's aspect.
- **Intentional mobile frame changes** are listed per route in `SITE00_WORKSPACE_MEDIA_COMPONENT_AUDIT.json` (hero bands → HUB hero height, the EXPERIENCE plate flexing so the root fits one screen, LIBRARY strips 2.2:1 → 16:9). **Unexplained frame changes: 0.**

### 5.4 Declared components

INBOX (recent rail STRIP, incoming CARD, focus PORTRAIT, decision PORTRAIT, attachments STRIP) · ACTIVITY (avatars / bullets / links ROW, approval cards / updates STRIP, milestone FEATURE, hero HERO_PLATE) · EXPRESSION (making PORTRAIT, entries STRIP, ops ROW, floors CARD / WIDE_SCENE, content-package frames STRIP) · EXPRESSION families (family hero HERO_PLATE, storyboard frames STRIP, authority / look / performance art CARD with centred cover, casting headshots ROW / PORTRAIT_COVER) · LIBRARY (strips / flow STRIP, collections ROW, cast PORTRAIT_COVER, vault HERO_PLATE) · DESIGN (template cards CARD / LANDSCAPE, chamber plates BOARD_PREVIEW, core mark LOGO_MARK / LOGO_CONTAIN) · HUB (hero HERO_PLATE; feature / entry / ops / feed thumbs pinned to THUMBNAIL_COVER, the focal HUB already rendered) · Experience children (world plate CARD / WIDE_SCENE with per-sub-workspace focal, scroll hero HERO_PLATE).

**Composition art, not media panels:** the DESIGN atrium environment, the central red / black core, chamber miniature glyphs and pipeline stage icons. These are listed as `COMPOSITION ART` in the component audit.

---

## 6. Live QA

Captures: `screenshots/sheets/` (mobile BEFORE | AFTER per tab; tablet / desktop AFTER grids), `screenshots/compare/` (labelled comparison set), `screenshots/pixel-diff.json` (per-state diff), `screenshots/stress/` (media stress test).

### 6.1 Root tabs (7 / 7, mobile) — `SITE00_WORKSPACE_ROOT_TAB_QA.json`

HUB unchanged (pixel-identical). INBOX, DESIGN, EXPERIENCE, EXPRESSION, LIBRARY and ACTIVITY: 0 oversized layers, 0 overflow, 0 distortion, 0 broken media, 0 source-driven geometry.

### 6.2 Child pages (18, mobile + tablet + desktop) — `SITE00_WORKSPACE_CHILD_PAGE_QA.json`

| Tab | Child views |
|---|---|
| DESIGN | brand, surfaces, assets, viewport |
| EXPERIENCE | world, environments |
| EXPRESSION | narrative, casting / actors, wardrobe / looks, sets / environments, storyboard |
| LIBRARY | collection open, in review |
| ACTIVITY | approvals, milestone |
| INBOX | watching, all, decision detail |

Every mobile child tops out at T5 (13.27 px) or below; the ACTIVITY approvals lens keeps the root display title (§3).

### 6.3 Internal scroll panes

Locked-viewport compositions (Expression families, INBOX panes) scroll inside their panels. On main, 7 rows or controls were hard-cut at a pane edge. They now sit on a **scroll-edge fade**: the last 18 px fade out while the pane has more content, a scroll-driven effect that is inactive when nothing overflows and gone at the end of the scroll. Measured after: 9 edge rows, all faded, **0 hard cuts**.

### 6.4 Media stress test — `SITE00_WORKSPACE_MEDIA_STRESS_TEST.json`

Panels are mounted inside the real production frame (real CSS) at all three viewports. Sources: 1:1, 4:5, 3:4, 16:9, 21:9, very tall, very large, transparent logo, UI screenshot, missing, broken, plus long title, long metadata and a narrow (240 px) side-by-side panel.

Each case checks:
- the slot box is identical for every source
- the declared fit is applied
- the frame aspect equals the declared aspect (within 3%)
- the image fills the slot without distortion
- contain modes are never cropped
- the portrait focal sits in the upper third
- UI captures keep the top bar
- logos are contained
- hero focal metadata is honoured
- no panel or viewport overflow, no title / media collision, no clipped missing label
- the narrow panel stacks

Result: **mobile 63 / 63, tablet 42 / 42, desktop 42 / 42.** Captures: `screenshots/stress/`.

Note for content owners: a very tall or portrait source in a landscape cover slot shows its centre band. Give such assets focal metadata (`focal="50% 20%"`) or a PORTRAIT slot.

---

## 7. Implementation map

| File | Role |
|---|---|
| `src/site00/config/production-workspace-density.ts` | Contract: tiers, scale, panel density, fit modes, slots, frame ownership, `resolveWorkspaceMedia` |
| `src/site00/styles/site00-production-workspace-density.css` | §1 tokens · §2 media slot contract · §3 layer normalization (mobile) · §4 panel density + media (mobile) · §5 mobile fixes · §6 WorkspacePanel · §7 scroll panes |
| `src/site00/components/productionAuthority/WorkspaceMediaSlot.tsx` | Slot primitive + `workspaceMediaAttrs` |
| `src/site00/components/productionAuthority/WorkspacePanel.tsx` | Panel primitive (6 layout modes) |
| `primitives.tsx` (`Thumb` = WorkspaceThumbnail), `HubImage`, Expression family `Img`, `InboxBody`, `ActivityBody`, `iaKit`, `ExpressionBody`, `ExpressionFamilyShell` + families, `LibraryBody`, `DesignChamber`, `HubBody`, `ExperienceProductionShellPage`, `PwFrame`, `ProductionAuthorityFrame` | Slot / fit declarations (optional props — undeclared callers render unchanged); frames load the density layer (`data-density="hub-authority"`) |
| `scripts/production-workspace/density-*.mjs` | Live audit, CDP rule probe, report, stress test, screenshot pack, contract export |
| `tests/productionWorkspaceResponsiveDensityMedia1.test.tsx` | Contract + CSS guards (38 tests) |

---

## 8. Documented exceptions (functional / creative reasons, not drift)

1. **DESIGN chamber miniatures:** "Aa" and "NDX GROTESK" in the chamber's board miniatures extend past their miniature tile (2 flags per DESIGN state). They are scaled previews of a board, not readable copy, and are composition-owned and unchanged from main. The same applies to the 3.8–5 px chamber miniature body text, which is unchanged.
2. **Expression momentum-curve labels:** these sit beside their dots by design (an "out of parent" flag, not clipped) and are fully visible.
3. **Locked-viewport free space:** DESIGN root and modes distribute free space between the chamber and the bands. These are compositions, not density failures.
4. **ACTIVITY approvals lens:** keeps the root T6 title (§3).
5. **Tablet / desktop:** these are regression targets for this sprint and stay pixel-identical to main. Their pre-existing layers above the HUB-equivalent ceiling (e.g. ACTIVITY `h1` 54 px on tablet) are recorded in the QA JSON for a follow-up sprint.

---

## 9. Re-run

```bash
# live audits (branch + main), report, screenshot pack, stress test, contracts
VIEWPORTS=mobile,tablet,desktop BASE=http://127.0.0.1:5174 OUT=/tmp/after node scripts/production-workspace/density-audit.mjs
node scripts/production-workspace/density-compare.mjs /tmp/before /tmp/after docs/site00/production-workspace/refinements/responsive-density-media1/screenshots
node scripts/production-workspace/density-report.mjs /tmp/before/audit.json /tmp/after/audit.json docs/site00/production-workspace/refinements/responsive-density-media1 screenshots
BASE=http://127.0.0.1:5174 OUT=/tmp/stress node scripts/production-workspace/density-media-stress.mjs
npx tsx scripts/production-workspace/density-contracts-export.ts
```
