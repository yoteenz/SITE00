# Scene decomposition

Each approved authority screen becomes a `SceneDecomposition`: ordered `SceneLayer` entries with normalized bboxes, z-index, and ownership.

Inputs today: authority manifest + asset slot registry + layout heuristics. Opus live DOM probes can replace heuristics without changing manifest shape.

Example sheet: `MAP2_SCENE_DECOMPOSITION_SHEET_BLDR_EXAMPLE.md`.
