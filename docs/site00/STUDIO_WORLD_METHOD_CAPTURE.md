# Studio World Method Capture — SITE 00 EVOLVE

Internal architecture note for reusable production-method discoveries made while building EVOLVE Marketing OS operator workflows. **Do not productize in fsbw/Studio World from this document alone.**

Status key: **CAPTURED** | **VALIDATED** | **PRODUCTIZATION_CANDIDATE**

---

## 1. Strategy → Production Brief Translation

**Status:** CAPTURED

EVOLVE maps campaign objective, audience, message, channel, and content item into a Studio World production request with explicit deliverables, canon refs, reference refs, format, and due date — without dispatching live production.

**Observation:** Operators need a review surface that shows exactly what SITE 00 will ask Studio World to create before approval. The brief builder must pull from Marketing Profile, Manifest, Content Brain (CANON vs REFERENCE classification), and campaign lineage.

---

## 2. Campaign → Multi-Channel Deliverable Decomposition

**Status:** CAPTURED

A single campaign decomposes into calendar items, marketing email items, and per-platform social items — each independently editable with shared campaign lineage but no forced caption parity across platforms.

**Observation:** Cross-platform independence is an operator requirement, not an implementation detail. AIO social deferral (DEFERRED_BY_OWNER) must not spawn active calendar obligations or blockers.

---

## 3. Reference-Family Methodology

**Status:** CAPTURED

Content Brain entries carry classification (CANONICAL, REFERENCE, IDEA, PERFORMANCE_LEARNING). EVOLVE assists operators with approved language but does not silently promote IDEA → CANON during editing.

**Observation:** Production briefs should surface canon vs reference explicitly in preview before approval.

---

## 4. Approval-Gated Production Dispatch

**Status:** VALIDATED

Production requests progress: REQUESTED → PENDING approval → APPROVED_FOR_DISPATCH. **DISPATCHED** remains distinct and is not wired in Sprint 02.

Governance-blocked capabilities (Product Photography, Live Try-On, Commerce FAL, Slay Forecast) stop at BLOCKED_BY_GOVERNANCE — never APPROVED_FOR_DISPATCH.

**Observation:** Cost displays as UNKNOWN unless legitimately available. No fabricated provider estimates.

---

## 5. Manifest → Campaign Lineage

**Status:** CAPTURED

Approved manifest items can spawn campaigns with metadata lineage:

- `source: MARKETING_MANIFEST`
- `manifest_item_key`
- `manifest_id`

**Observation:** Operators must always see why a campaign exists without re-entering canonical strategy.

---

## 6. Roadmap Deferral History Preservation

**Status:** CAPTURED

Roadmap items with DEFERRED_BY_OWNER retain history when later activated. EVOLVE must not rewrite deferral as though channels were always active.

**Observation:** COMMAND surfaces deferred items separately from BLOCKED — owner decisions are not system failures.

---

## 7. Provider Abstraction + External Account Identity (Sprint 03)

**Status:** CAPTURED

Provider-independent adapter contract with normalized capability registry. Connections belong to one organization; granted vs supported capabilities tracked separately. Explicit account/property selection required.

**Observation:** `ADAPTER_AVAILABLE ≠ ACCOUNT_CONNECTED`. Credentials use `REQUIRES_SECURE_CONFIGURATION` when secrets absent.

---

## 8. Evidence Normalization + Metric Provenance (Sprint 03)

**Status:** CAPTURED

Normalized metric observations retain provider, connection, property, source metadata, attribution state, confidence. Missing metrics = `NOT_AVAILABLE`.

---

## 9. Distribution Lineage + Publishing Fences (Sprint 03)

**Status:** CAPTURED

Distribution jobs and external publication records prepared. Global + org publishing fences enforced server-side. NDXbook = `DISTRIBUTION_PUBLISHING_PILOT` with publishing DISABLED.

---

## 10. Evidence-Backed Learning Boundary (Sprint 03)

**Status:** CAPTURED

Performance evidence → Insight → Suggested Learning → Human Review → Canonical Content Brain. No silent canon updates.

---

## Sprint 04 — NDXbook Pilot Methods

### 11. Provider Authorization + Account Confirmation

**Status:** CAPTURED — OAuth state org+provider bound; ProviderSecretStore encrypted refs; CONNECTED ≠ VERIFIED ≠ ACCOUNT_CONFIRMED.

### 12. Publication Dry Run + Fence Architecture

**Status:** CAPTURED — Internal pipeline stops before provider write; global/org/approval/account fences server-side.

### 13. Pre-Publication Baseline

**Status:** CAPTURED — Baseline sync when permissions exist; otherwise truthful NOT_AVAILABLE states.

---

## Productization Candidates (future Studio World)

| Method | Status |
|--------|--------|
| Brief preview contract (org, campaign, deliverables, canon, refs, governance) | PRODUCTIZATION_CANDIDATE |
| Multi-deliverable campaign decomposition schema | PRODUCTIZATION_CANDIDATE |
| Approval-gated dispatch state machine | PRODUCTIZATION_CANDIDATE |

**Not in scope here:** Implementing these in Studio World / fsbw.
