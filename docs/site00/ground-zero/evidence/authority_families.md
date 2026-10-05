# SITE 00 authority families (commit eedc9c8)

Read this first: most founder screen authorities are not stored as images in the repo. They exist in three forms:

- the left or top half of `authority-vs-live` proof images under `artifacts/`;
- id or path manifests in code (`production-authority-registry.ts`, `publicRedesignAuthorityManifest.ts`);
- remote URLs (`download_production_authorities.ps1`, with 242 OpenArt records).

The repo has 2,111 tracked images. Every one is assigned to one of 41 sets in `authority_registry.json`, so `unclassified_bulk` is empty. Of those images, 1,013 have no viewport in the path.

Git history is a single squashed commit for every path. Because of that, recency comes from sprint lineage text, not from dates.

---

## PRODUCTION WORKSPACE (HUB / INBOX / DESIGN / EXPERIENCE / EXPRESSION / LIBRARY / ACTIVITY)

**Strongest current authority:** `STUDIOOS_PRODUCTION_PARENT_3VIEW_AUTHORITY_LITE_v1` (00–11).
- Each one is a triptych: desktop 16:9, tablet 4:3 and mobile 9:19.5.
- In-repo evidence: `artifacts/production-all-tabs-forensic1/*-authority-vs-tunnel.jpg` (I inspected the HUB, DESIGN/BRAND, EXPERIENCE and LIBRARY images).

**Canonical lineage**
1. `production-authority-registry.ts`: 36 founder images IMG_59xx/60xx (12 screens × 3 viewports). The originals are not in the repo. Status: OLDER_CANONICAL.
2. OPUS1 proof (`artifacts/production-authority-opus/`), then OPUS2 proof (`artifacts/production-authority-opus2/root/`). Status: LEGACY_VALID proofs.
3. Per-tab packs:
   - HUB: three founder HUB refs (1296×2304 / 1792×1344 / 2304×1296), giving HUB.RECONSTRUCTION.OPUS1 and then HUB.DESCENDANTS.OPUS1.
   - INBOX: `INBOX_ACTIVITY_3VIEW_v1`, then `INBOX_LITE_v2` (mobile only), then the INBOX root re-converged to PARENT_3VIEW 01_INBOX (`production-inbox-root-convergence2`). This last step is CURRENT.
   - ACTIVITY: `INBOX_ACTIVITY_3VIEW_v1` OPUS1 (`7dcf37de`) is CURRENT by explicit founder decision. ACTIVITY LOG is not a target.
   - DESIGN ×6: the PARENT_3VIEW boards plus the `DWS_SONNET_LITE/05_SYSTEM_PACKS` sheets give OPUS3. This is CURRENT.
   - EXPRESSION: `EXPRESSION_AUTHORITY_LITE` (v1/v2 naming conflict), 40 paired routes, giving EXPRESSION.OPUS1. This is CURRENT for the sub-pages; the root is partial.
   - EXPERIENCE / LIBRARY root: PARENT_3VIEW 08 / 10 are CURRENT.
     - Descendants: 92 + 150 OpenArt boards (`download_production_authorities.ps1`) are IN_REVIEW. They are not downloaded and no code uses them.
   - CHARACTER FABRICATION: 16 mobile screens, not in the repo. There is no tablet or desktop authority.

**Current responsive authority**
- Breakpoint families: mobile <700, tablet 700–1119, desktop ≥1120. Each family is recomposed independently, never scaled.
- QA artboards: 360×640@2x, 1024×768 and 1280×720.
- Device presets: 390×844, 430×932, 834×1194 and 1440×900.

**Visual rules (checked against the images)**
- Environments: white luminous atrium or plaza.
- Core: a black/red crystal pyramid core, under red light rings or an axis line.
- DESIGN boards: tilted glass boards suspended around the core.
- Status rail: floats over the hero foot.
- Section heads: red 3px bars.
- Counts: red numerals.
- Host chrome: off-white gradient with 1px rules.
- LIBRARY is the dark exception: black mountains with red geometry.

**Shared components**
- `ProductionAuthorityFrame`, with the `pxh-*` host top and the 7-tab bottom nav.
- `DesignChamber`, which uses `designPackAssets.ts`.
- `productionNavIcon`, which uses the `bottom-nav/masters` icons.
- Runtime assets: Grok1 plates and the HUB hero crops in `public/site00/production-authority-assets/`.

**Superseded**
- `public/site00/production-mobile/` (retired plates).
- The INBOX half of 3VIEW_v1.
- The OPUS2 descendant reskin for EXPRESSION.

## CLIENT APP (`/app`)

- There is no image authority in the repo.
- The only evidence is CSS: `site00-client-app.css` ("reference-faithful" P0.APP.1). It uses white and #fafafa, a 430px column, Martian Mono and #e8192c.
- MEMORY.md says it must be "not admin, not generic SaaS".
- **Status: INCOMPLETE** (the reference is not tracked).

## IDNTY / BLDR / EVOLVE / PUBLIC ORIGIN / LOCATIONS

**Strongest authority:** the SITE 00 Public Redesign Authority Pack. In the repo it exists only as code records in `src/site00/authority/publicRedesignAuthorityManifest.ts`.

| Family | Records | Viewport |
|---|---|---|
| ORIGIN | 4 | 941×1672 |
| IDNTY | 22 | 941×1672, 850×1850, 1080×1920 |
| BLDR | 6 | 941×1672 |
| EVOLVE | 4 | 1080×1920, 941×1672 |
| LOCATIONS | 1 | 941×1672 |

- Every record is mobile only.
- Status is STRUCTURE_IMPLEMENTED. Several IDNTY build-ready screens have honest deviations from the images.
- The experience compiler ingests them as `approved: true`.

**Superseded:** `01/02/03_OLD_REFINE_*_LAYOUT` (`99_SUPERSEDED_DO_NOT_USE`).

**Shared components**
- `PublicOriginMobile`, `IdentityDiagnosticFlow`, `BuilderPathPanel` / `BuilderCommandCenter`, `EvolvePathPanel` / `EvolveInterventionCenter`.
- Asset slots ENV.\*, MACHINE.\* and CARD.\* are defined in `publicRedesignAssetSlots.ts`. The Grok assets are pending.
- EVOLVE path icons: `public/assets/evolve/*.svg`.

**Limitations**
- I could not visually verify these, because the images are absent.
- There is no desktop authority.

## PUBLIC SITE: PROJECTS

- **CANONICAL:** `public/visual-references/founder/site00/projects-index-approved-reference.jpg`, plus its golden crop in `tests/fixtures/p0vr4r2/`.
- It is a desktop header crop only.
- What it shows: a red-glass orbital core, a FOUNDER VIEW (black/red) vs CLIENT VIEW selector, and corner-bracket stat tiles.

## DESIGN WORKSPACE: project design page (`/projects/:slug/design`)

**Lineage**
1. `twin-v3` prototypes, then r2, then r3 territories A/B/C. Status: SUPERSEDED.
2. Founder golden `founder-r5f2-ndxbook/{mobile,desktop}-master.jpg`. CORE.md calls it "the golden master".
3. Founder references p0vr2b, then p0vr6r1 calibration and the skins authority.
   - These use SITE 00 red and Martian Mono.
   - Tabs: REFERENCES / ASSETS / PAGES / SKINS / HISTORY / MORE.
   - Bottom nav: ORIGIN / IDNTY / LOCATIONS / PROJECTS / CTRL ROOM.

**Status: CONFLICTING.** The golden master is a black/lime NDXBOOK-skinned workspace, while Production DESIGN is the red/white chamber. `STALE_FALLBACK_MAP` flags the twin workspace as stale, but both are still routed.

**Icon sets:** `ai-consoles` and `project-tabs` are both STAGED (IN_REVIEW).

## PROJECT EXPERIENCE (client canon, NOT host)

- **NDXBOOK:** `visual-references/founder/ndxbook` (README: "canonical" mood boards).
  - Style: cream paper and olive/lime accent.
  - Status: REFERENCE_ONLY for host purposes.
  - The same files exist in both `public/` and the root `visual-references/`.
- **JURNL F01:** CANONICAL and live, with `F01.00_WELCOME_APPROVED`.
  - Style: bone, emerald and burgundy, with Barlow / Instrument Serif type.
  - `_ARCHIVE_SCREENSHOT_CROPS_v1` is superseded.
- **JURNL F02:** IN_REVIEW ("Founder visual approval is still pending").
- **ASTRAL WORLD:** `AW_M_01` / `AW_D_01` screen masters. Canonical master v2 replaces v1.

## SYSTEM / GUIDE / SOUND, AUTH / ACCOUNT

**NO authority** exists in the repo or in any manifest. The relevant routes in `WAITING_FOR_AUTHORITY_ROUTES` are `/system`, `/origin/sign-in`, `/origin/create-account` and `/checkout/*`. `/guide`, `/sound` and `/account` are not in that list, and I found no authority for them.

## INTERNAL SYSTEM

- **Design pack:** the two founder sheets in `docs/site00/design-pack/sources/` are CANONICAL. They define the component grammar:
  - panel shells, drawers, buttons, tabs and review cards;
  - pipeline tiles, device frames, environment plates;
  - swatches and utility widgets.
- **Loader:** v1.
- **NDX v3 icons.**
- `page-concept-generator` icons: INCOMPLETE (no runtime consumer).

## RESPONSIVE PACKS

**Real 3-viewport authorities**
- PARENT_3VIEW (12 triptychs).
- INBOX_ACTIVITY_3VIEW_v1 (12).
- EXPRESSION_LITE (40 mobile + 40 desktop/tablet boards).
- The HUB founder trio.
- The OpenArt EXPERIENCE/LIBRARY export (mobile + desktop_tablet, remote only).

**Gaps**
- There is no founder 834×1194 tablet authority. The production tablet authorities are 4:3.
- The Public pack is mobile only.
- INBOX tablet/desktop children were translated from the mobile authority because their boards were unreachable.

---

## TRUE conflicts needing a founder decision

1. **Bottom nav icon position (tablet/desktop).** The IMG manifest proof (OPUS1) puts the icon left of the label. PARENT_3VIEW puts it above the label.
2. **Host top-left title.** PARENT_3VIEW shows "HUB · SITE 00 / STUDIO WORLD". Live `pxh` canon removed it (`77302d92`).
3. **Host typography.** Martian Mono is the stated host canon (tokens.css, CORE.md). Production uses Saira Semi Condensed everywhere, with Martian only as a fallback. The authority renders show a condensed sans.
4. **Project design page.** The twin-v3 founder golden (NDXBOOK-skinned, lime) and the p0vr6r1 red Design Reconstruction compete with the Production DESIGN chamber.
5. **EXPERIENCE world.** The authority shows a red-lit city plaza with a ring cylinder. The Grok1 world plate is a daylight white city. Forensic1 records this as AUTHORITY_REFERENCE_MISMATCH.
6. **EXPERIENCE taxonomy.** The capsule labels (PATHS / INTERACTIONS / INHABITANTS / STATES / ACCESS, also used by the OpenArt export) differ from the registry routes (environments / modules / simulations / assets / review).
7. **HUB machine.** Should the legacy 864-space ProductionHub be kept, or converged into the hub root? (STALE_FALLBACK_MAP #1)
8. **Red tokens.** #e8192c (public/client) and #e5231b (production) are both in use. This is minor.

Already decided, not a conflict: ACTIVITY stays OPUS1. CF typography is an intentional specialization.

## Surfaces with NO authority

| Surface | Status |
|---|---|
| origin | **HAS** (code manifest only) |
| projects | **HAS** (desktop header only) |
| services | **NONE** |
| about | **NONE** |
| brand | **NONE** |
| faq | **NONE** |
| contact | **NONE** |
| account | **NONE** |
| system | **NONE** |
| guide | **NONE** |
| sound | **NONE** |

Also with no authority:
- sites and journal;
- sign-in, create-account, forgot-password and reset-password;
- checkout;
- the `/bldr` and `/evolve` hubs and their assessment steps;
- IDNTY complete and discovery-result;
- Character Fabrication tablet/desktop;
- the client app `/app` (no tracked reference).
