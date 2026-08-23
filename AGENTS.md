# AGENTS.md — SITE 00 (site00.com)

Instructions for **Cursor Cloud Agents**. Local Cursor sessions also benefit; cloud agents read this file at session start and after handoffs.

Repo: `github.com/yoteenz/SITE00` · Do **not** push to Frontal Slayer / fsbw.

---

## Cursor Cloud specific instructions

### Motherboard (read first)

At chat start, read in order:

1. `motherboard/README.md`
2. `motherboard/CORE.md`
3. `motherboard/CODEBASE.md`
4. `motherboard/MEMORY.md`

Also apply always-applied rules in `.cursor/rules/` (`motherboard.mdc`, `shipping.mdc`, `session-close.mdc`).

### Dev commands (cloud VM)

```bash
npm ci                    # install (also in .cursor/environment.json install)
npm run dev               # Vite on :5174 — auto-started via environment terminals
npm test                  # vitest
npm run build             # production dist/
bash scripts/package-cpanel-deploy.sh   # build dist + ZIP to /tmp/
```

Preview tunnel: `.cursor/environment.json` terminals `site00-vite` + `site00-preview-tunnel`. URL file: `/tmp/site00-cloud-preview-url.txt`.

API is **not** on cPanel static hosting. Production API: Railway (`api.site00.com`). `VITE_API_BASE=https://api.site00.com` at build time.

### Git shipping (mandatory)

Follow `.cursor/rules/shipping.mdc`:

1. Branch: `cursor/<descriptive-name>-4f59` (lowercase)
2. Commit, push: `git push -u origin <branch>`
3. Open PR to `main` via ManagePullRequest tool (not `gh pr create`)
4. **Merge PR in the same session** unless founder said draft / don't merge / wait for review
5. Fetch `origin/main` before merge if needed
6. **Merging the PR is not the end of the session** — see Session close below

### Session close (mandatory — every work-completing turn)

Founder formalized this once. **Never tell the founder to paste session-close text into sprint prompts.**

**Before your final message** when work is complete, merged, or a sprint finishes:

1. **Re-read** `.cursor/rules/session-close.mdc` (required even after context handoff/summary)
2. Deliver **all three parts** — missing any part is a failed close:

#### Part 1 — Prose summary
Normal markdown: what changed, why, founder next steps (Railway redeploy, Supabase migration, etc.).

#### Part 2 — Structured conclusion code box
One fenced code block for founder mobile copy-paste.

- If the user/sprint provided a `CONCLUSION` or `FINAL CONCLUSION FORMAT` template, fill it in **inside this box** (not as markdown headings in prose).
- If no sprint template, use a short STATUS block ending with `STOP.`
- **Do NOT put deploy URLs inside this box.**

#### Part 3 — Deploy links (each on its own line)
Immediately after the code box — bare URLs or markdown links, **one per line**:

1. Direct ZIP download URL
2. GitHub Release page URL
3. `SITE00-DEPLOY-README.txt` download URL (when release exists)
4. One-line verify reminder (e.g. page source must NOT reference `index.BT7zuSxb.js`)
5. One-line upload reminder (GoDaddy public_html → upload → extract → hard refresh)

When **frontend/UI changed** this session:

```bash
bash scripts/package-cpanel-deploy.sh
gh release create site00-deploy-YYYY-MM-DD-vN \
  /tmp/site00-production-dist-YYYY-MM-DD-vN.zip \
  SITE00-DEPLOY-README.txt \
  --title "SITE 00 production deploy YYYY-MM-DD vN" \
  --notes "..."
```

Increment `vN` from latest release. API-only changes: parts 1 + 2 required; part 3 deploy links optional unless UI bundle changed.

### Handoff rule

Conversation summaries and compaction **drop procedural requirements**. After any handoff, before sending your final message:

- [ ] Part 1 prose present
- [ ] Part 2 conclusion in a **single fenced code block**
- [ ] Part 3 deploy links each on **separate line** (if UI changed)
- [ ] Fresh ZIP release built (if UI changed)

### Secrets (placeholders only — never commit real values)

Cloud VM uses Cursor Secrets dashboard. Common server-side (Railway, not VITE_*):

- `SUPABASE_SERVICE_ROLE_KEY`, `FAL_KEY`, `ANTHROPIC_API_KEY`, `ADMIN_EMAILS`

Browser build uses `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE`, `VITE_SITE00_ROOT=1`.

### Production deploy split

| Layer | Host | Action after merge |
|-------|------|-------------------|
| SPA `dist/` | GoDaddy cPanel | Upload GitHub Release ZIP |
| API `server/` + `api/` | Railway | Redeploy from `main` |

`main` merge ≠ live site00.com until cPanel deploy.

---

## Project overview

SITE 00 — standalone commercial product (React 19, Vite, Supabase, Railway API). Founder codes primarily from **mobile**.

Key docs: `docs/DEPLOYMENT.md`, `motherboard/CORE.md`, `docs/MOTHERBOARD_COMMANDS.md`.
