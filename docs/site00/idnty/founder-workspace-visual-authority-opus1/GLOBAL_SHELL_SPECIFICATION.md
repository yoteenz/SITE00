# Global shell specification

**Status:** PROPOSED. Boards 01 (mobile), 02 (desktop and tablet), 24 (search, notifications, overlays), 25 (responsive). Registry SH-01…SH-16. Open decisions: FD-W1, FD-W2, FD-W6.

## 1. Today

Of the seven DF founder pages, only R7 uses `Site00AdminShell` (`src/site00/admin/components/shell/Site00AdminShell.tsx`). That shell:
- uses Martian Mono throughout;
- has a sidebar from `control-nav.ts` with no Digital Foundation item;
- shows a static "OWNER / ADMIN" profile and "V2.0.0";
- has a header with a read-only search that opens the production `AdminSearchModal`, a bell with **no handler**, and a static "ONLINE" label;
- has no account menu and no sign-out.

R1–R6 render with no shell at all.

## 2. Shell anatomy

| Part | Registry | Behaviour | Data |
| --- | --- | --- | --- |
| Founder identity | SH-02 | Plate + "FOUNDER" + email (data); opens the account menu | Supabase auth session |
| Environment indicator | SH-03 | `STAGING` tag beside the wordmark, read from the deployment identity in the readiness report; unknown → `ENV UNKNOWN` (muted), never assumed | `readiness-report` |
| Search / command | SH-04 | Phone: full-screen. Tablet/desktop: palette (⌘K). Groups: CLIENTS (name, email), REVIEWS, GO TO. Typed text keeps its case. Two-character minimum with the existing hint copy | `list` (+ names, G-01) and the §4 review derivation |
| Notification center | SH-05 | Derived list: founder decisions first (§4 queue), then recent movement (events). Bell red dot = at least one founder decision. MARK SEEN is local to the browser until a store exists (G-10) | §4 + events (G-03) |
| Global create | SH-06 | Phone: red 44 × 40 block centred in the bottom nav, label CREATE below → sheet with NEW CLIENT FOUNDATION, SYNTHETIC TEST CLIENT (TEST tag; staging only), PREPARE INVITATION (disabled: "after a foundation exists · open a client"). Desktop: red NEW FOUNDATION in the sidebar; synthetic creation lives in SYSTEM → TEST LAB | `create-artifact`, `create-test-client` |
| Account menu | SH-07 | FOUNDER (ADMIN), ENVIRONMENT (STAGING), READINESS DESK, CORRESPONDENCE STUDIO, OPEN CLIENT EXPERIENCE, SIGN OUT (red) | session |
| Bottom nav | SH-08 | HOME · FOUNDATIONS · CREATE · REVIEWS (count badge) · SYSTEM; current = red top rule + red label | review count |
| Menu drawer | SH-09 | Right drawer, 86 % width: WORKSPACE (01–06 by index, REVIEWS count), TOOLS (Readiness Desk, Correspondence Studio), identity, SIGN OUT | — |
| Index rail | SH-10 | Tablet: 72 px; plate, +, six icons with index numbers | — |
| Sidebar | SH-11 | Desktop: 232 px; see DESKTOP_LAYOUT_AUTHORITY.md | — |
| Inspector host | SH-12 | Dock (392 desktop, 360 tablet ≥ 1100) or sheet | selection |
| Overlay host | SH-13 | One portal; stack order: menu > dialog/sheet > drawer > inspector | — |
| Feedback host | SH-14 | Toasts (4 s, errors persist); page banners under the title | — |
| Layout controller | SH-15 | `< 768` phone · `768–1279` rail · `≥ 1280` sidebar; dock if width − nav ≥ 1100 | matchMedia |
| Page title | SH-16 | Index rail + display headline + red period + optional sub + optional threshold object | — |

## 3. Wordmark

- "SITE 00" is set in Saira Semi Condensed 600 with wide tracking, and "FOUNDER" sits below it. This is the DF client header treatment.
- The reference's monospace wordmark is not reproduced because the two-font rule forbids it.
- The STAGING tag is a 1 px ink outline with a small ink square.

## 4. Behaviour contracts

1. **Auth.** The shell renders inside `AdminGuard`. The preview bypass (`TEMPORARY_SITE00_ADMIN_BYPASS_ON_PREVIEW`) is unchanged by this work.
2. **Error boundary.** Keep the existing "[ ADMIN · INITIALIZATION FAILED ]" recovery (Reload / Return to sign-in), restyled.
3. **Review count.** One derivation (DATA_CONTRACT_MAPPING.md §4), shared by the bell, nav badge, Overview signal and Reviews title. If it fails to load, no badge is shown, never "0".
4. **Persistence of shell state.** The selected destination is in the URL. Drawer, search and notification state are not.
5. **Sign-out** uses the existing Supabase auth sign-out. On failure: an error toast, and the session is kept.
6. **No marketing chrome.** No promotional banners, upgrade prompts or version strings in the workspace shell. The admin "V2.0.0" label stays in the admin shell, not here.
7. **Correspondence Studio and the Readiness Desk** open in the same tab as full pages, with their existing chrome. The workspace does not iframe them.
