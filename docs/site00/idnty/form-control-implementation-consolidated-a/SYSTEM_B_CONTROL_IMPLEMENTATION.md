# System B control implementation

**Visual:** red 8px square period inside ink-bordered box (unchecked uses `--df-check-border`).

**Locked included services:** `.df-check--locked.df-check--on` — full ink fill, white check icon (unchanged semantics).

**Migrated surfaces:**

| Surface | File |
| --- | --- |
| P03 service rows | `EntryIntake.tsx` → `DfCheckMark` |
| P05 disclosures | `CheckoutActivation.tsx` |
| P04 add-ons | `Recommendation.tsx` |

Radios, tabs, and toggles not converted to checkbox semantics.
