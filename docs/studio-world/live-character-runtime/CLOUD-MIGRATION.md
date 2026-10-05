# Cloud Migration (architecture only)

Prototype: **local Windows only** — no cloud GPU in this sprint.

## Target

Move `StudioWorldRuntimeHost` from LOCAL_WINDOWS to CLOUD_GPU without rewriting Character Fabrication.

## Requirements (later)

- Authenticated signalling + TLS
- Session authorization tied to SITE00 user/project
- STUN/TURN strategy
- Runtime isolation + GPU on-demand (not 24/7)
- Same `CharacterRuntimeAdapter` + protocol v1+

## Cost control

Runtime states include `OFFLINE` / `SHUTTING_DOWN`; cloud spin-up on demand for stream/capture sessions only.
