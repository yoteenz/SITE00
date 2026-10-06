# Media slot audit

Media in the graph projections follows the media role contract from PANEL-MEDIA-GEOMETRY-REFINEMENT2
(`src/site00/config/production-workspace-media.ts`): every image declares a role; functional media is **contained**, never
cropped; nothing is borrowed from another project.

## Artifact → media role (`GraphPrimitives.artifactMediaRole`)

| Artifact type | Role | Fit |
|---|---|---|
| VISUAL_AUTHORITY, REFERENCE_AUTHORITY, SCENE / SPATIAL authorities (default) | `REFERENCE_AUTHORITY` | `THUMBNAIL_CONTAIN` |
| STORYBOARD_FRAME | `VIDEO_FRAME` | `THUMBNAIL_CONTAIN` |
| BRAND_MARK, ICON | `LOGO_MARK` | `THUMBNAIL_CONTAIN` |
| WORLD_ASSET | `LANDSCAPE_EDITORIAL` | `THUMBNAIL_CONTAIN` |
| UI_ASSET, PHOTOGRAPHY, ILLUSTRATION, OTHER | `OTHER_FUNCTIONAL` | `THUMBNAIL_CONTAIN` |

Slots: row thumbnail 56 × 56 (`.pgx-row__thumb`), tile 4 : 5 (`.pgx-tile__media`), lineage preview up to 70 vh
(`.pgx-preview`) — all `object-fit: contain`.

## Slot states (default / overview / child / empty / error / loading)

| State | Rendering |
|---|---|
| Artifact with a mounted file | `<img>` with `data-media-role`, inside `data-media-fit="THUMBNAIL_CONTAIN"` |
| Artifact recorded, file not in the web build (e.g. `docs/` bundle references) | `RECORDED · NOT MOUNTED` (`data-media-state="missing"`) |
| Artifact status MISSING (asset contract without a runtime file) | `MISSING` |
| Node without a preview artifact | no thumbnail column (row without media) — never another project's art |
| No artifact at all | `NO PREVIEW` |
| Loading | graph static parts are synchronous; images lazy-load inside fixed-geometry slots (no layout shift) |

## Default / overview coverage per tab

| Tab | Default | Overview content | Child | Empty |
|---|---|---|---|---|
| HUB | project control plane | phase, counts, progress, domains, decisions, blockers, events | node history (ACTIVITY `?node=`) | `project-hub-progress-empty`, `…-needs-you-empty`, `…-blockers-empty`, `…-events-empty` |
| INBOX | NEEDS YOU | lenses + list with actions | `?item=` | `project-inbox-empty`, `project-inbox-item-missing` |
| DESIGN | **overview** (was `brand` chamber) | method strip, families, authorities | `?family=` | `domain-empty-design`, `project-design-family-missing` |
| EXPERIENCE | world graph | kind lenses, world, scenes, authorities | `?scene=` | `domain-empty-experience`, `project-experience-scene-missing` |
| EXPRESSION | Entry 002 root (established) | — | 40 family routes | `domain-empty-expression` |
| LIBRARY | CANONICAL lens (else ALL) | status lenses + tiles | `?artifact=` lineage | `project-library-empty`, `project-library-artifact-missing` |
| ACTIVITY | ALL | lenses, feed, nodes | `?node=` | `project-activity-empty`, `project-activity-node-missing` |

## CASTING default / overview media (NDXBOOK)

Fixed in #1400 (PANEL-MEDIA-GEOMETRY-REFINEMENT2) and re-verified live in this sprint at all three viewports:

| Panel | Live result |
|---|---|
| AVAILABLE TALENT | 7 talent faces, every one role `PORTRAIT`, rendered through `ActorFace` |
| LEAD AUTHORITY | `REFERENCE_AUTHORITY` slot, not cover-cropped |
| CAST ASSIGNED / ROLES CAST | now count catalogued actors only (the phantom actor id no longer counts) |

## Live QA (3 viewports × 5 projects × 7 tabs)

- 105 / 105 routes: every `<img>` in a graph surface carries its own `data-media-role`; NDXBOOK's Entry 002 bodies (HUB,
  INBOX, EXPRESSION — 22 images per viewport) declare the role on the `HubImage` slot wrapper, as the #1400 contract
  specifies; 0 horizontal overflow (document, scroll pane, any element); 0 page errors.
- Render tests (F): every `<img>` in LIBRARY / DESIGN / EXPERIENCE projections declares a role, every media slot is
  `THUMBNAIL_CONTAIN`, no image source references NDXBOOK / Entry 002 under another project; an unmounted artifact renders
  `RECORDED · NOT MOUNTED` or `MISSING`.
- Embedded project artwork typography is untouched (authority files are shown as files, contained).
