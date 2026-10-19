# 32 · OPUS3 → Composer implementation handoff (phases 0–14)

**Not executed.** This is the build plan for a later implementation sprint. Each phase lists:
- file mapping, dependencies, APIs, DB, UI, boards, tests, security, rollback and acceptance;
- whether it can be built **before** policy approval (**PRE-POLICY**), or needs **founder approval** first (**APPROVAL**).

Paths below `src/site00/admin/founder-workspace/referrals/` are proposed (registry RF-xxx).

**Global rules:**
- Draft PRs only. Never merge or deploy without the founder.
- No live emails or partner messages.
- Do not change the payment webhooks without a separate approval.
- No Supabase production changes outside approved migrations.
- No model identifiers in commits.

---

### Phase 0 · Authority intake — APPROVAL
- **Scope:** founder reviews boards R01–R44; decides FD-R20 (index), FD-R14 (territory), FD-R13 (copy), and as many of FD-R01…R19 as possible.
- **Files:** `29_FOUNDER_APPROVAL_REGISTER.md` updated by the founder.
- **Dependencies:** none. **APIs / DB / UI:** none.
- **Tests:** none. **Rollback:** n/a.
- **Acceptance:** register rows move from OPEN to DECIDED with date and initials.

### Phase 1 · Navigation + route scaffold — PRE-POLICY
- **Files:**
  - `shell/destinations.ts` (RF-001);
  - `Sidebar.tsx`, `IndexRail.tsx`, `WorkspaceDrawer.tsx` (rows);
  - `referrals/ReferralsLayout.tsx`, `ReferralsSectionNav.tsx` (RF-003);
  - `referrals/permissions.ts` (RF-006);
  - route registrations.
- **Dependencies:** OPUS1 shell implemented. **APIs:** none (static).
- **DB:** none.
- **UI:** empty-state pages for all seven sections with *PROGRAMME NOT CONFIGURED* copy.
- **Boards:** R01–R04, R42.
- **Tests:**
  - bottom bar still HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM and five items;
  - no bottom item selected on `/referrals`;
  - sidebar shows 06 REFERRALS / 07 SYSTEM (or the FD-R20 decision);
  - G-RF-21: preview bypass excluded from future mutation routes.
- **Security:** routes behind `AdminGuard`.
- **Rollback:** remove the destination entry (feature flag `REFERRALS_DESTINATION`).
- **Acceptance:** navigation works at the 16 viewports; layout audit passes.

### Phase 2 · Read models over existing data — PRE-POLICY
- **Files:**
  - `api/admin/referrals/summary.ts`;
  - `api/_lib/referrals/readModels.ts`;
  - `referrals/ReferralsOverviewPage.tsx`, `ReferralSignals.tsx`, `PartnersPanel.tsx` (RF-010…RF-016).
- **Dependencies:** P1.
- **APIs:** `GET summary` (counts from the invitation store; amounts `UNAVAILABLE` until P6).
- **DB:** none (read the in-memory store or the tables once P3 lands).
- **UI:** overview with OBSERVED counts; money metrics show `—` with *NOT CONFIGURED*.
- **Boards:** R01–R05. **Tests:** metric definitions match doc 07 §1; empty / error states.
- **Security:** founder only. **Rollback:** flag.
- **Acceptance:** no invented values; every metric shows its definition.

### Phase 3 · Partner registry persistence — PRE-POLICY (records) / APPROVAL (activation)
- **Files:**
  - `api/_lib/invitationSystem/supabaseStore.ts` (G-RF-01);
  - `api/admin/referrals/partners.ts`;
  - `referrals/partners/*` (RF-020…RF-025, RF-030…RF-035).
- **Dependencies:** P2; migration A (constraints + FKs on existing tables, doc 25 §6).
- **APIs:** partners CRUD (draft only), status change (ACTIVE requires a terms version).
- **DB:** migration A; AIO fixture → DRAFT (G-RF-22).
- **UI:** registry, partner detail, RO-01, RO-02, RO-04.
- **Boards:** R06–R11.
- **Tests:**
  - create → DRAFT, with no link or terms;
  - ACTIVE blocked without terms;
  - duplicate detection;
  - persisted ids are DB-generated (#1657 regression test).
- **Security:** founder only; contact data not in search for other roles.
- **Rollback:** down-migration A; the store falls back to memory behind a flag.
- **Acceptance:** AIO shows PLANNED; the conflict banner disappears once the fixture is fixed.

### Phase 4 · Attribution capture — APPROVAL (FD-R07, R08, R09)
- **Files:**
  - `api/_lib/referrals/attributionResolver.ts` (RF-045);
  - `api/site00/invitation.ts` (CORS, rate limits);
  - `service.ts` activation → durable artifact (G-RF-03).
- **Dependencies:** P3; policy decisions.
- **APIs:** existing public endpoints hardened.
- **DB:** UNIQUE (artifact) on attributions; FK to artifacts.
- **UI:** public entry states (RF-080).
- **Boards:** R32, R43.
- **Tests:** all 21 edge cases (doc 15) as unit/integration tests; a client-supplied partner id is ignored; idempotent capture.
- **Security:** G-RF-14, G-RF-15; httpOnly context cookie.
- **Rollback:** disable the resolver (codes still resolve; no attribution written).
- **Acceptance:** E01–E21 behave as specified on staging.

### Phase 5 · Attribution ledger, trace, exceptions — PRE-POLICY (UI) / APPROVAL (corrections authority FD-R18)
- **Files:** `referrals/attribution/*` (RF-040…RF-044); `record/ReferralSource.tsx` (RF-008).
- **Dependencies:** P4.
- **APIs:** attribution list, trace, exception resolve, correction.
- **DB:** `attribution_exceptions`.
- **UI:** R12–R15; FOUNDATIONS ↔ REFERRALS links.
- **Tests:** a correction requires a reason; blocked after PAID; events written.
- **Security:** founder only.
- **Rollback:** hide corrections behind a flag.
- **Acceptance:** two-way navigation verified.

### Phase 6 · Commission engine + ledger — APPROVAL (FD-R01–R06)
- **Files:**
  - `api/_lib/referrals/commissionEngine.ts` (RF-055);
  - fix `commissionLedger.ts:45` (G-RF-05); wire eligibility (G-RF-06);
  - `referrals/commissions/*`.
- **Dependencies:** P4; payment evidence G-RF-08/09/10/23, as a separately approved payments change.
- **APIs:** commissions list.
- **DB:** `partner_terms_versions`, `commission_adjustments`, CHECK + FKs on entries.
- **UI:** R16–R19.
- **Tests:** state machine (legal and illegal transitions); integer arithmetic; terms version locked; refund / partial refund / dispute flows; idempotency.
- **Security:** no amounts to partners yet.
- **Rollback:** engine flag off; entries remain TRACKED.
- **Acceptance:** reconciliation F-04 passes on a staging data set.

### Phase 7 · Approval workflow + audit — APPROVAL (FD-R18)
- **Files:** RO-12, RO-13 overlays; `api/admin/referrals/commissions/approve|adjust`.
- **Dependencies:** P6. **DB:** events. **UI:** R20.
- **Tests:** approval does not pay; blocked when refunded or disputed; separation of duties if decided.
- **Security:** idempotency keys. **Rollback:** disable the endpoints.
- **Acceptance:** audit trail complete for every approval.

### Phase 8 · Payout recording (record-only) — APPROVAL (FD-R05, R10, R16)
- **Files:** `referrals/payouts/*` (RF-060…RF-064), RO-14…RO-17; `api/admin/referrals/payouts/*`.
- **Dependencies:** P7.
- **DB:** `payouts`, `payout_payment_records`, `partner_payees`.
- **UI:** R21–R25.
- **Tests:**
  - RECORD ≠ SEND (no provider calls anywhere: static check);
  - amount equals the total;
  - a duplicate reference is a no-op;
  - reversal creates negative rows;
  - no banking fields in schemas or UI.
- **Security:** payee documents encrypted, outside the UI.
- **Rollback:** disable recording.
- **Acceptance:** monthly close dry-run (doc 27 §6).

### Phase 9 · Card Studio (digital) — PRE-POLICY (studio) / APPROVAL (FD-R13 copy, FD-R15 share)
- **Files:** `referrals/cards/*` (RF-070…RF-075); templates A/B/C as React components from `rf-kit.js card()` geometry.
- **Dependencies:** P3 (links).
- **APIs:** cards; links issue/revoke.
- **DB:** `card_templates`.
- **UI:** R26–R30, R32.
- **Tests:**
  - cards never overflow (container);
  - no terms or ids in card markup;
  - placeholder QR until validated;
  - share uses the Web Share API with a fallback.
- **Security:** QR payload = public URL only.
- **Rollback:** flag. **Acceptance:** digital share works on iOS and Android, tested on real devices by the founder.

### Phase 10 · Partner portal — APPROVAL (FD-R11, FD-R12)
- **Files:** `src/site00/partner-portal/*` (RF-081…RF-085); `api/partner/*`.
- **Dependencies:** P6–P9.
- **DB:** `partner_portal_access`; RLS policies.
- **UI:** R35–R38.
- **Tests:**
  - a partner sees only their own rows (RLS tests);
  - masking;
  - revoked sessions end;
  - a QR URL does not authenticate.
- **Security:** CSP; rate-limited sign-in.
- **Rollback:** portal flag off.
- **Acceptance:** penetration checklist passes.

### Phase 11 · Print pipeline — APPROVAL (FD-R13, FD-R14, FD-R17 for AIO)
- **Files:** RF-072, RF-074, RF-076…RF-079; `api/_lib/referrals/printPackage.ts`; extend `scripts/invitation001/render-invitation001.ts`.
- **Dependencies:** P9; production domain verified.
- **DB:** `card_proofs`, `qr_validations`.
- **UI:** R31, R33, R34.
- **Tests:**
  - export refuses a placeholder or staging QR;
  - the gate is server-enforced;
  - filenames carry no ids;
  - PDF/X validation.
- **Security:** export logged.
- **Rollback:** disable export.
- **Acceptance:** the print path order (doc 18 §5) is completed once on a printer proof before any run.

### Phase 12 · Analytics + activity — PRE-POLICY
- **Files:** `referrals/activity/*` (RF-090…RF-092); read models with evidence classes.
- **Dependencies:** P4+.
- **DB:** event types extended.
- **UI:** R39.
- **Tests:** every metric declares its class; no chart without a stored series.
- **Rollback:** flag.
- **Acceptance:** activity matches stored events 1:1.

### Phase 13 · Workspace integrations — PRE-POLICY
- **Files:** RF-004 search, RF-005 notifications, RF-007 diagnostics.
- **Dependencies:** P2+.
- **Tests:** search returns no banking data; notifications deep-link correctly.
- **Rollback:** providers off.
- **Acceptance:** ⌘K finds partners and refs.

### Phase 14 · Hardening + launch readiness — APPROVAL
- **Scope:** security review (doc 23), financial controls (doc 27), retention jobs, the full 16-viewport audit, accessibility review, an end-to-end staging run of R43 and R44, founder sign-off, and the AIO activation decision.
- **Rollback:** every phase flag documented.
- **Acceptance:** all register rows decided; no OPEN blocker; founder approves activation.

---

## Built before policy vs after approval
- **PRE-POLICY:** P1, P2, P3 (records), P5 (UI), P9 (studio shell), P12, P13.
- **APPROVAL:** P0, P4, P6, P7, P8, P10, P11, P14, and every production activation.
