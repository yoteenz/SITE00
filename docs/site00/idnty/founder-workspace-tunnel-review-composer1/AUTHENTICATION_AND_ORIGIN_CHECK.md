# Authentication and origin check

## Policy (sprint)

- **No** auth bypass in git.
- **No** hardcoded passwords.
- **No** RLS weakening.
- **No** broad wildcard redirect URLs.

## Founder login

Use the **existing Supabase email/OAuth flow** in the browser on the cloud preview hostname (`SITE00_CLOUDFLARE_TUNNEL_HOSTNAME`).

If login fails with redirect/origin errors:

1. In Supabase **Authentication → URL configuration**, ensure **Site URL** or **Redirect URLs** include exactly the preview origin (same hostname as the tunnel, `https://` prefix).  
   (and any path variants you already use for SITE 00 admin, e.g. `/admin/**` callbacks if configured).
2. Do **not** add `*` wildcards.

## Preview-only API behavior (dev tunnel)

When `SITE00_CLOUD_MOBILE_PREVIEW=1`, the **local Vite `/api`** stack may accept preview bootstrap and admin list calls for founder console smoke — this is **not** production Railway behavior. Production remains on `https://api.site00.com`.

## Post-login landing

Auth return path for founder readiness: `/admin/site00/founder-workspace/overview` (`site00AuthRedirect.ts`).

## Security note

Tunnel is HTTPS via Cloudflare; still treat as **development** — no real payment execution, no production email sends enabled in this pin.
