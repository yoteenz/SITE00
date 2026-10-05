# SITE 00 — Navigation, Spatial Shell & Control: Founder Review

- **Sprint:** P0.SITE00.GROUND-ZERO-NAVIGATION-SPATIAL-SHELL-INTERACTION-FORENSIC1
- **Status:** evidence plus proposals only. The Opus tree is still **PROPOSED_BY_OPUS**, and your tree is **not locked**. No routes changed and nothing was generated.
- **How this was checked:** by reading the code only, with file and line references. A live run was not possible because the npm registry is blocked here, so a few behaviours are marked CONFIRM_LIVE in `evidence/`.

---

## In one paragraph

Ground Zero found the routes correctly, but it under-described how SITE 00 is actually *moved through*. SITE 00 has a spatial layer that was missing from the tree: you arrive at **ORIGIN**, **ENTER 00** or swipe up into a directory, and **EXIT 00** takes you back. It also has a contextual shortcut layer, **FAST TRAVEL**, and the code tangles together four different "control" ideas. This review separates them. The architecture now reads as **layers**, not eleven peer families.

## How SITE 00 is entered today

| Step | What happens | Evidence |
|---|---|---|
| Arrive | **ORIGIN** (`/`) says "YOU ARE AT 00.00 ORIGIN POINT". | `config/status.ts:39-45` |
| Mobile, swipe up | Swiping up (or tapping **SWIPE UP**) opens **LOCATIONS** (`/origin/locations`) after a 720ms transition. | `useSwipeUp.ts:15-27,33`, `useOriginLocationsTransition.ts:7-35` |
| Mobile, "ENTER SITE 00" | This link sits on the same widget but opens **ENTER 00 / WAITING ROOM** (`/enter`). | `OriginMobileSwipeUp.tsx:37` |
| Desktop | The **ENTER 00** header toggle opens `/enter`. LOCATIONS cannot be reached on desktop: at 768px and wider it redirects to ORIGIN. | `EntryToggle.tsx:27-36`, `LocationsPage.tsx:37-39` |

**Important:** the "swipe-up ENTER 00 menu" you remember is, in code, the **LOCATIONS** directory, not `/enter`. One gesture area on ORIGIN therefore leads to two different directories.

## What ENTER 00 is

ENTER 00 is a **spatial portal**: the act of going inside. It opens the **WAITING ROOM**, a real place with its own environment plate (`ENTER_00_WAITING_ROOM`) and the label "LOCATION / ENTER 00". It is not a hamburger menu.

The WAITING ROOM has 9 destinations:

- **EXPLORE:** SITES, SERVICES, SYSTEM, ABOUT, JOURNAL
- **YOUR SPACE:** BLDR STUDIO, PROJECTS, ACCOUNT, SUPPORT

Gaps:

- IDNTY, EVOLVE and MY SITES are missing from the list.
- There are no founder or client variants; the only difference is a lock icon driven by a browser flag.
- The header nav on `/enter` repeats the same five EXPLORE items.

## What the WAITING ROOM is

In code, the WAITING ROOM is `/enter`. You said **MENU = WAITING ROOM**, but I could not find that decision written anywhere in the repo, including the motherboard memory. It should be recorded when the tree is locked.

Today two directory places exist:

| Directory | Platform | How you reach it | Destinations |
|---|---|---|---|
| **WAITING ROOM** (`/enter`) | Desktop-first | ENTER 00 | 9 |
| **LOCATIONS** (`/origin/locations`) | Mobile-only | Swipe-up and the bottom-nav centre button | 11 (includes IDNTY, EVOLVE, MY SITES) |

**Proposal:** treat them as **one WAITING ROOM system**, with:

- one list of destinations;
- two layouts, where mobile is the approved LOCATIONS design and tablet/desktop is `/enter`;
- ENTER 00 and SWIPE-UP both opening it, and EXIT 00 leaving it.

This replaces the earlier idea of merging LOCATIONS into `/enter` as a "MAP state".

## What EXIT 00 is

EXIT 00 is the **reverse portal**: it leaves an interior place and returns to ORIGIN. It always goes to the same fixed place and is never BACK. It appears in three places:

- `/enter`
- LOCATIONS
- the internal design workspace, where it means "leave the app" and goes to `/`

**Proposal:** keep EXIT 00 for public spatial exits only. Give internal tools their own EXIT PRODUCTION control. Keep the other actions distinct:

| Control | Meaning |
|---|---|
| **BACK** | Step back within a flow |
| **CLOSE** | Dismiss an overlay |
| **HOME** | That app's home |
| **EXIT PROJECT** | Leave a project room |
| **LOG OUT** | End the session |

**LOG OUT is broken for clients today.** The client SIGN OUT is a plain link that does not end the session, so sign-in sends the user straight back in (`SelfDirectedViews.tsx:509-511`).

## What FAST TRAVEL is

FAST TRAVEL is a **contextual shortcut overlay**: a global destination switcher. It is not a teleport, a project switcher or a workspace switcher.

**How it works:**

- It opens from the icon in the mobile header.
- It has 11 page-aware profiles and 20 destinations.
- It is driven only by the current URL and a "signed in" flag.

**Limits:**

- It is **mobile only**.
- It does not know founder from client, and it does not know the current project.
- It never appears on ORIGIN (so the ORIGIN profile can never show), LOCATIONS, `/enter`, production, the client app or admin.

**Proposal:** one FAST TRAVEL in every shell, at every viewport, aware of role and project. The WAITING ROOM stays the full directory; FAST TRAVEL stays the short, contextual one.

## CONTROL ROOM vs CONTROL PLANE (your correction applied)

Four different things currently share "control" names:

| Name | What it actually is |
|---|---|
| **CLIENT CONTROL ROOM** (`/control`, labelled "CTRL ROOM") | Meant to be account settings, but built as a "what needs my attention" command center. It mixes project signals, a founder-only EVOLVE operations card visible to every client, and seed data. Domains, billing, team, settings and security are stubs. There is no profile editing, and password reset is broken. |
| **FOUNDER CONTROL ROOM** | **Barely exists.** Settings is static text, the team list comes from an environment variable, finance is demo data, and provider connections are real. You have no profile, security, notifications, defaults or commercial page. |
| **00 / CONTROL** (`/admin/site00`) | An operations console that mixes three things: founder settings, project management (registry, provisioning, reviews) and business operations (leads, finance, reports). |
| **CONTROL PLANE** | Infrastructure (auth, registry, membership, permissions, firewall, review/approval engines, project graph, cost, funding, discounts, provider connections, notifications, lifecycle). It has no pages. In code, "control plane" currently names only the SITE 00 ↔ FSBW design handoff bridge, so that module needs renaming. |

The name "CTRL ROOM" is also used for an operator page (`/admin/site00/ctrl-room`), which collides with the client area.

**Proposed split:**

- **CLIENT CONTROL ROOM:** profile, security, notifications, payment methods and receipts, connected providers, membership/access, personal settings.
- **FOUNDER CONTROL ROOM:** profile, security, notifications, defaults, **COMMERCIAL** (pricing, discounts and promotions, client pricing, credits and waivers), payments and billing, provider connections, team and access.
- **Project management is never in a control room.**
  - Clients reach their projects through **YOUR SPACE** (MY PROJECTS, MY SITES, MY INTAKES).
  - You manage projects in **production / operations**.

## Discounts and promotions

**What exists today:** only Existing Location **courtesy codes**. They support six discount types, per-client restriction, expiry and redemption limits. Their limits:

- they run in memory, and the database tables for them go unused;
- their scope is never checked;
- they can only be created through an API call.

Nothing else exists: no project credits, no client-specific pricing and no general waivers.

**Proposal:** a **commercial adjustments engine** in the control plane, covering discounts, comps/waivers, a credit ledger, price and usage-limit overrides, with an audit history and checks at quote and checkout. You would manage it from **FOUNDER CONTROL ROOM › COMMERCIAL**. Clients see only their own credits and redemptions.

## How SITES differ from PROJECTS (your correction applied)

| | Meaning |
|---|---|
| **SITE** | A digital location SITE 00 created, which may be live |
| **PROJECT** | The ongoing working relationship and production container |

**Launched is not deleted.**

**Today:**

- Public `/sites` is empty, and links to `/sites/:id` go to a route that doesn't exist.
- The client "MY SITES" page shows hard-coded sample sites to everyone.
- Sites link to projects through a nullable `project_id`, and nothing creates a site at launch.
- Project statuses stop at PRODUCTION/ARCHIVED, and phases end at LAUNCH.
- Lists that show only ACTIVE projects make launched projects disappear.

**Proposed model:**

- **Linkage:** one PROJECT can have many SITES, and every SITE 00-built site must link to its project.
- **Project states:** ACTIVE, IN REVIEW, LAUNCHED, MAINTENANCE, EVOLVE, PAUSED, ARCHIVED.
- **Site states:** PLANNED, IN BUILD, LIVE, UPDATING, RETIRED.
- **From a site, a client can:** OPEN LIVE, view INFO, RETURN TO PROJECT, REQUEST MAINTENANCE, start an ADD-ON, EXTENSION or EVOLVE.
- **Public SITES:** a curated list of digital locations with a detail page each, not a portfolio grid.

## How client navigation differs from founder navigation

| | Client today | Founder today |
|---|---|---|
| Global nav | Account top nav, which also shows admin links that bounce | Same, plus PRODUCTION, production's 7 tabs and the operations nav |
| ENTER 00 / FAST TRAVEL | Same as everyone | Same as everyone (no founder variant) |
| Control room | `/control`, a command center | None |
| Project | `/projects` (founder view hard-coded), review links to `/client/projects`, `/app` direct | Six project switchers. The production switcher always lands on DESIGN, and the global tabs always show NDXBOOK. |
| Exit | EXIT 00; sign-out doesn't sign out | EXIT 00 (two meanings) |

The full matrix, including internal and project-scoped users, is in `SITE00_INDEPENDENT_TREE_REVIEW_PACKET_ADDENDUM_NAVIGATION.json`.

## How global navigation fits the product tree

`SITE00_EXPERIENCE_TREE.json` organises SITE 00 as **layers**:

| Layer | Contents |
|---|---|
| **A** Routed product surfaces | Public location, IDNTY, BLDR, EVOLVE |
| **B** Global navigation | Headers, bottom navs, FAST TRAVEL, project switchers |
| **C** Spatial entry/exit | ORIGIN, SWIPE-UP, ENTER 00, WAITING ROOM, EXIT 00, transitions |
| **D** Account / control rooms | Client and founder control rooms, plus ACCESS |
| **E** Project / client experiences | YOUR SPACE, project room, sites |
| **F** Production workspace | Plus the operations console |
| **G** Control plane | Infrastructure |
| **H** Project runtimes | A **platform container layer**, not a page family |
| **I** STUDIO OS | Machinery; **LAB is its internal surface**, not a separate root |
| **J** STUDIO WORLD | Reserved |

`SITE00_ROUTE_TREE.json` keeps the plain URL structure separately.

## What to reconsider before you lock the tree

`SITE00_TREE_REVIEW_CORRECTION_EVIDENCE.json` lists:

- **7 under-modeled items:** FAST TRAVEL, the spatial entry system, SWIPE-UP, EXIT 00, project switchers, context switchers, and non-route surfaces.
- **8 missing items:** founder control room, client control room as settings, control plane layer, commercial engine, client sites, post-launch lifecycle, site↔project linkage, and the LOG OUT / EXIT PROJECT distinction.
- **7 incorrect flattenings:** 11 peer families, ACCESS & CTRL ROOM, 00/CONTROL, system capabilities, project runtimes, STUDIO OS LAB, and SITES.
- **14 earlier proposals to revisit.** The main ones:
  - **TC010:** MY PROJECTS must not live in CTRL ROOM.
  - **TC011 and TC048:** intakes go to YOUR SPACE.
  - **TC033:** WAITING ROOM becomes one system with two layouts.
  - **TC029–TC032:** rename LAB to STUDIO OS › LAB.
  - The F05/F08/F09/F10 family definitions.

**New open decisions:**

- **U10:** founder control room scope.
- **U11:** client control room vs YOUR SPACE.
- **U12:** FAST TRAVEL scope.
- **U13:** project and site lifecycle states.
- **U14:** the "control plane" naming collision in code.
- **U15:** what EXIT 00 means inside internal tools.

## For the ChatGPT review

Give the reviewer these files:

1. `SITE00_INDEPENDENT_TREE_REVIEW_PACKET_ADDENDUM_NAVIGATION.md` (plus its `.json`)
2. The original `../SITE00_INDEPENDENT_TREE_REVIEW_PACKET.md`
