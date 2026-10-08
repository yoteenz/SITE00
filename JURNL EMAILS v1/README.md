# JURNL EMAILS v1 — JURNL EDITORIAL CORRESPONDENCE

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

Sprint `P0.JURNL.EMAIL-ENGINE.CANONICAL-ARCHITECTURE-AND-CREATIVE-INFRASTRUCTURE1`. This folder holds the system that governs JURNL email. It does not hold any email design yet: the eight first emails are **CONTRACT_READY**, nothing has been generated, no template is implemented, and no email is sent.

> A JURNL EMAIL SHOULD FEEL LIKE SOMETHING RECEIVED FROM A BEAUTIFUL PRIVATE FINANCIAL ATELIER — NOT SOMETHING SENT BY A FINTECH CRM.

| Folder | Holds |
|---|---|
| `00_SYSTEM/` | ontology, creative doctrine, families, consent model, trigger contracts, responsive rules, asset model, lifecycle, provider inventory and contract, preview / QA, analytics, fixtures |
| `01_WELCOME/` | A01 WELCOME TO JURNL: contract (E01) |
| `02_VERIFY_EMAIL/` | A02 VERIFY YOUR EMAIL: contract (E06) |
| `03_FINISH_SETUP/` | A03 FINISH SETTING UP JURNL: contract (E05) |
| `04_STS_READY/` | A04 YOUR SAFE TO SPEND IS READY: contract (E01) |
| `05_WEEKLY_BRIEF/` | A05 YOUR WEEK IN JURNL: contract (E03) |
| `06_PURCHASE_NUDGE/` | A06 A PURCHASE MAY NEED A SECOND LOOK: contract (E05) |
| `07_MILESTONE/` | A07 YOU REACHED A MILESTONE: contract (E04) |
| `08_RESET_ACCESS/` | A08 RESET YOUR ACCESS: contract (E06) |
| `COMPONENTS/` | EC01–EC17 |
| `MANIFESTS/` | seven manifests + JSON Schemas |
| `COPY/` | copy deck (subjects, preheaders, CTAs) |
| `REVIEW/` | founder review material; batch-1 readiness |
| `SIDEKICK_ASSETS/`, `EMAIL_SHELLS/`, `RESPONSIVE/` | empty until authorities are approved |
| `IMPLEMENTATION/` | guidance for template / provider work |

Pipeline: MESSAGE CONTRACT → EMAIL FAMILY → CREATIVE TERRITORY → FULL EMAIL AUTHORITY → FOUNDER REVIEW → RESPONSIVE AUTHORITY → ASSET DECOMPOSITION → SIDEKICK / ARTIFACT GENERATION → FOUNDER APPROVAL → TEMPLATE IMPLEMENTATION → PROVIDER INTEGRATION → EMAIL CLIENT QA → DELIVERY QA → LIVE. FULL EMAIL AUTHORITY BEFORE ASSET DECOMPOSITION. Do not generate random plates in advance.
