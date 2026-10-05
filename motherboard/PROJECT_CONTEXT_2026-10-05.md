# Project ecosystem handoff — 2026-10-05

**Sprint:** P0.SITE00.PRODUCTION-GATEWAY-MOTHERBOARD-CONTEXT-SYNC1  
**Provenance key:** [LOCKED] founder decision · [REPO] implemented artifact · [FORENSIC] audit finding · [HISTORICAL] context · [OPEN] not decided · [SUPERSEDED] replaced

---

## Why this document exists

ChatGPT and agent conversations accumulated material product, production, and architecture context that was not fully durable in repo memory. This sprint transfers **project-relevant** context into the motherboard and implements the first **enforced** production root engine: **PROVIDER_GATEWAY**.

**Incident chain (reference binding):** Policy + tests reported PASS, but capability-genome forensic found ~57 non-test files still calling providers directly. F03 plate-first Grok outputs proved the gap in practice. **Rule:** promote founder corrections into canon, guardrails, tests, and shared infrastructure — not one-off patches.

---

## Founder workflow [LOCKED]

- Final creative authority; concise analysis before implementation; full pasteable sprints; option boards before premature lock.
- Live evidence (screenshot, runtime, tests) over agent claims.
- Visual/spatial/product reasoning; mobile-first review; typography, material, geometry, lineage discipline.
- Session close: prose + conclusion code box + deploy links (see `.cursor/rules/session-close.mdc`).

---

## Hierarchy [LOCKED]

| Layer | Role |
|-------|------|
| **SITE 00** | Client-facing commercial **digital location** product (not generic website builder) |
| **STUDIO OS** | Internal production machinery |
| **STUDIO WORLD** | Digital office / spatial production infrastructure — must not bottleneck SITE 00, JURNL, AIO, FS |

---

## SITE 00 [LOCKED + REPO]

- Products: **IDNTY** (states 00–03), **BLDR** (SITE/WORLD/SYSTEMS/EXTENSIONS), **EVOLVE** (REFINE/INSTALL/TRANSFORM + Marketing & Content complement).
- Visual canon: luminous white architecture, red signal, spatial depth, host-chrome discipline; Library may be dark exception.
- Client app nav: HOME · PROJECT · REVIEWS · INBOX · LIBRARY. Project room answers “where we are / what needs you / what’s next / cost / files” without founder status pings.
- **Site ≠ project:** launch does not end the working relationship (maintenance, EVOLVE, extensions).
- **Control Room** (account/me) ≠ **Control Plane** (policy/machines) ≠ **Project room**.
- Movement layer: Enter 00, Waiting Room, Locations, Fast Travel, Swipe-up, Exit 00 — not ordinary page families.
- Production workspace bottom nav order preserved: HUB · INBOX · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · ACTIVITY.
- Viewport presets: mobile-first 393×852 (repo may use ~390×844 chrome), tablet 834×1194, desktop 1440×900.

### Capability genome [FORENSIC — PR #1368 lineage on main]

~290 canonical capabilities; mature system largely **exists but disconnected**. Strategy: **reconciliation, connection, promotion** before invention. Root engines: PERMISSION_ENGINE, PROJECT_REGISTRY, EVENT_LEDGER, ASSET_GRAPH, **PROVIDER_GATEWAY**, COST_LEDGER, CAPABILITY_REGISTRY, ROUTE_META_REGISTRY.

### Client readiness [LOCKED]

Two gates: **onboarding ready** (invite, membership, firewall, review loop) vs **delivery/launch ready** (hosting, SEO, monitoring). Do not collapse.

### Security urgency [FORENSIC]

Universal API auth, RLS, membership/invites, and permission engine still gaps — do not claim “client safe” until gates pass.

---

## JURNL [LOCKED + REPO]

- Personal finance/lifestyle; uppercase copy; no circular tappable buttons.
- Families F01–F16; **family = primary review unit**.
- Expression: same world, different room/moment/job; hierarchical expression cascade; expression brief + tree gates before paid generation.
- **Authority-first:** full composed page authority → approval → clean plate derivation (not background-first).
- **Plate ↔ UI:** occupancy zones; `PLATE_UI_INTERFERENCE` when environment competes with left rail.
- F03 distinctness FAIL / plate SHOULD_REPLACE; F04 PASS; child production blocked pending founder parent review / F03 correction.
- Currency: base ≠ display; no symbol-only conversion [LOCKED principle].

---

## AIO [LOCKED context]

- All In One Enterprises; brokerage model shipper → AIO → private carrier board (not open marketplace).
- Separate Supabase context; SITE 00 classification: existing product · reconstruction; IDNTY 00 Starting at Zero in formal pipeline.
- **Not client-ready** until onboarding gate passes; gateway firewall tests prove method only.

---

## FRONTAL SLAYER [LOCKED context]

- Luxury raw hair; red #EB1C24, gray, marble/acrylic/crystal world; six signature units + PSA masteries; mansion/showroom spatial commerce vision.
- Future SITE 00 integration after client foundation; preserve `fs_*` boundaries.

---

## ASTRAL WORLD / Astréa [LOCKED context]

- Multi-reader spatial platform; flagship Astréa; Tarot Suite, Astral Mall, Coffee Shop; subscription tiers; entry must feel spatial threshold not landing page.

---

## STUDIO OS [REPO]

- Organizes/runs machinery; bulletproof pipeline stages Discover → … → Evolve documented in sprint canon.

---

## STUDIO WORLD [LOCKED + REPO]

- Residents S1 ensemble (Etta, Zuri, Jules, Noa, Caspian, Iona, Marlowe, Elio) — persistent people, not client roles.
- Fabrication: face authority → body → continuity → UE; modular production (reuse → reskin → net-new).
- Must not block product shipping; reusable methods validated then productized.

---

## NDXBOOK [LOCKED]

- Project inside SITE 00 / Studio World production — not SITE 00 itself, not a resident.
- Entry 002 “Oh, now it was fun?” — 2016 baddie fashion reel pipeline; locked production order (cover → reel → … → fan-out formats last).

---

## Production methodology & guardrails [REPO — 2026-10-05]

- Reference exists → reference-guided; no describe-then-text-to-image; cross-project reference blocked.
- **Enforcement path:** `runProductionProviderRequest()` — see `docs/production/provider-gateway/`.
- Spend: server `spend_authorization_id`; legacy `founderConfirmedSpend` insufficient alone.
- Direct provider imports: allowlisted legacy inventory + CI audit prevents **new** bypasses.

---

## Deployment / CI [FORENSIC + REPO]

- Frontend: GoDaddy cPanel ZIP; API: Railway; merge ≠ live site.
- CI has been unhealthy — do not claim regression-guarded merge gate until green.

---

## Open / next root engines [RECOMMENDATION]

After PROVIDER_GATEWAY wave 1: **PROJECT_REGISTRY** consolidation (7+ competing registries) and **PERMISSION_ENGINE** for client onboarding gate — evidence from ground-zero / capability-genome forensics.
