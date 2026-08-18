# Protocol: Adding to the Motherboard

When the user says **"add to motherboard"** (in this or any past chat), follow this protocol so new context is stored **without overwriting or duplicating** existing content.

---

## Rules

0. **Sync after tasks.** After completing a user-requested task, **commit and push** to GitHub. Include `MEMORY.md` updates in the same commit when possible. Update the open PR if one exists for the current branch.

0b. **MEMORY auto-add is ON by default.** Append **`MEMORY.md`** after completed tasks unless the user said **"stop adding to motherboard"**.

1. **Append only.** Do not remove, replace, or rewrite existing sections in `CORE.md` or `MEMORY.md`. Only add new content.
2. **No duplicates.** Before adding, read the full `MEMORY.md` and `CORE.md`. If the same fact or decision is already stated, do not add it again.
3. **One entry per add.** Add exactly one new entry to `MEMORY.md` per **"add to motherboard"** invocation (or when batching into a commit at end of task).
4. **Full conversation context.** Every entry must reflect the **entire conversation so far** in this chat—from inception to now—not just the last message.
5. **CORE.md updates are optional and minimal.** Only add when you have a **new, permanent** fact about design, stack, or flows not already in CORE.
6. **MEMORY.md is the default place for conversation summaries.** Put learnings, one-off decisions, and "what we did in this chat" in `MEMORY.md`.

---

## Format for a new MEMORY.md entry

Append to the **end** of `MEMORY.md`.

```markdown
---

## YYYY-MM-DD — Short topic title (or "Full conversation summary")

Summary of the **whole conversation so far** in this chat: user goals, what was discussed, what was decided, what was built or changed, and any conventions or preferences stated.

- **Context:** User's initial goal(s) or problem(s) for this chat.
- **Topics covered:** Key prompts and themes (from start to now).
- **Decisions / outcomes:** What was agreed or decided.
- **Changes:** Files, docs, or areas touched (or "docs only").
- **Conventions:** Any new pattern or preference future agents should follow.
```

Use real date (today's date when adding).

---

## Auto-add is on by default

Append to **`MEMORY.md`** at the end of any exchange where you completed a user-requested task (code change, fix, feature, or decision).

- **Every entry must summarize the entire conversation so far** (from chat inception to now), not just the latest turn.
- **"Add to motherboard"** = append one entry now + re-enable auto-add if the user had said **"stop adding to motherboard"**.
- **When to skip:** Q&A with no request to record, "thanks"/"ok", or when the founder said **"stop adding to motherboard"**.

---

## Checklist before adding

- [ ] Read all of `README.md`, `ADDING.md`, `CORE.md`, and `MEMORY.md`.
- [ ] Confirmed the new information is not already in `MEMORY.md` or `CORE.md`.
- [ ] Appended **one** new entry to `MEMORY.md` in the format above.
- [ ] Optionally added a small, non-duplicative update to `CORE.md` only if it's a lasting design/stack/flow fact.
- [ ] Did not delete or overwrite existing content.
