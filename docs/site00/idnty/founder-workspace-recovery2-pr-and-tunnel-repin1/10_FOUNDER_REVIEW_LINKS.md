# 10 — Founder review links

Use the **Cloudflare dev tunnel origin** from Cursor Cloud Secrets (`SITE00_CLOUDFLARE_TUNNEL_HOSTNAME`) or read `/tmp/site00-cloud-preview-url.txt` on the canonical preview agent.

Path suffixes (append to tunnel origin):

| Area | Path |
| --- | --- |
| Overview | `/admin/site00/founder-workspace/overview` |
| Foundations | `/admin/site00/founder-workspace/foundations` |
| Reviews | `/admin/site00/founder-workspace/reviews` |
| Operations | `/admin/site00/founder-workspace/operations` |
| Correspondence | `/admin/site00/founder-workspace/correspondence` |
| Referrals | `/admin/site00/founder-workspace/referrals` |
| System / Test lab | `/admin/site00/founder-workspace/system` |

**Card studio:** Referrals destination → **Card studio** tab (no separate route).

**Create client:** shell Create → overlay OL-01.

**Client record:** `/admin/site00/founder-workspace/foundations/<artifactId>` (auth + data required).

## Authentication

Founder/admin login required. Do not bypass on the public tunnel.

## Draft PR

See [04_RECOVERY2_REVIEW_PR_MANIFEST.md](./04_RECOVERY2_REVIEW_PR_MANIFEST.md) — PR URL in sprint conclusion after draft open.
