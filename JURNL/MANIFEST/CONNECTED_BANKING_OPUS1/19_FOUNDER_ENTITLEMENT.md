# 19 · FOUNDER ENTITLEMENT

- **Integrated, not rebuilt.** The isolated founder-entitlement branch `cursor/jurnl-founder-entitlements-isolated-v1-4e5a` (PR #1708 line) was **merged** into this branch at commit `a871a65e4`. It brings:
  - FOUNDER_FULL internal grants with an atomic grant RPC and durable audit;
  - SERVER_VERIFIED resolution;
  - the runtime bridge.

  There were no code conflicts; MEMORY.md kept both logs.
- **Connected banking is gated server-side.** `requireBankUser` checks for an active FOUNDER_FULL grant through `listActiveInternalGrants` (with `JURNL_BANKING_ACCESS=FOUNDER_ONLY`, the default). It does not use a client flag, an email allowlist or a hard-coded address. Other users' privileges are unchanged.
- **No billing is triggered.** No subscription is created and no billing provider is called; the grant is not a subscription. Plaid usage costs belong to the JURNL Plaid account, not to the founder's JURNL plan.
- **Tests:**
  - acceptance step 04: no grant at first; after the grant, SERVER_VERIFIED with FOUNDER_FULL active and no ACTIVE subscription;
  - HTTP test: 403 without the grant, 200 with it;
  - the merged founder-entitlement suites (security, atomic grant integrity, runtime bridge) all pass in the full unit run.
- **Not verified here:** the entitlement after logout and a fresh login on a **real** Supabase project. The grant has to be created in a founder-approved database first (founder action F-3).
