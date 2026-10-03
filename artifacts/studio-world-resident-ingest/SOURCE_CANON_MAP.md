# SOURCE CANON MAP

| FSBW source (authority) | SITE00 projection |
|-------------------------|-------------------|
| `src/studio-os-core/studio-world-residents/season1-ensemble/` | `shared/site00-studio-world/resident-intelligence/season1-ensemble/residents.ts` |
| `docs/studio-world/STUDIO_WORLD_SEASON1_CORE_ENSEMBLE_CANON_BIBLE.md` | Dossier fields + `SOURCE_CANON_MAP` (this file) |
| `docs/studio-world/residents/season-1/season1-ensemble-canonical.json` | Structured dossiers + `sourceAuthority` block per resident |

**Rule:** FSBW remains originating canon. Every dossier includes:

```json
{
  "repo": "fsbw",
  "canon": "STUDIO_WORLD_SEASON1_CORE_ENSEMBLE",
  "residentId": "SW-RESIDENT-00X",
  "version": "season1-v1"
}
```

SITE00 must not silently become a competing resident canon.
