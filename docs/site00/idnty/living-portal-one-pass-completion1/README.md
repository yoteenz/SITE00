# Living portal one-pass completion (draft implementation)

Branch: `cursor/idnty-living-portal-one-pass-completion1-be3b`  
Authority source: `docs/site00/idnty/client-foundation-digital-access-authority-lock1/` (from PR #1670 branch, ingested here).

## Delivered in this pass

| Item | Status |
| --- | --- |
| LOCK1 docs + approved masters/derivatives in repo | Ingested |
| Public PWA assets + `public/foundation-manifest.webmanifest` | Deployed paths per `08_ASSET_MANIFEST.md` |
| `ProjectPortal` wired in `FoundationClient` (P07–P10, records, comm prefs) | Done |
| Post-intake `P03IntakeSubmitted` + G-02 quote/surface withholding | Done |
| G-12 token hash index (memory + Supabase lookup + migration) | Done |
| G-09 `/foundation/return` + session API + reentry (in-memory; dev code in non-prod) | Scaffold |
| Draft PR only — not merged to integration/production | Per sprint |

## Still open (follow-up)

- Full email delivery for reentry codes (G-14)
- Token URL `replaceState` after first open (optional hardening)
- Staging E2E 24-step journey with live Stripe/email env
- Founder confirmation of deployed icon hashes (FR-02 maskable)

## Tunnel

Repin preview worktree to this branch for founder mobile review (integration base remains `cursor/idnty-founder-readiness-e2e-be3b` until merge).
