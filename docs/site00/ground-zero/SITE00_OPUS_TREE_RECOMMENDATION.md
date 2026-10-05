# SITE 00 — Opus Tree Recommendation

**Status:** PROPOSED_BY_OPUS · not founder-approved · nothing applied to code
**Commit audited:** `eedc9c8` (main, 2026-10-05)
**Machine-readable:** `SITE00_OPUS_RECOMMENDED_CANONICAL_PAGE_TREE.json` · changes in `SITE00_PAGE_TREE_CHANGELOG.json` (51 changes)

---

## 1. What the tree should be, in one paragraph

SITE 00 should read as **four audience surfaces joined by one project truth**. Visitors move through the **public location** (ORIGIN, the WAITING ROOM, IDNTY, BLDR, EVOLVE). A person becomes a member through **ACCESS & CTRL ROOM** (sign-in, invite acceptance, their projects and intakes). A client lives in **one CLIENT APP per project** (HOME · PROJECT · REVIEWS · INBOX · LIBRARY). The founder makes the work in the **PRODUCTION WORKSPACE** (HUB · INBOX · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · ACTIVITY), scoped to one project at a time, and runs the business in **00 / CONTROL**. Everything that is a bench, an experiment or a debug harness leaves the product tree and goes into one guarded **LAB**. Cross-cutting machinery — registry, membership, review engine, events, notifications, messages, files, project pulse — is a set of **systems, not pages**.

Today the code has the right pieces but too many copies of them: four client project rooms, three internal planes, two public directories, 53 one-off routes inside the product namespace, and a project registry split across seven hard-coded lists.

## 2. Why

1. **The locked ontology already describes audiences.** The client nav (HOME/PROJECT/REVIEWS/INBOX/LIBRARY) and the production nav (HUB…ACTIVITY) are two different instruments. Mixing them behind one URL (today's `/projects/:slug`, which hard-codes the FOUNDER view) is the source of most confusion.
2. **The review loop needs exactly one client surface and one founder surface reading one table.** Today three client surfaces read the review API, none is reachable with auth in production, and the workspace reads none of it.
3. **Clarity scales.** With four more projects arriving (JURNL, AIO, FRONTAL SLAYER, future clients), every duplicated surface multiplies the firewall surface area.

## 3. What should EXPAND

| Where | Expansion | Why |
|---|---|---|
| Production HUB | **CLIENT RELATIONSHIP** child (`/production/:slug/client`) | Canon requires client status, project status and client relationship in the workspace; nothing exists. |
| Production INBOX | **CLIENT REVIEWS lens** + **SEND TO CLIENT** sheet | The loop has no start and no return today. |
| Client app | **PROJECT** journey, **NOTIFICATIONS** and **MENU** drawers | Locked tab and header items that do nothing today. |
| ACCESS | **ACCEPT INVITE** (`/invite/:token`) and **MY PROJECTS** (`/control/projects`) | No invite flow; clients cannot find their project. |
| Public | **LEGAL**, **ORIGIN STORY**, **NOT FOUND** | Footer links 404 silently; ORIGIN must carry the inception story without becoming a generic about page. |
| BLDR | **SYSTEMS** + **EXTENSIONS** classes | Locked ontology; authority already defines them. |

## 4. What should COLLAPSE

- **Client review sub-routes** — compare / comments / annotations / approve / revision / history are six URLs for one component. They become states of the review, plus one revision-feedback sheet. Approve and revision are reclassified as **interactions**.
- **Client `project/:section`** (8 sections) → sections of PROJECT. **`library/:categoryId`** → a LIBRARY state.
- **CTRL ROOM domains / billing / team / settings / security** (one shared placeholder component) → one SETTINGS surface with tabs.
- **`/bldr/start`** (self-described legacy hop) → BLDR hub.
- **Production design modes** stay states (already are).

## 5. What should MERGE

- **`/app` + `/client/projects` + `/studio/:slug` client views → CLIENT APP.** The web project room becomes the desktop composition of the same tree.
- **`/enter` (WAITING ROOM) + `/origin/locations` (LOCATIONS) → WAITING ROOM with a MAP state.** *Medium confidence; founder decision.*
- **`/contact` + `/faq` → SUPPORT** (HELP / CONTACT / BOOK DISCOVERY).
- **`/about` + `/brand` → ORIGIN STORY.** **`/guide` → SYSTEM.** **`/blueprints` → BLDR TEMPLATES.**
- **`/existing-location/*` → EVOLVE assessment** (same job: an existing property).
- **`/account` → CTRL ROOM.** **Admin project pages + provisioning + setup → CONTROL PROJECTS** (the one registry UI).
- **CONTROL REVIEWS + production INBOX decisions → one review engine**, viewed cross-project in CONTROL and per project in INBOX.
- **Legacy founder-workspace routes** (content-operations, character, cultural intelligence, campaign…) → EXPRESSION families where one exists, otherwise LAB.

## 6. What should SPLIT

- **`/production`** today is both "all projects" and "NDXBOOK's hub". Split into **PRODUCTION (all projects)** at `/production` and **HUB** at `/production/:slug`.

## 7. What should MOVE

- Production **INBOX / LIBRARY / ACTIVITY** under `/production/:slug/…` (project-scoped, as canon requires).
- **`/account/intakes`** → `/control/intakes`.
- **`/control/evolve-operations`** (founder-only data on a client route) → CONTROL EVOLVE OPS.
- **18 design benches, 31 experiments, dev harnesses** → `/lab/*` behind one admin guard.
- **Project runtime preview** → the LIVE state of EXPERIENCE (route kept).

## 8. What should disappear as a top-level page

`/projects` and `/projects/:slug/*` (STUDIO OS modules), `/studio/:slug`, `/client/projects`, `/account`, `/about`, `/brand`, `/faq`, `/contact`, `/guide`, `/sound`, `/blueprints`, `/existing-location`, `/bldr/start`, `/origin/locations`, and every bench/experiment route. Each keeps a **redirect** — no deep link breaks — and nothing is deleted until its successor reaches parity.

## 9. What should become a new page

`/invite/:token`, `/control/projects`, `/production/:slug/client`, `/origin/story`, `/legal/:doc`, `/lab`, a NOT FOUND page, and the BLDR EXTENSIONS class.

## 10. What should become a state or interaction

| Becomes | Current route(s) |
|---|---|
| STATE of review | `/reviews/:id/{compare,comments,annotations,history}` |
| INTERACTION | `/reviews/:id/approve`, `/reviews/:id/revision` |
| STATE of PROJECT | `/project/:section` |
| STATE of LIBRARY | `/library/:categoryId` |
| STATE (tab) of SETTINGS | `/control/{domains,billing,team,security}` |
| STATE (MAP) of WAITING ROOM | `/origin/locations` |
| STATE of SUPPORT | `/contact`, `/faq` |
| STATE (section) of SYSTEM | `/guide` |
| STATE (LIVE) of EXPERIENCE | `/production/:slug/runtime/*` (route kept for mounting) |
| COMPONENT STATE (global setting) | `/sound` |
| DRAWER | client PROFILE and PROJECTS tabs |

## 11. What the top-level navigation should express

| Surface | Navigation |
|---|---|
| Public mobile | ORIGIN · IDNTY · **WAITING ROOM** (centre) · BLDR · EVOLVE — signed in, CTRL ROOM replaces EVOLVE |
| Public desktop | ORIGIN mark · IDNTY · BLDR · EVOLVE · SYSTEM · SITES · ENTER 00 / EXIT 00 |
| Client app (locked) | HOME · PROJECT · REVIEWS · INBOX · LIBRARY |
| Production (locked) | HUB · INBOX · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · ACTIVITY |
| 00 / CONTROL | COMMAND · PROJECTS · REVIEWS · CLIENTS · BUSINESS · EVOLVE OPS · VAULT · ACCESS · SETTINGS |

The public desktop header today shows SITES/SERVICES/SYSTEM/ABOUT/JOURNAL and **no product**. The proposal puts the three locked products first.

## 12. Audience split

- **Public-facing:** ORIGIN, WAITING ROOM, ORIGIN STORY, SYSTEM, SITES, JOURNAL, SERVICES (product map), SUPPORT, LEGAL, IDNTY, BLDR, EVOLVE.
- **Client-facing:** ACCESS (sign-in, invite, recover), CTRL ROOM (projects, intakes, sites, settings), CLIENT APP.
- **Internal only:** PRODUCTION WORKSPACE, 00 / CONTROL (incl. ASSET VAULT), LAB, STUDIO WORLD (reserved).
- **Project-owned:** PROJECT RUNTIMES (JURNL runtime, ASTRAL WORLD reader), firewalled from host chrome.

## 13. Confidence

| Recommendation | Confidence | Basis |
|---|---|---|
| One client app; retire `/client/projects` + `/studio` client views | HIGH | repo_evidence, locked_ontology |
| Project-scope every production tab; split `/production` | HIGH | repo_evidence, locked_ontology |
| LAB namespace for benches/experiments | HIGH | repo_evidence |
| Review sub-routes → states/interactions | HIGH | repo_evidence |
| Invite, MY PROJECTS, CLIENT RELATIONSHIP, LEGAL as new nodes | HIGH | repo_evidence, user_journey |
| Merge LOCATIONS into WAITING ROOM | MEDIUM | user_journey, locked_ontology |
| ORIGIN STORY absorbing ABOUT/BRAND | MEDIUM | locked_ontology, inference |
| Existing-location → EVOLVE | MEDIUM | repo_evidence, user_journey |
| Retire STUDIO OS `/projects/:slug` modules | MEDIUM | repo_evidence (some modules may hold unique data) |
| STUDIO WORLD as reserved family | LOW | locked_ontology, inference |

## 14. The strongest alternative (summary)

**Project-first.** One project address, `/projects/:slug`, serves every role. Clients see the five client tabs; the founder sees the same project plus `/production/*` with the seven locked tabs. LOCATIONS stays a separate place, and CONTROL folds into production as `/production/ops`. This is a real contender: it reuses the existing `/projects/:slug` investment and gives one link per project. The cost is a firewall enforced at render time on shared URLs. See `SITE00_TREE_TRADEOFF_MATRIX.md`.
