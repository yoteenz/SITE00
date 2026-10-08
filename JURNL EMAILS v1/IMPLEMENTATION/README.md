# Implementation (COMPOSER)

Templates are built only from approved authorities and assets (pipeline steps 10–13).

- Email-safe doctrine, accessibility gates and client matrix: `00_SYSTEM/responsive-rules.md`.
- Provider-neutral contract: `00_SYSTEM/provider-contract.md` (`shared/jurnl-email-engine/provider.ts`).
- Fixtures for previews: `00_SYSTEM/fixtures.json` (refused by delivery).
- Auth mail (A02, A08) goes through Supabase Auth templates or a Send Email Hook; do not rewrite the auth flows.
- Update MANIFESTS through the source + export script; never hand-edit generated files.
