# SITE 00 Project Bible

**Status:** Compiled view implemented P0.D (2026-08-25)

---

## Principle

```
PROJECT BIBLE = compiled current truth of the project
```

The Project Bible is **not** a separate source-of-record database. It is a compiled view from canonical project data.

---

## Sections (P0.D)

| Section | Truth layer | Source |
|---------|-------------|--------|
| ORIGIN | CLIENT_FOUNDER_TRUTH | Project status + client truth count |
| CLIENT TRUTH | CLIENT_FOUNDER_TRUTH | `site00_client_truth_records` |
| ORIGIN SUMMARY | CLIENT_FOUNDER_TRUTH (derived) | `site00_origin_summaries` |
| IDENTITY BRIEF | CLIENT_FOUNDER_TRUTH (derived) | `site00_identity_briefs` |
| IDENTITY TERRITORIES | CREATIVE_EXPLORATION | `site00_identity_territories` |
| IDENTITY CANON | APPROVED_CANON or UNRESOLVED | `site00_canon_records` |
| WORLD HIERARCHY | CLIENT_FOUNDER_TRUTH | `site00_world_hierarchy_nodes` |
| UNRESOLVED DECISIONS | UNRESOLVED | Client truth category filter |

---

## Truth labels

Every section carries an explicit `truthLayer`:

- `CLIENT_FOUNDER_TRUTH` — what client/founder supplied
- `CREATIVE_EXPLORATION` — what SITE 00 proposes (non-canonical by default)
- `APPROVED_CANON` — explicitly promoted decisions
- `UNRESOLVED` — open decisions

Creative exploration does **not** appear as approved truth in the default Bible view.

---

## World formation state

Compiled Bible always reports:

```
worldFormationState: NOT_FORMED
```

WORLD formation runtime is not invoked at Identity phase.

---

## API

`GET /api/site00/projects?action=project_bible&slug=<slug>`

Requires `PROJECT_INTELLIGENCE` capability.

---

## Key file

`api/_lib/site00Projects/identity/projectBibleCompiler.ts`
