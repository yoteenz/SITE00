# 10 — Tunnel review

Repin after push:

```bash
bash .cursor/scripts/serve-site00-preview-from-pin-ref.sh cursor/idnty-approved-referral-card-assets-be3b
bash .cursor/scripts/restart-site00-preview-tunnel.sh
```

Card Studio: `/admin/site00/founder-workspace/referrals` → **CARD STUDIO** section/tab.

Verify JPEG loads:

```bash
curl -o /dev/null -w "%{http_code}\n" "$ORIGIN/site00/idnty/referral-card/aio/site00-idnty-referral-card-front.jpg"
```

Use cloud preview URL file / secrets for `$ORIGIN` (not committed in docs).
