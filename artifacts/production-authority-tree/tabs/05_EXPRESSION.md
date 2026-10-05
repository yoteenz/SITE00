# EXPRESSION — Production Authority Tree

## 1. ROOT AUTHORITY

- **Route:** `/production/:projectSlug/expression?entry=002` (default entry 002)
- **Component:** `ExpressionBody` — Production Floor hero, making, active entries, floors, travel table
- **Entry canon:** ENTRY 002 — “OH, NOW IT WAS FUN?” (2016 Instagram Baddie Fashion)

## 2. CHILD ROUTES

| Sub-workspace | Route |
|---------------|-------|
| Narrative | `/expression/narrative` |
| Character Fabrication | `/expression/character-fabrication` |
| Casting | `/expression/casting` |
| Wardrobe | `/expression/wardrobe` |
| Performance | `/expression/performance` |
| Sets | `/expression/sets` |
| Storyboard | `/expression/storyboard` |
| Review | `/expression/review` |

## 3. GRANDCHILD ROUTES / MODES

| Parent | Grandchild | Trigger |
|--------|------------|---------|
| Narrative | Momentum wizard | tab `momentum` or Open narrative momentum |
| Casting | Actors | sub-tab `actors` |

## 4. NON-ROUTE INTERACTIONS

- Floor grid links (production floors cards)
- Format chips (REEL, TIKTOK, …)
- Narrative story/structure/momentum tabs
- Casting actors tab
- Engine buttons on several screens → legacy expression-engine route

## 5. TEMPORARY SURFACES

- **Narrative Momentum** embed (`NarrativeMomentumLive`) inside narrative screen
- CF popovers / steps (Character Fabrication internal UI)

## 6. STATES

- Entry progress chip (ready / pending / blocked)
- No entry in production empty
- Per-floor status from `useEntry002Production`

## 7. RESPONSIVE VARIANTS

- Root + most children: authority descendant layer (glass, stage band)
- **CF:** phone-native 432 canvas; tablet/desktop — authority nav + scaled canvas (**PARTIAL** on wide hosts)

## 8. PARENT INHERITANCE REQUIREMENTS

Children must trace to expression stage plate, red pipe heads, production floor grid — not content-ops admin.

## 9. KNOWN STALE / LEGACY SURFACES

- `/projects/:slug/content-operations/expression-engine` — **LEGACY_LOCKED**
- NME wizard tokens remapped only inside `.pw--authority`

## 10. MISSING / UNMOUNTED SURFACES

No invented sub-workspaces. Social/campaign naming appears in copy/floors but routes map to listed subs.

## 11. AUTHORITY SOURCE

- Expression stage / hub node art for floors
- CF: separate Fab Condensed authority (**AUTHORITY_CONFLICT** documented — intentional specialization)
- Entry 002 production graph

## 12. CURRENT IMPLEMENTATION STATUS

| Node | Status |
|------|--------|
| expression-root | REFERENCE_LOCKED |
| expression-child (except CF) | REFERENCE_LOCKED |
| narrative-momentum | REFERENCE_LOCKED |
| cf-surface | PARTIAL |
| expression-engine-legacy | LEGACY_LOCKED |

**Tree complete:** yes.
