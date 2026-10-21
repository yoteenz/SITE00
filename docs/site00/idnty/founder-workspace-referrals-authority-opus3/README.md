# Founder workspace · REFERRALS and partner commerce authority (OPUS3)

**Sprint:** `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.REFERRALS-AND-PARTNER-COMMERCE-AUTHORITY.OPUS3`
**Status:** COMPLETE REFERRAL-SYSTEM VISUAL AUTHORITY — **FOUNDER REVIEW REQUIRED**
**Builds on:** OPUS1 visual authority `b82ca64e4` · form-control authority `c5a773381` (FD-1…FD-6; Phases 1–2 in #1659/#1660, Phases 3–5 in #1661) · OPUS2 responsive authority `81407c694`
**Branch / PR:** `claude/digital-foundation-authority-audit-8d42xk` · draft PR #1658 (base `cursor/idnty-founder-readiness-e2e-be3b`)

This package extends the approved Founder Workspace with a seventh destination, **06 REFERRALS**: partners, attribution, commissions, payouts, Card Studio and activity, plus a separate partner portal and the System B referral-card print path. It is an **authority package**:
- no production code, backend, database or deployment changed;
- no partner record, agreement, rate, attribution window, payment or message is asserted or triggered.

## Read in this order
1. `02_REFERENCE_IMAGE_ANALYSIS.md` — what the founder's reference sets, and what it does not.
2. `03_EXISTING_REFERRAL_INFRASTRUCTURE_AUDIT.md` — what already exists (invitation system, #1657, payments).
3. `04`–`05` — information architecture and page tree.
4. Boards: `boards/png/` (44 boards; manifest in doc 28).
5. `29_FOUNDER_APPROVAL_REGISTER.md` — **twenty open policy decisions**.
6. `32_OPUS3_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md` — phases 0–14.

## Documents
- `02_REFERENCE_IMAGE_ANALYSIS.md`
- `03_EXISTING_REFERRAL_INFRASTRUCTURE_AUDIT.md`
- `04_REFERRALS_INFORMATION_ARCHITECTURE.md`
- `05_COMPLETE_REFERRALS_PAGE_TREE.md`
- `06_REFERRALS_COMPONENT_REGISTRY.md`
- `07_REFERRALS_STATE_MATRIX.md`
- `08_RESPONSIVE_REFERRALS_AUTHORITY.md`
- `09_DESKTOP_REFERRALS_SPECIFICATION.md`
- `10_TABLET_REFERRALS_SPECIFICATION.md`
- `11_MOBILE_REFERRALS_SPECIFICATION.md`
- `12_PARTNER_MANAGEMENT_SPECIFICATION.md`
- `13_PARTNER_DETAIL_SPECIFICATION.md`
- `14_ATTRIBUTION_ARCHITECTURE.md`
- `15_ATTRIBUTION_EDGE_CASES.md`
- `16_COMMISSION_ENGINE_SPECIFICATION.md`
- `17_PAYOUT_WORKSPACE_SPECIFICATION.md`
- `18_CARD_STUDIO_SPECIFICATION.md`
- `19_PHYSICAL_CARD_VISUAL_AUTHORITY.md`
- `20_PRINT_PRODUCTION_SPECIFICATION.md`
- `21_QR_VALIDATION_AND_LINK_CONTRACT.md`
- `22_PARTNER_PORTAL_SPECIFICATION.md`
- `23_SECURITY_AND_AUTHORIZATION.md`
- `24_REFERRALS_ACTIVITY_SPECIFICATION.md`
- `25_DATA_MODEL_PROPOSAL.md`
- `26_API_AND_BACKEND_GAP_MATRIX.md`
- `27_FINANCIAL_AUDIT_REQUIREMENTS.md`
- `28_VISUAL_BOARD_MANIFEST.md`
- `29_FOUNDER_APPROVAL_REGISTER.md`
- `30_EXISTING_WORKSPACE_INTEGRATION_MAP.md`
- `31_RESPONSIVE_COMPONENT_MAPPING.md`
- `32_OPUS3_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md`
- `33_COVERAGE_AND_OMISSION_REPORT.md`
- `34_VERIFICATION_REPORT.md`

## Package layout
```
boards/            specimen system (src/), 44 board shells + boards.js, render-boards.mjs, audit-layout.mjs, batch-shoot.mjs, write-docs.py
boards/png/        rendered boards (DSF 2)
data/              policy register, attribution edge cases, overlay presentation (from live specimens)
registry/          RF-001+ / RO component registry (JSON + CSV) and its builder
verification/      layout audit results and contact sheets
```

The specimen system reuses OPUS2 `ws.css`, `ws-kit.js` and `ws-overlays.js` by relative import. It adds `rf.css`, `rf-kit.js`, `rf-pages.js` and `rf-overlays.js`. Nothing in `src/` imports from this folder, and the application bundle is unchanged.

## Key positions
- REFERRALS is destination **06** (SYSTEM → 07). The mobile bottom bar is unchanged and REFERRALS is reached from the MENU (FD-R20 open).
- **AIO is PLANNED · NOT ACTIVE.** The repository fixture that marks it ACTIVE without an agreement is flagged as a conflict.
- No rate or window is proposed. Specimen amounts follow EXAMPLE TERMS E-1 / E-2, labelled as such.
- REFERRED ≠ CONVERTED ≠ ELIGIBLE ≠ APPROVED ≠ PAID. RECORD PAYMENT ≠ SEND PAYMENT.
- Card print export stays blocked until partner, link, QR, template, copy and print spec are all verified. Every QR shown is a non-scannable placeholder labelled NOT VALID FOR PRINT.
