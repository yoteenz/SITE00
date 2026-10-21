# Tunnel configuration

## Type

**Cloudflare tunnel** (canonical connector on this Cursor Cloud environment).

| Setting | Value |
| --- | --- |
| Public hostname | Cursor secret `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME` (also `/tmp/site00-cloud-preview-url.txt` on canonical VM) |
| Local target | `localhost:5174` |
| Connector script | `.cursor/scripts/run-site00-preview-tunnel.sh` |
| Vite session (tmux) | `site00_vite` |
| Tunnel session (tmux) | `site00_preview_tunnel` |
| Canonical gate | `SITE00_CLOUDFLARE_TUNNEL_CANONICAL=1` (required) |

## Review pin (this sprint)

The tunnel still terminates at **:5174**, but Vite now serves a **pinned worktree** at:

- **Ref:** `origin/cursor/founder-workspace-full-authority-implementation-composer1-be3b`
- **SHA:** `b8f0bcf0553f7e770ad1c0ad109fb9e690554955`
- **Worktree:** `/tmp/site00-preview-main`
- **Lineage file:** `/tmp/site00-preview-runtime-lineage.txt` (`PREVIEW_AUTHORITY=PINNED`)

**Start / refresh pin:**

```bash
bash .cursor/scripts/serve-site00-preview-from-pin-ref.sh \
  origin/cursor/founder-workspace-full-authority-implementation-composer1-be3b
```

**Runtime flags (dev tunnel only — not production):**

- `SITE00_CLOUD_MOBILE_PREVIEW=1`
- `SITE00_INTAKES_USE_MEMORY=1` (ephemeral intake on preview-linked DB gap)
- `VITE_SITE00_PREVIEW_LOCAL_API=1` (bundled local `/api` on Vite)
- `VITE_API_BASE=` empty (no accidental production API override from pin script)

## Lifecycle

- Tunnel and Vite run in **tmux**; they stop if those sessions end or the VM shuts down.
- Do **not** assume the pin survives agent handoff — re-run the pin script if lineage SHA drifts.

## Railway / staging

**Not modified.** No new Railway services; existing staging (`carefree-luck-staging` / `reliable-creation-staging`) untouched.
