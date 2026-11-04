# Founder approval gates

| ID | Topic | Status |
|----|-------|--------|
| FD-01 | Integration branch acceptance | **RECOMMENDED:** adopt `cursor/jurnl-financial-safety-integration-4e5a` over `integration/jurnl-production-workspace` for Opus handoff |
| FD-02 | PR #1709 disposition | **RECOMMENDED:** supersede after candidate review |
| FD-03 | Zero held balance before archive | **BLOCKED** — not implemented; asset pockets with balance may archive if no other blockers |
| FD-04 | Intentional credit overpayment | **BLOCKED** — guards refuse overpay |
| FD-05 | Default MONEY parent | **NOT APPLICABLE** — unchanged |
| FD-06 | Tunnel switch to reviewed SHA | **BLOCKED** — documented plan only |
| FD-07 | Live RLS verification | **BLOCKED** — prerequisites |
| FD-08 | PR #1708 entitlements merge order | **RECOMMENDED:** keep isolated until MONEY integration accepted |
