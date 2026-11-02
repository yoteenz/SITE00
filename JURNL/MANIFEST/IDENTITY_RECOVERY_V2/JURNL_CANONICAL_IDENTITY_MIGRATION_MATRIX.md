# JURNL canonical identity — downstream migration matrix (read-only)

**Sprint:** P0.JURNL.IDENTITY.CANONICAL-APPROVAL-AND-CLEAN-ASSET-EXTRACTION1  
**Runtime migration:** **NOT_STARTED** (no live UI changes)

Classification key: `KEEP_EXISTING` · `MIGRATE_EXACT_ASSET` · `MIGRATE_AFTER_CLEAN_EXTRACTION` · `PAGE_SPECIFIC_AUTHORITY` · `INTENTIONALLY_LOGO_FREE` · `SUPERSEDED_NEEDS_CORRECTION` · `BLOCKED_PENDING_EVIDENCE`

| Consumer | Current asset / treatment | Class | Notes |
| --- | --- | --- | --- |
| **F01 ENTRY v2 Welcome** | Live sprig PNG + Authority Serif JURNL | `PAGE_SPECIFIC_AUTHORITY` | Decorative composition; not a generic logo swap |
| **F01 ENTRY package screens** | `JurnlLogo` → vertical official PNG | `SUPERSEDED_NEEDS_CORRECTION` | Migrate only after founder approves + clean asset policy |
| **F01 Recovery / Security** | `JurnlLogo` | `SUPERSEDED_NEEDS_CORRECTION` | Same as above |
| **F02 SETUP** | Page authorities / plates | `PAGE_SPECIFIC_AUTHORITY` | No default logo stamp |
| **F03 TODAY** | Parent authorities in review | `BLOCKED_PENDING_EVIDENCE` | Regeneration blocked (F03 plate) |
| **F04 ACTIVITY** | Parent authorities in review | `BLOCKED_PENDING_EVIDENCE` | Regeneration blocked |
| **F05 MONEY** | `ReferenceLockup` | `KEEP_EXISTING` | Already F09 lineage |
| **F06 INCOME** | Family authorities | `PAGE_SPECIFIC_AUTHORITY` | Per-page placement |
| **F07 UPCOMING** | Family authorities | `PAGE_SPECIFIC_AUTHORITY` | |
| **F08 PLAN** | `ReferenceLockup` on select screens | `KEEP_EXISTING` | |
| **F09 SAFE TO SPEND** | `ReferenceLockup` + F09 plates | `KEEP_EXISTING` | Source authority for identity |
| **F10 PURCHASES** | `ReferenceLockup` | `KEEP_EXISTING` | |
| **F11 TRIPS** | Authorities | `PAGE_SPECIFIC_AUTHORITY` | |
| **F12 CREDIT** | `ReferenceLockup` | `KEEP_EXISTING` | |
| **F13 PAYDOWN** | Authorities | `PAGE_SPECIFIC_AUTHORITY` | |
| **F14 GOALS** | Authorities | `PAGE_SPECIFIC_AUTHORITY` | |
| **F15 AHEAD** | Authorities | `PAGE_SPECIFIC_AUTHORITY` | |
| **F16 RECORDS** | Authorities | `PAGE_SPECIFIC_AUTHORITY` | |
| **Global shell / Quick Add** | No lockup img | `INTENTIONALLY_LOGO_FREE` | |
| **Account menu** | `ReferenceLockup` on select views | `KEEP_EXISTING` | |
| **Design viewport / review packs** | Reference hygiene packs | `KEEP_EXISTING` | Pack A uses layer paths |
| **Email engine** | Editorial packs | `PAGE_SPECIFIC_AUTHORITY` | No automatic F09 plate attach |
| **`ReferenceLockup` component** | `LOCKUP_SPRIG` + `LOCKUP_WORD` | `MIGRATE_AFTER_CLEAN_EXTRACTION` | Optional path swap after founder + `TECHNICALLY_READY` |
| **`JurnlLogo` primitive** | Superseded vertical PNG | `MIGRATE_EXACT_ASSET` | Blocked until founder confirms canonical registration |
| **Contract `JURNL.LOGO.OFFICIAL`** | Points at vertical PNG | `SUPERSEDED_NEEDS_CORRECTION` | Metadata-only future sprint |

## Risk summary

- **High:** Replacing `JurnlLogo` without founder gate breaks F01 package parity with approved authorities.
- **Medium:** Swapping layer files changes every `ReferenceLockup` screen simultaneously — requires regression board.
- **Low:** Registry / pack metadata updates (this sprint) — no runtime diff.

## Regression coverage (future migration)

- ENTRY v2 SSR tests (no `jurnl-logo-official` on v2 routes).
- `ReferenceLockup` ink-box placement per family layout JSON.
- Visual diff vs approved parent authorities (no regeneration in this sprint).
