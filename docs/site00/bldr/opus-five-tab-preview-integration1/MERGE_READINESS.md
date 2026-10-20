# Builder PR #1672 — merge readiness (preview sprint)

## Source

| Item | Value |
| --- | --- |
| PR | [#1672](https://github.com/yoteenz/SITE00/pull/1672) (open) |
| Branch | `claude/bldr-five-tab-editorial-authority-8d42xk` |
| HEAD SHA | `5dd77ff1a86cdb29ad29cbe7de948a9482aca5ba` |
| Merge target (PR base) | `main` |
| GitHub merge state | **CLEAN** / **MERGEABLE** (no reported conflicts vs `main`) |

## Isolated preview (does not repin foundation tunnel)

| Item | Value |
| --- | --- |
| Worktree | `/tmp/site00-builder-preview-bldr1672` @ PR SHA |
| Dev port | **5176** (foundation remains **5174** → site00.fsbw-dev.com) |
| Public URL | Quick tunnel — see `/tmp/site00-builder-preview-url.txt` on canonical preview env |
| Route | `/bldr/studio/blueprint?reviewRoom=BLUEPRINT` |
| Scripts | `.cursor/scripts/run-site00-builder-preview-server.sh`, `run-site00-builder-preview-tunnel.sh` |

**Stable hostname `builder.site00.fsbw-dev.com`:** not configured in this environment (would require separate Cloudflare ingress + token). Use quick tunnel until founder approves DNS/tunnel setup.

## Foundation separation

- PR **#1671** is **merged** into `cursor/idnty-founder-readiness-e2e-be3b`; living portal work continues on `cursor/idnty-living-portal-one-pass-completion1-be3b`.
- **Do not** merge #1672 into foundation branches.
- Foundation review gallery and client portal were **not** modified in this sprint.

## Shared-file risk (when merging #1672 → `main`)

Expect overlap with recent `main` / foundation work in:

- `src/site00/builder-studio/*` (Blueprint five tabs — **keep PR #1672 as authority**)
- `src/site00/styles/site00-bldr*.css`
- `vite.config.ts` / preview flags (reconcile, do not drop foundation review adapters)

Run before merge:

```bash
git fetch origin main claude/bldr-five-tab-editorial-authority-8d42xk
git merge-tree $(git merge-base origin/main origin/claude/bldr-five-tab-editorial-authority-8d42xk) origin/main origin/claude/bldr-five-tab-editorial-authority-8d42xk
```

## Merge gate

**Founder approval required** after live preview review. No auto-merge.
