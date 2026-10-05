# JURNL Wave 1 — Shared Global Interactions

**Sprint:** P0.JURNL.WAVE1-SHARED-GLOBAL-INTERACTIONS  
**Agent:** COMPOSER  
**Base:** Wave 0 merged on `main`

## Delivered

| Workstream | Status | Evidence |
|------------|--------|----------|
| W1.1 Settings | PARTIAL | `SettingsScreens.tsx` route `account`; repository `settings` |
| W1.2 Family links | PASS | `familyLinks.ts` + registry integration |
| W1.3 Ask JURNL global | PARTIAL | `GlobalSheets.tsx` AskJurnlSheet on F03/F04/F05–F16 |
| W1.4 Quick Add V2 | PARTIAL | `quickAddRegistry.ts` + QuickAddV2Sheet; TRANSACTION only |
| W1.5 Ledger edit/delete | PASS | Repository mutations; DetailSheet for ADDED |
| W1.6 Honest connect | PARTIAL | `connectionProvider.ts`; F02 permission copy + preview-only flag |
| W1.7 Consent | PARTIAL | Repository `consent[]` + `consentSync.ts` |
| W1.8 State/primitives | PARTIAL | Reused drawers/modals; no design-system rewrite |
| W1.9 QA / blueprint | PASS | Tests + structural blueprint regeneration |

## Intentional partials (Wave 2+)

- Settings: F01.11/F01.12 drawer reuse (export/delete/security) not fully ported to post-entry surface
- Quick Add: only TRANSACTION type enabled; other domains await Wave 2–4 owners
- Ask JURNL: explanation-only; no LLM provider (founder decision)
- Connect: no live bank aggregation

## Zero generation

NEW_PAID_GENERATIONS: 0
