# 19 · Membership, add-ons, help & support, sign out

Every claim is read at `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` @ `4ddbac6ce` and is VERIFIED_CURRENT_CODE.
Pricing, entitlements and authentication were not touched (sprint §20 / §21).

## Membership (MY MEMBERSHIP → `MembershipFolio`)

| Aspect | Finding | Evidence |
|---|---|---|
| Entry | menu `menu-membership` → `onOpen('membership')` | `runtime/global/GlobalMenu.tsx:89` |
| Data | `useJurnlEntitlements()` + the contract registry (`planById`, `capabilityById`, `addOnById`); read-only | `GlobalMenu.tsx:101-163` |
| Display | V3 folio with bronze laurel wax seal, YOUR PLAN row (`membership-plan`, FOUNDER ACCESS or plan name), status chip, first 6 capabilities checklist, granted add-ons | `:101-163` |
| Failure | fails closed: `V3Notice` "unavailable" when entitlements are not RESOLVED | `:120-123` |
| Upgrade / manage | MANAGE MEMBERSHIP row (`:158`) has **no handler**; it shows "NOT AVAILABLE YET" | `:158` |
| Add-ons path | NO ADD-ONS YET → `membership-add-ons` → add-ons | `:151` |
| Return | `membership-done` → back to the menu | — |
| Status | **ACTIVE_AND_FUNCTIONAL (read-only)**. Upgrade and management are absent by design (no billing provider configured: `billingLive` check in the folio). | — |

Related branch: PR #1708 (`cursor/jurnl-founder-entitlements-isolated-v1-4e5a`, draft) changes FOUNDER_FULL grants. It is not in the inspected tree,
and this audit does not depend on it.

## Explore add-ons (EXPLORE ADD-ONS → `AddOnCollection` → `UnlockFolio`)

| Aspect | Finding | Evidence |
|---|---|---|
| Entry | `menu-add-ons` → `onOpen('add-ons')` | `GlobalMenu.tsx:90` |
| Collection | `add-on-<id>` rows from the contract `addOns`, with art per add-on (`ADD_ON_ART`) | `:166-225` |
| Unlock | `UnlockFolio`. The `unlock-feature` card has `onClick={() => undefined}`, a **dead button**. `unlock-not-now` returns to the add-ons collection. | `:211` |
| Purchase | none (no checkout): consistent with no billing provider | — |
| Status | **ACTIVE_BUT_PARTIAL** | — |

## Help & support

| Surface | Behaviour | Evidence | Status |
|---|---|---|---|
| Menu HELP & SUPPORT | `showToast({ title: 'HELP & SUPPORT', body: 'NOT IN THIS PREVIEW YET.' })` | `GlobalMenu.tsx:93` | **PRESENT_BUT_PLACEHOLDER** |
| ACCOUNT page 3 HELP & SUPPORT (GET SUPPORT) | `s.notYet('HELP & SUPPORT')` | `AccountScreens.tsx:264` | **PRESENT_BUT_PLACEHOLDER** |
| Help articles, contact support, sync troubleshooting | not present | grep at `4ddbac6ce` | **REQUIRED_NOT_DESIGNED** |
| Account recovery | the F01 entry family (sign-in / recovery) owns it; it is not reachable from the menu | F01 screens | out of scope (auth unchanged) |

The current menu does not offer a working support experience. Required remediation is
a HELP & SUPPORT folio: topics (CONNECTING A BANK, SYNC PROBLEMS, MANUAL POCKETS, PRIVACY, MEMBERSHIP) and contact (a channel the
founder approves, FD-11). Connected accounts add **sync troubleshooting**, which deep-links from CX-13 errors.

## Sign out

| Entry | Behaviour | Evidence | Status |
|---|---|---|---|
| Menu SIGN OUT | `signOut()`: the session resets to `DEFAULT_SESSION`, the repository user becomes `preview-guest`, and Supabase `signOut` runs in production | `GlobalMenu.tsx:95`; `state/store.tsx:209-213` | **ACTIVE_BUT_PARTIAL** |
| ACCOUNT page SIGN OUT | same | `AccountScreens.tsx:266` | same |
| Drawer SIGN OUT | same | `AccountScreens.tsx:418` | same |

The defects are the same at all three entries:
* There is no confirmation, although F01.04 has one.
* The surface stays open.
* There is no redirect to `entry`, so the user stays on the app route as PREVIEW GUEST.

Remediation is navigation only: confirm, then close panels, then `go('entry')`. **Authentication itself is not changed.**

## Visual authority

The membership and add-on folios are V3 surfaces from the V3 global interactive authority (`JURNL/MANIFEST/…V3…`, see 21). No new
authority is needed for membership or add-ons. HELP & SUPPORT needs one folio composition (batch B09).
