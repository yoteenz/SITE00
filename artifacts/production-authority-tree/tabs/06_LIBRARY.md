# LIBRARY — Production Authority Tree

## 1. ROOT AUTHORITY

- **Route:** `/production/libraries`
- **Component:** `LibraryBody` — canon vault / material archive (not generic card DAM)

## 2. CHILD ROUTES

None (single route; state via tabs and collection focus).

## 3. GRANDCHILD ROUTES

None.

## 4. NON-ROUTE INTERACTIONS

- Canon tabs: CANONICAL · IN REVIEW · SUPERSEDED · ARCHIVE
- Collection row expand → detail panel
- Category focus within vault grid

## 5. TEMPORARY SURFACES

- Collection detail panel (inline expand)

## 6. STATES

- Canonical vs non-canonical empty messages
- Live thumbnails vs placeholder when no asset URL
- Record counts on collections (live data)

## 7. RESPONSIVE VARIANTS

Full-width vault on all breakpoints; tablet/desktop pxh chrome. Mobile overflow fixes from prior sprints — verify on device.

## 8. PARENT INHERITANCE REQUIREMENTS

Red-geometry / world / stage plates for collections; canon inspection typography — avoid generic media library grids.

## 9. KNOWN STALE / LEGACY SURFACES

- Retired sepia `PW_IMG` plates replaced in Opus2 — monitor regression to production-mobile pack

## 10. MISSING / UNMOUNTED SURFACES

Categories listed in product canon; some categories may show empty until graph assets mount — not classified as MISSING routes.

## 11. AUTHORITY SOURCE

- Library authority reference + `AUTHORITY_ASSETS.libraryCanon`
- Live cast art for Actor Catalogue when available

## 12. CURRENT IMPLEMENTATION STATUS

| Node | Status |
|------|--------|
| library-root + vault + tabs | REFERENCE_LOCKED |
| library-collections | REFERENCE_LOCKED |

**Tree complete:** yes.
