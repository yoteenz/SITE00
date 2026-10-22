# Opus3 approval register reconciliation

**Authority commit verified:** `890fc40b6` on `claude/digital-foundation-authority-audit-8d42xk`  
**Register updated:** `founder-workspace-referrals-authority-opus3/29_FOUNDER_APPROVAL_REGISTER.md`

## Status changes (2026-10-19)

| ID | Prior (Opus3 draft) | After policy lock 1 |
| --- | --- | --- |
| FD-R01 | OPEN | **DECIDED** — fixed fee |
| FD-R02 | OPEN | **DECIDED** — $500 base only |
| FD-R03 | OPEN (no default; reject 15%) | **DECIDED** — $25/$35/$50 cap; reject $75 |
| FD-R04 | OPEN | **DECIDED** — verified pay + 14-day hold + founder approval |
| FD-R05 | OPEN | **DECIDED** — monthly 15th, no minimum, manual external |
| FD-R06 | OPEN | **DECIDED** — reversal/adjustment rules |
| FD-R07 | OPEN (draft 90d pending) | **DECIDED** — 90 days |
| FD-R08 | OPEN (draft manual review) | **DECIDED** — manual review |
| FD-R09 | OPEN (draft rules) | **DECIDED** — disqualifiers as locked |
| FD-R10 | OPEN | **OPEN** — legal/tax detail not fully approved |
| FD-R11–R12, R15, R18–R20 | OPEN | **OPEN** |
| FD-R13–R14 | OPEN | **PARTIAL** — creative direction locked; print not approved |
| FD-R16 | OPEN | **DECIDED** — record-only |
| FD-R17 | OPEN | **DECIDED** — AIO planned $50; activation gated |

## Opus3 docs intentionally not rewritten

Implementation handoff (32), gap matrix (26), state matrix (07), and board assets remain authoritative for **UI and engineering shape**; numeric policy now lives in this lock folder + register §5 history.

## PR #1658

Remains **draft** — this sprint does **not** merge #1658. Policy lock lands via separate PR to the authority branch.

## Conflicts resolved

| Topic | Resolution |
| --- | --- |
| 15% reference imagery | Rejected — not policy |
| 30-day cookie | Rejected — 90-day window decided |
| $75 fee | Rejected — cap $50 |
| Percentage commission basis | Rejected — fixed fee only |
| AIO ACTIVE fixture | Must surface conflict; not normalized silently |
