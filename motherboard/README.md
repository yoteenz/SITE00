# Motherboard — Core Memory for SITE 00

**Location:** This folder is `motherboard/` at the project root (not a single file named "motherboard"). Do **not** create `MOTHERBOARD.md` at project root—this folder and its existing files are the only motherboard.

The **motherboard** is a shared, persistent context store for all agents working on **SITE 00** (standalone product extracted from Frontal Slayer / fsbw). It holds project design, logic, flows, conventions, and learnings so agents stay aligned across chats and cloud runs.

A Cursor rule (`.cursor/rules/motherboard.mdc`) is set to **always apply**, so agents in this project will recognize **"load motherboard"** and **"add to motherboard"** without further explanation.

Quick reference for humans: `docs/MOTHERBOARD_COMMANDS.md`.

---

## Auto-load and when you need to prompt

- **New chats:** The Cursor rule tells the agent to treat the motherboard as **auto-loaded** at the start of each new conversation. Read `README.md` → `CORE.md` → `CODEBASE.md` → `MEMORY.md` before implementing.
- **"Load motherboard":** Re-read those files and refresh context (e.g. after you've updated the motherboard).
- **"Add to motherboard":** Append **one MEMORY entry now** and re-enable auto-add if it was turned off. **Auto-add after completed tasks is ON by default** — agents append MEMORY at end of significant exchanges without needing this command every time.

**Adding from old chats:** Appending only **adds** a new entry—it does **not** overwrite existing entries. For current context, agents should treat **CORE + CODEBASE + the latest MEMORY entries** as the source of truth; older MEMORY entries are timeline/history.

---

## Commands (no extra explanation needed)

### "Load motherboard" (optional; new chats auto-load)

1. Read **all** of these files in order:
   - `motherboard/README.md` (this file)
   - `motherboard/CORE.md` (design, stack, flows, conventions)
   - `motherboard/CODEBASE.md` (current codebase structure and key paths)
   - `motherboard/MEMORY.md` (conversation learnings and decisions)
2. Use this context as the source of truth for how SITE 00 works and how to add or change features.

### "Add to motherboard"

1. Read `README.md`, `ADDING.md`, `CORE.md`, `MEMORY.md`.
2. Follow `ADDING.md` (append-only, no overwrite, no duplicate, use the required format).
3. Add **one new entry** to `MEMORY.md` summarizing the **entire conversation so far** in this chat.
4. Optionally add a small update to `CORE.md` only for new **permanent** facts not already there.

**If the user says "stop adding to motherboard":** Turn off auto-add for the rest of this chat; only add again if they explicitly say "add to motherboard" later.

### "Snapshot codebase to motherboard"

1. Explore the repo: `src/`, `api/`, `public/`, `docs/`, routes, config.
2. **Overwrite** `motherboard/CODEBASE.md` with a structured summary matching the current codebase.
3. Do **not** modify `MEMORY.md` or `CORE.md` for this command.

---

## File roles

| File | Purpose |
|------|--------|
| `README.md` | This file. Explains all motherboard commands. |
| `CORE.md` | Stable project context: stack, design system, key flows, conventions. |
| `CODEBASE.md` | **Current codebase snapshot** (structure, paths). Refreshed by "Snapshot codebase to motherboard." |
| `MEMORY.md` | Append-only log of conversation summaries and one-off decisions. |
| `ADDING.md` | Protocol for how to add entries (format, deduplication, no overwrite). |

---

## Relationship to Frontal Slayer (fsbw)

SITE 00 was extracted from the **yoteenz/fsbw** monorepo. FSBW has its own `motherboard/` folder with Frontal Slayer–wide context. **This motherboard is SITE 00–only.** Cross-repo facts (shared Supabase project during migration, preview tunnel patterns) may be noted in CORE or MEMORY but implementation authority for this repo is here.

FSBW cloud-agent docs (e.g. `docs/cloud-agent/site00-preview-tunnel.md` in fsbw) may still apply operationally until fully moved into SITE 00.

---

## Quick reference for agents

- **"Load motherboard"** → Read `README.md` → `CORE.md` → `CODEBASE.md` → `MEMORY.md`.
- **"Add to motherboard"** → Append one entry to `MEMORY.md` (per `ADDING.md`). Auto-add after tasks is **ON** by default.
- **"Snapshot codebase to motherboard"** → Overwrite `CODEBASE.md` with current repo structure.
- **Ship changes:** Commit and push to GitHub; update PR when on a feature branch. See cloud agent instructions in the run environment.
