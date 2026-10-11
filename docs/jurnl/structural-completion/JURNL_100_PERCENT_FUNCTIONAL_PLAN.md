# JURNL — 100% FUNCTIONAL PLAN

Target: every F01–F16 node FUNCTIONAL on a neutral structural presentation, with **no new visual generation**.
Visual transformation runs afterwards, family by family, then founder approval, then launch.

## Completion simulation

| AFTER WAVE | FUNCTIONAL (BALANCED) | NODE-WEIGHTED | STRICT | NODES COMPLETED IN WAVE |
|---|---|---|---|---|
| W0 | 51.8% | 63.3% | 43.8% | 32 |
| W1 | 59.8% | 70.2% | 54.2% | 49 |
| W2 | 70% | 77.5% | 65.5% | 40 |
| W3 | 82.4% | 85.9% | 79.5% | 46 |
| W4 | 98.8% | 95.3% | 96.9% | 49 |
| W5 | 100% | 100% | 100% | 68 |

Each node's `target_wave` in the canonical graph says when it reaches 12/12. Waves 0–4 make F02–F16 and the global systems
functional on device persistence. Wave 5 brings the identity providers (auth, email, social, native bridge) that F01 needs to
reach 100% — a founder decision (FF.AUTH_PROVIDER), not a generation — and closes the launch gates (server persistence, RLS,
noindex, analytics, accessibility audit).

## Zero-generation rule

New nodes use existing JURNL primitives and live data. They mount on the family's parent plate where the plate is valid
(REUSE / MODULATE policy), or on the bone field (`JurnlScreen field="bone"`) for NO_PLATE nodes and interference-FAIL families.
Neutral is a holding state. No generic-SaaS components, colours or type are added. Plates are not changed.

## Waves (composer-ready)

### WAVE 0 — FOUNDATIONS — DATA CONTRACTS, REPOSITORY, DATE / CATEGORY / ACCOUNT MODELS, SHARED PRIMITIVES

**W0.1 DATE MODEL** · complexity M · collision MEDIUM · group W0-A
- Scope: ISO date type, cadence math (F02_CADENCES), next occurrence, relative formatter (TODAY / YESTERDAY / WEEKDAY / DATE).
- Depends on: nothing
- Files: `src/projects/jurnl/data/home/dates.ts (new)`, `src/projects/jurnl/data/home/money.ts`
- Pass: Unit tests for cadence + relative display across month ends and DST. LedgerEntry.when becomes an ISO date; display unchanged for existing mock scenario.

**W0.2 CATEGORY CATALOG** · complexity S · collision LOW · group W0-A
- Scope: Closed category list + icon binding table (placeholder glyphs allowed, flagged) + JurnlCategoryPicker.
- Depends on: nothing
- Files: `src/projects/jurnl/data/home/categories.ts (new)`, `src/projects/jurnl/runtime/components/TransactionRow.tsx`, `JURNL/MANIFEST/JURNL_CATEGORY_CATALOG.json (new)`
- Pass: Every mock and quick-add category maps to the catalog. markFor() reads the catalog.

**W0.3 REPOSITORY CONTRACT + DEVICE ADAPTER** · complexity L · collision HIGH · group W0-B
- Scope: Typed repository per data domain (list/get/create/update/remove/subscribe, status, asOf) with a localStorage/IndexedDB device adapter; MOCK becomes a seed scenario, not a source.
- Depends on: nothing
- Files: `src/projects/jurnl/data/repository/ (new)`, `src/projects/jurnl/data/home/money.ts`, `src/projects/jurnl/data/f02/setupDraft.ts`
- Pass: Data survives reload. Design-preview ?scenario still seeds mock data. No financial data leaves the device.

**W0.4 ACCOUNTS DOMAIN + ACCOUNT PICKER** · complexity M · collision MEDIUM · group W0-C
- Scope: DD.ACCOUNTS record (name, kind CASH/CHECKING/SAVINGS/CARD/LOAN/HELD, balance, asOf), F02.02 / F02.02.1 write into it, JurnlAccountPicker replaces both hard-coded lists.
- Depends on: W0.3
- Files: `src/projects/jurnl/data/repository/accounts.ts (new)`, `src/projects/jurnl/runtime/screens/HomeScreens.tsx`, `src/projects/jurnl/runtime/screens/SetupScreens.tsx`
- Pass: Quick add and filter list the registry. F02 setup writes a place.

**W0.5 REPOSITORY-DRIVEN STATES** · complexity M · collision MEDIUM · group W0-C
- Scope: JurnlStateBlock; LOADING / EMPTY / ERROR / STALE / OFFLINE from repository status; ?state remains a preview override.
- Depends on: W0.3
- Files: `src/projects/jurnl/runtime/components/primitives.tsx`, `src/projects/jurnl/runtime/screens/HomeScreens.tsx`
- Pass: F03 / F04 reach every state without ?state in tests.

**W0.6 SAFE-TO-SPEND FORMULA OWNED BY F09** · complexity S · collision MEDIUM · group W0-A
- Scope: Move safeToSpend() into an F09 module; obligations without an amount mark the signal PARTIAL instead of contributing $0; F03 + SEE WHY read it.
- Depends on: W0.1
- Files: `src/projects/jurnl/data/f09/safeToSpend.ts (new)`, `src/projects/jurnl/data/home/money.ts`
- Pass: Regression test: setup obligations never silently contribute 0. SEE WHY rows unchanged in the mock scenario.

**W0.7 REGISTER F05–F16** · complexity M · collision LOW · group W0-A
- Scope: Add F05–F16 to jurnlProject.ts families and generate production contracts from JURNL_FAMILY_TREE_F01_F16.json (implementation STRUCTURE_ONLY, approval UNREVIEWED). No approval claims.
- Depends on: nothing
- Files: `src/projects/jurnl/data/jurnlProject.ts`, `src/projects/jurnl/data/f05…f16/contract.ts (new)`
- Pass: familyGate / registry tests pass for 16 families.

**W0.8 SHARED PRIMITIVES** · complexity L · collision HIGH · group W0-B
- Scope: JurnlTopChrome, JurnlAmountField (extract), JurnlDateField, JurnlCadencePicker (extract), JurnlSignal (extract), JurnlRecordList, JurnlFieldRows (extract), JurnlProgress, JurnlComparePair, JurnlSequence. Global composition + containment rules apply.
- Depends on: W0.1
- Files: `src/projects/jurnl/runtime/components/primitives.tsx`, `src/projects/jurnl/runtime/components/ (new files)`
- Pass: interactive-text-qa.mjs stays at 0 drift at 393 / 834 / 1440. Each primitive has a role + a11y test.

**W0.9 MAIN-RED + DOC DRIFT** · complexity S · collision LOW · group W0-A
- Scope: Reconcile jurnlMonetizationFoundation "no price strings" with the currency contract; fix the FX wording in GLOBAL_COMPOSITION_RULES and the F03 plate status in CORE.md.
- Depends on: nothing
- Files: `tests/jurnlMonetizationFoundation.test.tsx`, `JURNL/MANIFEST/JURNL_GLOBAL_COMPOSITION_RULES.json`, `motherboard/CORE.md`
- Pass: Test green on main.

### WAVE 1 — GLOBAL SYSTEMS — SETTINGS, DISCOVERY, QUICK ADD V2, ASK EVERYWHERE, LEDGER EDIT, HONEST CONNECT

**W1.1 ACCOUNT / SETTINGS SURFACE** · complexity M · collision MEDIUM · group W1-A
- Scope: Route `account` with profile, display currency, privacy + AI access, consents, security + sessions, export, delete, sign out. Reuses F01.11 / F01.12 drawers.
- Depends on: W0.3, W0.8
- Files: `src/projects/jurnl/runtime/screens/SettingsScreens.tsx (new)`, `src/projects/jurnl/runtime/JurnlRuntimeRoot.tsx`, `src/projects/jurnl/runtime/screens/SecurityScreens.tsx`
- Pass: Sign out, export, delete reachable after entry. Currency selector moved (ASK keeps a link).

**W1.2 ASK JURNL ON EVERY FAMILY** · complexity S · collision LOW · group W1-B
- Scope: Family-aware explanation built from derived values; read-only; no LLM; AI access OFF respected.
- Depends on: W0.8
- Files: `src/projects/jurnl/runtime/screens/HomeScreens.tsx (AskSheet → shared)`, `src/projects/jurnl/runtime/screens/ParentScreens.tsx`
- Pass: ASK opens on F03–F16 with family context; no writes.

**W1.3 FAMILY DISCOVERY HUB LINKS** · complexity S · collision MEDIUM · group W1-B
- Scope: Panel-header actions on hubs (FF.DISCOVERY_HUBS mapping).
- Depends on: W0.8
- Files: `src/projects/jurnl/runtime/screens/HomeScreens.tsx`, `src/projects/jurnl/runtime/screens/ParentScreens.tsx`
- Pass: Graph validation: every family reachable from F03 without the review board.

**W1.4 QUICK ADD V2 + LEDGER EDIT / DELETE** · complexity M · collision HIGH · group W1-A
- Scope: Persisted save, date, category, registry account; F04 detail edit / delete for hand-added movements; RELATED link.
- Depends on: W0.1, W0.2, W0.3, W0.4
- Files: `src/projects/jurnl/runtime/screens/HomeScreens.tsx`, `src/projects/jurnl/data/home/money.ts`
- Pass: Add → reload → still there; edit; delete with confirm. JURNL_QUICK_ADD_CONTRACT updated (no recurrence).

**W1.5 HONEST CONNECT (MANUAL-FIRST)** · complexity S · collision MEDIUM · group W1-B
- Scope: F02.02 connect relabelled to naming a place unless FF.BANK_AGGREGATION chooses a provider.
- Depends on: W0.4
- Files: `src/projects/jurnl/runtime/screens/SetupScreens.tsx`, `src/projects/jurnl/data/f02/setupDraft.ts`
- Pass: No UI claims a live connection.

**W1.6 ONE CONSENT RECORD** · complexity S · collision MEDIUM · group W1-A
- Scope: DD.CONSENT written by F01.11 and F02.07, read by settings and ASK.
- Depends on: W0.3
- Files: `src/projects/jurnl/data/repository/consent.ts (new)`, `src/projects/jurnl/runtime/screens/SecurityScreens.tsx`, `src/projects/jurnl/runtime/screens/SetupScreens.tsx`
- Pass: Toggling in either place reflects in the other.

### WAVE 2 — SOURCE FAMILIES — F05 MONEY, F06 INCOME, F07 UPCOMING

**W2.F05 F05 MONEY STRUCTURAL COMPLETION** · complexity M · collision LOW · group W2-F05
- Scope: Parent live from DD.ACCOUNTS; F05.ACCOUNTS, F05.ACCOUNT; add / edit / remove / move; states.
- Depends on: W0.4, W0.8, W1.4
- Files: `src/projects/jurnl/runtime/screens/families/F05MoneyScreens.tsx (new)`, `src/projects/jurnl/data/f05/ (new)`
- Pass: Functional contract 12/12 for every F05 node. Responsive 393 / 834 / 1440; containment 0 drift.

**W2.F06 F06 INCOME STRUCTURAL COMPLETION** · complexity M · collision LOW · group W2-F06
- Scope: Sources CRUD, F06.SOURCE with matched arrivals, pattern sheet; setup seed handoff.
- Depends on: W0.1, W0.3, W0.8
- Files: `src/projects/jurnl/runtime/screens/families/F06IncomeScreens.tsx (new)`, `src/projects/jurnl/data/f06/ (new)`
- Pass: Functional contract 12/12 for every F06 node.

**W2.F07 F07 UPCOMING STRUCTURAL COMPLETION** · complexity M · collision MEDIUM · group W2-F07
- Scope: Obligations with amount + due date, sequence, item, mark paid (writes a movement), when sheet, overdue; setup seed handoff; F03 COMING reads F07.
- Depends on: W0.1, W0.3, W0.8, W1.4
- Files: `src/projects/jurnl/runtime/screens/families/F07UpcomingScreens.tsx (new)`, `src/projects/jurnl/data/f07/ (new)`, `src/projects/jurnl/data/home/money.ts`
- Pass: Functional contract 12/12. Safe-to-spend includes F07 amounts.

### WAVE 3 — DERIVED + PLANNING FAMILIES — F08 PLAN, F09 SAFE TO SPEND, F12 CREDIT, F14 GOALS; F03 RE-POINTED

**W3.F09 F09 SAFE TO SPEND + F03 RE-POINT** · complexity M · collision HIGH · group W3-F09
- Scope: F09 parent, WHY, HOLD; F03 signal + SEE WHY read F09; below-zero and unstated states.
- Depends on: W0.6, W2.F05, W2.F06, W2.F07
- Files: `src/projects/jurnl/runtime/screens/families/F09SafeScreens.tsx (new)`, `src/projects/jurnl/runtime/screens/HomeScreens.tsx`
- Pass: One formula; F03 and F09 show the same figure. F03 nodes reach 12/12.

**W3.F08 F08 PLAN STRUCTURAL COMPLETION** · complexity M · collision LOW · group W3-F08
- Scope: Intentions, assign, reorder, over-assigned validation; setup priorities handoff.
- Depends on: W2.F06, W2.F07
- Files: `src/projects/jurnl/runtime/screens/families/F08PlanScreens.tsx (new)`, `src/projects/jurnl/data/f08/ (new)`
- Pass: Functional contract 12/12.

**W3.F12 F12 CREDIT STRUCTURAL COMPLETION** · complexity M · collision LOW · group W3-F12
- Scope: Credit attributes on card / loan places, utilization reading, attention state; add card routes to F05 add sheet.
- Depends on: W2.F05
- Files: `src/projects/jurnl/runtime/screens/families/F12CreditScreens.tsx (new)`, `src/projects/jurnl/data/f12/ (new)`
- Pass: Functional contract 12/12. No second account list.

**W3.F14 F14 GOALS STRUCTURAL COMPLETION** · complexity M · collision LOW · group W3-F14
- Scope: Goals CRUD, set aside, meaning, reached state; setup goal handoff.
- Depends on: W0.1, W0.3, W0.8
- Files: `src/projects/jurnl/runtime/screens/families/F14GoalsScreens.tsx (new)`, `src/projects/jurnl/data/f14/ (new)`
- Pass: Functional contract 12/12.

### WAVE 4 — DECISION + PROJECTION FAMILIES — F10 PURCHASES, F11 TRIPS, F13 PAYDOWN, F15 AHEAD, F16 RECORDS

**W4.F10 F10 PURCHASES STRUCTURAL COMPLETION** · complexity M · collision LOW · group W4-F10
- Scope: Considerations, object page, decision sheet reading F09 / F14; bought → quick add.
- Depends on: W3.F09, W3.F14
- Files: `src/projects/jurnl/runtime/screens/families/F10PurchasesScreens.tsx (new)`, `src/projects/jurnl/data/f10/ (new)`
- Pass: Functional contract 12/12. No commerce surface.

**W4.F11 F11 TRIPS STRUCTURAL COMPLETION** · complexity M · collision LOW · group W4-F11
- Scope: Trips CRUD, cost lines (currency contract), funding sheet.
- Depends on: W3.F09, W3.F08
- Files: `src/projects/jurnl/runtime/screens/families/F11TripsScreens.tsx (new)`, `src/projects/jurnl/data/f11/ (new)`
- Pass: Functional contract 12/12. No booking surface.

**W4.F13 F13 PAYDOWN STRUCTURAL COMPLETION** · complexity M · collision LOW · group W4-F13
- Scope: Path from F05 liabilities + F12 terms; what-if; keep path; no-debt state.
- Depends on: W3.F12
- Files: `src/projects/jurnl/runtime/screens/families/F13PaydownScreens.tsx (new)`, `src/projects/jurnl/data/f13/ (new)`
- Pass: Functional contract 12/12. Non-shaming copy check.

**W4.F15 F15 AHEAD STRUCTURAL COMPLETION** · complexity L · collision LOW · group W4-F15
- Scope: Base projection, assumption sheet, branch compare, thin state.
- Depends on: W2.F06, W2.F07, W3.F08, W3.F14
- Files: `src/projects/jurnl/runtime/screens/families/F15AheadScreens.tsx (new)`, `src/projects/jurnl/data/f15/ (new)`
- Pass: Functional contract 12/12.

**W4.F16 F16 RECORDS STRUCTURAL COMPLETION** · complexity L · collision LOW · group W4-F16
- Scope: Device blob storage, index + find, document page, file / remove / export.
- Depends on: W0.3, W0.8
- Files: `src/projects/jurnl/runtime/screens/families/F16RecordsScreens.tsx (new)`, `src/projects/jurnl/data/f16/ (new)`
- Pass: Functional contract 12/12. Export works with no plan (safety floor).

### WAVE 5 — PRODUCTION ADAPTERS + LAUNCH GATES — AUTH, SERVER PERSISTENCE, PROVIDERS, SEO, ANALYTICS, A11Y AUDIT

**W5.1 PRODUCTION AUTH + EMAIL + SOCIAL** · complexity L · collision MEDIUM · group W5-A
- Scope: Production JurnlAuthAdapter (FF.AUTH_PROVIDER).
- Depends on: nothing
- Files: `src/projects/jurnl/runtime/state/adapters.ts`, `server/ (new routes)`
- Pass: F01 flows pass against the provider; preview accounts never in a production build.

**W5.2 SERVER PERSISTENCE + RLS + RATE PROXY** · complexity L · collision MEDIUM · group W5-B
- Scope: Server adapter for every repository; migrations; RLS; security tests; FX proxy; entitlement enforcement.
- Depends on: W0.3
- Files: `supabase/migrations/ (new)`, `server/routes.ts`, `src/projects/jurnl/data/repository/`
- Pass: RLS tests prove user isolation.

**W5.3 NOINDEX** · complexity S · collision LOW · group W5-C
- Scope: noindex on every JURNL route + host header.
- Depends on: nothing
- Files: `public/`, `src/site00/projectRuntime/`
- Pass: Rendered head carries noindex.

**W5.4 ANALYTICS ON EXISTING INFRA** · complexity S · collision LOW · group W5-C
- Scope: trackActivity jurnl_* events (no financial payloads) + buildMonetizationEvent; user_activity migration.
- Depends on: W5.2
- Files: `src/utils/activity.ts`, `src/projects/jurnl/runtime/state/store.tsx`
- Pass: Allow-list test rejects financial props.

**W5.5 NATIVE BRIDGE** · complexity M · collision LOW · group W5-A
- Scope: Real biometric + device trust in the native shell.
- Depends on: W5.1
- Files: `src/projects/jurnl/runtime/state/adapters.ts`
- Pass: F01.04 / F01.09 on device.

**W5.6 ACCESSIBILITY + RESPONSIVE AUDIT** · complexity M · collision LOW · group W5-C
- Scope: axe pass on every route + overlay; screen-reader spot checks; 393 / 834 / 1440 captures for every node.
- Depends on: W4.F16
- Files: `scripts/jurnl/ (new qa script)`
- Pass: 0 serious axe violations.

**W5.7 REVIEW CHROME OUT OF PRODUCT** · complexity S · collision LOW · group W5-C
- Scope: BOARD button + /parents only in design-preview.
- Depends on: nothing
- Files: `src/projects/jurnl/runtime/screens/ParentScreens.tsx`, `src/projects/jurnl/runtime/JurnlRuntimeRoot.tsx`
- Pass: Production mode shows no review chrome.

## Parallelization

- W0: A-group tasks (W0.1, W0.2, W0.6, W0.7, W0.9) run in parallel; W0.3 and W0.8 are high-collision — one owner each.
- W2: F05, F06 and F07 in parallel.
- W3: F08, F12 and F14 in parallel; F09 waits for W2.
- W4: F10, F11, F13, F15 and F16 in parallel.

## Pass conditions for "100% FUNCTIONAL"

- Every node in `JURNL_CANONICAL_PRODUCT_GRAPH.json` scores 12/12 on its applicable criteria (`JURNL_FUNCTIONAL_COMPLETION_CONTRACT.json`).
- Graph validation: 0 orphans, 0 dangling opens, 0 target-unreachable, 0 families reachable only through the review board.
- `interactive-text-qa.mjs` at 0 drift on every new route and overlay at 393 / 834 / 1440.
- No generation call anywhere in waves 0–4.
